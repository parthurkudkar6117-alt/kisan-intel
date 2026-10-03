import React, { useState } from 'react';
import { Send, Bot, ShieldCheck, RefreshCw, Leaf } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function PlannerChatbot({ crop, cropStage, location }) {
  const { profile } = useFarm();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello! I am your Advanced AI Farm Advisor. I use live authenticated data from government advisories (IMD/ICAR) for ${location?.name || 'your area'}. What would you like to know today?`,
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeCrop = crop || profile.crop;
  const activeStage = cropStage || profile.cropStage;
  const activeLocation = location || profile.location;

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const activeKey = localStorage.getItem('kisan_gemini_api_key') || localStorage.getItem('gemini_api_key') || '';
      const res = await fetch('/api/planner/ai-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': activeKey
        },
        body: JSON.stringify({
          message: input,
          crop: activeCrop,
          cropStage: activeStage,
          location: activeLocation,
          geminiApiKey: activeKey
        })
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.reply,
        sender: 'bot',
        advisorySource: data.advisorySource,
        isLiveWebScraped: data.isLiveWebScraped
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "I couldn't reach the advisory server right now. Please check your connection or API key.",
        sender: 'bot',
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const presetQuestions = [
    "What is today's IMD advisory for my district?",
    "When should I irrigate based on weather?",
    "ICAR pest warning for current stage"
  ];

  return (
    <div className="card-clean shadow-card overflow-hidden flex flex-col h-[500px] border-slate-200 mt-6 dark:bg-slate-900 dark:border-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Advanced AI Farm Advisory</h3>
            <p className="text-xs text-emerald-200 flex items-center gap-1 opacity-90">
              <ShieldCheck className="w-3 h-3" /> Live IMD/ICAR Data
            </p>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-medium">
          {activeLocation?.name || "Local"}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.sender === 'user' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 rounded-tr-sm' 
                : msg.isError 
                  ? 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 rounded-tl-sm'
                  : 'bg-white text-slate-800 shadow-sm border border-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 rounded-tl-sm'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
              
              {/* Trust Badge for Bot Responses */}
              {msg.sender === 'bot' && !msg.isError && msg.advisorySource && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded text-[10px] font-medium border border-emerald-100 dark:border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    {msg.advisorySource}
                  </span>
                  {msg.isLiveWebScraped && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 rounded text-[10px] font-medium border border-sky-100 dark:border-sky-500/20">
                      <RefreshCw className="w-3 h-3" />
                      Live Sync
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700 rounded-2xl p-4 rounded-tl-sm shadow-sm flex gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Preset Chips */}
      {messages.length === 1 && (
        <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
          {presetQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => { setInput(q); }}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${activeCrop} in ${activeLocation?.name?.split(',')[0]}...`}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-full pl-5 pr-12 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
