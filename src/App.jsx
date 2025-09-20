import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';
import DigitalMarketingSection from './components/DigitalMarketingSection';
import ServiceSelector from './components/ServiceSelector';
import SEOSimulator from './components/SEOSimulator';
import WordPressSimulator from './components/WordPressSimulator';
import AnimatedBackground from './components/AnimatedBackground';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showSEOSimulator, setShowSEOSimulator] = useState(false);
  const [showWordPressSimulator, setShowWordPressSimulator] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleShowServiceSelector = () => {
    setShowServiceSelector(true);
  };

  const handleCloseServiceSelector = () => {
    setShowServiceSelector(false);
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setShowServiceSelector(false);
    
    // Show the appropriate simulator based on service
    if (service.id === 'seo') {
      setShowSEOSimulator(true);
    } else if (service.id === 'wordpress') {
      setShowWordPressSimulator(true);
    }
    // Add more simulators here as we build them
  };

  const handleBackFromSimulator = () => {
    setShowSEOSimulator(false);
    setShowWordPressSimulator(false);
    setShowServiceSelector(true);
  };

  const handleProceedToQuote = (serviceData) => {
    // Handle proceeding to quote with service data
    setShowSEOSimulator(false);
    setShowWordPressSimulator(false);
    // You could store the serviceData and show a quote form
    console.log('Proceeding to quote with:', serviceData);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'projects', 'digital-marketing', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="App">
      <AnimatedBackground />
      <Navigation activeSection={activeSection} lightboxOpen={lightboxOpen} />
      <div className="main-layout">
        <main className="content-area">
          <HeroSection />
          <AboutSection />
          <ProjectsSection onLightboxChange={setLightboxOpen} onShowServiceSelector={handleShowServiceSelector} />
          <DigitalMarketingSection onLightboxChange={setLightboxOpen} />
            <ContactSection />
        </main>
        <div className="sticky-profile-wrapper">
          <div className="sticky-profile-container">
            {/* Profile image will be moved here */}
          </div>
        </div>
      </div>

      {/* Service Selector Modal */}
      {showServiceSelector && (
        <ServiceSelector
          onSelectService={handleSelectService}
          onClose={handleCloseServiceSelector}
        />
      )}

      {/* SEO Simulator Modal */}
      {showSEOSimulator && (
        <SEOSimulator
          onBack={handleBackFromSimulator}
          onProceedToQuote={handleProceedToQuote}
        />
      )}

      {/* WordPress Simulator Modal */}
      {showWordPressSimulator && (
        <WordPressSimulator
          onBack={handleBackFromSimulator}
          onProceedToQuote={handleProceedToQuote}
        />
      )}
    </div>
  );
}

export default App;