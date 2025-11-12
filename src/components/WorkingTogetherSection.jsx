import React from 'react';
import { useTheme } from 'next-themes';

const featureHighlights = [
  {
    key: 'results',
    title: 'Proven Results',
    description: 'From AI-powered platforms to e-commerce solutions, I deliver products that move metrics and delight users.',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    key: 'innovation',
    title: 'Innovation First',
    description: 'I stay ahead of technology trends, shipping modern, scalable solutions with future-friendly architectures.',
    iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    key: 'partnership',
    title: 'Dedicated Partnership',
    description: 'Expect clear communication, iterative collaboration, and ongoing support long after launch.',
    iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
];

const WorkingTogetherSection = () => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = (resolvedTheme ?? 'light') === 'dark';

  const sectionPrimaryTextClass = isDarkMode ? 'text-white' : 'text-[#3c281c]';
  const sectionSecondaryTextClass = isDarkMode ? 'text-gray-300' : 'text-[#5f4735]';

  const containerClass = isDarkMode
    ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-cyan-400/30 shadow-2xl'
    : 'bg-[#fef8f3] border border-[#e7ccb0] shadow-[0_28px_60px_rgba(90,58,40,0.18)]';
  const overlayClass = isDarkMode
    ? 'bg-gradient-to-r from-cyan-400/5 to-purple-500/5'
    : 'bg-[radial-gradient(circle,_rgba(209,178,145,0.18)_0%,_rgba(255,252,247,0)_70%)]';
  const headlineClass = isDarkMode
    ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-purple-600 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-[#b88760] via-[#d9a066] to-[#a26f4a] bg-clip-text text-transparent';
  const iconVariants = isDarkMode
    ? {
        results: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
        innovation: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white',
        partnership: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
      }
    : {
        results: 'bg-[#e4f2ff] border border-[#cddff1] text-[#2f3d4a]',
        innovation: 'bg-[#f7e3f3] border border-[#e7c7df] text-[#4b2f3e]',
        partnership: 'bg-[#e6f6ec] border border-[#cce4d4] text-[#2f4034]',
      };

  return (
    <section id="working-together" className="py-16 md:py-24">
      <div className="text-center">
        <div className="max-w-6xl mx-auto">
          <div className={`backdrop-blur-md rounded-3xl p-10 md:p-12 relative overflow-hidden ${containerClass}`}>
            <div className={`absolute inset-0 rounded-3xl ${overlayClass}`} />
            <div className="relative z-10 space-y-12">
              <h3 className="text-4xl md:text-5xl font-bold mb-6">
                <span className={headlineClass}>
                  Interested in Working Together?
                </span>
              </h3>
              <p className={`max-w-3xl mx-auto text-base md:text-lg ${sectionSecondaryTextClass}`}>
                From automation-first products to growth-focused marketing experiences, I build digital platforms that are as strategic as they are beautiful.
              </p>

              <div className="hidden md:grid grid-cols-3 gap-8">
                {featureHighlights.map((feature) => (
                  <div key={feature.key} className="text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${iconVariants[feature.key]}`}>
                      <svg className="w-8 h-8 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.iconPath} />
                      </svg>
                    </div>
                    <h4 className={`text-xl font-bold ${sectionPrimaryTextClass}`}>{feature.title}</h4>
                    <p className={`${sectionSecondaryTextClass} text-sm`}>{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="md:hidden">
                <div className="overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="flex space-x-4 min-w-max px-4">
                    {featureHighlights.map((feature) => (
                      <div key={feature.key} className="flex-shrink-0 w-72 text-center space-y-4">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${iconVariants[feature.key]}`}>
                          <svg className="w-8 h-8 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.iconPath} />
                          </svg>
                        </div>
                        <h4 className={`text-xl font-bold ${sectionPrimaryTextClass}`}>{feature.title}</h4>
                        <p className={`${sectionSecondaryTextClass} text-sm`}>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkingTogetherSection;

