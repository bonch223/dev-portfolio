import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';

const PhysicsParticleSystem = forwardRef(({ onParticleClick, onCollision, isDarkMode = false }, ref) => {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [visibleParticles, setVisibleParticles] = useState([]);

  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    spawnParticle: (pathIndex, size, speed) => {
      spawnParticle(pathIndex, size, speed);
    },
    removeParticle: (particleId) => {
      removeParticle(particleId);
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Create engine
    const engine = Matter.Engine.create();
    engineRef.current = engine;

    // Create renderer
    const render = Matter.Render.create({
      element: containerRef.current,
      engine: engine,
      options: {
        width: 600,
        height: 600,
        wireframes: false,
        background: 'transparent',
        showVelocity: false,
        showCollisions: false,
        showSeparations: false,
        showBroadphase: false,
        showBounds: false,
        showAxes: false,
        showPositions: false,
        showAngleIndicator: false,
        showIds: false,
        showShadows: false,
        showVertexNumbers: false,
        showMousePosition: false,
        showDebug: false
      }
    });
    renderRef.current = render;

    // Create circular boundaries for orbital paths
    const centerX = 300;
    const centerY = 300;
    // Convert rem to pixels and scale for 600x600 container
    // Original CSS: 22rem, 26rem, 32rem → roughly 176px, 208px, 256px
    const pathRadii = [176, 208, 256]; // Match the CSS orbital paths

    // Create central gravitational body
    const centerBody = Matter.Bodies.circle(centerX, centerY, 30, {
      isStatic: true,
      render: {
        visible: false
      }
    });
    Matter.World.add(engine.world, centerBody);

    // Remove gravity completely for smooth orbital motion
    engine.world.gravity.scale = 0; // No gravity

    // Particle creation function
    const createParticle = (pathIndex, size, speed) => {
      const radius = size * 8; // Convert rem to pixels
      const angle = Math.random() * Math.PI * 2;
      const x = centerX + Math.cos(angle) * pathRadii[pathIndex];
      const y = centerY + Math.sin(angle) * pathRadii[pathIndex];
      

      const particle = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.1, // Reduced bounce
        friction: 0.01, // Increased friction
        density: 0.0005,
        frictionAir: 0.005, // Increased air resistance for smoother motion
        render: {
          visible: false // Hide Matter.js rendering, we'll use React
        }
      });

      // Add particle data
      const particleData = {
        id: Date.now() + Math.random(),
        pathIndex,
        size,
        speed,
        startTime: Date.now(),
        angle,
        direction: Math.random() > 0.5 ? 1 : -1,
        velocity: { x: 0, y: 0 } // Will be updated with actual velocity
      };
      
      particle.particleData = particleData;

      // Set orbital velocity for circular motion with variation
      // Convert speed parameter (8-13 seconds) to orbital speed (0.5-2.0 pixels/frame)
      const minSpeed = 0.5;
      const maxSpeed = 2.0;
      const speedRange = maxSpeed - minSpeed;
      const normalizedSpeed = Math.max(0, Math.min(1, (15 - speed) / 7)); // Convert 8-13 to 0-1
      const orbitalSpeed = minSpeed + (normalizedSpeed * speedRange);
      const velocityX = -Math.sin(angle) * orbitalSpeed * particleData.direction;
      const velocityY = Math.cos(angle) * orbitalSpeed * particleData.direction;
      
      // Safety check for initial velocity
      if (!isFinite(velocityX) || !isFinite(velocityY)) {
        // Use safe default velocity
        const safeAngle = Math.random() * Math.PI * 2;
        const safeVx = -Math.sin(safeAngle) * orbitalSpeed * particleData.direction;
        const safeVy = Math.cos(safeAngle) * orbitalSpeed * particleData.direction;
        Matter.Body.setVelocity(particle, { x: safeVx, y: safeVy });
      } else {
        // Set initial velocity for orbital motion
        Matter.Body.setVelocity(particle, { x: velocityX, y: velocityY });
        
        // Store velocity in particle data for collision calculations
        particleData.velocity = { x: velocityX, y: velocityY };
      }

      // Add orbital force to maintain circular motion
      particle.plugin = {
        ...particleData,
        orbitalRadius: pathRadii[pathIndex],
        orbitalCenter: { x: centerX, y: centerY },
        orbitalSpeed: orbitalSpeed, // Use the orbital speed variable
        lastUpdate: Date.now()
      };

      return particle;
    };

    // Store createParticle function for external use
    window.createParticle = createParticle;

    // Collision detection
    Matter.Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      
      pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        // Check if both bodies have particle data (skip center body)
        if (bodyA.particleData && bodyB.particleData) {
          // Two particles collided
          const particle1 = bodyA.particleData;
          const particle2 = bodyB.particleData;
          
          // Determine winner using physics (momentum)
          const winner = determineWinner(particle1, particle2);
          const loser = winner === particle1 ? particle2 : particle1;
          
          // Create explosion effect at collision point
          createExplosionEffect(bodyA.position.x, bodyA.position.y, winner);
          
          // Trigger shake effect in parent component
          if (onCollision) {
            onCollision();
          }
          
          // Remove loser from physics world and state
          if (loser === particle1) {
            Matter.World.remove(engine.world, bodyA);
            setParticles(prev => prev.filter(p => p.particleData?.id !== particle1.id));
            setVisibleParticles(prev => prev.filter(p => p.id !== particle1.id));
          } else {
            Matter.World.remove(engine.world, bodyB);
            setParticles(prev => prev.filter(p => p.particleData?.id !== particle2.id));
            setVisibleParticles(prev => prev.filter(p => p.id !== particle2.id));
          }
        }
      });
    });

    // Add custom orbital forces before starting
    let lastLogTime = 0;
    let lastCentripetalLog = 0;
    let lastBoostLog = 0;
    let lastCountLog = 0;
    
    const applyOrbitalForces = () => {
      const bodies = engine.world.bodies;
      let orbitalParticles = 0;
      const now = Date.now();
      
      bodies.forEach(body => {
        if (body.plugin && body.plugin.orbitalRadius) {
          orbitalParticles++;
          const center = body.plugin.orbitalCenter;
          const radius = body.plugin.orbitalRadius;
          const currentPos = body.position;
          
          // Calculate distance from center with safety checks
          const dx = currentPos.x - center.x;
          const dy = currentPos.y - center.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Safety check: prevent division by zero and invalid values
          if (distance < 0.1 || !isFinite(distance) || !isFinite(currentPos.x) || !isFinite(currentPos.y) || 
              Math.abs(currentPos.x) > 10000 || Math.abs(currentPos.y) > 10000) {
            // Reset particle to a safe position and velocity
            const safeAngle = Math.random() * Math.PI * 2;
            const safeX = center.x + Math.cos(safeAngle) * radius;
            const safeY = center.y + Math.sin(safeAngle) * radius;
            const safeVx = -Math.sin(safeAngle) * body.plugin.orbitalSpeed * 0.5;
            const safeVy = Math.cos(safeAngle) * body.plugin.orbitalSpeed * 0.5;
            
            Matter.Body.setPosition(body, { x: safeX, y: safeY });
            Matter.Body.setVelocity(body, { x: safeVx, y: safeVy });
            return; // Skip this frame's force calculations
          }
          
          // Train-on-track system: Constrain particle to follow circular track
          const velocity = body.velocity;
          const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
          const targetSpeed = body.plugin.orbitalSpeed;
          
          // Safety check for velocity values
          if (isFinite(speed) && isFinite(velocity.x) && isFinite(velocity.y) && speed < 10) {
            
            // 1. Calculate current angle on the track
            const currentAngle = Math.atan2(dy, dx);
            
            // 2. Calculate the next position on the track (like a train moving forward)
            const angleStep = (targetSpeed * body.plugin.direction) / radius; // Angular velocity
            const nextAngle = currentAngle + angleStep;
            
            // 3. Calculate the next position on the track
            const nextX = center.x + Math.cos(nextAngle) * radius;
            const nextY = center.y + Math.sin(nextAngle) * radius;
            
            // 4. Set the particle to the next position on the track (like a train moving to next rail segment)
            Matter.Body.setPosition(body, { x: nextX, y: nextY });
            
            // 5. Set velocity to be tangential to the track (like a train's forward motion)
            const trackVelocityX = -Math.sin(nextAngle) * targetSpeed * body.plugin.direction;
            const trackVelocityY = Math.cos(nextAngle) * targetSpeed * body.plugin.direction;
            Matter.Body.setVelocity(body, { x: trackVelocityX, y: trackVelocityY });
            
            // Update velocity in particle data for collision calculations
            if (body.particleData) {
              body.particleData.velocity = { x: trackVelocityX, y: trackVelocityY };
            }
            
          } else {
            // Reset to track position
            const currentAngle = Math.atan2(dy, dx);
            const trackX = center.x + Math.cos(currentAngle) * radius;
            const trackY = center.y + Math.sin(currentAngle) * radius;
            const trackVx = -Math.sin(currentAngle) * targetSpeed * body.plugin.direction;
            const trackVy = Math.cos(currentAngle) * targetSpeed * body.plugin.direction;
            
            Matter.Body.setPosition(body, { x: trackX, y: trackY });
            Matter.Body.setVelocity(body, { x: trackVx, y: trackVy });
          }
        }
      });
      
    };

    // Apply train-on-track system every frame
    Matter.Events.on(engine, 'beforeUpdate', applyOrbitalForces);

    // Start the engine
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);
    
    // Add a test particle that should definitely move
    setTimeout(() => {
      const testParticle = Matter.Bodies.circle(centerX + 100, centerY, 10, {
        render: { visible: false }
      });
      Matter.Body.setVelocity(testParticle, { x: 1, y: 1 });
      Matter.World.add(engine.world, testParticle);
    }, 1000);
    

    // Cleanup
    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, []);


  // Update visible particles with physics body positions
  useEffect(() => {
    const updatePositions = () => {
      setVisibleParticles(prev => {
        const updated = prev.map(particleData => {
          const physicsBody = particles.find(p => p.particleData?.id === particleData.id);
          if (physicsBody && physicsBody.position) {
            const x = physicsBody.position.x;
            const y = physicsBody.position.y;
            const rotation = physicsBody.angle * (180 / Math.PI);
            
            // Safety check: ensure all values are finite numbers
            if (isFinite(x) && isFinite(y) && isFinite(rotation)) {
              return {
                ...particleData,
                x: x,
                y: y,
                rotation: rotation
              };
            } else {
              return particleData; // Keep old position if new one is invalid
            }
          }
          return particleData;
        }).filter(particleData => 
          particles.some(p => p.particleData?.id === particleData.id)
        );
        
        
        return updated;
      });
    };

    const interval = setInterval(updatePositions, 16); // ~60fps
    return () => clearInterval(interval);
  }, [particles]);

  // Function to get random gradient colors for particles
  const getParticleGradient = (particleData) => {
    const vibrantColorSets = [
      ['#00D4FF', '#8B5CF6'],
      ['#8B5CF6', '#EC4899'],
      ['#EC4899', '#F59E0B'],
      ['#F59E0B', '#10B981'],
      ['#10B981', '#00D4FF'],
      ['#EF4444', '#F97316'],
      ['#8B5CF6', '#06B6D4'],
      ['#EC4899', '#84CC16'],
      ['#F59E0B', '#EF4444'],
      ['#10B981', '#8B5CF6'],
      ['#06B6D4', '#EC4899'],
      ['#84CC16', '#8B5CF6'],
      ['#F97316', '#10B981'],
      ['#EF4444', '#00D4FF'],
      ['#8B5CF6', '#F59E0B'],
      ['#EC4899', '#06B6D4'],
      ['#10B981', '#EF4444'],
      ['#F59E0B', '#8B5CF6'],
      ['#00D4FF', '#84CC16'],
      ['#06B6D4', '#F97316'],
      ['#A855F7', '#EC4899'],
      ['#F59E0B', '#06B6D4'],
      ['#10B981', '#F97316'],
      ['#EF4444', '#8B5CF6'],
      ['#84CC16', '#EC4899'],
      ['#06B6D4', '#10B981'],
      ['#F97316', '#8B5CF6'],
      ['#EC4899', '#F59E0B'],
      ['#8B5CF6', '#84CC16'],
      ['#00D4FF', '#EF4444'],
      ['#DC2626', '#F59E0B'],
      ['#059669', '#8B5CF6'],
      ['#7C3AED', '#EC4899'],
      ['#F59E0B', '#84CC16'],
      ['#06B6D4', '#DC2626'],
      ['#10B981', '#7C3AED'],
      ['#EC4899', '#059669'],
      ['#8B5CF6', '#F59E0B'],
      ['#84CC16', '#DC2626'],
      ['#00D4FF', '#7C3AED'],
    ];

    const warmColorSets = [
      ['#b68b63', '#d9a066'],
      ['#a1704f', '#d4b08a'],
      ['#9c6b4f', '#c79a73'],
      ['#8b5e3c', '#b88760'],
      ['#a87b58', '#e0c199'],
      ['#b68668', '#f1d6b8'],
      ['#8c6849', '#c29874'],
      ['#a6724c', '#daba94'],
      ['#b48a68', '#f3dec2'],
      ['#9f7456', '#cfaa84'],
      ['#b5845f', '#e7c7a4'],
      ['#8b6041', '#b88a69'],
      ['#a47449', '#d2b08b'],
      ['#c4926a', '#f4ddbf'],
      ['#a97c56', '#dfc19d'],
      ['#8f684a', '#c29d7c'],
      ['#b0805d', '#e2c7a5'],
      ['#9a6f52', '#cdac88'],
      ['#ba906a', '#f6e3c7'],
      ['#936548', '#be996f'],
    ];

    const colorSets = isDarkMode ? vibrantColorSets : warmColorSets;

    const colorIndex = Math.floor(particleData.id % colorSets.length);
    const [color1, color2] = colorSets[colorIndex];

    return `${color1}, ${color2}`;
  };

  // Function to create explosion effect
  const createExplosionEffect = (x, y, winnerParticle) => {
    if (!containerRef.current) return;

    const gradient = getParticleGradient(winnerParticle);
    const [startColor, endColor] = gradient.split(', ');

    // Create main explosion
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    explosion.style.width = '40px';
    explosion.style.height = '40px';
    explosion.style.borderRadius = '50%';
    explosion.style.background = `radial-gradient(circle, ${startColor} 0%, ${endColor} 45%, transparent 80%)`;
    explosion.style.transform = 'translate(-50%, -50%) scale(0)';
    explosion.style.animation = 'explosion 0.6s ease-out forwards';
    explosion.style.setProperty('--explosion-scale', '3');
    explosion.style.zIndex = '25';
    explosion.style.pointerEvents = 'none';
    
    containerRef.current.appendChild(explosion);

    // Create multiple smaller explosion particles
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.width = '6px';
      particle.style.height = '6px';
      particle.style.borderRadius = '50%';
      particle.style.background = Math.random() > 0.5 ? startColor : endColor;
      particle.style.transform = 'translate(-50%, -50%)';
      particle.style.animation = `explosionParticle 1s ease-out forwards`;
      particle.style.zIndex = '24';
      particle.style.pointerEvents = 'none';
      
      // Random direction for particle
      const angle = (i / 8) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      particle.style.setProperty('--end-x', Math.cos(angle) * distance + 'px');
      particle.style.setProperty('--end-y', Math.sin(angle) * distance + 'px');
      
      containerRef.current.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1000);
    }

    // Remove main explosion after animation
    setTimeout(() => {
      if (explosion.parentNode) {
        explosion.parentNode.removeChild(explosion);
      }
    }, 600);
  };

  const determineWinner = (particle1, particle2) => {
    // Use physics-based determination: momentum = mass * velocity
    const mass1 = particle1.size * particle1.size; // Approximate mass as size squared
    const mass2 = particle2.size * particle2.size;
    const velocity1 = Math.sqrt(particle1.velocity?.x ** 2 + particle1.velocity?.y ** 2) || 1;
    const velocity2 = Math.sqrt(particle2.velocity?.x ** 2 + particle2.velocity?.y ** 2) || 1;
    
    const momentum1 = mass1 * velocity1;
    const momentum2 = mass2 * velocity2;
    
    return momentum1 >= momentum2 ? particle1 : particle2;
  };

  const spawnParticle = (pathIndex, size, speed) => {
    if (!engineRef.current || !window.createParticle) {
      return;
    }
    
    const particle = window.createParticle(pathIndex, size, speed);
    Matter.World.add(engineRef.current.world, particle);
    
    // Add to both physics and visible particles
    setParticles(prev => [...prev, particle]);
    setVisibleParticles(prev => [...prev, particle.particleData]);
  };


  // Cleanup function to remove particles
  const removeParticle = (particleId) => {
    if (engineRef.current) {
      // Find and remove from physics world
      const bodyToRemove = engineRef.current.world.bodies.find(body => 
        body.particleData?.id === particleId
      );
      if (bodyToRemove) {
        Matter.World.remove(engineRef.current.world, bodyToRemove);
      }
    }
    
    setParticles(prev => prev.filter(p => p.particleData?.id !== particleId));
    setVisibleParticles(prev => prev.filter(p => p.id !== particleId));
  };

  // Auto-cleanup invalid particles
  useEffect(() => {
    const cleanupInvalidParticles = () => {
      setParticles(prev => {
        const validParticles = prev.filter(particle => {
          if (!particle.position || !isFinite(particle.position.x) || !isFinite(particle.position.y) ||
              Math.abs(particle.position.x) > 10000 || Math.abs(particle.position.y) > 10000) {
            if (engineRef.current) {
              Matter.World.remove(engineRef.current.world, particle);
            }
            return false;
          }
          return true;
        });
        
        return validParticles;
      });
    };

    const interval = setInterval(cleanupInvalidParticles, 2000); // Check every 2 seconds for faster cleanup
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes explosion {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
          }
          
          @keyframes explosionParticle {
            0% { 
              transform: translate(-50%, -50%) scale(1); 
              opacity: 1; 
            }
            100% { 
              transform: translate(calc(-50% + var(--end-x)), calc(-50% + var(--end-y))) scale(0); 
              opacity: 0; 
            }
          }
        `}
      </style>
      
      {/* Physics Particle System Container */}
      <div 
        ref={containerRef}
        style={{
          width: '600px',
          height: '600px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          pointerEvents: 'none' // Allow clicks to pass through to profile
        }}
      >
      {/* Render visible particles */}
      {visibleParticles.map((particleData) => {
        if (!particleData.x || !particleData.y) {
          return null;
        }

        const gradient = getParticleGradient(particleData);
        const boxShadow = isDarkMode
          ? `0 0 ${particleData.size * 10}px rgba(0, 212, 255, 0.8)`
          : `0 0 ${particleData.size * 8}px rgba(138, 90, 59, 0.35)`;
        const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(209, 178, 145, 0.6)';

        return (
          <div
            key={particleData.id}
            className="physics-particle"
            style={{
              position: 'absolute',
              left: particleData.x,
              top: particleData.y,
              width: `${particleData.size}rem`,
              height: `${particleData.size}rem`,
              borderRadius: '50%',
              transform: `translate(-50%, -50%) rotate(${particleData.rotation || 0}deg)`,
              background: `linear-gradient(135deg, ${gradient})`,
              boxShadow,
              border: `2px solid ${borderColor}`,
              pointerEvents: 'auto',
              cursor: 'pointer',
              zIndex: 15,
              transition: 'none' // Disable CSS transitions for smooth physics
            }}
            onClick={() => onParticleClick && onParticleClick(particleData)}
          />
        );
      })}
      </div>
    </>
  );
});

export default PhysicsParticleSystem;
