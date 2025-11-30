import React, { useState, useRef, useEffect } from 'react';
import { aiContext } from '../data/ai-context';
import { useNavigate } from 'react-router-dom';

const ChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage or default
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('melbot_chat_history');
      return saved ? JSON.parse(saved) : [
        { role: 'assistant', content: "Hi! I'm MelBot. Ask me anything about the developer's skills or projects." }
      ];
    }
    return [{ role: 'assistant', content: "Hi! I'm MelBot. Ask me anything about the developer's skills or projects." }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const starterQuestions = [
    "What is Melvin's skills?",
    "Show me Melvin's projects",
    "How to Contact Melvin"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Persist messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('melbot_chat_history', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, isOpen]);

  const clearHistory = () => {
    const defaultMsg = [{ role: 'assistant', content: "Hi! I'm MelBot. Ask me anything about the developer's skills or projects." }];
    setMessages(defaultMsg);
    if (typeof window !== 'undefined') {
      localStorage.setItem('melbot_chat_history', JSON.stringify(defaultMsg));
    }
  };

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

  const handleSubmit = async (e, overrideInput = null) => {
    if (e) e.preventDefault();
    const messageToSend = overrideInput || input;

    if (!messageToSend.trim() || isLoading) return;

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
          context: aiContext
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render message content with carousel support
  const renderMessageContent = (content) => {
    const lines = content.split('\n');
    const renderedContent = [];
    let projectBuffer = [];

    lines.forEach((line, index) => {
      // Check for Project Line Marker (>>>)
      if (line.trim().startsWith('>>>')) {
        const match = line.match(/>>> :::([^|]+)\|([^:]+)::: - (.+)/);
        if (match) {
          projectBuffer.push({ title: match[1], link: match[2], desc: match[3] });
        }
      } else {
        // If we have buffered projects, render them as a carousel first
        if (projectBuffer.length > 0) {
          renderedContent.push(
            <div key={`carousel-${index}`} className="flex gap-3 overflow-x-auto pb-2 mb-2 scrollbar-hide -mx-2 px-2">
              {projectBuffer.map((proj, i) => (
                <div
                  key={i}
                  onClick={() => navigate(proj.link)}
                  className="flex-shrink-0 w-64 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{proj.title}</h4>
                    <svg className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-2">{proj.desc}</p>
                </div>
              ))}
            </div>
          );
          projectBuffer = [];
        }

        // Render normal text (handling inline chips if any remain)
        if (line.trim()) {
          renderedContent.push(
            <div key={`text-${index}`} className="mb-1">
              {line.split(/(:::[^|]+\|[^:]+:::)/g).map((part, i) => {
                const match = part.match(/:::([^|]+)\|([^:]+):::/);
                if (match) {
                  const [_, title, link] = match;
                  return (
                    <button
                      key={i}
                      onClick={() => navigate(link)}
                      className="inline-flex items-center px-2 py-0.5 mx-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold rounded-md hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
                    >
                      {title}
                    </button>
                  );
                }
                return part;
              })}
            </div>
          );
        }
      }
    });

    // Flush remaining buffer
    if (projectBuffer.length > 0) {
      renderedContent.push(
        <div key="carousel-end" className="flex gap-3 overflow-x-auto pb-2 mt-2 scrollbar-hide -mx-2 px-2">
          {projectBuffer.map((proj, i) => (
            <div
              key={i}
              onClick={() => navigate(proj.link)}
              className="flex-shrink-0 w-64 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{proj.title}</h4>
                <svg className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-2">{proj.desc}</p>
            </div>
          ))}
        </div>
      );
    }

    return renderedContent;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[360px] h-[550px] flex flex-col overflow-hidden animate-fade-in-up rounded-2xl border border-gray-200 dark:border-white/20 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-black/40 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">

          {/* Header */}
          <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-[2px] shadow-lg">
                <div className="w-full h-full rounded-full bg-white dark:bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">🤖</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-wide">MelBot</h3>
                <div className="flex items-center text-[10px] text-cyan-600 dark:text-cyan-300 uppercase tracking-wider font-semibold">
                  <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-1.5 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                  Online
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={clearHistory}
                className="p-2 text-gray-500 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all duration-200"
                title="Clear Conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="p-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all duration-200"
                title="Open Full Page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-sm ${msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-white/10 rounded-bl-sm'
                    }`}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-2xl rounded-bl-sm border border-gray-200 dark:border-white/10 flex space-x-1.5 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-50/80 dark:bg-black/20 backdrop-blur-md border-t border-gray-200 dark:border-white/10">
            {/* Chips */}
            {messages.length < 3 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                {starterQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(null, q)}
                    className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-xs text-cyan-700 dark:text-cyan-100 border border-gray-200 dark:border-white/10 transition-all duration-200 hover:scale-105 hover:border-cyan-500/30 shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask MelBot..."
                  className="w-full bg-white dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-full pl-4 pr-20 py-3 text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-white/30 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
                />

                <div className="absolute right-1.5 flex items-center space-x-1">
                  {/* Voice Button */}
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-full transition-all duration-200 ${isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    title={isListening ? "Listening..." : "Use Voice"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-500 z-50 ${isOpen
          ? 'bg-gray-800 text-white rotate-90'
          : 'bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white hover:scale-110 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
          }`}
      >
        {/* Pulse Effect */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-ping"></span>
        )}

        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <span className="text-3xl filter drop-shadow-md">🤖</span>
            {/* Notification Dot */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
          </div>
        )}

        {/* Tooltip */}
        {!isOpen && (
          <span className="absolute right-20 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl pointer-events-none translate-x-4 group-hover:translate-x-0">
            Chat with MelBot
            {/* Arrow */}
            <span className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white/90 transform -translate-y-1/2 rotate-45"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;