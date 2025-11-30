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
- Frontend: React, Tailwind CSS, Framer Motion, Next.js, WordPress
- Backend: Node.js, Express, Python, Vercel Serverless, WooCommerce
- AI/ML: OpenAI API, Gemini API, LangChain, RAG Systems
- Tools: Git, Docker, AWS, Firebase

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
        links: { caseStudy: "/projects/workflow-automation-challenger" }
    },
    {
        title: "Guro.AI",
        technologies: ["React", "Node.js", "AI Integration", "OpenAI API"],
        summary: "AI lesson plan generator for teachers.",
        links: { caseStudy: "/projects/guro-ai" }
    },
    {
        title: "SkillFoundri",
        technologies: ["WordPress", "PHP", "MySQL"],
        summary: "Project-based learning platform with mentorship.",
        links: { caseStudy: "/projects/skillfoundri" }
    },
    {
        title: "Rage Fitness Gym",
        technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
        summary: "Gym management system with POS and scheduling.",
        links: { caseStudy: "/projects/rage-fitness-gym" }
    },
    {
        title: "UrbanCare Services",
        technologies: ["React", "Node.js", "MongoDB"],
        summary: "Marketplace for home service professionals.",
        links: { caseStudy: "/projects/urbancare-services" }
    },
    {
        title: "Fantastic Baby Shakalaka",
        technologies: ["Shopify", "Liquid", "JavaScript"],
        summary: "Fashion e-commerce with lookbooks.",
        links: { caseStudy: "/projects/fantastic-baby-shakalaka" }
    },
    {
        title: "FitSync",
        technologies: ["Next.js", "Express.js", "TypeScript"],
        summary: "Fitness coaching platform (In Development).",
        links: { caseStudy: "/projects/fitsync" }
    },
    {
        title: "WhosIn",
        technologies: ["React", "TypeScript", "Face Recognition"],
        summary: "Smart attendance system using face recognition.",
        links: { caseStudy: "/projects/whosin" }
    },
    {
        title: "Armet Limited",
        technologies: ["Python", "AWS SES", "Redis"],
        summary: "High-volume email infrastructure CLI.",
        links: { caseStudy: "/projects/armet-limited" }
    },
    {
        title: "AutoScout",
        technologies: ["Python", "Playwright", "OpenAI API"],
        summary: "Intelligent lead scraper bot.",
        links: { caseStudy: "/projects/autoscout" }
    },
    {
        title: "DocuMind",
        technologies: ["Python", "LangChain", "RAG", "ChromaDB"],
        summary: "Local RAG system for secure document chatting.",
        links: { caseStudy: "/projects/documind" }
    },
    {
        title: "VoiceOps",
        technologies: ["Python", "Twilio", "Deepgram", "ElevenLabs"],
        summary: "Low-latency AI voice customer support agent.",
        links: { caseStudy: "/projects/voiceops" }
    },
    {
        title: "Decor Meadow",
        technologies: ["WordPress", "WooCommerce"],
        summary: "Home decor e-commerce store.",
        links: { caseStudy: "/projects/decor-meadow" }
    },
    {
        title: "Femme Fits",
        technologies: ["WordPress", "WooCommerce"],
        summary: "Women's fashion e-commerce.",
        links: { caseStudy: "/projects/femme-fits" }
    },
    {
        title: "Gents Den",
        technologies: ["WordPress", "WooCommerce"],
        summary: "Men's grooming e-commerce.",
        links: { caseStudy: "/projects/gents-den" }
    },
    {
        title: "Plush Pendants",
        technologies: ["WordPress", "WooCommerce"],
        summary: "Jewelry e-commerce with gifting flows.",
        links: { caseStudy: "/projects/plush-pendants" }
    },
    {
        title: "Starlet Style",
        technologies: ["WordPress", "WooCommerce"],
        summary: "Kids toys and fashion e-commerce.",
        links: { caseStudy: "/projects/starlet-style" }
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
4. Never say you lack details — you DO have them in the datasets.

Example you MUST follow:
“Yes! Melvin used Python in the :::AutoScout|/projects/autoscout::: project to build an intelligent lead scraper.”

If listing multiple projects, use this exact format (one per line):
>>> :::Project Name|/link::: - Short description.
>>> :::Another Project|/link::: - Short description.

========================
💬 **GENERAL BEHAVIOR**
========================
- Answer clearly, warmly, and with confidence.
- If asked about Melvin’s background, summarize using the **EXPERIENCE_DATA**.
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
