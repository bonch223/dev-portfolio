import React, { useState, useEffect } from 'react';

const SEOSimulator = ({ onBack, onProceedToQuote }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [keywordResults, setKeywordResults] = useState([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isVisible, setIsVisible] = useState(false);

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
    'Website Analysis',
    'Keyword Research',
    'Meta Optimization',
    'Results & Recommendations'
  ];

  // Simulate website analysis
  const analyzeWebsite = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic analysis results
    const results = {
      performance: Math.floor(Math.random() * 40) + 30, // 30-70
      accessibility: Math.floor(Math.random() * 40) + 40, // 40-80
      bestPractices: Math.floor(Math.random() * 30) + 50, // 50-80
      seo: Math.floor(Math.random() * 35) + 35, // 35-70
      issues: [
        'Missing meta descriptions',
        'Images without alt text',
        'Slow loading times',
        'No structured data',
        'Missing sitemap'
      ],
      recommendations: [
        'Optimize images for faster loading',
        'Add meta descriptions to all pages',
        'Implement structured data markup',
        'Create XML sitemap',
        'Improve internal linking structure'
      ]
    };
    
    setAnalysisResults(results);
    setIsAnalyzing(false);
    setCurrentStep(1);
  };

  // Simulate keyword research
  const researchKeywords = async () => {
    if (!keywords.trim()) return;
    
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
    const results = keywordList.map(keyword => ({
      keyword,
      searchVolume: Math.floor(Math.random() * 10000) + 100,
      difficulty: Math.floor(Math.random() * 100),
      cpc: (Math.random() * 5 + 0.5).toFixed(2),
      trends: Math.random() > 0.5 ? 'rising' : 'stable'
    }));
    
    setKeywordResults(results);
    setCurrentStep(2);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/50';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const handleProceedToQuote = () => {
    const serviceData = {
      service: 'SEO Optimization',
      url: websiteUrl,
      keywords: keywords,
      metaTitle: metaTitle,
      metaDescription: metaDescription,
      analysis: analysisResults
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
                    ? 'bg-cyan-500 text-white' 
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
        <div className="max-w-4xl mx-auto">
          {currentStep === 0 && (
            <div className="glass-content-pane">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">
                  🔍
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Website SEO Analysis
                </h2>
                <p className="text-gray-300 text-lg">
                  Enter your website URL and we'll analyze its SEO performance, 
                  identify issues, and provide actionable recommendations.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://your-website.com"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <button
                  onClick={analyzeWebsite}
                  disabled={!websiteUrl || isAnalyzing}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Analyzing Website...
                    </div>
                  ) : (
                    'Analyze Website'
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 1 && analysisResults && (
            <div className="space-y-6">
              <div className="glass-content-pane">
                <h3 className="text-2xl font-bold text-white mb-6">Performance Analysis</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className={`p-4 rounded-lg border ${getScoreBg(analysisResults.performance)}`}>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(analysisResults.performance)}`}>
                        {analysisResults.performance}
                      </div>
                      <div className="text-gray-300 text-sm">Performance</div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg border ${getScoreBg(analysisResults.accessibility)}`}>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(analysisResults.accessibility)}`}>
                        {analysisResults.accessibility}
                      </div>
                      <div className="text-gray-300 text-sm">Accessibility</div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg border ${getScoreBg(analysisResults.bestPractices)}`}>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(analysisResults.bestPractices)}`}>
                        {analysisResults.bestPractices}
                      </div>
                      <div className="text-gray-300 text-sm">Best Practices</div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg border ${getScoreBg(analysisResults.seo)}`}>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(analysisResults.seo)}`}>
                        {analysisResults.seo}
                      </div>
                      <div className="text-gray-300 text-sm">SEO</div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-bold text-red-400 mb-3">Issues Found</h4>
                    <ul className="space-y-2">
                      {analysisResults.issues.map((issue, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-green-400 mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {analysisResults.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="glass-content-pane">
                <h3 className="text-2xl font-bold text-white mb-6">Keyword Research</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Enter keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="web design, digital marketing, seo services"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={researchKeywords}
                    disabled={!keywords.trim()}
                    className="bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Research Keywords
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && keywordResults.length > 0 && (
            <div className="glass-content-pane">
              <h3 className="text-2xl font-bold text-white mb-6">Keyword Research Results</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left text-white py-3">Keyword</th>
                      <th className="text-left text-white py-3">Search Volume</th>
                      <th className="text-left text-white py-3">Difficulty</th>
                      <th className="text-left text-white py-3">CPC</th>
                      <th className="text-left text-white py-3">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywordResults.map((result, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="text-white py-3 font-medium">{result.keyword}</td>
                        <td className="text-gray-300 py-3">{result.searchVolume.toLocaleString()}</td>
                        <td className="py-3">
                          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                            result.difficulty >= 70 ? 'bg-red-500/20 text-red-400' :
                            result.difficulty >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {result.difficulty}%
                          </div>
                        </td>
                        <td className="text-gray-300 py-3">${result.cpc}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                            result.trends === 'rising' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {result.trends === 'rising' ? '📈 Rising' : '📊 Stable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-bold text-white mb-4">Meta Tag Optimization</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Best Web Design Services | Your Company"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                      maxLength={60}
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {metaTitle.length}/60 characters
                    </div>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Meta Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Professional web design services that boost your online presence. Get a custom website that converts visitors into customers."
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none resize-none"
                      rows={3}
                      maxLength={160}
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {metaDescription.length}/160 characters
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transition-all duration-300 mt-8"
              >
                Generate Final Report
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="glass-content-pane">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">
                  📊
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  SEO Analysis Complete!
                </h2>
                <p className="text-gray-300 text-lg">
                  Here's what I found and what I can do to improve your website's SEO performance.
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Current Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{analysisResults.seo}</div>
                      <div className="text-gray-300 text-sm">SEO Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{analysisResults.performance}</div>
                      <div className="text-gray-300 text-sm">Performance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{keywordResults.length}</div>
                      <div className="text-gray-300 text-sm">Keywords Researched</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{analysisResults.recommendations.length}</div>
                      <div className="text-gray-300 text-sm">Improvements Ready</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">What I Can Do For You</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-bold text-cyan-400 mb-3">Technical SEO</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Fix all identified technical issues</li>
                        <li>• Optimize page loading speeds</li>
                        <li>• Implement structured data markup</li>
                        <li>• Create and submit XML sitemaps</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-cyan-400 mb-3">Content Optimization</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Optimize meta titles and descriptions</li>
                        <li>• Improve internal linking structure</li>
                        <li>• Add alt text to all images</li>
                        <li>• Create keyword-optimized content</li>
                      </ul>
                    </div>
                  </div>
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
                  className="flex-1 bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Get Your SEO Quote
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEOSimulator;
