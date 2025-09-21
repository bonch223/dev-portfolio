import React, { useState, useEffect, useRef } from 'react';
import { companyAssets, profileAssets } from '../utils/assets';

const AboutSection = () => {
  const [activeTab, setActiveTab] = useState('story');
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showFullTimeline, setShowFullTimeline] = useState(true);
  const sectionRef = useRef(null);

  const skills = [
    {
      category: 'Web Development',
      technologies: ['WordPress', 'Shopify', 'HTML/CSS', 'JavaScript', 'PHP', 'React'],
      level: 95,
      color: '#00D4FF',
      icon: '💻'
    },
    {
      category: 'SEO & Marketing',
      technologies: ['Technical SEO', 'Analytics', 'Social Media', 'Content Marketing', 'Link Building'],
      level: 90,
      color: '#8B5CF6',
      icon: '📈'
    },
    {
      category: 'IT Management',
      technologies: ['System Administration', 'Network Management', 'Team Leadership', 'Training', 'Troubleshooting'],
      level: 92,
      color: '#00FF88',
      icon: '⚙️'
    },
    {
      category: 'AI & Innovation',
      technologies: ['Guro.ai Development', 'AI Integration', 'Automation', 'Machine Learning', 'Innovation'],
      level: 88,
      color: '#FF6B35',
      icon: '🤖'
    }
  ];

  const experiences = [
    {
      year: '2024-Present',
      title: 'COO & Lead Developer',
      company: 'SkillFoundri',
      description: 'Co-founding and leading an innovative ed-tech startup that combines features of Upwork, Asana, Blackboard, and Coursera. Driving product development, strategic partnerships, and scaling the platform for democratizing quality education.',
      icon: '🎓',
      achievements: ['Co-founded ed-tech startup', 'Led full-stack development', 'Securing strategic partnerships', 'Building comprehensive learning platform']
    },
    {
      year: '2023-2024',
      title: 'Tech Director | Web Dev Team Lead',
      company: 'Armet Ltd.',
      description: 'Leading web development projects specializing in WordPress and Shopify. Providing technical guidance to enhance system performance and user experience.',
      icon: '🚀',
      achievements: ['Led 15+ web projects', 'Improved team efficiency by 40%', 'Mentored 8 developers']
    },
    {
      year: '2022-2023',
      title: 'SAS Director',
      company: 'Aces Tagum College, Inc. (ATCI)',
      description: 'Students Affairs Services Director responsible for overseeing student services, activities, and support programs. Led initiatives to enhance student experience and engagement.',
      icon: '👥',
      achievements: ['Directed student affairs services', 'Enhanced student engagement', 'Led support programs', 'Improved student experience']
    },
    {
      year: '2021-2022',
      title: 'BSIT Program Coordinator',
      company: 'Aces Tagum College, Inc. (ATCI)',
      description: 'Coordinated the Bachelor of Science in Information Technology program. Managed curriculum development, student guidance, and program quality assurance.',
      icon: '📚',
      achievements: ['Coordinated BSIT program', 'Managed curriculum development', 'Provided student guidance', 'Ensured program quality']
    },
    {
      year: '2019-2023',
      title: 'MIS Manager',
      company: 'Aces Tagum College, Inc. (ATCI)',
      description: 'Managed IT infrastructure including servers, workstations, and networking systems. Improved web systems and provided comprehensive IT support and management.',
      icon: '💻',
      achievements: ['Managed 200+ workstations', 'Improved web systems', 'Reduced downtime by 60%', 'Trained 50+ staff members']
    },
    {
      year: '2019-2023',
      title: 'BSIT Instructor',
      company: 'Aces Tagum College, Inc. (ATCI)',
      description: 'Taught core BSIT subjects including Data Structures, Programming 1 & 2, Web Development, Multimedia, and Capstone Project. Mentored students through their academic journey and final projects.',
      icon: '👨‍🏫',
      achievements: ['Taught Data Structures & Algorithms', 'Instructed Programming 1 & 2', 'Led Web Development courses', 'Guided Multimedia projects', 'Supervised Capstone projects']
    },
    {
      year: '2016-2019',
      title: 'SEO Specialist',
      company: 'White-Hat SEO',
      description: 'Managed 50+ websites, social media accounts, and online shops. Created graphics and video content for marketing campaigns.',
      icon: '📈',
      achievements: ['Managed 50+ websites', 'Increased organic traffic by 300%', 'Created 200+ marketing assets']
    },
    {
      year: '2015-2016',
      title: 'Part-time Lecturer',
      company: 'Davao Oriental State University',
      description: 'Delivered engaging lectures in programming to undergraduate students. Former "Programmer-of-the-Year" for the batch of 2015.',
      icon: '🎓',
      achievements: ['Taught 200+ students', 'Programmer-of-the-Year 2015', 'Developed curriculum materials']
    },
    {
      year: '2014-2015',
      title: 'OJT Developer',
      company: 'DOPMC',
      description: 'On-the-Job Training developing a Fixed Assets Management System. Gained hands-on experience in software development and system design.',
      icon: '💼',
      achievements: ['Developed Fixed Assets Management System', 'Gained software development experience', 'Learned system design principles', 'Completed OJT program']
    }
  ];

  // Condensed timeline showing only the most recent and relevant positions
  const condensedExperiences = experiences.slice(0, 4); // Show first 4 (most recent) entries

  const companies = [
    {
      name: 'SkillFoundri',
      logo: companyAssets.skillfoundriLogo,
      role: 'COO & Lead Developer',
      period: '2024-Present',
      description: 'Ed-tech startup co-founder and technical leader',
      color: '#00FF88'
    },
    {
      name: 'Armet Limited, Inc.',
      logo: companyAssets.armetLimited,
      role: 'Tech Director & Web Dev Team Lead',
      period: '2023-2024',
      description: 'Leading web development projects and team management',
      color: '#00D4FF'
    },
    {
      name: 'Aces Tagum College, Inc.',
      logo: companyAssets.atci,
      role: 'MIS Manager, BSIT Instructor & SAS Director',
      period: '2019-2023',
      description: 'IT management, teaching, and student affairs leadership',
      color: '#8B5CF6'
    },
    {
      name: 'White-Hat SEO',
      logo: companyAssets.whiteHat,
      role: 'SEO Specialist',
      period: '2016-2019',
      description: 'Digital marketing and SEO optimization specialist',
      color: '#FF6B35'
    },
    {
      name: 'Traveling Californian',
      logo: companyAssets.travelingCalifornian,
      role: 'SEO & Web Development',
      period: '2016-2019',
      description: 'SEO optimization and web development services',
      color: '#EC4899'
    }
  ];

  const stats = [
    { label: 'Years Experience', value: '7+', color: '#00D4FF' },
    { label: 'Websites Managed', value: '50+', color: '#8B5CF6' },
    { label: 'Team Members Led', value: '15+', color: '#00FF88' },
    { label: 'Projects Completed', value: '100+', color: '#FF6B35' }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      return () => section.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);


  return (
    <section ref={sectionRef} id="about" className="section about-section relative z-10 overflow-hidden">
      {/* Dynamic Interactive Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        
        {/* Mouse-following gradient */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-1000"
          style={{
            left: `${mousePosition.x * 100}%`,
            top: `${mousePosition.y * 100}%`,
            background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-40 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      <div className="section-content relative z-10">
        {/* Hero Section with Profile */}
        <div className="text-center mb-16">
          <div className="inline-block relative mb-8">
            <h2 className="heading-secondary mb-4 relative z-10">
              About <span className="text-gradient">Me</span>
            </h2>
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-xl"></div>
          </div>
          
          {/* Profile Card */}
          <div className="glass-content-pane max-w-4xl mx-auto mb-8 group hover:scale-105 transition-all duration-500 relative overflow-visible">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-cyan-400 to-purple-500 relative group-hover:rotate-12 transition-transform duration-500">
                  <img 
                    src={profileAssets.photo} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                
                {/* Animated glow effect on hover */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl scale-110"></div>
                
                {/* Outer glow ring */}
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Hello, I'm a Tech Innovator</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  From <span className="text-gradient font-semibold">"Programmer-of-the-Year"</span> to 
                  <span className="text-gradient font-semibold"> Tech Director</span>, I've been crafting 
                  digital experiences that make a difference. Currently co-founding and leading the future of education with 
                  <span className="text-gradient font-semibold"> SkillFoundri</span>.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-cyan-400">Available for projects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Co-founding SkillFoundri</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="glass-content-pane p-2">
            <div className="flex space-x-2">
              {[
                { id: 'story', label: 'My Story', icon: '📖' },
                { id: 'skills', label: 'Skills', icon: '⚡' },
                { id: 'timeline', label: 'Timeline', icon: '⏰' },
                { id: 'companies', label: 'Companies', icon: '🏢' },
                { id: 'achievements', label: 'Impact', icon: '🏆' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'story' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Personal Story */}
              <div className="glass-content-pane group hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity animate-spin" style={{animationDuration: '8s'}}></div>
                <h3 className="heading-tertiary mb-6 text-gradient">My Journey</h3>
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    My journey began in 2015 when I was recognized as <span className="text-gradient font-semibold">"Programmer-of-the-Year"</span> 
                    at Davao Oriental State University. This early recognition fueled my passion for technology and innovation.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Over the years, I've evolved from a passionate programmer to a <span className="text-gradient font-semibold">Tech Director</span>, 
                    leading teams and driving digital transformation across various organizations.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Today, I'm co-founding and leading <span className="text-gradient font-semibold">SkillFoundri</span> as COO and Lead Developer - 
                    an innovative ed-tech startup that's revolutionizing online education through project-based learning and industry-relevant skill development.
                  </p>
                </div>
              </div>

              {/* Current Focus */}
              <div className="glass-content-pane group hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity animate-pulse"></div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <span className="text-3xl">🎓</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xl">SkillFoundri</h4>
                    <p className="text-cyan-400 text-sm">COO & Lead Developer</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Currently serving as COO and Lead Developer at SkillFoundri, an innovative ed-tech startup that combines 
                  the best features of Upwork, Asana, Blackboard, and Coursera. I lead the development of this comprehensive 
                  platform that transforms online education through project-based learning and industry-relevant skill development. 
                  As we scale our startup, we're actively seeking strategic partnerships and investment opportunities to accelerate 
                  our mission of democratizing quality education.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Leadership', 'Full-Stack Development', 'Project Management', 'WordPress', 'PHP', 'MySQL', 'JavaScript', 'Education Technology'].map((tech, index) => (
                    <span key={index} className="code-text text-xs">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Skills Grid */}
              <div className="glass-content-pane group hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="floating-circle circle-1" />
                <div className="floating-circle circle-2" />
                <div className="floating-circle circle-3" />
                
                <h3 className="heading-tertiary mb-6 text-gradient">Technical Skills</h3>
                <div className="grid grid-cols-2 gap-4">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-white/5 transition-all duration-300 group/skill"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg">
                          {skill.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm group-hover/skill:text-cyan-400 transition-colors">{skill.category}</h4>
                          <p className="text-xs text-gray-400">{skill.level}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                        <div 
                          className="h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${skill.level}%`,
                            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}80)`
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {skill.technologies.slice(0, 3).map((tech, techIndex) => (
                          <span key={techIndex} className="code-text text-xs">{tech}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack Visualization */}
              <div className="glass-content-pane group hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <h3 className="heading-tertiary mb-6 text-gradient">Tech Arsenal</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['WordPress', 'Shopify', 'SEO', 'JavaScript', 'PHP', 'React', 'AI/ML', 'Figma', 'Analytics', 'Automation', 'Leadership', 'Innovation'].map((tech, index) => (
                    <div key={index} className="text-center group/tech hover:scale-110 transition-all duration-300">
                      <div className="w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover/tech:from-cyan-400/40 group-hover/tech:to-purple-500/40 transition-all">
                        <span className="text-white text-lg font-bold group-hover/tech:text-cyan-400 transition-colors">{tech.charAt(0)}</span>
                      </div>
                      <p className="text-gray-300 text-xs group-hover/tech:text-white transition-colors">{tech}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="glass-content-pane group hover:scale-105 transition-all duration-500 relative">
              <div className="flex justify-between items-center mb-8">
                <h3 className="heading-tertiary text-gradient">Career Timeline</h3>
                <button
                  onClick={() => setShowFullTimeline(!showFullTimeline)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 text-sm text-cyan-400 hover:text-white"
                >
                  {showFullTimeline ? 'Show Recent Only' : 'Show Full Timeline'}
                </button>
              </div>
              
              {/* Desktop Timeline */}
              <div className="hidden md:block relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500"></div>
                
                <div className="space-y-8">
                  {(showFullTimeline ? experiences : condensedExperiences).map((exp, index) => (
                    <div key={index} className="relative flex items-start space-x-6 group/item">
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center relative z-10 group-hover/item:rotate-12 group-hover/item:scale-110 transition-all duration-300">
                        <span className="text-xl group-hover/item:scale-110 transition-transform">{exp.icon}</span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 group-hover/item:bg-white/5 rounded-lg p-4 -m-4 transition-all duration-300">
                        <div className="text-cyan-400 font-bold text-sm mb-2">{exp.year}</div>
                        <h4 className="text-white font-bold text-lg group-hover/item:text-cyan-400 transition-colors mb-1">{exp.title}</h4>
                        <p className="text-cyan-400 font-medium text-sm group-hover/item:text-white transition-colors mb-3">{exp.company}</p>
                        <p className="text-gray-300 leading-relaxed mb-4">{exp.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {exp.achievements.map((achievement, achIndex) => (
                            <span key={achIndex} className="code-text text-xs">{achievement}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Swipeable Timeline */}
              <div className="md:hidden">
                <div className="relative">
                  {/* Timeline line - horizontal for mobile */}
                  <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>
                  
                  {/* Swipeable container */}
                  <div className="overflow-x-auto scrollbar-hide pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    <div className="flex space-x-6 min-w-max px-4">
                      {(showFullTimeline ? experiences : condensedExperiences).map((exp, index) => (
                        <div key={index} className="flex-shrink-0 w-80 group/item">
                          {/* Timeline dot */}
                          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 group-hover/item:rotate-12 group-hover/item:scale-110 transition-all duration-300">
                            <span className="text-xl group-hover/item:scale-110 transition-transform">{exp.icon}</span>
                          </div>
                          
                          {/* Content */}
                          <div className="bg-white/5 rounded-lg p-4 group-hover/item:bg-white/10 transition-all duration-300">
                            <div className="text-cyan-400 font-bold text-sm mb-2 text-center">{exp.year}</div>
                            <h4 className="text-white font-bold text-lg group-hover/item:text-cyan-400 transition-colors mb-1 text-center">{exp.title}</h4>
                            <p className="text-cyan-400 font-medium text-sm group-hover/item:text-white transition-colors mb-3 text-center">{exp.company}</p>
                            <p className="text-gray-300 leading-relaxed mb-4 text-sm">{exp.description}</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {exp.achievements.slice(0, 3).map((achievement, achIndex) => (
                                <span key={achIndex} className="code-text text-xs">{achievement}</span>
                              ))}
                              {exp.achievements.length > 3 && (
                                <span className="code-text text-xs">+{exp.achievements.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Swipe indicator */}
                  <div className="text-center mt-4">
                    <div className="inline-flex items-center space-x-2 text-cyan-400 text-sm">
                      <span>←</span>
                      <span>Swipe to explore timeline</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="glass-content-pane group hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity animate-spin" style={{animationDuration: '6s'}}></div>
                
                <h3 className="heading-tertiary mb-6 text-gradient">Impact & Achievements</h3>
                
                {/* Desktop Stats Grid */}
                <div className="hidden md:grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center group-hover:scale-110 transition-transform">
                      <div 
                        className="text-4xl font-bold mb-2 group-hover:text-white transition-colors animate-pulse"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                      <p className="text-gray-300 text-sm group-hover:text-cyan-400 transition-colors">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mobile Stats Grid */}
                <div className="md:hidden grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center group-hover:scale-110 transition-transform">
                      <div 
                        className="text-2xl font-bold mb-1 group-hover:text-white transition-colors animate-pulse"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                      <p className="text-gray-300 text-xs group-hover:text-cyan-400 transition-colors">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Awards & Recognition */}
              <div className="glass-content-pane group hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <h3 className="heading-tertiary mb-6 text-gradient">Recognition</h3>
                
                {/* Desktop Recognition */}
                <div className="hidden md:block space-y-4">
                  <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-white/5 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Programmer-of-the-Year</h4>
                      <p className="text-cyan-400 text-sm">Davao Oriental State University</p>
                      <p className="text-gray-400 text-xs">2015</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-white/5 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Tech Leadership</h4>
                      <p className="text-cyan-400 text-sm">Leading Digital Transformation</p>
                      <p className="text-gray-400 text-xs">2023-Present</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-white/5 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎓</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Ed-Tech Co-Founder</h4>
                      <p className="text-cyan-400 text-sm">SkillFoundri COO & Lead Developer</p>
                      <p className="text-gray-400 text-xs">2024-Present</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Recognition - Swipeable */}
                <div className="md:hidden">
                  <div className="overflow-x-auto scrollbar-hide pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    <div className="flex space-x-4 min-w-max px-4">
                      <div className="flex-shrink-0 w-72 p-3 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-white/5 transition-all duration-300">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🏆</span>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">Programmer-of-the-Year</h4>
                            <p className="text-cyan-400 text-xs">Davao Oriental State University</p>
                            <p className="text-gray-400 text-xs">2015</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 w-72 p-3 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-white/5 transition-all duration-300">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🚀</span>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">Tech Leadership</h4>
                            <p className="text-cyan-400 text-xs">Leading Digital Transformation</p>
                            <p className="text-gray-400 text-xs">2023-Present</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 w-72 p-3 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-white/5 transition-all duration-300">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-cyan-500 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🎓</span>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">Ed-Tech Co-Founder</h4>
                            <p className="text-cyan-400 text-xs">SkillFoundri COO & Lead Developer</p>
                            <p className="text-gray-400 text-xs">2024-Present</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Swipe indicator */}
                  <div className="text-center mt-4">
                    <div className="inline-flex items-center space-x-2 text-cyan-400 text-sm">
                      <span>←</span>
                      <span>Swipe to explore achievements</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="glass-content-pane group hover:scale-105 transition-all duration-500 relative overflow-hidden">
              <h3 className="heading-tertiary mb-8 text-gradient text-center">Companies I've Worked With</h3>
              
              {/* Desktop Companies Grid */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company, index) => (
                  <div 
                    key={index} 
                    className="company-card group/card hover:scale-105 transition-all duration-300 p-6 rounded-xl border border-gray-600 hover:border-gray-500 hover:bg-white/5 relative overflow-hidden"
                  >
                    {/* Company logo */}
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-600 group-hover/card:border-gray-500 transition-all duration-300 bg-white/10 backdrop-blur-sm">
                        <div className="w-full h-full bg-gradient-to-br from-white/20 via-white/10 to-transparent absolute inset-0 z-10"></div>
                        <img 
                          src={company.logo} 
                          alt={`${company.name} logo`}
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300 relative z-20"
                        />
                      </div>
                    </div>
                    
                    {/* Company info */}
                    <div className="text-center">
                      <h4 className="text-white font-bold text-lg mb-2 group-hover/card:text-cyan-400 transition-colors">
                        {company.name}
                      </h4>
                      <p className="text-cyan-400 text-sm font-medium mb-2">
                        {company.role}
                      </p>
                      <p className="text-gray-400 text-xs mb-3">
                        {company.period}
                      </p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {company.description}
                      </p>
                    </div>
                    
                    {/* Accent line */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl transition-all duration-300"
                      style={{ background: `linear-gradient(90deg, ${company.color}, ${company.color}80)` }}
                    />
                  </div>
                ))}
              </div>

              {/* Mobile Swipeable Companies */}
              <div className="md:hidden">
                <div className="overflow-x-auto scrollbar-hide pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                  <div className="flex space-x-4 min-w-max px-4">
                    {companies.map((company, index) => (
                      <div 
                        key={index} 
                        className="flex-shrink-0 w-64 company-card group/card hover:scale-105 transition-all duration-300 p-4 rounded-xl border border-gray-600 hover:border-gray-500 hover:bg-white/5 relative overflow-hidden"
                      >
                        {/* Company logo */}
                        <div className="flex justify-center mb-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-600 group-hover/card:border-gray-500 transition-all duration-300 bg-white/10 backdrop-blur-sm">
                            <div className="w-full h-full bg-gradient-to-br from-white/20 via-white/10 to-transparent absolute inset-0 z-10"></div>
                            <img 
                              src={company.logo} 
                              alt={`${company.name} logo`}
                              className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300 relative z-20"
                            />
                          </div>
                        </div>
                        
                        {/* Company info */}
                        <div className="text-center">
                          <h4 className="text-white font-bold text-base mb-1 group-hover/card:text-cyan-400 transition-colors">
                            {company.name}
                          </h4>
                          <p className="text-cyan-400 text-xs font-medium mb-1">
                            {company.role}
                          </p>
                          <p className="text-gray-400 text-xs mb-2">
                            {company.period}
                          </p>
                          <p className="text-gray-300 text-xs leading-relaxed">
                            {company.description}
                          </p>
                        </div>
                        
                        {/* Accent line */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl transition-all duration-300"
                          style={{ background: `linear-gradient(90deg, ${company.color}, ${company.color}80)` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Swipe indicator */}
                <div className="text-center mt-4">
                  <div className="inline-flex items-center space-x-2 text-cyan-400 text-sm">
                    <span>←</span>
                    <span>Swipe to explore companies</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
