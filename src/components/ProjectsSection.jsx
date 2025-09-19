import React, { useState, useEffect } from 'react';

const ProjectsSection = () => {
  const [activeProject, setActiveProject] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const projects = [
    {
      id: 'guro-ai',
      title: 'Guro.AI',
      subtitle: 'AI Lesson Plan Generator',
      description: 'An innovative AI-powered platform that generates personalized lesson plans for Filipino teachers, making education more accessible and efficient.',
      longDescription: 'Guro.AI revolutionizes education by leveraging artificial intelligence to create customized lesson plans. The platform analyzes curriculum requirements, student needs, and teaching preferences to generate comprehensive, engaging lesson plans that save teachers hours of preparation time.',
      image: '/src/assets/guro.ai/536270183_24671247665820897_5850011110701414279_n.jpg',
      video: '/src/assets/guro.ai/Guro.AI - AI Lesson Plan Generator for Filipino Teachers.mp4',
      technologies: ['React', 'Node.js', 'OpenAI API', 'MongoDB', 'Tailwind CSS'],
      features: [
        'AI-powered lesson plan generation',
        'Curriculum alignment',
        'Multi-language support',
        'Teacher collaboration tools',
        'Progress tracking'
      ],
      color: '#00D4FF',
      gradient: 'from-cyan-400 to-blue-500',
      category: 'AI/ML',
      status: 'Live',
      url: 'https://guro-ai.vercel.app/'
    },
    {
      id: 'skillfoundri',
      title: 'SkillFoundri',
      subtitle: 'Learning Platform',
      description: 'A comprehensive learning platform combining Upwork, Asana, Blackboard, and Coursera features for a complete educational experience.',
      longDescription: 'SkillFoundri transforms online education by offering project-based learning experiences. As COO and Co-Founder, I lead the development of this platform that combines theoretical knowledge with practical applications, providing students with industry-relevant skills through interactive courses and mentorship programs.',
      image: '/src/assets/SkillFoundri/1.png',
      technologies: ['WordPress', 'PHP', 'MySQL', 'JavaScript', 'CSS'],
      features: [
        'Interactive courses',
        'Project-based learning',
        'Progress tracking',
        'Community features',
        'Certification system'
      ],
      color: '#00FF88',
      gradient: 'from-green-400 to-cyan-400',
      category: 'Web',
      status: 'Live',
      url: 'https://www.skillfoundri.com/'
    },
    {
      id: 'rage-fitness',
      title: 'Rage Fitness Gym',
      subtitle: 'Gym Management System',
      description: 'A comprehensive gym management system with POS functionality for local fitness centers.',
      longDescription: 'Rage Fitness Gym App is a complete gym management solution featuring membership management, POS system, class scheduling, and member tracking. Built for local fitness centers to streamline their operations and improve member experience.',
      image: '/src/assets/rage/1.png',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API', 'CSS'],
      features: [
        'Membership management',
        'POS system',
        'Class scheduling',
        'Member tracking',
        'Payment processing'
      ],
      color: '#FF6B35',
      gradient: 'from-orange-400 to-red-500',
      category: 'Web App',
      status: 'Live',
      url: 'https://rage-fitness-gym.vercel.app/'
    },
    {
      id: 'urbancare',
      title: 'UrbanCare Services',
      subtitle: 'Service Provider Platform',
      description: 'Connect with trusted, vetted service providers for all your home care, renovation, and maintenance needs.',
      longDescription: 'UrbanCare Services bridges the gap between customers and trusted service providers. The platform offers seamless booking, provider vetting, and service tracking, making professional services more accessible and reliable for urban communities.',
      image: '/src/assets/urbancare/1.png',
      technologies: ['React', 'Node.js', 'MongoDB', 'Payment Gateway', 'Mobile Responsive'],
      features: [
        'Service provider network',
        'Booking system',
        'Provider vetting',
        'Service tracking',
        'Mobile responsive'
      ],
      color: '#8B5CF6',
      gradient: 'from-purple-500 to-pink-500',
      category: 'Web App',
      status: 'Live',
      url: 'https://urbancare-services.vercel.app/'
    },
    {
      id: 'fantastic-baby',
      title: 'Fantastic Baby Shakalaka',
      subtitle: 'Client Website',
      description: 'A complete website restructure and development for a client, focusing on improved user experience and modern design.',
      longDescription: 'Fantastic Baby Shakalaka website was completely restructured to improve user experience and modernize the design. The project involved creating a new structure while maintaining the client\'s brand identity and improving overall site performance.',
      image: '/src/assets/SkillFoundri/1.png', // Using SkillFoundri image as placeholder
      technologies: ['WordPress', 'PHP', 'CSS', 'JavaScript', 'SEO'],
      features: [
        'Website restructure',
        'Modern design',
        'SEO optimization',
        'Mobile responsive',
        'Performance optimization'
      ],
      color: '#EC4899',
      gradient: 'from-pink-400 to-purple-500',
      category: 'WordPress',
      status: 'Live',
      url: 'https://fantasticbabyshakalaka.com/'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="projects" className="section relative z-10">
      <div className="section-content">
        <div className="text-center mb-16">
          <h2 className="heading-secondary mb-4">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Explore my portfolio of innovative projects that showcase my expertise in 
            full-stack development, AI integration, and user experience design.
          </p>
        </div>

        {/* Project Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {projects.map((project, index) => (
            <button
              key={project.id}
              onClick={() => setActiveProject(index)}
              className={`px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                activeProject === index
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {project.title}
            </button>
          ))}
        </div>

        {/* Active Project Display */}
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          {/* Left Side - Project Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  projects[activeProject].status === 'Live' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : projects[activeProject].status === 'In Development'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {projects[activeProject].status}
                </span>
                <span className="text-gray-400 text-sm">
                  {projects[activeProject].category}
                </span>
              </div>
              
              <h3 className="heading-tertiary text-gradient">
                {projects[activeProject].title}
              </h3>
              <p className="text-xl text-cyan-400 font-medium">
                {projects[activeProject].subtitle}
              </p>
            </div>

            <p className="text-gray-300 leading-relaxed text-lg">
              {projects[activeProject].longDescription}
            </p>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-lg">Key Features</h4>
              <div className="grid grid-cols-1 gap-2">
                {projects[activeProject].features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${projects[activeProject].gradient}`} />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-lg">Technologies Used</h4>
              <div className="flex flex-wrap gap-2">
                {projects[activeProject].technologies.map((tech, index) => (
                  <span 
                    key={index}
                    className="code-text"
                    style={{ borderColor: projects[activeProject].color + '40' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <a 
                href={projects[activeProject].url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <span>View Project</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button className="btn btn-secondary">
                <span>View Details</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side - Project Visual */}
          <div className="relative">
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${projects[activeProject].gradient} rounded-2xl blur-3xl opacity-20 scale-110`} />
            
            {/* Project image/video container */}
            <div className="relative card p-4 overflow-hidden">
              {projects[activeProject].video ? (
                <video 
                  className="w-full h-64 object-cover rounded-lg"
                  poster={projects[activeProject].image}
                  controls
                  muted
                >
                  <source src={projects[activeProject].video} type="video/mp4" />
                </video>
              ) : (
                <img 
                  src={projects[activeProject].image} 
                  alt={projects[activeProject].title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-4 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
            </div>

            {/* Floating elements */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r ${projects[activeProject].gradient} rounded-full animate-float opacity-60`} />
            <div className={`absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r ${projects[activeProject].gradient} rounded-full animate-float opacity-60`} style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="card p-8 max-w-2xl mx-auto">
            <h3 className="heading-tertiary mb-4 text-gradient">
              Interested in Working Together?
            </h3>
            <p className="text-gray-300 mb-6">
              I'm always excited to work on new projects and collaborate with amazing people. 
              Let's create something incredible together!
            </p>
            <button 
              onClick={scrollToContact}
              className="btn btn-primary"
            >
              <span>Get In Touch</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
