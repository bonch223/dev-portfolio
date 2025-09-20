import React, { useState, useEffect, useRef, useCallback } from 'react';
import { profileAssets } from '../utils/assets';
import PhysicsParticleSystem from './PhysicsParticleSystem';

const HeroSection = () => {
  const [currentRole, setCurrentRole] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const profileContainerRef = useRef(null);
  const physicsSystemRef = useRef(null);

  const roles = [
    'SEO Practitioner',
    'UI/UX Designer',
    'WordPress Developer',
    'No Code Expert',
    'Marketing Specialist'
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Typewriter effect for roles
  useEffect(() => {
    let isActive = true; // Flag to prevent multiple instances
    
    const typeWriter = async () => {
      if (!isActive) return; // Exit if component unmounted or new effect started
      
      const currentRoleText = roles[currentRole];
      
      // Start typing
      setIsTyping(true);
      setDisplayedText('');
      
      // Type out the text
      for (let i = 0; i <= currentRoleText.length; i++) {
        if (!isActive) return; // Exit if component unmounted
        setDisplayedText(currentRoleText.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay between characters
      }
      
      if (!isActive) return; // Exit if component unmounted
      
      // Wait a bit before starting to delete
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      if (!isActive) return; // Exit if component unmounted
      
      // Delete the text
      for (let i = currentRoleText.length; i >= 0; i--) {
        if (!isActive) return; // Exit if component unmounted
        setDisplayedText(currentRoleText.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay for deletion
      }
      
      if (!isActive) return; // Exit if component unmounted
      
      setIsTyping(false);
      
      // Move to next role
      setCurrentRole((prev) => (prev + 1) % roles.length);
    };

    // Start the first typewriter cycle immediately
    typeWriter();

    // Cleanup function
    return () => {
      isActive = false;
    };
  }, [currentRole]);


  // Physics-based collision detection is handled by Matter.js

  const createCollisionEffect = (winner, loser) => {
    if (!profileContainerRef.current) return;

    // Create explosion effect
    const explosion = document.createElement('div');
    explosion.className = 'particle-explosion';
    explosion.style.position = 'absolute';
    explosion.style.pointerEvents = 'none';
    explosion.style.borderRadius = '50%';
    explosion.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(0,212,255,0.6) 50%, transparent 100%)';
    explosion.style.transform = 'translate(-50%, -50%) scale(0)';
    explosion.style.animation = 'explosion 0.8s ease-out';
    explosion.style.zIndex = '25';
    
    // Position explosion at collision point (approximate)
    explosion.style.left = '50%';
    explosion.style.top = '50%';
    
    profileContainerRef.current.appendChild(explosion);
    
    setTimeout(() => {
      if (explosion.parentNode) {
        explosion.parentNode.removeChild(explosion);
      }
    }, 800);

    // Screen shake effect
    document.body.style.animation = 'screenShake 0.3s ease-out';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 300);
  };

  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Physics particle system functions
  const spawnPhysicsParticle = useCallback((pathIndex, size, speed) => {
    if (physicsSystemRef.current) {
      physicsSystemRef.current.spawnParticle(pathIndex, size, speed);
    }
  }, []);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  }, []);

  const getNearestPath = (clickX, clickY, containerRect) => {
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    const distance = Math.sqrt(
      Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2)
    );
    
    // Path radii: 11rem, 13rem, 16rem (converted to pixels approximately)
    const pathRadii = [176, 208, 256]; // 11*16, 13*16, 16*16
    
    let nearestPath = 0;
    let minDistance = Math.abs(distance - pathRadii[0]);
    
    for (let i = 1; i < pathRadii.length; i++) {
      const dist = Math.abs(distance - pathRadii[i]);
      if (dist < minDistance) {
        minDistance = dist;
        nearestPath = i;
      }
    }
    
    return nearestPath;
  };

  const handleProfileMouseMove = (event) => {
    if (!profileContainerRef.current) return;
    
    const rect = profileContainerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const nearestPath = getNearestPath(mouseX, mouseY, rect);
    setHoveredPath(nearestPath);
  };

  const handleProfileClick = useCallback((event) => {
    if (!profileContainerRef.current) {
      return;
    }
    
    const rect = profileContainerRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    let targetPath = getNearestPath(clickX, clickY, rect);
    
    // 30% chance to spawn on a path that already has particles for more collisions
    if (Math.random() < 0.3 && particles.length > 0) {
      const pathsWithParticles = [...new Set(particles.map(p => p.pathIndex))];
      if (pathsWithParticles.length > 0) {
        targetPath = pathsWithParticles[Math.floor(Math.random() * pathsWithParticles.length)];
      }
    }
    
    // Set selected path for visual feedback
    setSelectedPath(targetPath);
    
    const randomSize = Math.random() * 1.5 + 0.5; // 0.5 to 2rem
    const randomSpeed = Math.random() * 5 + 8; // 8 to 13 seconds
    
    
    // Spawn physics particle
    spawnPhysicsParticle(targetPath, randomSize, randomSpeed);
    
    // Create ripple effect
    createRippleEffect(clickX, clickY);
    
    // Clear selected path after a short delay
    setTimeout(() => setSelectedPath(null), 500);
  }, [particles, spawnPhysicsParticle]);

  // Auto-simulation: 3-5 particles on each of the 3 orbital paths
  useEffect(() => {
    const simulateClicks = () => {
      const paths = [0, 1, 2]; // 3 orbital paths
      const particlesPerPath = 3 + Math.floor(Math.random() * 3); // 3-5 particles per path
      const baseInterval = 800; // 0.8 seconds base interval
      const randomVariation = 400; // ±0.4 second variation
      
      // Randomize the order of paths
      const shuffledPaths = [...paths].sort(() => Math.random() - 0.5);
      
      let clickIndex = 0;
      
      shuffledPaths.forEach((pathIndex) => {
        for (let i = 0; i < particlesPerPath; i++) {
          setTimeout(() => {
            if (profileContainerRef.current) {
              const rect = profileContainerRef.current.getBoundingClientRect();
              
              // Generate click position on specific orbital path
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              
              // Path radii: 11rem, 13rem, 16rem (converted to pixels approximately)
              const pathRadii = [176, 208, 256]; // 11*16, 13*16, 16*16
              const targetRadius = pathRadii[pathIndex];
              
              // Random angle on the specific path
              const angle = Math.random() * Math.PI * 2;
              const clickX = centerX + Math.cos(angle) * targetRadius;
              const clickY = centerY + Math.sin(angle) * targetRadius;
              
              // Create synthetic click event
              const syntheticEvent = {
                clientX: rect.left + clickX,
                clientY: rect.top + clickY
              };
              
              // Trigger the click handler
              handleProfileClick(syntheticEvent);
            }
          }, clickIndex * (baseInterval + (Math.random() - 0.5) * randomVariation));
          
          clickIndex++;
        }
      });
    };

    // Start simulation after a short delay to ensure everything is loaded
    const simulationTimeout = setTimeout(simulateClicks, 3000);
    
    return () => clearTimeout(simulationTimeout);
  }, [handleProfileClick]);

  const handleProfileMouseLeave = () => {
    setHoveredPath(null);
  };

  const createRippleEffect = (x, y) => {
    const ripple = document.createElement('div');
    ripple.className = 'particle-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.pointerEvents = 'none';
    ripple.style.borderRadius = '50%';
    ripple.style.border = '2px solid rgba(0, 212, 255, 0.6)';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.zIndex = '20';
    
    profileContainerRef.current.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  };

  // Function to reset all particles (for testing)
  const resetAllParticles = () => {
    setParticles([]);
  };

  // Add keyboard shortcut to reset (for testing)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'r' || event.key === 'R') {
        resetAllParticles();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <section id="home" className="section hero-section">
      <div className="section-content">
        <div className="hero-grid">
          {/* Left Content with Glass Pane */}
          <div className={`hero-content ${isVisible ? 'animate-slide-left' : 'opacity-0'}`}>
            <div className="glass-content-pane">
              {/* Subtle moving circles inside the glass pane */}
              <div className="floating-circle circle-1" />
              <div className="floating-circle circle-2" />
              <div className="floating-circle circle-3" />
              <div className="floating-circle circle-4" />
              <div className="floating-circle circle-5" />
              
              <div className="hero-text">
                <h1 className="heading-primary">
                  Hi, I'm <span className="text-gradient animate-pulse">Mel</span>
                </h1>
                
                <div className="role-container">
                  <span className="role-label">I'm a</span>
                  <div className="role-display" style={{ minHeight: '2.5rem', minWidth: '12rem', display: 'flex', alignItems: 'center' }}>
                    <span className="role-text">
                      {displayedText}
                    </span>
                    <span className="cursor-blink">|</span>
                  </div>
                </div>
              </div>

              <p className="hero-description">
                Passionate about creating innovative digital solutions that drive business growth. 
                I specialize in SEO optimization, WordPress development, UI/UX design, and 
                no-code solutions that deliver exceptional results for my clients.
              </p>

              <div className="hero-buttons">
                <button 
                  onClick={scrollToProjects}
                  className="btn btn-primary"
                >
                  <span>View My Work</span>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <a 
                  href="/src/assets/Resume.pdf" 
                  download
                  className="btn btn-secondary"
                >
                  <span>Download Resume</span>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </a>
              </div>

              {/* Tech Stack */}
              <div className="tech-stack">
                <p className="tech-stack-label">Tech Stack</p>
                <div className="tech-badges">
                  {['WordPress', 'SEO', 'UI/UX', 'Shopify', 'No Code', 'Marketing'].map((tech) => (
                    <span key={tech} className="code-text">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Profile Image */}
          <div className={`hero-image-container ${isVisible ? 'animate-slide-right' : 'opacity-0'}`}>
            <div 
              className={`profile-container ${isShaking ? 'shake' : ''}`} 
              ref={profileContainerRef}
              onClick={handleProfileClick}
              onMouseMove={handleProfileMouseMove}
              onMouseLeave={handleProfileMouseLeave}
            >
              {/* Glow effect */}
              <div className="profile-glow" />
              
              {/* Orbital paths */}
              <div className={`orbit-path orbit-path-1 ${hoveredPath === 0 ? 'path-hovered' : ''} ${selectedPath === 0 ? 'path-selected' : ''}`}></div>
              <div className={`orbit-path orbit-path-2 ${hoveredPath === 1 ? 'path-hovered' : ''} ${selectedPath === 1 ? 'path-selected' : ''}`}></div>
              <div className={`orbit-path orbit-path-3 ${hoveredPath === 2 ? 'path-hovered' : ''} ${selectedPath === 2 ? 'path-selected' : ''}`}></div>

              {/* Physics Particle System */}
              <PhysicsParticleSystem 
                ref={physicsSystemRef}
                onParticleClick={handleProfileClick}
                onCollision={triggerShake}
              />

              {/* Profile image container */}
              <div className="profile-image-wrapper">
                <img 
                  src={profileAssets.photo} 
                  alt="MJR Elayron Profile" 
                  className="profile-image"
                />
                
                {/* Overlay gradient */}
                <div className="profile-overlay" />
              </div>

            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-indicator-inner">
            <div className="scroll-dot" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
