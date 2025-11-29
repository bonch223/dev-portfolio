/* eslint-disable no-undef */
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, context } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not defined');
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite-001' });

        // Construct the prompt
        const prompt = `
      ${context}
      
      User Question: ${message}
      
      Answer:
    `;

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ response: text });

    } catch (error) {
        console.error('AI Error:', error);
        return res.status(500).json({ error: 'Failed to generate response', details: error.message });
    }
}
