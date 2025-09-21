import React, { useState, useEffect } from 'react';

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(null);
  const [currentVisitors, setCurrentVisitors] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    const trackRealVisit = async () => {
      const sessionVisited = sessionStorage.getItem('portfolio-session-visited');
      
      try {
        if (!sessionVisited) {
          // This is a new session - track the visit
          const response = await fetch('/api/visitor-counter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setVisitorCount(data.totalVisits);
            sessionStorage.setItem('portfolio-session-visited', 'true');
          } else {
            // Fallback to localStorage if API fails
            const storedCount = localStorage.getItem('portfolio-visitor-count') || '150';
            const newCount = parseInt(storedCount) + 1;
            localStorage.setItem('portfolio-visitor-count', newCount.toString());
            setVisitorCount(newCount);
            sessionStorage.setItem('portfolio-session-visited', 'true');
          }
        } else {
          // Returning visitor - just get current count
          const response = await fetch('/api/visitor-counter', {
            method: 'GET',
          });
          
          if (response.ok) {
            const data = await response.json();
            setVisitorCount(data.totalVisits);
          } else {
            // Fallback to localStorage
            const storedCount = localStorage.getItem('portfolio-visitor-count') || '150';
            setVisitorCount(parseInt(storedCount));
          }
        }
      } catch (error) {
        console.log('API not available, using localStorage fallback');
        // Fallback to localStorage if API is not available
        const storedCount = localStorage.getItem('portfolio-visitor-count') || '150';
        if (!sessionVisited) {
          const newCount = parseInt(storedCount) + 1;
          localStorage.setItem('portfolio-visitor-count', newCount.toString());
          setVisitorCount(newCount);
          sessionStorage.setItem('portfolio-session-visited', 'true');
        } else {
          setVisitorCount(parseInt(storedCount));
        }
      }
    };
    
    // Track the visit
    trackRealVisit();
    
    // Simulate current visitors (realistic range based on time of day)
    const getCurrentVisitors = () => {
      const hour = new Date().getHours();
      let baseVisitors;
      
      // More visitors during business hours
      if (hour >= 9 && hour <= 17) {
        baseVisitors = Math.floor(Math.random() * 4) + 2; // 2-5 visitors
      } else if (hour >= 18 && hour <= 22) {
        baseVisitors = Math.floor(Math.random() * 3) + 1; // 1-3 visitors
      } else {
        baseVisitors = Math.floor(Math.random() * 2) + 1; // 1-2 visitors
      }
      
      setCurrentVisitors(baseVisitors);
    };
    
    // Update current visitors every 15-45 seconds
    const interval = setInterval(getCurrentVisitors, Math.random() * 30000 + 15000);
    
    // Initial current visitors
    getCurrentVisitors();
    
    // Show counter after a short delay
    setTimeout(() => setIsVisible(true), 1000);
    
    // Hide counter after 3 seconds of being visible
    setTimeout(() => {
      setIsHiding(true);
      // Remove from DOM after animation completes
      setTimeout(() => setIsVisible(false), 500);
    }, 4000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Convert number to ordinal (1st, 2nd, 3rd, 4th, etc.)
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) {
      return num + "st";
    }
    if (j === 2 && k !== 12) {
      return num + "nd";
    }
    if (j === 3 && k !== 13) {
      return num + "rd";
    }
    return num + "th";
  };

  // Format large numbers with ordinal suffix
  const formatOrdinalNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'Mth';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'Kth';
    }
    return getOrdinalSuffix(num);
  };

  if (!visitorCount) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ${
      isVisible && !isHiding 
        ? 'opacity-100 translate-y-0 scale-100' 
        : isHiding 
        ? 'opacity-0 translate-y-4 scale-95' 
        : 'opacity-0 translate-y-4 scale-95'
    }`}>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-2xl border border-white/30 hover:bg-white/15 transition-all duration-300">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
          <div className="text-white text-sm font-medium drop-shadow-sm">
            <div>Total visits: <span className="font-bold text-yellow-300 drop-shadow-md">{visitorCount}</span></div>
            <div className="text-xs text-gray-300">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block mr-1 animate-pulse"></span>
              {currentVisitors} online now
            </div>
          </div>
        </div>
        
        {/* Glassy reflection effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-2xl border border-white/20 shadow-inner pointer-events-none"></div>
      </div>
    </div>
  );
};

export default VisitorCounter;
