import React, { useState } from 'react';
import { useTheme } from 'next-themes';

const InteractiveBuilderCTA = ({ onStartSimulation }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = (resolvedTheme ?? 'light') === 'dark';
  const [showMobileNotice, setShowMobileNotice] = useState(false);

  const handleStart = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setShowMobileNotice(true);
      setTimeout(() => setShowMobileNotice(false), 3000);
      return;
    }

    onStartSimulation?.();
  };

  const surfaceClass = isDarkMode
    ? 'bg-[#111b3a]/95 border border-cyan-400/25 shadow-[0_28px_60px_rgba(14,116,188,0.32)]'
    : 'bg-[#fff4e6]/95 border border-[#e8cbaa] shadow-[0_30px_65px_rgba(90,58,40,0.18)]';
  const headingClass = isDarkMode ? 'text-white' : 'text-[#3c281c]';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-[#5f4735]';
  const primaryButtonClass = isDarkMode
    ? 'inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-[0_20px_45px_rgba(0,212,255,0.25)] hover:shadow-[0_24px_55px_rgba(0,212,255,0.32)] transition-all'
    : 'inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold bg-[#b88760] text-white shadow-[0_20px_45px_rgba(90,58,40,0.22)] hover:bg-[#a46f4d] transition-all';
  const secondaryButtonClass = isDarkMode
    ? 'inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold border border-gray-600 bg-gray-800/70 text-gray-100 hover:border-cyan-400/50 transition-all'
    : 'inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold border border-[#d9c1a5] bg-white text-[#3c281c] hover:bg-[#f4e4d2] transition-all';
  const pillClass = isDarkMode
    ? 'px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 text-sm font-semibold'
    : 'px-4 py-2 rounded-full border border-[#eacdad] bg-white text-[#77563e] text-sm font-semibold';

  return (
    <div className="section-content mt-16">
      <div className={`rounded-[32px] p-8 md:p-12 relative overflow-hidden ${surfaceClass}`}>
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className={`absolute inset-0 bg-gradient-to-r ${isDarkMode ? 'from-cyan-500/40 to-purple-500/30' : 'from-[#f5d4b3]/50 to-[#fef1df]/50'}`} />
        </div>

        <div className="relative z-10 grid gap-10 md:grid-cols-[1.2fr_auto] items-center">
          <div className="space-y-5">
            <h3 className={`text-3xl md:text-4xl font-bold ${headingClass}`}>
              Launch an Interactive Builder
            </h3>
            <p className={`text-base md:text-lg leading-relaxed ${textClass}`}>
              Try the same hands-on simulators I use with clients to scope automation, WordPress, and full-stack builds. Customize flows, preview deliverables, and get an actionable brief in minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleStart}
                className={primaryButtonClass}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-4.197-2.42A1 1 0 009 9.618v4.764a1 1 0 001.555.832l4.197-2.42a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  />
                </svg>
                <span>Start a Simulation</span>
              </button>
              <a
                href="#contact"
                className={secondaryButtonClass}
              >
                <span>Talk through a project</span>
              </a>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-3">
            <div className={pillClass}>Automation Playbooks</div>
            <div className={pillClass}>WordPress Sprints</div>
            <div className={pillClass}>Full-Stack Scoping</div>
          </div>
        </div>
      </div>

      {showMobileNotice && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
        >
          <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/30 shadow-2xl max-w-sm mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Desktop Experience Required
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              The simulators are optimized for laptop and desktop screens. Please revisit on a larger device to explore the builder.
            </p>
            <button
              onClick={() => setShowMobileNotice(false)}
              className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold py-2 px-6 rounded-full hover:shadow-lg transition-all duration-300"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveBuilderCTA;

