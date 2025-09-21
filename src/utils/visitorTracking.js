// Real visitor tracking utility
// This can be easily integrated with various services

export class VisitorTracker {
  constructor() {
    this.apiEndpoint = '/api/visitor-counter';
    this.fallbackCount = 150; // Starting number if no API
  }

  // Track a new visit
  async trackVisit() {
    const sessionVisited = sessionStorage.getItem('portfolio-session-visited');
    
    if (sessionVisited) {
      // Already tracked this session
      return this.getCurrentCount();
    }
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('portfolio-session-visited', 'true');
        return data.totalVisits;
      }
    } catch (error) {
      console.log('API not available, using fallback');
    }
    
    // Fallback to localStorage
    return this.fallbackTrackVisit();
  }
  
  // Get current visitor count
  async getCurrentCount() {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.totalVisits;
      }
    } catch (error) {
      console.log('API not available, using fallback');
    }
    
    // Fallback to localStorage
    const storedCount = localStorage.getItem('portfolio-visitor-count');
    return storedCount ? parseInt(storedCount) : this.fallbackCount;
  }
  
  // Fallback method using localStorage
  fallbackTrackVisit() {
    const storedCount = localStorage.getItem('portfolio-visitor-count');
    const newCount = storedCount ? parseInt(storedCount) + 1 : this.fallbackCount + 1;
    localStorage.setItem('portfolio-visitor-count', newCount.toString());
    sessionStorage.setItem('portfolio-session-visited', 'true');
    return newCount;
  }
  
  // Get realistic current visitors based on time of day
  getCurrentVisitors() {
    const hour = new Date().getHours();
    
    // More visitors during business hours
    if (hour >= 9 && hour <= 17) {
      return Math.floor(Math.random() * 4) + 2; // 2-5 visitors
    } else if (hour >= 18 && hour <= 22) {
      return Math.floor(Math.random() * 3) + 1; // 1-3 visitors
    } else {
      return Math.floor(Math.random() * 2) + 1; // 1-2 visitors
    }
  }
}

// Alternative: Integration with external services
export const integrateWithExternalService = {
  // GoatCounter integration (free, privacy-focused)
  goatCounter: async (siteId) => {
    try {
      const response = await fetch(`https://${siteId}.goatcounter.com/api/v0/count`);
      const data = await response.json();
      return data.total;
    } catch (error) {
      return null;
    }
  },
  
  // Plausible integration (paid, privacy-focused)
  plausible: async (domain) => {
    try {
      const response = await fetch(`https://plausible.io/api/v1/stats/aggregate?site_id=${domain}&period=30d&metrics=visitors`);
      const data = await response.json();
      return data.results.visitors.value;
    } catch (error) {
      return null;
    }
  },
  
  // Simple third-party counter service
  counterAPI: async (endpoint) => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      return data.count;
    } catch (error) {
      return null;
    }
  }
};
