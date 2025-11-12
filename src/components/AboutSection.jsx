import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { companyAssets, profileAssets } from '../utils/assets';

const AboutSection = () => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = (resolvedTheme ?? 'light') === 'dark';
  const primaryTextClass = isDarkMode ? 'text-white' : 'text-[#3b261a]';
  const secondaryTextClass = isDarkMode ? 'text-gray-300' : 'text-[#5f4735]';
  const accentTextClass = isDarkMode ? 'text-cyan-400' : 'text-[#b88760]';
  const accentDotClass = isDarkMode ? 'bg-cyan-400' : 'bg-[#b88760]';
  const accentDotSecondaryClass = isDarkMode ? 'bg-green-400' : 'bg-[#a26f4a]';
  const tabActiveClass = isDarkMode
    ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg'
    : 'bg-[#f6e8d9] text-[#4a3223] border border-[#e3c7a8] shadow-[0_12px_30px_rgba(90,58,40,0.12)]';
  const tabInactiveClass = isDarkMode
    ? 'text-gray-300 hover:text-white hover:bg-white/10'
    : 'text-[#7a5c4a] hover:text-[#4a3223] hover:bg-[#f0e1cf]';
  const badgeBaseClass = isDarkMode
    ? 'bg-white/10 hover:bg-white/20 text-cyan-400 hover:text-white border border-white/20'
    : 'bg-[#f3e3d0] hover:bg-[#ead3bb] text-[#70513a] hover:text-[#3b261a] border border-[#e0c5ab] shadow-[0_10px_24px_rgba(90,58,40,0.08)]';
  const skillCardClass = isDarkMode
    ? 'border border-gray-600 hover:border-gray-500 hover:bg-white/5'
    : 'border border-[#e0c5ab] bg-[#fbf0e2] hover:bg-[#f4e4d4] hover:border-[#d8bfa4] shadow-[0_10px_24px_rgba(90,58,40,0.08)]';
  const progressTrackClass = isDarkMode ? 'bg-gray-700' : 'bg-[#e8d6c4]';
  const getSkillBarGradient = (color) =>
    isDarkMode ? `linear-gradient(90deg, ${color}, ${color}80)` : 'linear-gradient(90deg, #b88760, #d9b08c)';
  const skillIconWrapperClass = isDarkMode
    ? 'bg-white/10 text-white'
    : 'bg-[#f2dfc8] text-[#704c33] border border-[#e2c8a9]';
  const techTileBackgroundClass = isDarkMode
    ? 'bg-gradient-to-r from-cyan-400/20 to-purple-500/20 group-hover/tech:from-cyan-400/40 group-hover/tech:to-purple-500/40'
    : 'bg-[#f5e6d5] border border-[#e2c8ad] group-hover/tech:bg-[#edd9c2]';
  const techTileTextClass = isDarkMode
    ? 'text-white group-hover/tech:text-cyan-400'
    : 'text-[#4a3223] group-hover/tech:text-[#a96e47]';
  const techTileLabelClass = isDarkMode
    ? 'text-gray-300 group-hover/tech:text-white'
    : 'text-[#6b4f3a] group-hover/tech:text-[#3b261a]';
  const recognitionCardClass = isDarkMode
    ? 'border border-gray-600 hover:border-gray-500 hover:bg-white/5'
    : 'border border-[#e0c5ab] bg-[#fbf0e2] hover:bg-[#f2e2d1] hover:border-[#d4b798] shadow-[0_10px_24px_rgba(90,58,40,0.08)]';
  const recognitionIconWrapperClass = isDarkMode
    ? ''
    : 'bg-[#f2dfc8] border border-[#e0c5ab]';
  const companyCardClass = isDarkMode
    ? 'border border-gray-600 hover:border-gray-500 hover:bg-white/5'
    : 'border border-[#e0c5ab] bg-[#fbf0e2] hover:bg-[#f2e2d1] hover:border-[#d4b798] shadow-[0_12px_32px_rgba(90,58,40,0.08)]';
  const companyLogoWrapperClass = isDarkMode
    ? 'border-2 border-gray-600 group-hover/card:border-gray-500 bg-white/10'
    : 'border-2 border-[#e0c5ab] group-hover/card:border-[#d4b798] bg-[#fff8ef]';
  const sectionBackgroundOverlayClass = isDarkMode
    ? 'bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20'
    : 'bg-[radial-gradient(circle_at_top,_rgba(247,236,225,0.85)_0%,_rgba(240,224,208,0.65)_45%,_rgba(233,212,194,0.45)_100%)]';
  const mouseGlowBackground = isDarkMode
    ? 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)'
    : 'radial-gradient(circle, rgba(209,178,145,0.28) 0%, rgba(230,204,177,0.18) 45%, transparent 70%)';
  const floatingParticleClass = isDarkMode
    ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
    : 'bg-[#e2c8ad]';
  const profileFrameClass = isDarkMode
    ? 'rounded-full p-[3px] bg-gradient-to-r from-cyan-400 to-purple-500'
    : 'rounded-full p-[3px] bg-gradient-to-r from-[#f2dfc8] to-[#dfc09f] shadow-[0_12px_30px_rgba(90,58,40,0.15)]';
  const profileOverlayClass = isDarkMode
    ? 'bg-gradient-to-t from-black/50 to-transparent'
    : 'bg-[linear-gradient(to_top, rgba(59,38,26,0.32), transparent)]';
  const profileHoverGlowClass = isDarkMode
    ? 'bg-gradient-to-r from-cyan-400/20 to-purple-500/20'
    : 'bg-[radial-gradient(circle, rgba(209,178,145,0.3) 0%, rgba(255,252,247,0) 70%)]';
  const profileOuterRingClass = isDarkMode
    ? 'absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 opacity-20 group-hover:opacity-40 transition-opacity animate-pulse'
    : 'absolute -inset-2 rounded-full border border-[#e6c9a7] opacity-40 group-hover:opacity-70 transition-opacity';
  const accentBubblePrimaryClass = isDarkMode
    ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
    : 'bg-[#efdcc6]';
  const accentBubbleSecondaryClass = isDarkMode
    ? 'bg-gradient-to-r from-green-500 to-cyan-500'
    : 'bg-[#e9cfb2]';
  const achievementBubbleClass = isDarkMode
    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
    : 'bg-[#f7e2bd] border border-[#e8c794]';

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
        <div className={`absolute inset-0 ${sectionBackgroundOverlayClass}`}></div>
        
        {/* Mouse-following gradient */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-1000"
          style={{
            left: `${mousePosition.x * 100}%`,
            top: `${mousePosition.y * 100}%`,
            background: mouseGlowBackground,
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full opacity-40 animate-pulse ${floatingParticleClass}`}
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
            <div
              className={`absolute -inset-4 rounded-full blur-xl ${
                isDarkMode
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20'
                  : 'bg-[radial-gradient(circle,_rgba(209,178,145,0.35)_0%,_rgba(255,252,247,0.1)_60%,_transparent_100%)]'
              }`}
            ></div>
          </div>
          
          {/* Profile Card */}
          <div className="glass-content-pane max-w-4xl mx-auto mb-8 group hover:scale-105 transition-all duration-500 relative overflow-visible">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="relative group">
                <div className={`w-32 h-32 rounded-full transition-transform duration-500 group-hover:rotate-12 ${profileFrameClass}`}>
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img 
                      src={profileAssets.photo} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 ${profileOverlayClass}`}></div>
                  </div>
                </div>
                
                {/* Animated glow effect on hover */}
                <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl scale-110 ${profileHoverGlowClass}`}></div>
                
                {/* Outer glow ring */}
                <div className={profileOuterRingClass}></div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-left">
                <h3 className={`text-2xl font-bold mb-2 ${primaryTextClass}`}>Hello, I'm a Tech Innovator</h3>
                <p className={`leading-relaxed mb-4 ${secondaryTextClass}`}>
                  From <span className="text-gradient font-semibold">"Programmer-of-the-Year"</span> to 
                  <span className="text-gradient font-semibold"> Tech Director</span>, I've been crafting 
                  digital experiences that make a difference. Currently co-founding and leading the future of education with 
                  <span className="text-gradient font-semibold"> SkillFoundri</span>.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${accentDotClass}`}></div>
                    <span className={`text-sm font-medium ${accentTextClass}`}>Available for projects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${accentDotSecondaryClass}`}></div>
                    <span className={`text-sm font-medium ${accentTextClass}`}>Co-founding SkillFoundri</span>
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
                    activeTab === tab.id ? tabActiveClass : tabInactiveClass
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
                <div
                  className={`absolute top-4 right-4 w-12 h-12 rounded-full opacity-20 group-hover:opacity-40 transition-opacity ${accentBubblePrimaryClass} ${
                    isDarkMode ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '8s' }}
                ></div>
                <h3 className="heading-tertiary mb-6 text-gradient">My Journey</h3>
                <div className="space-y-4">
                  <p className={`leading-relaxed ${secondaryTextClass}`}>
                    My journey began in 2015 when I was recognized as <span className="text-gradient font-semibold">"Programmer-of-the-Year"</span> 
                    at Davao Oriental State University. This early recognition fueled my passion for technology and innovation.
                  </p>
                  <p className={`leading-relaxed ${secondaryTextClass}`}>
                    Over the years, I've evolved from a passionate programmer to a <span className="text-gradient font-semibold">Tech Director</span>, 
                    leading teams and driving digital transformation across various organizations.
                  </p>
                  <p className={`leading-relaxed ${secondaryTextClass}`}>
                    Today, I'm co-founding and leading <span className="text-gradient font-semibold">SkillFoundri</span> as COO and Lead Developer - 
                    an innovative ed-tech startup that's revolutionizing online education through project-based learning and industry-relevant skill development.
                  </p>
                </div>
              </div>

              {/* Current Focus */}
              <div className="glass-content-pane group hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div
                  className={`absolute -top-2 -right-2 w-16 h-16 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${accentBubbleSecondaryClass}`}
                ></div>
                <div className="flex items-center space-x-3 mb-6">
                  <div
                    className={`w-16 h-16 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-green-500 to-cyan-500'
                        : 'bg-[#f2dfc8] border border-[#e0c1a1]'
                    }`}
                  >
                    <span className="text-3xl">🎓</span>
                  </div>
                  <div>
                    <h4 className={`font-bold text-xl ${primaryTextClass}`}>SkillFoundri</h4>
                    <p className={`text-sm ${accentTextClass}`}>COO & Lead Developer</p>
                  </div>
                </div>
                <p className={`${secondaryTextClass} leading-relaxed mb-6`}>
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
                <div className={`floating-circle circle-1 ${isDarkMode ? '' : 'hidden'}`} />
                <div className={`floating-circle circle-2 ${isDarkMode ? '' : 'hidden'}`} />
                <div className={`floating-circle circle-3 ${isDarkMode ? '' : 'hidden'}`} />
                
                <h3 className="heading-tertiary mb-6 text-gradient">Technical Skills</h3>
                <div className="grid grid-cols-2 gap-4">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg transition-all duration-300 group/skill ${skillCardClass}`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${skillIconWrapperClass}`}>
                          {skill.icon}
                        </div>
                        <div>
                          <h4
                            className={`font-semibold text-sm transition-colors ${isDarkMode ? 'text-white group-hover/skill:text-cyan-400' : 'text-[#4a3223] group-hover/skill:text-[#b88760]'}`}
                          >
                            {skill.category}
                          </h4>
                          <p className={`text-xs ${secondaryTextClass}`}>{skill.level}%</p>
                        </div>
                      </div>
                      <div className={`w-full rounded-full h-2 mb-3 ${progressTrackClass}`}>
                        <div
                          className="h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${skill.level}%`,
                            background: getSkillBarGradient(skill.color)
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
                    <div key={index} className="text-center group/tech hover:scale-105 transition-all duration-300">
                      <div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-2 transition-all ${techTileBackgroundClass}`}
                      >
                        <span className={`text-lg font-bold transition-colors ${techTileTextClass}`}>{tech.charAt(0)}</span>
                      </div>
                      <p className={`text-xs transition-colors ${techTileLabelClass}`}>{tech}</p>
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
                  className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/20 text-cyan-400 hover:text-white'
                      : 'bg-[#f3e3d0] hover:bg-[#ead3bb] text-[#70513a] hover:text-[#3b261a] border border-[#e0c5ab] shadow-[0_10px_24px_rgba(90,58,40,0.08)]'
                  }`}
                >
                  {showFullTimeline ? 'Show Recent Only' : 'Show Full Timeline'}
                </button>
              </div>
              
              {/* Desktop Timeline */}
              <div className="hidden md:block relative">
                {/* Timeline line */}
                <div
                  className={`absolute left-8 top-0 bottom-0 w-0.5 ${
                    isDarkMode
                      ? 'bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500'
                      : 'bg-[linear-gradient(to_bottom,_rgba(186,137,99,0.6)_0%,_rgba(216,176,132,0.3)_50%,_rgba(240,218,189,0.1)_100%)]'
                  }`}
                ></div>
                
                <div className="space-y-8">
                  {(showFullTimeline ? experiences : condensedExperiences).map((exp, index) => (
                    <div key={index} className="relative flex items-start space-x-6 group/item">
                      {/* Timeline dot */}
                      <div
                        className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center relative z-10 group-hover/item:rotate-12 group-hover/item:scale-110 transition-all duration-300 ${
                          isDarkMode
                            ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
                            : 'bg-[#f6e9d9] border border-[#e3c7a8]'
                        }`}
                      >
                        <span className="text-xl group-hover/item:scale-110 transition-transform">{exp.icon}</span>
                      </div>
                      
                      {/* Content */}
                      <div
                        className={`flex-1 min-w-0 rounded-lg p-4 -m-4 transition-all duration-300 ${
                          isDarkMode ? 'group-hover/item:bg-white/5' : 'group-hover/item:bg-[#f8ecdd]'
                        }`}
                      >
                        <div className={`font-bold text-sm mb-2 ${accentTextClass}`}>{exp.year}</div>
                        <h4
                          className={`font-bold text-lg transition-colors ${primaryTextClass} ${
                            isDarkMode ? 'group-hover/item:text-cyan-400' : 'group-hover/item:text-[#b88760]'
                          }`}
                        >
                          {exp.title}
                        </h4>
                        <p className={`font-medium text-sm mb-3 ${accentTextClass}`}>{exp.company}</p>
                        <p className={`${secondaryTextClass} leading-relaxed mb-4`}>{exp.description}</p>
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
                  <div
                    className={`absolute top-8 left-0 right-0 h-0.5 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500'
                        : 'bg-[linear-gradient(to_right,_rgba(186,137,99,0.6)_0%,_rgba(216,176,132,0.3)_50%,_rgba(240,218,189,0.1)_100%)]'
                    }`}
                  ></div>
                  
                  {/* Swipeable container */}
                  <div className="overflow-x-auto scrollbar-hide pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    <div className="flex space-x-6 min-w-max px-4">
                      {(showFullTimeline ? experiences : condensedExperiences).map((exp, index) => (
                        <div key={index} className="flex-shrink-0 w-80 group/item">
                          {/* Timeline dot */}
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 group-hover/item:rotate-12 group-hover/item:scale-110 transition-all duration-300 ${
                              isDarkMode
                                ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
                                : 'bg-[#f6e9d9] border border-[#e3c7a8]'
                            }`}
                          >
                            <span className="text-xl group-hover/item:scale-110 transition-transform">{exp.icon}</span>
                          </div>
                          
                          {/* Content */}
                          <div
                            className={`rounded-lg p-4 transition-all duration-300 ${
                              isDarkMode ? 'bg-white/5 group-hover/item:bg-white/10' : 'bg-[#fbf0e2] group-hover/item:bg-[#f2e2d1]'
                            }`}
                          >
                            <div className={`font-bold text-sm mb-2 text-center ${accentTextClass}`}>{exp.year}</div>
                            <h4
                              className={`font-bold text-lg mb-1 text-center transition-colors ${primaryTextClass} ${
                                isDarkMode ? 'group-hover/item:text-cyan-400' : 'group-hover/item:text-[#b88760]'
                              }`}
                            >
                              {exp.title}
                            </h4>
                            <p className={`font-medium text-sm mb-3 text-center ${accentTextClass}`}>{exp.company}</p>
                            <p className={`${secondaryTextClass} leading-relaxed mb-4 text-sm text-center`}>{exp.description}</p>
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
                    <div className={`inline-flex items-center space-x-2 text-sm ${accentTextClass}`}>
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
                <div
                  className={`absolute top-4 right-4 w-8 h-8 rounded-full opacity-20 group-hover:opacity-40 transition-opacity ${achievementBubbleClass} ${
                    isDarkMode ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '6s' }}
                ></div>
                
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
                      <p
                        className={`text-sm transition-colors ${secondaryTextClass} ${
                          isDarkMode ? 'group-hover:text-cyan-400' : 'group-hover:text-[#b88760]'
                        }`}
                      >
                        {stat.label}
                      </p>
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
                      <p
                        className={`text-xs transition-colors ${secondaryTextClass} ${
                          isDarkMode ? 'group-hover:text-cyan-400' : 'group-hover:text-[#b88760]'
                        }`}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Awards & Recognition */}
              <div className="glass-content-pane group hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <h3 className="heading-tertiary mb-6 text-gradient">Recognition</h3>
                
                {/* Desktop Recognition */}
                <div className="hidden md:block space-y-4">
                  <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${recognitionCardClass}`}>
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : recognitionIconWrapperClass
                      }`}
                    >
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${primaryTextClass}`}>Programmer-of-the-Year</h4>
                      <p className={`${accentTextClass} text-sm`}>Davao Oriental State University</p>
                      <p className={`${secondaryTextClass} text-xs`}>2015</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${recognitionCardClass}`}>
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'bg-gradient-to-r from-green-400 to-blue-500' : recognitionIconWrapperClass
                      }`}
                    >
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${primaryTextClass}`}>Tech Leadership</h4>
                      <p className={`${accentTextClass} text-sm`}>Leading Digital Transformation</p>
                      <p className={`${secondaryTextClass} text-xs`}>2023-Present</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${recognitionCardClass}`}>
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'bg-gradient-to-r from-green-400 to-cyan-500' : recognitionIconWrapperClass
                      }`}
                    >
                      <span className="text-2xl">🎓</span>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${primaryTextClass}`}>Ed-Tech Co-Founder</h4>
                      <p className={`${accentTextClass} text-sm`}>SkillFoundri COO & Lead Developer</p>
                      <p className={`${secondaryTextClass} text-xs`}>2024-Present</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Recognition - Swipeable */}
                <div className="md:hidden">
                  <div className="overflow-x-auto scrollbar-hide pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    <div className="flex space-x-4 min-w-max px-4">
                      <div className={`flex-shrink-0 w-72 p-3 rounded-lg transition-all duration-300 ${recognitionCardClass}`}>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : recognitionIconWrapperClass
                            }`}
                          >
                            <span className="text-xl">🏆</span>
                          </div>
                          <div>
                            <h4 className={`font-semibold text-sm ${primaryTextClass}`}>Programmer-of-the-Year</h4>
                            <p className={`${accentTextClass} text-xs`}>Davao Oriental State University</p>
                            <p className={`${secondaryTextClass} text-xs`}>2015</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex-shrink-0 w-72 p-3 rounded-lg transition-all duration-300 ${recognitionCardClass}`}>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-gradient-to-r from-green-400 to-blue-500' : recognitionIconWrapperClass
                            }`}
                          >
                            <span className="text-xl">🚀</span>
                          </div>
                          <div>
                            <h4 className={`font-semibold text-sm ${primaryTextClass}`}>Tech Leadership</h4>
                            <p className={`${accentTextClass} text-xs`}>Leading Digital Transformation</p>
                            <p className={`${secondaryTextClass} text-xs`}>2023-Present</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex-shrink-0 w-72 p-3 rounded-lg transition-all duration-300 ${recognitionCardClass}`}>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-gradient-to-r from-green-400 to-cyan-500' : recognitionIconWrapperClass
                            }`}
                          >
                            <span className="text-xl">🎓</span>
                          </div>
                          <div>
                            <h4 className={`font-semibold text-sm ${primaryTextClass}`}>Ed-Tech Co-Founder</h4>
                            <p className={`${accentTextClass} text-xs`}>SkillFoundri COO & Lead Developer</p>
                            <p className={`${secondaryTextClass} text-xs`}>2024-Present</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Swipe indicator */}
                  <div className="text-center mt-4">
                    <div className={`inline-flex items-center space-x-2 text-sm ${accentTextClass}`}>
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
                    className={`company-card group/card hover:scale-105 transition-all duration-300 p-6 rounded-xl relative overflow-hidden ${companyCardClass}`}
                  >
                    {/* Company logo */}
                    <div className="flex justify-center mb-4">
                      <div className={`w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 backdrop-blur-sm relative ${companyLogoWrapperClass}`}>
                        <div className="w-full h-full absolute inset-0 z-10 bg-white/10" style={{ mixBlendMode: 'overlay' }}></div>
                        <img 
                          src={company.logo} 
                          alt={`${company.name} logo`}
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300 relative z-20"
                        />
                      </div>
                    </div>
                    
                    {/* Company info */}
                    <div className="text-center">
                      <h4
                        className={`font-bold text-lg mb-2 transition-colors ${primaryTextClass} ${
                          isDarkMode ? 'group-hover/card:text-cyan-400' : 'group-hover/card:text-[#b88760]'
                        }`}
                      >
                        {company.name}
                      </h4>
                      <p className={`text-sm font-medium mb-2 ${accentTextClass}`}>
                        {company.role}
                      </p>
                      <p className={`${secondaryTextClass} text-xs mb-3`}>
                        {company.period}
                      </p>
                      <p className={`${secondaryTextClass} text-sm leading-relaxed`}>
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
                        className={`flex-shrink-0 w-64 company-card group/card hover:scale-105 transition-all duration-300 p-4 rounded-xl relative overflow-hidden ${companyCardClass}`}
                      >
                        {/* Company logo */}
                        <div className="flex justify-center mb-3">
                          <div className={`w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 backdrop-blur-sm relative ${companyLogoWrapperClass}`}>
                            <div className="w-full h-full absolute inset-0 z-10 bg-white/10" style={{ mixBlendMode: 'overlay' }}></div>
                            <img 
                              src={company.logo} 
                              alt={`${company.name} logo`}
                              className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300 relative z-20"
                            />
                          </div>
                        </div>
                        
                        {/* Company info */}
                        <div className="text-center">
                          <h4
                            className={`font-bold text-base mb-1 transition-colors ${primaryTextClass} ${
                              isDarkMode ? 'group-hover/card:text-cyan-400' : 'group-hover/card:text-[#b88760]'
                            }`}
                          >
                            {company.name}
                          </h4>
                          <p className={`text-xs font-medium mb-1 ${accentTextClass}`}>
                            {company.role}
                          </p>
                          <p className={`${secondaryTextClass} text-xs mb-2`}>
                            {company.period}
                          </p>
                          <p className={`${secondaryTextClass} text-xs leading-relaxed`}>
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
                  <div className={`inline-flex items-center space-x-2 text-sm ${accentTextClass}`}>
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
