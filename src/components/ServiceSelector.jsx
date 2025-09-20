import React, { useState, useEffect } from 'react';

const ServiceSelector = ({ onSelectService, onClose, onShowProcessPage }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    setIsVisible(true);
    // Reset any existing scroll issues and lock body scroll
    document.body.style.overflow = 'hidden';
    // Force a reflow to ensure styles are applied
    document.body.offsetHeight;
    
    return () => {
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Additional effect to handle reopening after returning from process page
  useEffect(() => {
    if (isVisible) {
      // Reset scroll position and lock body scroll
      document.body.style.overflow = 'hidden';
      // Reset any scroll position in the modal
      const modalContainer = document.querySelector('.service-selector-modal');
      if (modalContainer) {
        modalContainer.scrollTop = 0;
      }
    }
  }, [isVisible]);

  const services = [
    {
      id: 'seo',
      title: 'SEO Optimization',
      subtitle: 'Boost Your Search Rankings',
      description: 'Analyze your website, research keywords, and optimize for search engines.',
      icon: '🔍',
      color: '#10B981',
      gradient: 'from-green-400 to-emerald-600',
      features: ['Website Analysis', 'Keyword Research', 'Meta Optimization', 'Performance Audit'],
      simulator: 'SEO Simulator',
      available: true
    },
    {
      id: 'wordpress',
      title: 'WordPress Development',
      subtitle: 'Build Beautiful Websites',
      description: 'Create responsive, custom WordPress sites with drag-and-drop ease.',
      icon: '🌐',
      color: '#3B82F6',
      gradient: 'from-blue-400 to-blue-600',
      features: ['Custom Themes', 'Plugin Development', 'E-commerce Setup', 'Performance Optimization'],
      simulator: 'WordPress Builder',
      available: true
    },
    {
      id: 'fullstack',
      title: 'Full Stack Development',
      subtitle: 'Complete Web Solutions',
      description: 'Design databases, build APIs, and create full-featured web applications.',
      icon: '💻',
      color: '#8B5CF6',
      gradient: 'from-purple-400 to-purple-600',
      features: ['Database Design', 'API Development', 'Frontend & Backend', 'Deployment'],
      simulator: 'Full Stack Designer',
      available: true
    },
    {
      id: 'uiux',
      title: 'UI/UX Design',
      subtitle: 'Create Amazing Experiences',
      description: 'Design intuitive interfaces and user experiences that convert.',
      icon: '🎨',
      color: '#F59E0B',
      gradient: 'from-yellow-400 to-orange-500',
      features: ['Wireframing', 'Prototyping', 'User Research', 'Design Systems'],
      simulator: 'Design Studio',
      available: false,
      status: 'Under Development'
    },
    {
      id: 'digital-marketing',
      title: 'Digital Marketing',
      subtitle: 'Grow Your Business',
      description: 'Create campaigns, analyze performance, and drive conversions.',
      icon: '📈',
      color: '#EF4444',
      gradient: 'from-red-400 to-pink-500',
      features: ['Campaign Creation', 'Analytics Setup', 'Content Strategy', 'Conversion Optimization'],
      simulator: 'Marketing Lab',
      available: false,
      status: 'Coming Soon'
    },
    {
      id: 'tech-consult',
      title: 'Tech Consultation',
      subtitle: 'Strategic Guidance',
      description: 'Get expert advice on technology choices and business strategy.',
      icon: '💡',
      color: '#06B6D4',
      gradient: 'from-cyan-400 to-teal-500',
      features: ['Tech Audits', 'Strategy Planning', 'Architecture Review', 'Best Practices'],
      simulator: 'Consultation Hub',
      available: false,
      status: 'Coming Soon'
    }
  ];

  const handleServiceSelect = (service) => {
    if (!service.available) return; // Don't allow selection of unavailable services
    
    setSelectedService(service);
    // Add a small delay for smooth transition
    setTimeout(() => {
      onSelectService(service);
    }, 300);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Restore body scroll immediately
    document.body.style.overflow = 'unset';
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={`fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="service-selector-modal container mx-auto px-4 py-8 h-full overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={handleClose}
            className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Choose Your <span className="text-gradient">Service</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Try out our interactive tools to experience what we can do for you. 
            Each simulator gives you a real feel for the service before we work together.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`glass-content-pane group transition-all duration-500 relative overflow-hidden ${
                service.available 
                  ? `hover:scale-105 cursor-pointer ${selectedService?.id === service.id ? 'ring-2 ring-cyan-400 scale-105' : ''}`
                  : 'opacity-60 cursor-not-allowed'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleServiceSelect(service)}
            >
              {/* Service Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center text-3xl mb-6 mx-auto group-hover:rotate-12 transition-transform duration-300`}>
                {service.icon}
              </div>

              {/* Service Info */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-cyan-400 font-medium mb-3">
                  {service.subtitle}
                </p>
                <p className="text-gray-300 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="text-center space-y-3 relative z-10">
                      {service.available ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServiceSelect(service);
                          }}
                          className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r ${service.gradient} text-white font-bold hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                        >
                          <span>Try {service.simulator}</span>
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                ) : (
                  <div className="inline-flex items-center px-6 py-3 rounded-xl bg-gray-600/50 text-gray-300 font-bold border border-gray-500/50 w-full justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{service.status}</span>
                  </div>
                )}
                
                      {/* Complete Process Link - Always visible */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowProcessPage(service.id);
                        }}
                        className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium no-focus-outline"
                      >
                        <span>View Complete Process Details</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
              </div>

              {/* Hover Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-6 max-w-3xl mx-auto mb-6">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-blue-400 font-semibold">Simplified Demo Process</h4>
            </div>
            <p className="text-gray-300 text-sm">
              These simulators provide a simplified version of our actual processes to give you a taste of what we do. 
              Each service has detailed process information available via the links above.
            </p>
          </div>
          
          <p className="text-gray-400 text-sm">
            Each simulator is designed to give you real value and insight into our services.
            <br />
            After trying them out, you'll have a clear understanding of what we can achieve together.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelector;
