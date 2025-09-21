import React, { useState, useEffect } from 'react';

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    // Get or create visitor count
    const storedCount = localStorage.getItem('portfolio-visitor-count');
    let count = storedCount ? parseInt(storedCount) : 0;
    
    // Check if this is a new session (not just a page refresh)
    const sessionVisited = sessionStorage.getItem('portfolio-session-visited');
    
    if (!sessionVisited) {
      count += 1;
      localStorage.setItem('portfolio-visitor-count', count.toString());
      sessionStorage.setItem('portfolio-session-visited', 'true');
    }
    
    setVisitorCount(count);
    
    // Show counter after a short delay
    setTimeout(() => setIsVisible(true), 1000);
    
    // Hide counter after 3 seconds of being visible
    setTimeout(() => {
      setIsHiding(true);
      // Remove from DOM after animation completes
      setTimeout(() => setIsVisible(false), 500);
    }, 4000); // 1 second delay + 3 seconds visible = 4 seconds total
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
          <span className="text-white text-sm font-medium drop-shadow-sm">
            You are the <span className="font-bold text-yellow-300 drop-shadow-md">{formatOrdinalNumber(visitorCount)}</span> visitor
          </span>
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
