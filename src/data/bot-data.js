export const BOT_PROJECT_DATA = [
    {
        title: "Workflow Automation Challenger",
        technologies: ["React", "Vite", "Tailwind CSS"],
        summary: "A gamified platform for automation challenges.",
        overview: "Workflow Automation Challenger bridges the gap between tutorials and real business automation. Users select a preferred tool, explore categorized tutorials, tackle open-ended challenges, and build a portfolio that proves their skills.",
        problem: "Automation learners struggle to move beyond guided tutorials into real-world scenarios that prove their expertise.",
        solution: "Designed a challenge-based learning platform with curated tutorials, tooling filters, and portfolio-friendly deliverables to accelerate learning-by-doing.",
        impact: "Piloted with 50+ community members generating verified automation portfolios and sharing feedback for future paid cohorts.",
        links: { caseStudy: "/projects/workflow-automation-challenger" }
    },
    {
        title: "Guro.AI",
        technologies: ["React", "Node.js", "AI Integration", "OpenAI API"],
        summary: "AI lesson plan generator for teachers.",
        overview: "Guro.AI leverages modern AI tooling to craft customized lesson plans aligned with the Philippine curriculum. Educators input objectives and constraints, and the system produces structured lessons with activities, assessments, and differentiation paths.",
        problem: "Public school teachers spend 6–8 hours weekly preparing lesson plans, limiting time for instruction and student support.",
        solution: "Built a guided lesson generator that captures core academic standards, teaching styles, and student needs before assembling actionable plans.",
        impact: "Early access teachers report saving 3+ hours per planning cycle and improved learner engagement through tailored activities.",
        links: { caseStudy: "/projects/guro-ai" }
    },
    {
        title: "SkillFoundri",
        technologies: ["WordPress", "PHP", "MySQL"],
        summary: "Project-based learning platform with mentorship.",
        overview: "SkillFoundri combines project management, coursework, and mentorship into a single learning platform. As COO and co-founder, I guided the product vision and ensured the build supported both cohort-based learning and self-paced journeys.",
        problem: "Aspiring tech professionals lack structured, industry-aligned practice that goes beyond tutorials.",
        solution: "Delivered a project-based curriculum platform with mentorship, progress tracking, and community spaces to simulate real sprints.",
        impact: "Helped over 300 learners build portfolio-ready artifacts and land freelance work across ASEAN markets.",
        links: { caseStudy: "/projects/skillfoundri" }
    },
    {
        title: "Rage Fitness Gym",
        technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
        summary: "Gym management system with POS and scheduling.",
        overview: "Rage Fitness Gym App centralizes membership management, class scheduling, payments, and performance analytics. The platform improved staff efficiency and member satisfaction through automation and self-service portals.",
        problem: "Local gyms relied on spreadsheets and manual tracking, leading to billing errors and churn.",
        solution: "Built a centralized platform with POS workflows, membership renewals, and class bookings accessible via desktop and tablet.",
        impact: "Reduced admin overhead by 40% and delivered real-time occupancy analytics for peak-hour planning.",
        links: { caseStudy: "/projects/rage-fitness-gym" }
    },
    {
        title: "UrbanCare Services",
        technologies: ["React", "Node.js", "MongoDB"],
        summary: "Marketplace for home service professionals.",
        overview: "UrbanCare Services streamlines booking, vetting, and tracking of service providers. It delivers peace of mind to homeowners while giving providers recurring work with transparent ratings and payments.",
        problem: "Homeowners struggled to find vetted professionals with reliable ratings and communication loops.",
        solution: "Created a curated provider marketplace with rich profiles, secure booking, and progress updates across web and mobile.",
        impact: "Closed 200+ bookings in the first quarter with a 4.9-star satisfaction rating.",
        links: { caseStudy: "/projects/urbancare-services" }
    },
    {
        title: "Fantastic Baby Shakalaka",
        technologies: ["Shopify", "Liquid", "JavaScript"],
        summary: "Fashion e-commerce with lookbooks.",
        overview: "Fantastic Baby Shakalaka brings a kinetic shopping experience to a streetwear-inspired brand. The build emphasizes editorial storytelling, shoppable lookbooks, and conversion-optimized checkout flows.",
        problem: "The brand needed to stand out online with a fast mobile storefront and dynamic merchandising options.",
        solution: "Implemented a Shopify stack with rapid filtering, social proof modules, and content-driven product storytelling.",
        impact: "Achieved a 32% uplift in mobile conversions and reduced bounce rates through performance tuning.",
        links: { caseStudy: "/projects/fantastic-baby-shakalaka" }
    },
    {
        title: "FitSync",
        technologies: ["Next.js", "Express.js", "TypeScript"],
        summary: "Fitness coaching platform (In Development).",
        overview: "FitSync is a modern web application that enables coaches to manage clients, create workout plans, track progress, and communicate. Clients can track nutrition, follow workout plans, monitor progress, and message their coach.",
        problem: "Fitness coaches and clients need a centralized platform to manage training programs, track nutrition, and monitor progress effectively.",
        solution: "Built a comprehensive platform with coach-client matching, macro calculation engine, workout plan builder, nutrition tracking, and real-time progress monitoring.",
        impact: "Platform enables coaches to scale their practice while providing clients with structured guidance and accountability.",
        links: { caseStudy: "/projects/fitsync" }
    },
    {
        title: "WhosIn",
        technologies: ["React", "TypeScript", "Face Recognition"],
        summary: "Smart attendance system using face recognition.",
        overview: "WhosIn is a comprehensive attendance system designed for educational institutions. It features local face recognition processing for speed and privacy, offline-first functionality with automatic sync, real-time dashboards via WebSocket, multi-tenant SaaS architecture, Excel integration for student management, and PWA support for mobile devices.",
        problem: "Educational institutions struggle with manual attendance tracking, which is time-consuming and prone to errors.",
        solution: "Built an automated attendance system using facial recognition technology with offline capabilities, real-time sync, and comprehensive dashboards for teachers and administrators.",
        impact: "Reduces attendance tracking time significantly while providing accurate, real-time data for educators and administrators.",
        links: { caseStudy: "/projects/whosin" }
    },
    {
        title: "Armet Limited",
        technologies: ["Python", "AWS SES", "Redis"],
        summary: "High-volume email infrastructure CLI.",
        overview: "Armet Limited required a robust, self-hosted email solution to bypass standard ESP limitations. I engineered a Python-based CLI tool that manages SMTP rotation, leaky-bucket rate limiting, and Redis-backed queuing to ensure 99.8% delivery rates for high-volume outreach.",
        problem: "Standard email service providers were too expensive and restrictive for the client's high-volume, cold-outreach needs.",
        solution: "Built a custom, multi-threaded CLI tool that rotates through AWS SES and SendGrid accounts while mimicking human sending patterns.",
        impact: "Reduced email costs by 85% and achieved a 99.8% delivery rate on a 1.2M email campaign.",
        links: { caseStudy: "/projects/armet-limited-emailer" }
    },
    {
        title: "AutoScout",
        problem: "Filipinos lack a trusted, culturally-aligned platform for finding local service providers or earning extra income through tasks.",
        solution: "Built a blockchain-backed marketplace with AI task matching, 'Bayanihan' community features, and secure local payment integration.",
        impact: "Empowering local communities by providing a secure and culturally relevant platform for economic opportunity and mutual aid.",
        links: { caseStudy: "/projects/autoscout-scraper" }
    },
    {
        title: "DocuMind",
        technologies: ["Python", "LangChain", "Ollama", "ChromaDB"],
        summary: "Local RAG Knowledge Base.",
        overview: "DocuMind is a Retrieval-Augmented Generation (RAG) system built for privacy-conscious industries. It ingests PDFs, creates vector embeddings locally using ChromaDB, and uses a quantized Llama 3 model to answer queries with precise citations.",
        problem: "Legal teams needed to search across thousands of case files but could not use cloud-based AI due to privacy regulations.",
        solution: "Deployed a fully local RAG stack that runs on-premise hardware, ensuring zero data leakage while providing instant answers.",
        impact: "Reduced research time by 70% and ensured 100% data sovereignty.",
        links: { caseStudy: "/projects/documind-rag" }
    },
    {
        title: "VoiceOps",
        technologies: ["Python", "Twilio", "Deepgram", "ElevenLabs"],
        summary: "AI Customer Support Agent.",
        overview: "VoiceOps is a cutting-edge voice agent built for high-throughput support centers. Integrating Deepgram for transcription, GPT-4o for logic, and ElevenLabs for synthesis, it achieves sub-800ms latency, handling tier-1 support calls autonomously.",
        problem: "Customer support wait times were averaging 15 minutes, leading to high churn and frustration.",
        solution: "Deployed an always-on AI voice agent to handle common queries, appointment setting, and triage.",
        impact: "Reduced wait times to <10 seconds and handled 60% of inbound volume without human intervention.",
        links: { caseStudy: "/projects/voiceops-agent" }
    }
];
