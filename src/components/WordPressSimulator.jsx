import React, { useState, useEffect } from 'react';

const WordPressSimulator = ({ onBack, onProceedToQuote }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedPlugins, setSelectedPlugins] = useState([]);
  const [pageElements, setPageElements] = useState([]);
  const [themeColors, setThemeColors] = useState({
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#F59E0B'
  });

  useEffect(() => {
    setIsVisible(true);
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset';
    };
  }, []);

  const steps = [
    'Choose Theme',
    'Customize Colors',
    'Build Your Page',
    'Add Plugins',
    'Preview & Results'
  ];

  const themes = [
    {
      id: 'business',
      name: 'Business Pro',
      description: 'Professional theme perfect for corporate websites',
      image: '/api/placeholder/300/200',
      features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Customizable']
    },
    {
      id: 'creative',
      name: 'Creative Studio',
      description: 'Modern theme for creative agencies and portfolios',
      image: '/api/placeholder/300/200',
      features: ['Portfolio Gallery', 'Animation Effects', 'Creative Layouts', 'Social Integration']
    },
    {
      id: 'ecommerce',
      name: 'Shop Master',
      description: 'Complete e-commerce solution with WooCommerce',
      image: '/api/placeholder/300/200',
      features: ['WooCommerce Ready', 'Payment Integration', 'Inventory Management', 'Mobile Optimized']
    }
  ];

  const pageBlocks = [
    {
      id: 'hero',
      name: 'Hero Section',
      icon: '🏠',
      description: 'Eye-catching banner with call-to-action'
    },
    {
      id: 'text',
      name: 'Text Block',
      icon: '📝',
      description: 'Rich text content with formatting options'
    },
    {
      id: 'image',
      name: 'Image Gallery',
      icon: '🖼️',
      description: 'Beautiful image gallery with lightbox'
    },
    {
      id: 'button',
      name: 'Call-to-Action',
      icon: '🔘',
      description: 'Prominent button to drive conversions'
    },
    {
      id: 'contact',
      name: 'Contact Form',
      icon: '📧',
      description: 'Professional contact form'
    }
  ];

  const plugins = [
    {
      id: 'yoast',
      name: 'Yoast SEO',
      description: 'Optimize your site for search engines',
      icon: '🔍',
      category: 'SEO'
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      description: 'Complete e-commerce solution',
      icon: '🛒',
      category: 'E-commerce'
    },
    {
      id: 'contact-form-7',
      name: 'Contact Form 7',
      description: 'Create and manage contact forms',
      icon: '📧',
      category: 'Forms'
    },
    {
      id: 'wp-rocket',
      name: 'WP Rocket',
      description: 'Speed up your website',
      icon: '🚀',
      category: 'Performance'
    },
    {
      id: 'elementor',
      name: 'Elementor',
      description: 'Advanced page builder',
      icon: '🎨',
      category: 'Design'
    }
  ];

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setCurrentStep(1);
  };

  const handleColorChange = (colorType, value) => {
    setThemeColors(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  const handleAddElement = (element) => {
    setPageElements(prev => [...prev, { ...element, id: Date.now() }]);
  };

  const handleRemoveElement = (elementId) => {
    setPageElements(prev => prev.filter(el => el.id !== elementId));
  };

  const handlePluginToggle = (plugin) => {
    setSelectedPlugins(prev => 
      prev.some(p => p.id === plugin.id)
        ? prev.filter(p => p.id !== plugin.id)
        : [...prev, plugin]
    );
  };

  const handleProceedToQuote = () => {
    const serviceData = {
      service: 'WordPress Development',
      theme: selectedTheme,
      colors: themeColors,
      elements: pageElements,
      plugins: selectedPlugins
    };
    onProceedToQuote(serviceData);
  };

  return (
    <div className={`fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4 py-8 h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Services
            </button>
            
            <div className="flex items-center text-blue-400 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Simplified Demo
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index <= currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  index <= currentStep ? 'text-white' : 'text-gray-400'
                }`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-600 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 0 && (
            <div className="glass-content-pane">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">
                  🌐
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Choose Your WordPress Theme
                </h2>
                <p className="text-gray-300 text-lg">
                  Select a theme that matches your brand and business needs. 
                  Each theme comes with unique features and customization options.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`glass-content-pane cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedTheme?.id === theme.id ? 'ring-2 ring-blue-400' : ''
                    }`}
                    onClick={() => handleThemeSelect(theme)}
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-6xl opacity-50">
                        {theme.id === 'business' && '🏢'}
                        {theme.id === 'creative' && '🎨'}
                        {theme.id === 'ecommerce' && '🛒'}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{theme.name}</h3>
                    <p className="text-gray-300 mb-4">{theme.description}</p>
                    <div className="space-y-2">
                      {theme.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-300">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 1 && selectedTheme && (
            <div className="glass-content-pane">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Customize Your Theme Colors
                </h2>
                <p className="text-gray-300 text-lg">
                  Choose colors that represent your brand and create a cohesive look.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Primary Color</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={themeColors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-16 h-16 rounded-lg border border-gray-600"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={themeColors.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Secondary Color</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={themeColors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-16 h-16 rounded-lg border border-gray-600"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={themeColors.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Accent Color</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={themeColors.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="w-16 h-16 rounded-lg border border-gray-600"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={themeColors.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-white font-bold mb-4">Live Preview</h3>
                  <div className="bg-white rounded-lg p-4 text-black">
                    <div className="h-32 rounded-lg mb-4" style={{ backgroundColor: themeColors.primary }}>
                      <div className="h-full flex items-center justify-center">
                        <span className="text-white font-bold">Header</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 rounded" style={{ backgroundColor: themeColors.secondary }}></div>
                      <div className="h-4 rounded w-3/4" style={{ backgroundColor: themeColors.accent }}></div>
                      <div className="h-4 rounded w-1/2 bg-gray-300"></div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transition-all duration-300 mt-8"
              >
                Continue to Page Builder
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="glass-content-pane">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Build Your Page
                </h2>
                <p className="text-gray-300 text-lg">
                  Drag and drop elements to build your page. Click on elements to add them.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Page Elements</h3>
                  <div className="space-y-3">
                    {pageBlocks.map((block) => (
                      <div
                        key={block.id}
                        className="flex items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleAddElement(block)}
                      >
                        <span className="text-2xl mr-4">{block.icon}</span>
                        <div>
                          <h4 className="text-white font-medium">{block.name}</h4>
                          <p className="text-gray-400 text-sm">{block.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Your Page</h3>
                  <div className="bg-white rounded-lg p-4 min-h-96">
                    {pageElements.length === 0 ? (
                      <div className="flex items-center justify-center h-64 text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📄</div>
                          <p>Your page is empty. Add some elements!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pageElements.map((element) => (
                          <div
                            key={element.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center">
                              <span className="text-xl mr-3">{element.icon}</span>
                              <span className="text-gray-800">{element.name}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveElement(element.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transition-all duration-300 mt-8"
              >
                Add Plugins
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="glass-content-pane">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Choose Plugins
                </h2>
                <p className="text-gray-300 text-lg">
                  Select plugins to add functionality to your website.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className={`glass-content-pane cursor-pointer transition-all duration-300 ${
                      selectedPlugins.some(p => p.id === plugin.id) ? 'ring-2 ring-blue-400' : ''
                    }`}
                    onClick={() => handlePluginToggle(plugin)}
                  >
                    <div className="text-4xl mb-4">{plugin.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{plugin.name}</h3>
                    <p className="text-gray-300 text-sm mb-3">{plugin.description}</p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                      {plugin.category}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setCurrentStep(4)}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transition-all duration-300 mt-8"
              >
                Preview & Get Quote
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="glass-content-pane">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">
                  🎉
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Your WordPress Site is Ready!
                </h2>
                <p className="text-gray-300 text-lg">
                  Here's what I can build for you based on your selections.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Site Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Theme:</span>
                      <span className="text-white">{selectedTheme?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Page Elements:</span>
                      <span className="text-white">{pageElements.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Plugins:</span>
                      <span className="text-white">{selectedPlugins.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Custom Colors:</span>
                      <span className="text-white">3 colors</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">What I'll Deliver</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Custom WordPress theme development</li>
                    <li>• Responsive design for all devices</li>
                    <li>• SEO optimization</li>
                    <li>• Performance optimization</li>
                    <li>• Plugin integration and setup</li>
                    <li>• Content management training</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onBack}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300"
                >
                  Try Another Service
                </button>
                <button
                  onClick={handleProceedToQuote}
                  className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Get Your WordPress Quote
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordPressSimulator;
