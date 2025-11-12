import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LightboxGallery from './LightboxGallery';
import { featuredProjects as featuredProjectList, otherProjects as otherProjectList } from '../data/projects';

const ProjectsSection = ({ onLightboxChange, onShowServiceSelector }) => {
  const [activeProject, setActiveProject] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const navigate = useNavigate();

  // Utility function to prioritize videos in gallery
  const prioritizeVideosInGallery = (gallery) => {
    if (!gallery) return gallery;
    return gallery.sort((a, b) => {
      const aIsVideo = a.endsWith('.mp4') || a.endsWith('.webm') || a.endsWith('.mov');
      const bIsVideo = b.endsWith('.mp4') || b.endsWith('.webm') || b.endsWith('.mov');
      
      if (aIsVideo && !bIsVideo) return -1; // Video first
      if (!aIsVideo && bIsVideo) return 1;  // Video first
      return 0; // Keep original order for same type
    });
  };

  // Featured Projects (5 main projects with full development and links)
  const featuredProjects = featuredProjectList;

  // Other Projects (projects without full development or links)
  const otherProjects = otherProjectList;

  // Use featured projects as main projects for navigation
  const projects = featuredProjects;

  const currentProject = projects[activeProject] ?? projects[0];
  const projectDetailsPath = currentProject ? `/projects/${currentProject.slug}` : '#';
  const liveProjectUrl = currentProject?.links?.live ?? currentProject?.url ?? null;
  const projectSummary = currentProject?.overview ?? currentProject?.summary ?? '';
  const clientNeed = currentProject?.problem ?? currentProject?.summary ?? '';
  const deliveredOutcome = currentProject?.solution ?? currentProject?.impact ?? '';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const openLightbox = (images, startIndex = 0) => {
    const prioritizedImages = prioritizeVideosInGallery(images);
    setLightboxImages(prioritizedImages);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
    onLightboxChange(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    onLightboxChange(false);
  };

  const handleProjectNavigate = (slug) => {
    navigate(`/projects/${slug}`);
  };

  return (
    <section id="projects" className="section projects-section relative z-10">
      <div className="section-content">
        <div className="text-center mb-16">
          <h2 className="heading-secondary mb-4">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore my portfolio of innovative projects that showcase my expertise in 
            full-stack development, AI integration, and user experience design.
          </p>
        </div>

        {/* Project Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {projects.map((project, index) => (
            <button
              key={project.id}
              onClick={() => setActiveProject(index)}
              className={`px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                activeProject === index
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {project.title}
            </button>
          ))}
        </div>

        {/* Active Project Display */}
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          {/* Left Side - Project Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentProject.status === 'Live' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : currentProject.status === 'In Development'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {currentProject.status}
                </span>
                <span className="text-gray-400 text-sm">
                  {currentProject.category}
                </span>
              </div>
              
              <h3 className="heading-tertiary text-gradient">
                {currentProject.title}
              </h3>
              <p className="text-xl text-cyan-400 font-medium">
                {currentProject.subtitle}
              </p>
            </div>

            <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-lg">
              {projectSummary}
            </p>

            {(clientNeed || deliveredOutcome) && (
              <div className="glass-content-pane rounded-2xl p-5 md:p-6 space-y-6">
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 dark:text-cyan-300">
                    Project Brief
                  </span>
                  <h4 className="text-xl font-semibold text-slate-900 dark:text-white">
                    What the client needed vs. what we shipped
                  </h4>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {clientNeed && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide uppercase">
                        Client Goals
                      </h5>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-gray-300">
                        {clientNeed}
                      </p>
                    </div>
                  )}
                  {deliveredOutcome && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide uppercase">
                        Delivered Solution
                      </h5>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-gray-300">
                        {deliveredOutcome}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-slate-900 dark:text-white">Key Features</h4>
              <div className="grid grid-cols-1 gap-2">
                {currentProject.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentProject.gradient}`} />
                    <span className="text-slate-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-slate-900 dark:text-white">Technologies Used</h4>
              <div className="flex flex-wrap gap-2">
                {currentProject.technologies.map((tech, index) => (
                  <span 
                    key={index}
                    className="code-text"
                    style={{ borderColor: currentProject.color + '40' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link 
                to={projectDetailsPath}
                className="btn btn-primary"
              >
                <span>Explore Case Study</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              {liveProjectUrl && (
                <a 
                  href={liveProjectUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <span>View Live Site</span>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Right Side - Project Visual */}
          <div className="relative">
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentProject.gradient} rounded-2xl blur-3xl opacity-20 scale-110`} />
            
            {/* Project image/video container */}
            <div 
              className="relative card p-4 overflow-hidden group cursor-pointer"
              onClick={() => {
                if (currentProject.gallery) {
                  openLightbox(currentProject.gallery, 0);
                }
              }}
            >
              {currentProject.video ? (
                <div className="relative">
                <video 
                  className="w-full h-64 object-cover rounded-lg"
                  poster={currentProject.image}
                  controls
                  muted
                    onClick={(e) => e.stopPropagation()}
                >
                  <source src={currentProject.video} type="video/mp4" />
                </video>
                  {/* Video overlay for gallery access */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <img 
                  src={currentProject.image} 
                  alt={currentProject.title}
                  className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
              )}
              
              {/* Gallery button */}
              {currentProject.gallery && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(currentProject.gallery, 0);
                  }}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-4 bg-gradient-to-t from-black/50 to-transparent rounded-lg pointer-events-none" />
              
              {/* Gallery indicator */}
              {currentProject.gallery && currentProject.gallery.length > 1 && (
                <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-2">
                  <span className="text-white text-sm font-medium">
                    {currentProject.gallery.length} items
                  </span>
                  {currentProject.gallery.some(item => 
                    item.endsWith('.mp4') || item.endsWith('.webm') || item.endsWith('.mov')
                  ) && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <span className="text-white text-xs">+ Video</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Floating elements */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r ${currentProject.gradient} rounded-full animate-float opacity-60`} />
            <div className={`absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r ${currentProject.gradient} rounded-full animate-float opacity-60`} style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Other Projects Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h3 className="heading-tertiary mb-2 text-gradient">
              Other <span className="text-gradient">Projects</span>
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Additional projects showcasing diverse skills across different industries.
            </p>
          </div>

          {/* Desktop Other Projects Grid */}
          <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {otherProjects.map((project, index) => (
              <div 
                key={project.id}
                className="glass-content-pane group hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
                onClick={() => handleProjectNavigate(project.slug)}
              >
                {/* Project Image */}
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ 
                        background: `${project.color}40`,
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {project.category.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-3">
                  <h4 className="font-semibold text-sm mb-1 truncate text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h4>
                  <p className="text-sky-600 dark:text-cyan-400 text-xs font-medium mb-2 truncate">
                    {project.subtitle}
                  </p>
                  <p className="text-slate-600 dark:text-gray-300 text-xs leading-relaxed mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 2).map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="px-2 py-1 rounded text-xs text-slate-600 dark:text-gray-300"
                        style={{ 
                          background: `${project.color}20`,
                          border: `1px solid ${project.color}30`
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 2 && (
                      <span className="text-gray-400 text-xs">
                        +{project.technologies.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Accent Line */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300"
                  style={{ background: `${project.color}` }}
                />
              </div>
            ))}
          </div>

          {/* Mobile Swipeable Other Projects */}
          <div className="md:hidden mb-12">
            <div className="overflow-x-auto scrollbar-hide pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              <div className="flex space-x-4 min-w-max px-4">
                {otherProjects.map((project, index) => (
                  <div 
                    key={project.id}
                    className="flex-shrink-0 w-64 glass-content-pane group hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
                    onClick={() => handleProjectNavigate(project.slug)}
                  >
                    {/* Project Image */}
                    <div className="relative overflow-hidden rounded-lg">
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-2 left-2">
                        <span 
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ 
                            background: `${project.color}40`,
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          {project.category.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="p-3">
                      <h4 className="font-semibold text-sm mb-1 truncate text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                        {project.title}
                      </h4>
                      <p className="text-sky-600 dark:text-cyan-400 text-xs font-medium mb-2 truncate">
                        {project.subtitle}
                      </p>
                      <p className="text-slate-600 dark:text-gray-300 text-xs leading-relaxed mb-3 line-clamp-2">
                        {project.description}
                      </p>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 2).map((tech, techIndex) => (
                          <span 
                            key={techIndex}
                            className="px-2 py-1 rounded text-xs text-slate-600 dark:text-gray-300"
                            style={{ 
                              background: `${project.color}20`,
                              border: `1px solid ${project.color}30`
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 2 && (
                          <span className="text-gray-400 text-xs">
                            +{project.technologies.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Accent Line */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300"
                      style={{ background: `${project.color}` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Swipe indicator */}
            <div className="text-center mt-4">
              <div className="inline-flex items-center space-x-2 text-cyan-400 text-sm">
                <span>←</span>
                <span>Swipe to explore more projects</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Gallery */}
      <LightboxGallery
        images={lightboxImages}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        initialIndex={lightboxIndex}
      />

      {/* Other Project Modal */}
      {/* This component is now handled by the router, so it's removed. */}

    </section>
  );
};

export default ProjectsSection;
