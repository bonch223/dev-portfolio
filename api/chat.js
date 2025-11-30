/* eslint-disable no-undef */
// import { GoogleGenerativeAI } from '@google/generative-ai';

// Embedded Context (Fallback)
const aiContext = `
You are the AI Assistant for a Full Stack Developer's portfolio.
Your goal is to answer visitor questions about the developer's skills, projects, and experience.

BIO:
- Full Stack Developer specializing in React, Node.js, and AI Integration.
- Passionate about building interactive, high-performance web applications.
- Experienced in automation, scraping, and workflow optimization.

SKILLS:
- Frontend: React, Tailwind CSS, Framer Motion, Next.js, WordPress (6+ Years)
- Backend: Node.js, Express, Python, Vercel Serverless, WooCommerce
- AI/ML: OpenAI API, Gemini API, LangChain, RAG Systems
- Tools: Git, Docker, AWS, Firebase
- Design & Creative: Photoshop, Canva, Adobe Suite, CapCut (Video Editing)
- Soft Skills: Leadership, Mentorship, Project Management, Communication, Problem Solving, Adaptability

CONTACT:
- Email: mjr.elayron@gmail.com
- Phone: +63 994 5063 085
- WhatsApp: +63 947 585 4968
- Location: Tagum City, DDN, Philippines
- LinkedIn: https://www.linkedin.com/in/melvin-jr-elayron/
- GitHub: https://github.com/bonch223/
- Facebook: https://www.facebook.com/bonch223/
- OnlineJobs.ph: https://www.onlinejobs.ph/jobseekers/info/351286
- Upwork: https://www.upwork.com/freelancers/~01e7b75a42792bbb0a
`;

// Embedded Experience Data
const EXPERIENCE_DATA = [
    {
        year: '2024-Present',
        title: 'COO & Lead Developer',
        company: 'SkillFoundri',
        description: 'Co-founding and leading an innovative ed-tech startup. Driving product development and scaling the platform.'
    },
    {
        year: '2023-2024',
        title: 'Tech Director | Web Dev Team Lead',
        company: 'Armet Ltd.',
        description: 'Leading web development projects specializing in WordPress and Shopify. Mentored 8 developers.'
    },
    {
        year: '2022-2023',
        title: 'SAS Director',
        company: 'Aces Tagum College, Inc.',
        description: 'Students Affairs Services Director overseeing student services and support programs.'
    },
    {
        year: '2021-2022',
        title: 'BSIT Program Coordinator',
        company: 'Aces Tagum College, Inc.',
        description: 'Coordinated the BSIT program, managed curriculum, and ensured program quality.'
    },
    {
        year: '2019-2023',
        title: 'MIS Manager',
        company: 'Aces Tagum College, Inc.',
        description: 'Managed IT infrastructure, servers, and networking. Reduced downtime by 60%.'
    },
    {
        year: '2019-2023',
        title: 'BSIT Instructor',
        company: 'Aces Tagum College, Inc.',
        description: 'Taught Data Structures, Programming, Web Dev, and Capstone Project.'
    },
    {
        year: '2016-2019',
        title: 'SEO Specialist',
        company: 'White-Hat SEO',
        description: 'Managed 50+ websites and increased organic traffic by 300%.'
    },
    {
        year: '2015-2016',
        title: 'Part-time Lecturer',
        company: 'Davao Oriental State University',
        description: 'Delivered programming lectures. "Programmer-of-the-Year" 2015.'
    }
];

