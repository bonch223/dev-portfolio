import React from 'react';
import { useNavigate } from 'react-router-dom';

const WorkflowChallengerSection = () => {
  const navigate = useNavigate();
  return (
    <section id="workflow-challenger-section" className="section relative z-10">
      <div className="section-content">
        <div className="bg-gradient-to-br from-cyan-600/20 via-purple-600/10 to-transparent rounded-3xl border border-cyan-400/30 p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="heading-secondary mb-4">
                Practice Real-World Automation
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Explore curated tutorials, tackle real business challenges, and build a verified portfolio of automation solutions with Zapier, N8N, Make, and more.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/workflow-challenger')}
                  className="btn btn-primary"
                >
                  Open Workflow Challenger
                </button>
                <a href="#projects" className="btn btn-secondary">
                  See Portfolio Entry
                </a>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-cyan-400/20">
              <div className="aspect-video bg-gradient-to-r from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-4">⚡</div>
                  <p className="text-white font-semibold">Zapier · N8N · Make.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowChallengerSection;

