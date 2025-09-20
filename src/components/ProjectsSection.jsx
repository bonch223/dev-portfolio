import React, { useState, useEffect } from 'react';
import LightboxGallery from './LightboxGallery';

const ProjectsSection = ({ onLightboxChange }) => {
  const [activeProject, setActiveProject] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Utility function to prioritize videos in gallery
  const prioritizeVideosInGallery = (gallery) => {
    if (!gallery) return gallery;
    return gallery.sort((a, b) => {
      const aIsVideo = a.endsWith('.mp4') || a.endsWith('.webm') || a.endsWith('.mov');
      const bIsVideo = b.endsWith('.mp4') || b.endsWith('.webm') || b.endsWith('.mov');
      
      if (aIsVideo && !bIsVideo) return -1; // Video first
      if (!aIsVideo && bIsVideo) return 1;  // Video first
      return 0; // Keep original order for same type
    });
  };

  // Featured Projects (5 main projects with full development and links)
  const featuredProjects = [
    {
      id: 'guro-ai',
      title: 'Guro.AI',
      subtitle: 'AI Lesson Plan Generator',
      description: 'An innovative AI-powered platform that generates personalized lesson plans for Filipino teachers, making education more accessible and efficient.',
      longDescription: 'Guro.AI revolutionizes education by leveraging artificial intelligence to create customized lesson plans. The platform analyzes curriculum requirements, student needs, and teaching preferences to generate comprehensive, engaging lesson plans that save teachers hours of preparation time.',
      image: '/src/assets/guro.ai/536270183_24671247665820897_5850011110701414279_n.jpg',
      video: '/src/assets/guro.ai/Guro.AI - AI Lesson Plan Generator for Filipino Teachers.mp4',
      gallery: [
        '/src/assets/guro.ai/Guro.AI - AI Lesson Plan Generator for Filipino Teachers.mp4',
        '/src/assets/guro.ai/536270183_24671247665820897_5850011110701414279_n.jpg',
        '/src/assets/guro.ai/536279927_24671248132487517_3002615940259727901_n.jpg',
        '/src/assets/guro.ai/540621977_24671253052487025_4440463990289559173_n.jpg'
      ],
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
      gallery: [
        '/src/assets/SkillFoundri/1.png',
        '/src/assets/SkillFoundri/2.png',
        '/src/assets/SkillFoundri/3.png'
      ],
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
      gallery: [
        '/src/assets/rage/1.png',
        '/src/assets/rage/2.png',
        '/src/assets/rage/3.png'
      ],
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
      gallery: [
        '/src/assets/urbancare/1.png',
        '/src/assets/urbancare/2.png',
        '/src/assets/urbancare/3.png'
      ],
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
      subtitle: 'Fashion E-commerce Platform',
      description: 'A complete e-commerce website for a trendy fashion brand, featuring modern design, seamless shopping experience, and mobile-first approach.',
      longDescription: 'Fantastic Baby Shakalaka is a cutting-edge fashion e-commerce platform that showcases trendy clothing and accessories. The website features a modern, responsive design with seamless shopping experience, integrated payment systems, and optimized for both desktop and mobile users. The platform includes advanced filtering, wishlist functionality, and social media integration.',
      image: '/src/assets/fantasticbabyshakala/1.png',
      gallery: [
        '/src/assets/fantasticbabyshakala/1.png',
        '/src/assets/fantasticbabyshakala/2.png',
        '/src/assets/fantasticbabyshakala/3.png'
      ],
      technologies: ['WordPress', 'WooCommerce', 'PHP', 'CSS3', 'JavaScript', 'SEO', 'Payment Integration'],
      features: [
        'Modern responsive design',
        'E-commerce functionality',
        'Product gallery with zoom',
        'Mobile-first approach',
        'SEO optimization',
        'Payment gateway integration',
        'Social media integration',
        'Performance optimization'
      ],
      color: '#EC4899',
      gradient: 'from-pink-400 to-purple-500',
      category: 'E-commerce',
      status: 'Live',
      url: 'https://fantasticbabyshakalaka.com/'
    }
  ];

  // Other Projects (projects without full development or links)
  const otherProjects = [
    {
      id: 'decor-meadow',
      title: 'Decor Meadow',
      subtitle: 'Home Decor E-commerce',
      description: 'A beautiful e-commerce website for home decor and interior design products with modern UI/UX and seamless shopping experience.',
      image: '/src/assets/Websites Created and Maintained/decormeadow.png',
      technologies: ['WordPress', 'WooCommerce', 'PHP', 'CSS3', 'JavaScript'],
      color: '#10B981',
      gradient: 'from-green-400 to-emerald-500',
      category: 'Website Creation'
    },
    {
      id: 'femme-fits',
      title: 'Femme Fits',
      subtitle: 'Fashion & Fitness Platform',
      description: 'A modern fashion and fitness website targeting women with workout guides, fashion tips, and lifestyle content.',
      image: '/src/assets/Websites Created and Maintained/femmefits.png',
      technologies: ['WordPress', 'PHP', 'CSS3', 'JavaScript'],
      color: '#F59E0B',
      gradient: 'from-amber-400 to-orange-500',
      category: 'Website Creation'
    },
    {
      id: 'gents-den',
      title: 'Gents Den',
      subtitle: 'Men\'s Lifestyle Platform',
      description: 'A sophisticated men\'s lifestyle website featuring grooming tips, fashion advice, and lifestyle content for the modern gentleman.',
      image: '/src/assets/Websites Created and Maintained/gentsden.png',
      technologies: ['WordPress', 'PHP', 'CSS3', 'JavaScript'],
      color: '#6B7280',
      gradient: 'from-gray-400 to-slate-500',
      category: 'Website Creation'
    },
    {
      id: 'plush-pendants',
      title: 'Plush Pendants',
      subtitle: 'Jewelry E-commerce',
      description: 'An elegant e-commerce website for jewelry and accessories with beautiful product showcases and secure online shopping.',
      image: '/src/assets/Websites Created and Maintained/plushpendants.png',
      technologies: ['WordPress', 'WooCommerce', 'PHP', 'CSS3'],
      color: '#8B5CF6',
      gradient: 'from-purple-400 to-violet-500',
      category: 'Website Creation'
    },
    {
      id: 'starlet-style',
      title: 'Starlet Style',
      subtitle: 'Fashion & Beauty Blog',
      description: 'A vibrant fashion and beauty blog website with trend updates, style guides, and beauty tips for fashion enthusiasts.',
      image: '/src/assets/Websites Created and Maintained/starletstyle.png',
      technologies: ['WordPress', 'PHP', 'CSS3', 'JavaScript'],
      color: '#EC4899',
      gradient: 'from-pink-400 to-rose-500',
      category: 'Website Creation'
    },
    {
      id: 'cebu-first',
      title: 'Cebu First',
      subtitle: 'SEO Analysis & Insights',
      description: 'Provided SEO analysis and strategic insights for Cebu First website, offering recommendations for search ranking improvements.',
      image: '/src/assets/Websites Created and Maintained/Cebufirst.png',
      technologies: ['SEO Analysis', 'Technical Audit', 'Strategic Insights'],
      color: '#3B82F6',
      gradient: 'from-blue-400 to-indigo-500',
      category: 'SEO Consultation'
    },
    {
      id: 'cebu-land-masters',
      title: 'Cebu Land Masters',
      subtitle: 'SEO Analysis & Insights',
      description: 'Conducted SEO analysis for Cebu Land Masters real estate website, providing strategic recommendations for local search optimization.',
      image: '/src/assets/Websites Created and Maintained/cebulandmasters.png',
      technologies: ['Local SEO Analysis', 'Real Estate SEO', 'Strategic Recommendations'],
      color: '#059669',
      gradient: 'from-emerald-400 to-green-500',
      category: 'SEO Consultation'
    }
  ];

  // Use featured projects as main projects for navigation
  const projects = featuredProjects;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openLightbox = (images, startIndex = 0) => {
    const prioritizedImages = prioritizeVideosInGallery(images);
    setLightboxImages(prioritizedImages);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
    onLightboxChange(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    onLightboxChange(false);
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
            <div 
              className="relative card p-4 overflow-hidden group cursor-pointer"
              onClick={() => {
                if (projects[activeProject].gallery) {
                  openLightbox(projects[activeProject].gallery, 0);
                }
              }}
            >
              {projects[activeProject].video ? (
                <div className="relative">
                  <video 
                    className="w-full h-64 object-cover rounded-lg"
                    poster={projects[activeProject].image}
                    controls
                    muted
                    onClick={(e) => e.stopPropagation()}
                  >
                    <source src={projects[activeProject].video} type="video/mp4" />
                  </video>
                  {/* Video overlay for gallery access */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <img 
                  src={projects[activeProject].image} 
                  alt={projects[activeProject].title}
                  className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
              )}
              
              {/* Gallery button */}
              {projects[activeProject].gallery && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(projects[activeProject].gallery, 0);
                  }}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-4 bg-gradient-to-t from-black/50 to-transparent rounded-lg pointer-events-none" />
              
              {/* Gallery indicator */}
              {projects[activeProject].gallery && projects[activeProject].gallery.length > 1 && (
                <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-2">
                  <span className="text-white text-sm font-medium">
                    {projects[activeProject].gallery.length} items
                  </span>
                  {projects[activeProject].gallery.some(item => 
                    item.endsWith('.mp4') || item.endsWith('.webm') || item.endsWith('.mov')
                  ) && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <span className="text-white text-xs">+ Video</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Floating elements */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r ${projects[activeProject].gradient} rounded-full animate-float opacity-60`} />
            <div className={`absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r ${projects[activeProject].gradient} rounded-full animate-float opacity-60`} style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Other Projects Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h3 className="heading-tertiary mb-2 text-gradient">
              Other <span className="text-gradient">Projects</span>
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Additional projects showcasing diverse skills across different industries.
            </p>
          </div>

          {/* Other Projects Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {otherProjects.map((project, index) => (
              <div 
                key={project.id}
                className="glass-content-pane group hover:scale-105 transition-all duration-300 relative overflow-hidden"
              >
                {/* Project Image */}
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ 
                        background: `${project.color}40`,
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {project.category.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-3">
                  <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-cyan-400 transition-colors truncate">
                    {project.title}
                  </h4>
                  <p className="text-cyan-400 text-xs font-medium mb-2 truncate">
                    {project.subtitle}
                  </p>
                  <p className="text-gray-300 text-xs leading-relaxed mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 2).map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="px-2 py-1 rounded text-xs text-gray-300"
                        style={{ 
                          background: `${project.color}20`,
                          border: `1px solid ${project.color}30`
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 2 && (
                      <span className="text-gray-400 text-xs">
                        +{project.technologies.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Accent Line */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300"
                  style={{ background: `${project.color}` }}
                />
              </div>
            ))}
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

      {/* Lightbox Gallery */}
      <LightboxGallery
        images={lightboxImages}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        initialIndex={lightboxIndex}
      />
    </section>
  );
};

export default ProjectsSection;
