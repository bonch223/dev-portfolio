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
import FullStackSimulator from './components/FullStackSimulator';
import ProcessPage from './components/ProcessPage';
import SEOQuoteGenerator from './components/SEOQuoteGenerator';
import WordPressQuoteGenerator from './components/WordPressQuoteGenerator';
import FullStackQuoteGenerator from './components/FullStackQuoteGenerator';
import AnimatedBackground from './components/AnimatedBackground';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showSEOSimulator, setShowSEOSimulator] = useState(false);
  const [showWordPressSimulator, setShowWordPressSimulator] = useState(false);
  const [showFullStackSimulator, setShowFullStackSimulator] = useState(false);
  const [showProcessPage, setShowProcessPage] = useState(false);
  const [showSEOQuoteGenerator, setShowSEOQuoteGenerator] = useState(false);
  const [showWordPressQuoteGenerator, setShowWordPressQuoteGenerator] = useState(false);
  const [showFullStackQuoteGenerator, setShowFullStackQuoteGenerator] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [processService, setProcessService] = useState(null);
  const [currentServiceData, setCurrentServiceData] = useState(null);

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
        } else if (service.id === 'fullstack') {
          setShowFullStackSimulator(true);
        }
    // Add more simulators here as we build them
  };

  const handleBackFromSimulator = () => {
    setShowSEOSimulator(false);
    setShowWordPressSimulator(false);
    setShowFullStackSimulator(false);
    setShowServiceSelector(true);
  };

  const handleProceedToQuote = (serviceData) => {
    // Handle proceeding to quote with service data
    setCurrentServiceData(serviceData);
    
    // Close current simulator
    setShowSEOSimulator(false);
    setShowWordPressSimulator(false);
    setShowFullStackSimulator(false);
    
    // Show appropriate quote generator based on service
    if (serviceData.service === 'SEO Optimization') {
      setShowSEOQuoteGenerator(true);
    } else if (serviceData.service === 'WordPress Development') {
      setShowWordPressQuoteGenerator(true);
    } else if (serviceData.service === 'FullStack Development') {
      setShowFullStackQuoteGenerator(true);
    }
    // Add more quote generators here for other services
    
    console.log('Proceeding to quote with:', serviceData);
  };

  const handleShowProcessPage = (service) => {
    setProcessService(service);
    setShowProcessPage(true);
  };

  const handleCloseProcessPage = () => {
    setShowProcessPage(false);
    setProcessService(null);
    // Ensure body scroll is restored when process page closes
    document.body.style.overflow = 'unset';
  };

  const handleCloseSEOQuoteGenerator = () => {
    setShowSEOQuoteGenerator(false);
    setCurrentServiceData(null);
  };

  const handleCloseWordPressQuoteGenerator = () => {
    setShowWordPressQuoteGenerator(false);
    setCurrentServiceData(null);
  };

  const handleCloseFullStackQuoteGenerator = () => {
    setShowFullStackQuoteGenerator(false);
    setCurrentServiceData(null);
  };

  const handleGenerateQuote = (quoteData, formData) => {
    // Handle quote generation - could save to database, send email, etc.
    // Here you could:
    // 1. Save quote to database
    // 2. Send email with quote
    // 3. Generate PDF
    // 4. Redirect to payment
    
    // Note: The quote generators handle their own display and closing
    // They will show the quote summary on the final step
    // and only close when the user explicitly closes them
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
          key={`service-selector-${showProcessPage}`}
          onSelectService={handleSelectService}
          onClose={handleCloseServiceSelector}
          onShowProcessPage={handleShowProcessPage}
        />
      )}

      {/* SEO Simulator Modal */}
      {showSEOSimulator && (
        <SEOSimulator
          onBack={handleBackFromSimulator}
          onProceedToQuote={handleProceedToQuote}
          onShowProcessPage={handleShowProcessPage}
        />
      )}

      {/* WordPress Simulator Modal */}
      {showWordPressSimulator && (
        <WordPressSimulator
          onBack={handleBackFromSimulator}
          onProceedToQuote={handleProceedToQuote}
          onShowProcessPage={handleShowProcessPage}
        />
      )}

      {/* Full Stack Simulator Modal */}
      {showFullStackSimulator && (
        <FullStackSimulator
          onBack={handleBackFromSimulator}
          onProceedToQuote={handleProceedToQuote}
          onShowProcessPage={handleShowProcessPage}
        />
      )}

      {/* Process Page Modal */}
      {showProcessPage && (
        <ProcessPage
          service={processService}
          onBack={handleCloseProcessPage}
        />
      )}

      {/* SEO Quote Generator Modal */}
      {showSEOQuoteGenerator && (
        <SEOQuoteGenerator
          onBack={handleCloseSEOQuoteGenerator}
          onGenerateQuote={handleGenerateQuote}
          simulatorData={currentServiceData?.simulatorData}
        />
      )}

      {/* WordPress Quote Generator Modal */}
      {showWordPressQuoteGenerator && (
        <WordPressQuoteGenerator
          onBack={handleCloseWordPressQuoteGenerator}
          onGenerateQuote={handleGenerateQuote}
          simulatorData={currentServiceData}
        />
      )}

      {/* FullStack Quote Generator Modal */}
      {showFullStackQuoteGenerator && (
        <FullStackQuoteGenerator
          onBack={handleCloseFullStackQuoteGenerator}
          onGenerateQuote={handleGenerateQuote}
          simulatorData={currentServiceData}
        />
      )}
    </div>
  );
}

export default App;