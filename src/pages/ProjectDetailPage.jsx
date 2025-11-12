import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import Navigation from '../components/Navigation';
import LightboxGallery from '../components/LightboxGallery';
import { getProjectBySlug, allProjects } from '../data/projects';

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDarkMode = (resolvedTheme ?? 'light') === 'dark';

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const project = useMemo(() => getProjectBySlug(slug), [slug]);

  useEffect(() => {
    if (!project) {
      navigate('/');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [project, navigate]);

  if (!project) {
    return null;
  }

  const {
    title,
    subtitle,
    category,
    year,
    status,
    summary,
    overview,
    hero,
    image,
    gallery,
    features = [],
    technologies = [],
    responsibilities = [],
    metrics = [],
    impact,
    solution,
    problem,
    links = {},
    color,
    gradient,
  } = project;

  const heroBanner = hero?.banner ?? image ?? gallery?.[0] ?? null;
  const heroGallery = hero?.gallery ?? gallery ?? [];
  const projectSummary = overview ?? summary ?? '';
  const liveLink = links.live ?? project.url ?? null;
  const demoLink = links.demo ?? null;
  const caseStudyLink = links.caseStudy ?? null;
  const githubLink = links.github ?? null;

  const relatedProjects = useMemo(() => {
    return allProjects
      .filter((item) => item.slug !== slug)
      .slice(0, 3);
  }, [slug]);

  const primaryTextClass = isDarkMode ? 'text-white' : 'text-[#3c281c]';
  const secondaryTextClass = isDarkMode ? 'text-gray-300' : 'text-[#5f4735]';
  const accentTextClass = isDarkMode ? 'text-cyan-400' : 'text-[#b88760]';
  const surfaceClass = isDarkMode
    ? 'bg-[#101735]/95 border border-cyan-400/20 shadow-[0_28px_55px_rgba(0,212,255,0.15)]'
    : 'bg-[#fffbf6]/95 border border-[#e8d1b6] shadow-[0_30px_60px_rgba(90,58,40,0.14)]';
  const chipClass = isDarkMode
    ? 'bg-gray-800/70 border border-cyan-400/20 text-gray-200'
    : 'bg-[#f9ede1] border border-[#d8bfa5] text-[#3c281c]';
  const badgeAccentClass = isDarkMode
    ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white'
    : 'bg-[#b88760] text-white';
  const mutedSurfaceClass = isDarkMode
    ? 'bg-[#0d1225]/90 border border-cyan-400/20'
    : 'bg-[#fff3e3]/90 border border-[#e8caa7]';

  const openGallery = (images, index = 0) => {
    if (!images?.length) return;
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeGallery = () => {
    setIsLightboxOpen(false);
  };

  const storySections = [
    { key: 'problem', title: 'The Challenge', content: problem },
    { key: 'solution', title: 'The Approach', content: solution },
    { key: 'impact', title: 'The Impact', content: impact },
  ].filter((section) => Boolean(section.content));

  const supplementalLinks = [
    { key: 'live', label: 'View Live Site', href: liveLink },
    { key: 'demo', label: 'View Demo', href: demoLink },
    { key: 'caseStudy', label: 'Download Case Study', href: caseStudyLink },
    { key: 'github', label: 'View Source Code', href: githubLink },
  ].filter((link) => Boolean(link.href));

  return (
    <div className="relative z-10">
      <Navigation
        activeSection="projects"
        lightboxOpen={isLightboxOpen}
        onWorkflowChallengerClick={() => navigate('/workflow-challenger')}
      />

      <main className="pt-24 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div
            className={`relative overflow-hidden rounded-[40px] p-8 md:p-16 mb-16 transition-colors duration-500 ${surfaceClass}`}
          >
            {heroBanner && (
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient ?? 'from-cyan-500/40 to-purple-500/40'}`} />
                <img
                  src={heroBanner}
                  alt={`${title} hero`}
                  className="w-full h-full object-cover mix-blend-soft-light"
                />
              </div>
            )}

            <div className="relative z-10 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {status && (
                    <span className={`${badgeAccentClass} px-4 py-1 rounded-full font-semibold shadow-md shadow-black/10`}>
                      {status}
                    </span>
                  )}
                  {category && (
                    <span className={`${chipClass} px-4 py-1 rounded-full`}>
                      {category}
                    </span>
                  )}
                  {year && (
                    <span className={`${chipClass} px-4 py-1 rounded-full`}>
                      {year}
                    </span>
                  )}
                </div>

                <div>
                  <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${primaryTextClass}`}>
                    {title}
                  </h1>
                  {subtitle && (
                    <p className={`text-xl font-semibold ${accentTextClass}`}>
                      {subtitle}
                    </p>
                  )}
                </div>

                {projectSummary && (
                  <p className={`text-lg leading-relaxed ${secondaryTextClass}`}>
                    {projectSummary}
                  </p>
                )}

                {supplementalLinks.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {supplementalLinks.map((link) => (
                      <a
                        key={link.key}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center space-x-2 px-5 py-3 rounded-full font-semibold transition-all ${
                          link.key === 'live'
                            ? isDarkMode
                              ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-[0_18px_40px_rgba(0,212,255,0.22)] hover:shadow-[0_22px_50px_rgba(0,212,255,0.28)]'
                              : 'bg-[#b88760] text-white shadow-[0_20px_45px_rgba(90,58,40,0.22)] hover:bg-[#a46f4d]'
                            : isDarkMode
                            ? 'bg-gray-800/70 text-gray-100 border border-gray-600 hover:border-cyan-400/50'
                            : 'bg-white text-[#3c281c] border border-[#d9bfa0] hover:bg-[#f4e4d2]'
                        }`}
                      >
                        <span>{link.label}</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m0-4l4-4m0 0h-5m5 0v5"
                          />
                        </svg>
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isDarkMode
                        ? 'text-gray-300 hover:text-white'
                        : 'text-[#7a5a42] hover:text-[#533d2a]'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span>Back to previous page</span>
                  </button>
                  <Link
                    to="/#projects"
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isDarkMode
                        ? 'text-cyan-300 hover:text-cyan-100'
                        : 'text-[#b88760] hover:text-[#8c623e]'
                    }`}
                  >
                    <span>Browse all projects</span>
                    <svg
                      className="w-4 h-4"
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
                  </Link>
                </div>
              </div>

              {heroGallery.length > 0 && (
                <div className="relative group">
                  <div className={`overflow-hidden rounded-3xl border-2 ${isDarkMode ? 'border-cyan-400/30' : 'border-[#e3c5a4] shadow-[0_24px_50px_rgba(90,58,40,0.16)]'} transition-transform duration-500 group-hover:scale-[1.02]`}>
                    <img
                      src={heroGallery[0]}
                      alt={`${title} preview`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {heroGallery.length > 1 && (
                    <button
                      type="button"
                      onClick={() => openGallery(heroGallery, 0)}
                      className={`absolute inset-0 flex items-center justify-center rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDarkMode ? 'bg-black/60' : 'bg-[#312014]/40'}`}
                    >
                      <span className="px-5 py-3 rounded-full font-semibold text-white bg-black/60 backdrop-blur-md">
                        View Gallery ({heroGallery.length})
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 mb-16">
            <div className={`rounded-3xl p-8 space-y-6 ${surfaceClass}`}>
              <h2 className={`text-2xl font-bold ${primaryTextClass}`}>Project Objectives</h2>
              <div className="space-y-4">
                {responsibilities.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${accentTextClass}`}>
                      Roles & Responsibilities
                    </h3>
                    <ul className="space-y-2">
                      {responsibilities.map((item, idx) => (
                        <li key={idx} className={`flex items-start space-x-3 ${secondaryTextClass}`}>
                          <span className={`mt-1 w-2 h-2 rounded-full bg-gradient-to-r ${gradient ?? 'from-cyan-400 to-purple-500'}`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {features.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${accentTextClass}`}>
                      Highlights
                    </h3>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {features.map((feature, idx) => (
                        <li
                          key={idx}
                          className={`rounded-2xl px-4 py-3 border ${mutedSurfaceClass} ${secondaryTextClass}`}
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {technologies.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${accentTextClass}`}>
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className={`px-4 py-2 rounded-full text-sm font-medium border ${chipClass}`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {metrics.length > 0 && (
              <div className={`rounded-3xl p-8 space-y-6 ${surfaceClass}`}>
                <h2 className={`text-2xl font-bold ${primaryTextClass}`}>Key Metrics</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className={`rounded-2xl px-5 py-6 text-center border ${mutedSurfaceClass}`}
                    >
                      <p className={`text-3xl font-bold mb-1 ${accentTextClass}`}>
                        {metric.value}
                      </p>
                      <p className={`text-sm uppercase tracking-wide ${secondaryTextClass}`}>
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {storySections.length > 0 && (
            <section className="mb-16">
              <div className="grid lg:grid-cols-3 gap-6">
                {storySections.map((section) => (
                  <div
                    key={section.key}
                    className={`rounded-3xl p-8 h-full ${surfaceClass}`}
                  >
                    <h3 className={`text-xl font-semibold mb-4 ${accentTextClass}`}>
                      {section.title}
                    </h3>
                    <p className={`${secondaryTextClass} leading-relaxed`}>
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {heroGallery.length > 1 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${primaryTextClass}`}>Project Gallery</h2>
                <button
                  type="button"
                  onClick={() => openGallery(heroGallery, 0)}
                  className={`text-sm font-semibold ${accentTextClass} hover:underline`}
                >
                  Open full gallery
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {heroGallery.slice(0, 6).map((media, idx) => (
                  <button
                    type="button"
                    key={media + idx}
                    onClick={() => openGallery(heroGallery, idx)}
                    className={`group relative rounded-3xl overflow-hidden border ${isDarkMode ? 'border-cyan-400/20' : 'border-[#e5cbb2]'}`}
                  >
                    <img
                      src={media}
                      alt={`${title} gallery item ${idx + 1}`}
                      className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                      <span className="text-white text-sm font-medium">
                        View media
                      </span>
                      <span className="text-white text-xs bg-black/40 px-3 py-1 rounded-full">
                        {idx + 1}/{heroGallery.length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {relatedProjects.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${primaryTextClass}`}>Related Projects</h2>
                <Link
                  to="/#projects"
                  className={`text-sm font-semibold ${accentTextClass} hover:underline`}
                >
                  View all projects
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedProjects.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/projects/${item.slug}`}
                    className={`rounded-3xl border overflow-hidden transition-transform duration-300 hover:-translate-y-2 ${isDarkMode ? 'border-cyan-400/20 bg-[#101735]/80' : 'border-[#e4cdb1] bg-[#fff7ec]'}`}
                  >
                    <div className="relative h-44">
                      <img
                        src={item.image ?? item.hero?.banner ?? heroBanner}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide">
                        {item.category && (
                          <span className={accentTextClass}>{item.category}</span>
                        )}
                        {item.year && (
                          <span className={`${secondaryTextClass} opacity-70`}>• {item.year}</span>
                        )}
                      </div>
                      <h3 className={`text-lg font-semibold ${primaryTextClass}`}>
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className={`text-sm line-clamp-3 ${secondaryTextClass}`}>
                          {item.summary}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <LightboxGallery
        images={lightboxImages}
        isOpen={isLightboxOpen}
        onClose={closeGallery}
        initialIndex={lightboxIndex}
      />
    </div>
  );
};

export default ProjectDetailPage;

