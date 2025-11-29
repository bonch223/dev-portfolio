import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, ArrowRight, BarChart3, Code2, Target, Lightbulb } from 'lucide-react';

const ProjectModal = ({ project, onClose }) => {
    const navigate = useNavigate();

    // Lock body scroll when modal is open
    useEffect(() => {
        if (project) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [project]);

    if (!project) return null;

    const handleViewFullCaseStudy = () => {
        navigate(`/projects/${project.slug}`);
    };

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>

                    {/* Header Image/Video */}
                    <div className="relative h-48 sm:h-64 md:h-80 flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                        <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20`} />
                        {project.video ? (
                            <video
                                src={project.video}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md border border-white/10">
                                    {project.category}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md ${project.status === 'Live'
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">{project.title}</h2>
                            <p className="text-lg text-slate-200 font-medium">{project.subtitle}</p>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        <div className="p-6 sm:p-8 space-y-8">

                            {/* Metrics Grid */}
                            {project.metrics && project.metrics.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {project.metrics.map((metric, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1" style={{ color: project.color }}>
                                                {metric.value}
                                            </div>
                                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                {metric.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Problem & Solution */}
                                <div className="space-y-6">
                                    {project.problem && (
                                        <div>
                                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-3">
                                                <Target className="w-5 h-5 text-red-500" />
                                                The Challenge
                                            </h3>
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {project.problem}
                                            </p>
                                        </div>
                                    )}

                                    {project.solution && (
                                        <div>
                                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-3">
                                                <Lightbulb className="w-5 h-5 text-amber-500" />
                                                The Solution
                                            </h3>
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {project.solution}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Tech Stack & Quick Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-3">
                                            <Code2 className="w-5 h-5 text-cyan-500" />
                                            Tech Stack
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.technologies.map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {project.impact && (
                                        <div className="bg-cyan-50 dark:bg-cyan-900/10 p-5 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                                            <h3 className="flex items-center gap-2 text-base font-bold text-cyan-900 dark:text-cyan-100 mb-2">
                                                <BarChart3 className="w-4 h-4" />
                                                Key Impact
                                            </h3>
                                            <p className="text-cyan-800 dark:text-cyan-200 text-sm leading-relaxed">
                                                {project.impact}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col sm:flex-row gap-4 justify-between items-center flex-shrink-0">
                        <div className="flex gap-4 w-full sm:w-auto">
                            {project.links?.live && (
                                <a
                                    href={project.links.live}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
                                >
                                    <ExternalLink size={18} />
                                    Live Demo
                                </a>
                            )}
                        </div>

                        <button
                            onClick={handleViewFullCaseStudy}
                            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                        >
                            View Full Case Study
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default ProjectModal;
