import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGemini() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('Error: GEMINI_API_KEY is missing.');
        process.exit(1);
    }

    console.log('Testing Gemini API with key:', process.env.GEMINI_API_KEY.substring(0, 5) + '...');

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite-001' });

        const prompt = 'Hello, are you working?';
        console.log('Sending prompt:', prompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Success! Response:', text);
    } catch (error) {
        console.error('Gemini API Error:', error);
    }
}

testGemini();
