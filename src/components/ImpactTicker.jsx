import React from 'react';
import { motion } from 'framer-motion';
import { featuredProjects } from '../data/projects';

const ImpactTicker = () => {
    // Extract all metrics from featured projects
    const allMetrics = featuredProjects.flatMap(project =>
        project.metrics ? project.metrics.map(metric => ({
            ...metric,
            projectId: project.id,
            projectTitle: project.title,
            color: project.color
        })) : []
    );

    // Filter for high-impact numbers to ensure quality
    const impactfulMetrics = allMetrics.filter(m =>
        m.value.includes('k') ||
        m.value.includes('M') ||
        m.value.includes('%') ||
        m.value.includes('ms') ||
        m.value.includes('+')
    );

    // Duplicate list to ensure seamless infinite scroll
    // We repeat it enough times to definitely fill the screen width
    const tickerItems = [...impactfulMetrics, ...impactfulMetrics];

    return (
        <div className="w-full bg-base-100/50 border-y border-base-content/5 overflow-hidden py-6 backdrop-blur-md z-10 relative">
            {/* Gradient Masks for smooth fade out at edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-base-100 to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-base-100 to-transparent z-20 pointer-events-none" />

            <div className="flex overflow-hidden">
                <motion.div
                    className="flex gap-16 whitespace-nowrap px-8"
                    animate={{ x: "-50%" }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 60 // Slow, readable speed
                    }}
                >
                    {/* Render items twice to create the loop, but we need a container that holds both sets */}
                    {/* Actually, the standard way is to have the container width be huge and translate -50% of it. 
              If tickerItems contains 2 sets, we translate -50% which is exactly 1 set length. */}
                    {tickerItems.map((item, index) => (
                        <div key={`${item.projectId}-${index}`} className="flex items-center gap-3 group select-none">
                            <span
                                className="text-3xl font-black tracking-tight"
                                style={{ color: item.color }}
                            >
                                {item.value}
                            </span>
                            <div className="flex flex-col leading-tight">
                                <span className="text-xs font-bold text-base-content/80 uppercase tracking-wider">
                                    {item.label}
                                </span>
                                <span className="text-[10px] text-base-content/40 font-medium">
                                    {item.projectTitle}
                                </span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default ImpactTicker;
