import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { allProjects } from '../data/projects';

const ProjectHighlightsMarquee = ({ currentSlug }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = (resolvedTheme ?? 'light') === 'dark';
  const [isPaused, setIsPaused] = useState(false);

  const baseProjects = useMemo(() => {
    return allProjects
      .filter((project) => project.slug !== currentSlug && project.image)
      .slice(0, 4);
  }, [currentSlug]);

  const marqueeProjects = useMemo(() => {
    if (!baseProjects.length) {
      return [];
    }
    return [...baseProjects, ...baseProjects];
  }, [baseProjects]);

  if (baseProjects.length < 2) {
    return null;
  }

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  return (
    <div className="section-content mt-16">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 dark:text-cyan-300">
            Featured Highlights
          </p>
          <h3 className="text-lg font-semibold text-[#3c281c] dark:text-white">
            Explore more work at a glance
          </h3>
        </div>
      </div>

      <div
        className="relative overflow-hidden project-marquee group"
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        onFocus={handlePause}
        onBlur={handleResume}
      >
        <div
          className="flex gap-4 project-marquee__track"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {marqueeProjects.map((project, index) => {
            const accentColor = project.color ?? (isDarkMode ? '#00d4ff' : '#b88760');
            return (
              <Link
                key={`${project.slug}-${index}`}
                to={`/projects/${project.slug}`}
                className={`project-marquee__card group relative overflow-hidden rounded-2xl border transition-all duration-500 focus:outline-none ${
                  isDarkMode
                    ? 'border-cyan-400/20 bg-[#111737]/80 hover:border-cyan-400/60 focus:border-cyan-400/60'
                    : 'border-[#e7ceb2] bg-[#fff6ec]/80 hover:border-[#dcbf9f] focus:border-[#dcbf9f]'
                }`}
                aria-label={`${project.title} case study`}
                onFocus={handlePause}
                style={{
                  boxShadow: `0 0 0 1px ${accentColor}22`,
                }}
              >
                <img
                  src={project.image ?? project.hero?.banner}
                  alt={project.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-black/75 via-black/40 to-transparent'
                      : 'bg-gradient-to-br from-[#3c281c]/70 via-[#3c281c]/10 to-transparent'
                  }`}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at top right, ${accentColor}33 0%, transparent 60%)`,
                  }}
                />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/70 dark:text-white/70">
                    <span>{project.category ?? 'Case Study'}</span>
                    {project.year && <span>• {project.year}</span>}
                  </div>
                  <h4 className="text-sm font-semibold text-white dark:text-white mt-1">
                    {project.title}
                  </h4>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white/85">
                    View case study
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectHighlightsMarquee;

