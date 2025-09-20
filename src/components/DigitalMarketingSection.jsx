import React, { useState, useEffect } from 'react';
import LightboxGallery from './LightboxGallery';
import { socialMediaAssets, printMaterialsAssets, seoAssets } from '../utils/assets';

const DigitalMarketingSection = ({ onLightboxChange }) => {
  const [activeCategory, setActiveCategory] = useState('social-media');
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const categories = [
    { id: 'social-media', label: 'Social Media', icon: '📱' },
    { id: 'print-materials', label: 'Print Materials', icon: '📄' },
    { id: 'seo-results', label: 'SEO Results', icon: '📈' }
  ];

  const socialMedia = socialMediaAssets;
  const printMaterials = printMaterialsAssets;
  const seoResults = seoAssets;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const openLightbox = (images, startIndex = 0) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
    onLightboxChange(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    onLightboxChange(false);
  };

  const getCurrentAssets = () => {
    switch (activeCategory) {
      case 'social-media':
        return socialMedia;
      case 'print-materials':
        return printMaterials;
      case 'seo-results':
        return seoResults;
      default:
        return [];
    }
  };

  const getCategoryInfo = () => {
    switch (activeCategory) {
      case 'social-media':
        return {
          title: 'Social Media Management',
          description: 'Social media pages and content I managed across various platforms, showcasing brand consistency and engagement strategies.',
          color: '#8B5CF6',
          gradient: 'from-purple-400 to-pink-500'
        };
      case 'print-materials':
        return {
          title: 'Print Materials Design',
          description: 'Professional print design including brochures, flyers, business cards, and marketing materials that make a lasting impression.',
          color: '#F59E0B',
          gradient: 'from-amber-400 to-orange-500'
        };
      case 'seo-results':
        return {
          title: 'SEO Results Showcase',
          description: 'Before and after comparisons showcasing significant improvements in search rankings and organic traffic.',
          color: '#10B981',
          gradient: 'from-emerald-400 to-green-500'
        };
      default:
        return {
          title: 'Digital Marketing',
          description: 'Comprehensive digital marketing solutions',
          color: '#00D4FF',
          gradient: 'from-cyan-400 to-blue-500'
        };
    }
  };

  const categoryInfo = getCategoryInfo();

  return (
    <section id="digital-marketing" className="section relative z-10">
      <div className="section-content">
        <div className="text-center mb-16">
          <h2 className="heading-secondary mb-4">
            Digital <span className="text-gradient">Marketing</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Comprehensive digital marketing solutions including social media campaigns, 
            print design, and SEO optimization that drive real results for businesses.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex justify-center mb-12">
          <div className="glass-content-pane p-2">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className={`${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          {/* Category Info */}
          <div className="glass-content-pane mb-8 group hover:scale-105 transition-all duration-500 relative overflow-hidden">
            <div className={`absolute top-4 right-4 w-16 h-16 bg-gradient-to-r ${categoryInfo.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity animate-pulse`}></div>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-r ${categoryInfo.gradient} rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                <span className="text-3xl">{categories.find(c => c.id === activeCategory)?.icon}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{categoryInfo.title}</h3>
                <p className="text-cyan-400 text-sm">Digital Marketing Solutions</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              {categoryInfo.description}
            </p>

            {/* SEO Results Special Layout */}
            {activeCategory === 'seo-results' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-semibold text-lg">Before SEO Optimization</h4>
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => openLightbox(seoResults, 0)}
                  >
                    <img 
                      src={seoResults[0]} 
                      alt="SEO Before" 
                      className="w-full rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-lg transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-white font-semibold text-lg">After SEO Optimization</h4>
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => openLightbox(seoResults, 1)}
                  >
                    <img 
                      src={seoResults[1]} 
                      alt="SEO After" 
                      className="w-full rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-lg transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Layout for Other Categories */}
            {activeCategory !== 'seo-results' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCurrentAssets().map((asset, index) => (
                  <div 
                    key={index}
                    className="relative cursor-pointer group"
                    onClick={() => openLightbox(getCurrentAssets(), index)}
                  >
                    <img 
                      src={asset} 
                      alt={`${categoryInfo.title} ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-lg transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default DigitalMarketingSection;