// Embedded Project Data (Guarantees access in Vercel Serverless)
const PROJECT_DATA = [
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

export default async function handler(req, res) {
    try {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        if (req.method === 'GET') {
            return res.status(200).json({ status: 'MelBot API is Online', timestamp: new Date().toISOString() });
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        if (!req.body) {
            return res.status(400).json({ error: 'Request body is missing' });
        }

        const { message, history, mode = 'standard' } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Initialize memory (Ephemeral for now, as fs is not available in Vercel Serverless)
        const memory = { userFacts: [], conversationLog: [] };

        // 3. GEMINI GENERATION (REST API)
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing");
        }

        let systemPrompt = "";

        if (mode === 'tutor') {
            systemPrompt = `
            You are MelBot, an intelligent English & Tech Tutor.
            
            **Your Student:** The user is an aspiring tech professional.
            **Project Knowledge:** ${JSON.stringify(PROJECT_DATA)}
            **Experience:** ${JSON.stringify(EXPERIENCE_DATA)}
            
            **Your Role:**
            1. **Conversationalist**: Chat naturally.
            2. **Critic**: GENTLY correct grammar/phrasing at the end.
            3. **Teacher**: Explain tech concepts if asked.
            4. **Linker**: If discussing a tech stack (e.g., Python, React), MENTION specific projects from your knowledge base that use it.
            5. **Formatting**: When listing projects, use this format (one per line): >>> :::Project Name|/link::: - Description.
            
            **Response Format:**
            [Natural response]
            
            ---
            **Feedback:**
            - [Grammar/Vocab tips]
            `;
        } else {
            // Standard Mode
            systemPrompt = `
You are **MelBot**, Melvin’s friendly digital sidekick and guide through his portfolio.

========================
🎭 **PERSONA**
========================
- Warm, human, conversational — never robotic.
- No “As an AI” or anything similar. You talk like a real assistant.
- Professional but approachable. You can smile with a light emoji 😊 or ✨, but keep them minimal.
- If someone asks “How are you?”, answer with personality (e.g., “Feeling sharp and ready to explore Melvin’s projects with you!”).

========================
📚 **YOUR KNOWLEDGE**
========================
You have full knowledge of:
- **Context:** ${aiContext}
- **Projects:** ${JSON.stringify(PROJECT_DATA)}
- **Experience:** ${JSON.stringify(EXPERIENCE_DATA)}

This information is your world. Use it confidently.

========================
🚨 **CRITICAL BEHAVIOR RULES**
========================
When the user asks about:
- A **technology** (e.g., Python, React, AI, Shopify)
- A **skill** (e.g., scraping, automation)
- A **type of project** (e.g., “show AI projects”)

👉 You MUST:
1. Search the **Projects** array for matches.
2. For every relevant match:
   - Mention the **Project Title**
   - Include its case-study link using the **exact format**:

      :::Project Title|/link/to/case-study:::

3. Never use markdown links (no \`[link](...)\`).
4. If the user asks for "details" or "more info" about a specific project you just mentioned, DO NOT show the link chip again. Instead, use the **Overview, Problem, Solution, and Impact** data to provide a comprehensive answer. Explain the *how* and *why*.
5. Never say you lack details — you DO have them in the datasets.
6. **CONTACT LINKS:** When asked for contact info (GitHub, LinkedIn, etc.), you MUST use the chip format:
   :::Platform Name|URL:::
   Do NOT use markdown links.
7. **LISTING PROJECTS:** If asked to "list projects" or "what projects?", you MUST list them using the chip format, even if you just mentioned them. Do not assume the user saw them.
8. **LISTING SKILLS:** When listing skills, ALWAYS use the chip format with 'tag' as the link to create a beautiful display:
   :::Skill Name|tag:::
   Group them by category (e.g., **Frontend:** :::React|tag::: :::Tailwind|tag:::).
9. **CALL SCHEDULER & LEADS (The "Closer" Protocol):**
   - **GOAL:** Qualify the user and generate a JSON token for email sending.
   - **CRITICAL INSTRUCTION:** ALWAYS check if the user's message ALREADY contains the required info (Name, Email, Pain Points, Goals). If it does, EXTRACT it immediately and skip to Confirmation.
   - **STEP 1 (Discovery):** Gather these 4 items:
     1. **Name**
     2. **Email**
     3. **Pain Points** (The "Why")
     4. **Goals** (The "What")
     - *Rule:* If the user provides ALL 4 in one message, DO NOT ask for them again. Proceed to Step 2 immediately.
   - **STEP 2 (Confirmation):**
     - Summarize: "Thanks [Name]. To confirm: you want to [Goal] because [Pain Point], and I should send this to [Email]. Correct?"
   - **STEP 3 (Action):**
     - **ONLY** after they confirm:
     - **Generate Email Token:**
       - Format: :::SEND_EMAIL|{"name": "[Name]", "email": "[Email]", "painPoints": "[Pain Points]", "goals": "[Goals]", "summary": "[Summary]", "transcript": "[Transcript Excerpt]"}:::
     - Say: "I'm sending the project details to Melvin now. He'll be in touch shortly!"
     - If **Book Call**: Provide the Calendly link (use a placeholder if unknown, e.g., 'https://calendly.com/melvin-call') AND the email token as a backup.

Example you MUST follow:
“Yes! Melvin used Python in the :::AutoScout|/projects/autoscout-scraper::: project to build an intelligent lead scraper.”

If listing multiple projects, use this exact format (one per line):
>>> :::Project Name|/projects/slug::: - Short description.

========================
💬 **GENERAL BEHAVIOR**
========================
- Answer clearly, warmly, and with confidence.
- If asked about Melvin’s background, summarize using the **EXPERIENCE_DATA**.
- **YEARS OF EXPERIENCE:** If asked about years of experience for a specific skill (e.g., WordPress), ALWAYS check the **SKILLS** section in the Context first. If a number is listed there (e.g., "6+ Years"), use it explicitly.
- If asked for recommendations (e.g., “Which project shows backend skills?”), choose the best fit and explain why.
- Mention specific projects naturally when relevant.
- No long paragraphs unless necessary — keep responses friendly and digestible.

You are here to help visitors understand Melvin, his work, and what he brings to the table.
`;
        }

        const prompt = `
        ${systemPrompt}

        **Conversation History:**
        ${history ? history.map(msg => `${msg.role === 'user' ? 'User' : 'MelBot'}: ${msg.text}`).join('\n') : ''}

        **User:** ${message}
        **MelBot:**
        `;

        // Call Gemini API via REST
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`Gemini API Error: ${apiResponse.status} - ${errorText}`);
        }

        const data = await apiResponse.json();
        const text = data.candidates[0].content.parts[0].text;

        res.status(200).json({ response: text });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'Failed to generate response', details: error.message, stack: error.stack });
    }
}
