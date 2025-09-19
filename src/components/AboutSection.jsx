import React, { useState, useEffect } from 'react';

const AboutSection = () => {
  const [activeSkill, setActiveSkill] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const skills = [
    {
      category: 'WordPress',
      technologies: ['WordPress Development', 'Custom Themes', 'Plugin Development', 'WooCommerce', 'Elementor'],
      level: 95,
      color: '#00D4FF'
    },
    {
      category: 'SEO',
      technologies: ['Technical SEO', 'On-Page SEO', 'Link Building', 'Analytics', 'Keyword Research'],
      level: 90,
      color: '#8B5CF6'
    },
    {
      category: 'UI/UX Design',
      technologies: ['Figma', 'Adobe XD', 'Photoshop', 'Canva', 'User Research'],
      level: 88,
      color: '#00FF88'
    },
    {
      category: 'No Code',
      technologies: ['Webflow', 'Bubble', 'Zapier', 'Airtable', 'Cursor AI'],
      level: 85,
      color: '#FF6B35'
    }
  ];

  const experiences = [
    {
      year: '2024',
      title: 'COO & Co-Founder',
      company: 'SkillFoundri',
      description: 'Leading operations and development of comprehensive learning platform combining Upwork, Asana, Blackboard, and Coursera features.'
    },
    {
      year: '2023',
      title: 'SEO Practitioner & WordPress Developer',
      company: 'Freelance',
      description: 'Delivering SEO optimization and WordPress development services to various clients, improving their online visibility and conversion rates.'
    },
    {
      year: '2022',
      title: 'UI/UX Designer & Graphics Specialist',
      company: 'Multiple Clients',
      description: 'Creating compelling visual designs and user experiences for web and mobile applications using modern design tools and methodologies.'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="about" className="section relative z-10">
      <div className="section-content">
        <div className="text-center mb-16">
          <h2 className="heading-secondary mb-4">
            About <span className="text-gradient">Me</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            I'm a passionate digital professional with 7+ years of experience in WordPress development, 
            UI/UX design, and SEO optimization. I specialize in creating innovative solutions that drive 
            business growth and deliver exceptional user experiences.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Story */}
          <div className={`space-y-8 ${isVisible ? 'animate-slide-left' : 'opacity-0'}`}>
            <div className="card p-8">
              <h3 className="heading-tertiary mb-6 text-gradient">My Journey</h3>
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  My journey in digital marketing and web development began 7 years ago with WordPress, 
                  and I quickly discovered my passion for creating user-friendly websites that drive results.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Over the years, I've expanded my expertise to include SEO optimization, UI/UX design, 
                  and no-code solutions. I believe in delivering comprehensive digital solutions that 
                  help businesses grow and succeed online.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  When I'm not working on client projects, you'll find me exploring new technologies, 
                  staying updated with SEO trends, or working on innovative projects like Guro.ai.
                </p>
              </div>
            </div>

            {/* Experience Timeline */}
            <div className="space-y-6">
              <h3 className="heading-tertiary text-gradient">Experience</h3>
              <div className="space-y-4">
                {experiences.map((exp, index) => (
                  <div key={index} className="card p-6 hover:scale-105 transition-transform">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{exp.year}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg">{exp.title}</h4>
                        <p className="text-cyan-400 font-medium">{exp.company}</p>
                        <p className="text-gray-300 text-sm mt-2">{exp.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Skills */}
          <div className={`space-y-8 ${isVisible ? 'animate-slide-right' : 'opacity-0'}`}>
            <div className="card p-8">
              <h3 className="heading-tertiary mb-6 text-gradient">Skills & Technologies</h3>
              
              {/* Skill Categories */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {skills.map((skill, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSkill(index)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      activeSkill === index
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: skill.color }}
                      />
                      <p className="text-white font-medium">{skill.category}</p>
                      <p className="text-sm text-gray-400">{skill.level}%</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Skill Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold text-lg">
                    {skills[activeSkill].category}
                  </h4>
                  <span className="text-cyan-400 font-bold">
                    {skills[activeSkill].level}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${skills[activeSkill].level}%`,
                      background: `linear-gradient(90deg, ${skills[activeSkill].color}, ${skills[activeSkill].color}80)`
                    }}
                  />
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {skills[activeSkill].technologies.map((tech, index) => (
                    <span 
                      key={index}
                      className="code-text"
                      style={{ borderColor: skills[activeSkill].color + '40' }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Fun Facts */}
            <div className="card p-8">
              <h3 className="heading-tertiary mb-6 text-gradient">Fun Facts</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">7+</div>
                  <p className="text-gray-300 text-sm">Years WordPress</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">5+</div>
                  <p className="text-gray-300 text-sm">Years SEO</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">2+</div>
                  <p className="text-gray-300 text-sm">Years Shopify</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">∞</div>
                  <p className="text-gray-300 text-sm">Learning Mode</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
