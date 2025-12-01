import React, { useState, useRef, useEffect } from 'react';
import { aiContext } from '../data/ai-context';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

// Scheduler Component
const Scheduler = ({ onConfirm, onCancel }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  const validateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const d = new Date(`${dateStr}T${timeStr}`);
    const day = d.getDay(); // 0=Sun, 6=Sat
    const hour = parseInt(timeStr.split(':')[0], 10);
    const minute = parseInt(timeStr.split(':')[1], 10);
    const totalMinutes = hour * 60 + minute;

    // Available Ranges (in minutes)
    // 4am-6am: 240-360
    // 9am-3pm: 540-900
    // 8pm-12mn: 1200-1440
    const ranges = [
      { start: 240, end: 360 },
      { start: 540, end: 900 },
      { start: 1200, end: 1440 }
    ];

    // Filter ranges based on day rules
    let validRanges = [...ranges];
    if (day === 5) validRanges = validRanges.filter(r => r.start < 1200); // Fri: No evening
    if (day === 6) {
      validRanges = [
        { start: 720, end: 900 }, // 12pm-3pm (Assuming "Busy on Sat morning" means until 12pm)
        { start: 1200, end: 1440 } // 8pm-12mn
      ];
    }
    if (day === 0) validRanges = [{ start: 1200, end: 1440 }]; // Sun: Only evening

    const isAvailable = validRanges.some(r => totalMinutes >= r.start && totalMinutes < r.end);

    if (isAvailable) return null;

    // Find nearest slot
    let nearestDiff = Infinity;
    let suggestion = "";

    validRanges.forEach(r => {
      // Check start of range
      const diffStart = Math.abs(totalMinutes - r.start);
      if (diffStart < nearestDiff) {
        nearestDiff = diffStart;
        const h = Math.floor(r.start / 60);
        const m = r.start % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
        suggestion = `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
      }
    });

    return `I have a prior appointment at that time. How about ${suggestion}?`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateTime(date, time);
    if (err) { setError(err); return; }
    onConfirm({ date, time });
  };

  return (
    <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shadow-lg my-2">
      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Schedule a Call</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date</label>
          <input type="date" required value={date} onChange={(e) => { setDate(e.target.value); setError(''); }} className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Time</label>
          <input type="time" required value={time} onChange={(e) => { setTime(e.target.value); setError(''); }} className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:shadow-md transition-all">Confirm</button>
        </div>
      </form>
    </div>
  );
};

// EmailStatus Component
const EmailStatus = ({ data, sendEmail }) => {
  const [status, setStatus] = useState('sending');
  const hasSent = useRef(false);

  useEffect(() => {
    let mounted = true;
    const send = async () => {
      if (hasSent.current) return;
      hasSent.current = true;
      const success = await sendEmail(data);
      if (mounted) setStatus(success ? 'success' : 'error');
    };
    send();
    return () => { mounted = false; };
  }, [data, sendEmail]);

  if (status === 'sending') return <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-100 dark:border-cyan-800 flex items-center gap-2 my-2"><div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div><span className="text-sm text-cyan-700 dark:text-cyan-300">Sending details to Melvin...</span></div>;
  if (status === 'success') return <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800 flex items-center gap-2 my-2"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-sm text-green-700 dark:text-green-300">Sent! Melvin will be in touch.</span></div>;
  return <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-2 my-2"><svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg><span className="text-sm text-red-700 dark:text-red-300">Failed to send. Please try again.</span></div>;
};

// Typing Effect Component
const TypingMessage = ({ content, onComplete, renderContent }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => { setDisplayedContent(prev => prev + content[currentIndex]); setCurrentIndex(prev => prev + 1); }, 15);
      return () => clearTimeout(timeout);
    } else { if (onComplete) onComplete(); }
  }, [currentIndex, content, onComplete]);
  return renderContent(displayedContent);
};

const ChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const EMAILJS_SERVICE_ID = 'service_2wtte0j';
  const EMAILJS_TEMPLATE_ID = 'template_5arjl6k';
  const EMAILJS_PUBLIC_KEY = 'tBuSbZ57Q0Hn6k-dJ';

  useEffect(() => { emailjs.init(EMAILJS_PUBLIC_KEY); }, []);

  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('melbot_chat_history');
      const savedTime = localStorage.getItem('melbot_chat_timestamp');
      if (saved && savedTime) {
        const now = new Date().getTime();
        if (now - parseInt(savedTime) < 48 * 60 * 60 * 1000) return JSON.parse(saved);
      }
    }
    return [{ role: 'assistant', content: "Hi! I'm MelBot. Ask me anything about the developer's skills or projects.", animate: false }];
  });

  const sendEmail = async (data) => {
    try {
      const transcriptText = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
      const templateParams = {
        to_name: 'Melvin',
        from_name: data.name || 'User',
        from_email: data.email || 'No Email Provided',
        message: `Type: ${data.type || 'Inquiry'}\n${data.date ? `Requested Date: ${data.date}` : ''}\n${data.time ? `Requested Time: ${data.time}` : ''}\n\nPain Points: ${data.painPoints || 'N/A'}\nGoals: ${data.goals || 'N/A'}\nSummary: ${data.summary || 'N/A'}\n\n--- FULL TRANSCRIPT ---\n${transcriptText}`,
        reply_to: data.email || '',
      };
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      return true;
    } catch (error) { console.error('EmailJS Error:', error); return false; }
  };

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const starterQuestions = ["What is Melvin's skills?", "Show me Melvin's projects", "How to Contact Melvin"];
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const messagesToSave = messages.map(({ animate, ...msg }) => msg);
      localStorage.setItem('melbot_chat_history', JSON.stringify(messagesToSave));
      localStorage.setItem('melbot_chat_timestamp', new Date().getTime().toString());
    }
    scrollToBottom();
  }, [messages, isOpen]);

  const clearHistory = () => {
    const defaultMsg = [{ role: 'assistant', content: "Hi! I'm MelBot. Ask me anything about the developer's skills or projects.", animate: true }];
    setMessages(defaultMsg);
    if (typeof window !== 'undefined') {
      const messagesToSave = defaultMsg.map(({ animate, ...msg }) => msg);
      localStorage.setItem('melbot_chat_history', JSON.stringify(messagesToSave));
      localStorage.setItem('melbot_chat_timestamp', new Date().getTime().toString());
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => setInput(event.results[0][0].transcript);
      recognition.onerror = (event) => { console.error("Speech recognition error", event.error); setIsListening(false); };
      recognitionRef.current = recognition;
    }
  }, []);

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) recognitionRef.current.stop();
      else try { recognitionRef.current.start(); } catch (error) { console.error("Error starting speech recognition:", error); }
    } else alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
  };

  const handleSubmit = async (e, overrideInput = null) => {
    if (e) e.preventDefault();
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMsg = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const contextHistory = messages.slice(-10).map(m => ({ role: m.role, text: m.content }));
      const apiUrl = 'https://mjre-portfolio.vercel.app/api/chat';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend, history: contextHistory, context: aiContext }),
      });
      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      // Disable animation if the message contains special tokens (Scheduler, Email, etc.)
      const shouldAnimate = !data.response.includes(':::');
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, animate: shouldAnimate }]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later.", animate: true }]);
    } finally { setIsLoading(false); }
  };

  const handleAnimationComplete = (index) => { setMessages(prev => prev.map((msg, i) => i === index ? { ...msg, animate: false } : msg)); };

  const handleScheduleConfirm = async (scheduleData) => {
    const emailData = { type: 'Call Schedule Request', name: 'User (via Chat)', email: 'Not provided', date: scheduleData.date, time: scheduleData.time, summary: 'User requested a call via Melbot.' };
    const success = await sendEmail(emailData);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: success
        ? `Great! I've sent a request to schedule a call for ${scheduleData.date} at ${scheduleData.time}. Melvin will review it and confirm with you shortly.\n\nIs there anything else you'd like to know about his work in the meantime?`
        : "I'm sorry, I couldn't send the schedule request right now. Please try again later or contact Melvin directly.",
      animate: false
    }]);
  };

  const handleLinkClick = (link) => { if (link.startsWith('http')) window.open(link, '_blank', 'noopener,noreferrer'); else navigate(link); };

  const renderMessageContent = (content) => {
    if (content.includes(':::SHOW_SCHEDULER:::')) {
      const parts = content.split(':::SHOW_SCHEDULER:::');
      return <>{parts[0] && renderMessageContent(parts[0])}<Scheduler onConfirm={handleScheduleConfirm} onCancel={() => setMessages(prev => [...prev, { role: 'assistant', content: "No problem! Let me know if you change your mind.", animate: true }])} />{parts[1] && renderMessageContent(parts[1])}</>;
    }
    const lines = content.split('\n');
    const renderedContent = [];
    let projectBuffer = [];
    lines.forEach((line, index) => {
      if (line.includes(':::SEND_EMAIL|')) {
        const match = line.match(/:::SEND_EMAIL\|(.+?):::/);
        if (match) {
          try {
            const emailData = JSON.parse(match[1]);
            renderedContent.push(<EmailStatus key={`email-${index}`} data={emailData} sendEmail={sendEmail} />);
          } catch (e) { console.error("Failed to parse email token", e); }
        }
      }
      if (line.trim().startsWith('>>>')) {
        const match = line.match(/>>> :::([^|]+)\|(.+?)::: - (.+)/);
        if (match) projectBuffer.push({ title: match[1], link: match[2], desc: match[3] });
      } else {
        if (projectBuffer.length > 0) {
          renderedContent.push(<div key={`carousel-${index}`} className="flex gap-3 overflow-x-auto pb-2 mb-2 scrollbar-hide -mx-2 px-2">{projectBuffer.map((proj, i) => (<div key={i} onClick={() => handleLinkClick(proj.link)} className="flex-shrink-0 w-64 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"><div className="flex items-center justify-between mb-1"><h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{proj.title}</h4><svg className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div><p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-2">{proj.desc}</p></div>))}</div>);
          projectBuffer = [];
        }
        if (line.trim()) {
          const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
          const cleanLine = isBullet ? line.trim().substring(2) : line;
          const textWithoutToken = cleanLine.replace(/:::SEND_EMAIL\|.+?:::/g, '');
          if (textWithoutToken.trim()) {
            renderedContent.push(<div key={`text-${index}`} className={`mb-1 ${isBullet ? 'pl-4 relative' : ''}`}>{isBullet && (<span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>)}{textWithoutToken.split(/(:::[^|]+\|.+?:::)/g).map((part, i) => {
              const match = part.match(/:::([^|]+)\|(.+?):::/);
              if (match) {
                const [_, title, link] = match;
                if (link === 'tag') return <span key={i} className="inline-flex items-center px-2.5 py-0.5 mx-1 my-0.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-full border border-gray-200 dark:border-white/10">{title}</span>;
                return <button key={i} onClick={() => handleLinkClick(link)} className="inline-flex items-center px-2 py-0.5 mx-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold rounded-md hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors">{title}</button>;
              }
              return part.split(/(\*\*.*?\*\*)/g).map((subPart, j) => { if (subPart.startsWith('**') && subPart.endsWith('**')) return <strong key={`${i}-${j}`} className="font-bold text-gray-900 dark:text-white">{subPart.slice(2, -2)}</strong>; return subPart; });
            })}</div>);
          }
        }
      }
    });
    if (projectBuffer.length > 0) {
      renderedContent.push(<div key="carousel-end" className="flex gap-3 overflow-x-auto pb-2 mt-2 scrollbar-hide -mx-2 px-2">{projectBuffer.map((proj, i) => (<div key={i} onClick={() => handleLinkClick(proj.link)} className="flex-shrink-0 w-64 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"><div className="flex items-center justify-between mb-1"><h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{proj.title}</h4><svg className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div><p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-2">{proj.desc}</p></div>))}</div>);
    }
    return renderedContent;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="fixed inset-0 z-[60] w-full h-full sm:static sm:z-auto sm:w-[360px] sm:h-[550px] sm:mb-4 flex flex-col overflow-hidden animate-fade-in-up sm:rounded-2xl border-0 sm:border border-gray-200 dark:border-white/20 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-black/90 sm:bg-white/90 sm:dark:bg-black/40 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-[2px] shadow-lg"><div className="w-full h-full rounded-full bg-white dark:bg-black/50 flex items-center justify-center backdrop-blur-sm"><span className="text-xl">🤖</span></div></div>
              <div className="ml-3"><h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-wide">MelBot</h3><div className="flex items-center text-[10px] text-cyan-600 dark:text-cyan-300 uppercase tracking-wider font-semibold"><span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-1.5 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>Online</div></div>
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={clearHistory} className="p-2 text-gray-500 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all duration-200" title="Clear Conversation"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              <button onClick={() => { setIsOpen(false); navigate('/chat'); }} className="p-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all duration-200" title="Open Full Page"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg></button>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all duration-200"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-md backdrop-blur-sm ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-sm shadow-cyan-500/20' : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-white/10 rounded-bl-sm shadow-gray-200/50 dark:shadow-none'}`}>
                  {msg.role === 'assistant' && msg.animate ? <TypingMessage content={msg.content} onComplete={() => handleAnimationComplete(idx)} renderContent={renderMessageContent} /> : renderMessageContent(msg.content)}
                </div>
              </div>
            ))}
            {isLoading && (<div className="flex justify-start"><div className="bg-gray-100 dark:bg-white/5 p-3 rounded-2xl rounded-bl-sm border border-gray-200 dark:border-white/10 flex space-x-1.5 backdrop-blur-sm shadow-sm"><div className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce delay-100"></div><div className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce delay-200"></div></div></div>)}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 bg-gray-50/80 dark:bg-black/20 backdrop-blur-md border-t border-gray-200 dark:border-white/10">
            {messages.length < 3 && (<div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">{starterQuestions.map((q, i) => (<button key={i} onClick={() => handleSubmit(null, q)} className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-xs text-cyan-700 dark:text-cyan-100 border border-gray-200 dark:border-white/10 transition-all duration-200 hover:scale-105 hover:border-cyan-500/30 shadow-sm">{q}</button>))}</div>)}
            <form onSubmit={handleSubmit}>
              <div className="relative flex items-center">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask MelBot..." className="w-full bg-white dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-full pl-4 pr-20 py-3 text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-white/30 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner" />
                <div className="absolute right-1.5 flex items-center space-x-1">
                  <button type="button" onClick={handleVoiceInput} className={`p-2 rounded-full transition-all duration-200 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'}`} title={isListening ? "Listening..." : "Use Voice"}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
                  <button type="submit" disabled={!input.trim() || isLoading} className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-500 z-50 ${isOpen ? 'bg-gray-800 text-white rotate-90' : 'bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white hover:scale-110 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'}`}>
        {!isOpen && (<span className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-ping"></span>)}
        {isOpen ? (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>) : (<div className="relative"><span className="text-3xl filter drop-shadow-md">🤖</span><span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span></div>)}
        {!isOpen && (<span className="absolute right-20 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl pointer-events-none translate-x-4 group-hover:translate-x-0">Chat with MelBot<span className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white/90 transform -translate-y-1/2 rotate-45"></span></span>)}
      </button>
    </div>
  );
};
export default ChatWidget;