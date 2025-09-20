import React, { useState, useEffect } from 'react';
import LightboxGallery from './LightboxGallery';
import { projectAssets, websiteAssets } from '../utils/assets';

const ProjectsSection = ({ onLightboxChange, onShowServiceSelector }) => {
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
      image: projectAssets.guro.main,
      video: projectAssets.guro.video,
      gallery: [
        projectAssets.guro.video,
        ...projectAssets.guro.images
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
      image: projectAssets.skillFoundri.main,
      gallery: projectAssets.skillFoundri.images,
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
      image: projectAssets.rage.main,
      gallery: projectAssets.rage.images,
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
      image: projectAssets.urbanCare.main,
      gallery: projectAssets.urbanCare.images,
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
      image: projectAssets.fantasticBaby.main,
      gallery: projectAssets.fantasticBaby.images,
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
      image: websiteAssets.decorMeadow,
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
      image: websiteAssets.femmeFits,
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
      image: websiteAssets.gentsDen,
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
      image: websiteAssets.plushPendants,
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
      image: websiteAssets.starletStyle,
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
      image: websiteAssets.cebuFirst,
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
      image: websiteAssets.cebuLandMasters,
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

        {/* Enhanced Call to Action - Why Choose Me */}
        <div className="text-center mt-16">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-3xl p-12 border border-cyan-400/30 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-500/5 rounded-3xl"></div>
              <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-purple-600 bg-clip-text text-transparent">
                    Interested in Working Together?
                  </span>
                </h3>
                
                {/* Why Choose Me Section */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-white">Proven Results</h4>
                    <p className="text-gray-300 text-sm">
                      From AI-powered platforms to e-commerce solutions, I've delivered 15+ successful projects that drive real business value and user engagement.
                    </p>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-white">Innovation First</h4>
                    <p className="text-gray-300 text-sm">
                      I stay ahead of technology trends, implementing cutting-edge solutions with modern frameworks and best practices for scalable, future-proof applications.
                    </p>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-white">Dedicated Partnership</h4>
                    <p className="text-gray-300 text-sm">
                      As your development partner, I provide ongoing support, transparent communication, and continuous optimization to ensure your project's long-term success.
                    </p>
                  </div>
                </div>

                {/* How I Create Services */}
                <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-2xl p-8 mb-8 border border-gray-600/30">
                  <h4 className="text-2xl font-bold text-white mb-8 text-left">
                    <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                      How I Create Exceptional Services
                    </span>
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">1</span>
                        </div>
                        <div className="text-left">
                          <h5 className="text-white font-semibold mb-2 text-lg">Discovery & Strategy</h5>
                          <p className="text-gray-300">
                            Deep dive into your business goals, target audience, and technical requirements to create a tailored solution strategy.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">2</span>
                        </div>
                        <div className="text-left">
                          <h5 className="text-white font-semibold mb-2 text-lg">Design & Development</h5>
                          <p className="text-gray-300">
                            Create intuitive user experiences and robust technical architecture using modern technologies and industry best practices.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">3</span>
                        </div>
                        <div className="text-left">
                          <h5 className="text-white font-semibold mb-2 text-lg">Testing & Optimization</h5>
                          <p className="text-gray-300">
                            Rigorous testing across devices and browsers, performance optimization, and SEO implementation for maximum impact.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">4</span>
                        </div>
                        <div className="text-left">
                          <h5 className="text-white font-semibold mb-2 text-lg">Launch & Support</h5>
                          <p className="text-gray-300">
                            Smooth deployment with ongoing maintenance, analytics setup, and continuous improvements to ensure long-term success.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality Assurance */}
                <div className="mb-8">
                  <h4 className="text-2xl font-bold text-white mb-6">
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                      Quality Assurance Promise
                    </span>
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-white font-medium text-sm">100% Responsive</p>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p className="text-white font-medium text-sm">SEO Optimized</p>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-white font-medium text-sm">Secure & Fast</p>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <p className="text-white font-medium text-sm">Ongoing Support</p>
                    </div>
                  </div>
                </div>

                {/* Main CTA */}
                <div className="text-center">
                  <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
                    Ready to transform your ideas into reality? Try our interactive simulators first to experience what we can do, 
                    then let's create something incredible together!
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
                    <button
                      onClick={onShowServiceSelector}
                      className="flex-1 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold py-4 px-8 rounded-full hover:shadow-lg hover:shadow-cyan-400/25 transition-all duration-300 flex items-center justify-center group min-w-[200px]"
                    >
                      <span>Try It Out First</span>
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={scrollToContact}
                      className="flex-1 bg-gray-700/80 hover:bg-gray-600/80 text-white font-bold py-4 px-8 rounded-full border border-gray-500 hover:border-gray-400 transition-all duration-300 min-w-[200px]"
                    >
                      Skip to Contact Form
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
