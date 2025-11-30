import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EnglishPracticePage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm MelBot, your English & Tech Tutor. I'm here to help you practice your conversation skills while we talk about tech, life, or whatever is on your mind. I'll also give you feedback on your grammar and vocabulary. What shall we talk about today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };
            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const handleVoiceInput = () => {
        if (recognitionRef.current) {
            if (isListening) {
                recognitionRef.current.stop();
            } else {
                try {
                    recognitionRef.current.start();
                } catch (error) {
                    console.error("Error starting speech recognition:", error);
                }
            }
        } else {
            alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const messageToSend = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
        setIsLoading(true);

        try {
            const response = await fetch('https://mjre-portfolio.vercel.app/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageToSend,
                    mode: 'tutor', // Enable Tutor Mode
                    history: messages.map(m => ({ role: m.role, text: m.content }))
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Let's try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans text-gray-800 dark:text-gray-100">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                                <span className="text-xl">🎓</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">English Practice with MelBot</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Grammar Critic • Tech Tutor • Conversationalist</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        ← Back to Portfolio
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 overflow-y-auto">
                <div className="space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-5 rounded-2xl text-base leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                                }`}>
                                {/* Render Markdown-like content (simple implementation) */}
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-700 flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sticky bottom-0">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full bg-gray-100 dark:bg-gray-900 border-0 rounded-full pl-6 pr-24 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                        />

                        <div className="absolute right-2 flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={handleVoiceInput}
                                className={`p-3 rounded-full transition-all ${isListening
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                title="Voice Input"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </button>

                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-xs text-gray-400 mt-2">
                        MelBot is learning from our conversation to help you better.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default EnglishPracticePage;
