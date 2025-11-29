import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LightboxGallery from './LightboxGallery';
import { featuredProjects, otherProjects } from '../data/projects';
import { placeholderAssets } from '../utils/assets';
import TechAutocomplete from './TechAutocomplete';

import ProjectModal from './ProjectModal';

const ProjectsSection = ({ onLightboxChange }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTech, setActiveTech] = useState('All');
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  const navigate = useNavigate();

  // Merge all projects
  const allProjects = useMemo(() => [...featuredProjects, ...otherProjects], []);

  // Extract unique categories and technologies
  const categories = useMemo(() => {
    const cats = new Set(allProjects.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [allProjects]);

  const technologies = useMemo(() => {
    const techs = new Set(allProjects.flatMap(p => p.technologies));
    return ['All', ...Array.from(techs).sort()];
  }, [allProjects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return allProjects.filter(project => {
      const categoryMatch = activeCategory === 'All' || project.category === activeCategory;
      const techMatch = activeTech === 'All' || project.technologies.includes(activeTech);
      return categoryMatch && techMatch;
    });
  }, [activeCategory, activeTech, allProjects]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const openLightbox = (images, startIndex = 0) => {
    // Sort videos first
    const sortedImages = [...images].sort((a, b) => {
      const aIsVideo = a.endsWith('.mp4') || a.endsWith('.webm');
      const bIsVideo = b.endsWith('.mp4') || b.endsWith('.webm');
      if (aIsVideo && !bIsVideo) return -1;
      if (!aIsVideo && bIsVideo) return 1;
      return 0;
    });

    setLightboxImages(sortedImages);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
    onLightboxChange(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    onLightboxChange(false);
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  return (
    <section id="projects" className="section projects-section relative z-10">
      <div className="section-content">
        <div className="text-center mb-12">
          <h2 className="heading-secondary mb-4">
            My <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
            A collection of my work in full-stack development, AI integration, and digital experiences.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12 space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Tech Filter */}
          <div className="flex justify-center">
            <TechAutocomplete
              technologies={technologies}
              selected={activeTech}
              onChange={setActiveTech}
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
              onClick={() => handleProjectClick(project)}
            >
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />

                {project.video ? (
                  <video
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    poster={project.image || placeholderAssets.image}
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => {
                      e.target.pause();
                      e.target.currentTime = 0;
                    }}
                  >
                    <source src={project.video} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={project.image || placeholderAssets.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-md shadow-sm">
                    {project.category}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md ${project.status === 'Live'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-cyan-500 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                    {project.subtitle}
                  </p>
                </div>

                <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                  {project.summary || project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-slate-600"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-slate-600">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-slate-500 dark:text-gray-400">
              Try adjusting your filters to see more results.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setActiveTech('All');
              }}
              className="mt-6 text-cyan-500 hover:text-cyan-400 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <LightboxGallery
        images={lightboxImages}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        initialIndex={lightboxIndex}
      />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};

export default ProjectsSection;

