import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  Sprout, 
  Languages, 
  Bot, 
  User, 
  ChevronDown, 
  Check, 
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function FarmerChatbot() {
  const { profile, geminiApiKey } = useFarm();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'hi'
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! 🙏 I am **Kisan Sahayak**, your agricultural AI assistant.\n\nI am synchronized with your farm: **${profile.crop}** in **${profile.location.name}** (${profile.cropStage}). How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Update welcome message if language or crop changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      const welcomeText = language === 'hi'
        ? `राम-राम किसान भाई! 🙏 मैं आपका **किसान सहायक** हूँ।\n\nआपकी सक्रिय फसल **${profile.crop}** (${profile.location.name}) के अनुसार मैं मौसम, मंडी भाव, और रोग उपचार में आपकी मदद कर सकता हूँ। नीचे दिए गए बटन दबाएं या बोलकर पूछें!`
        : `Hello! 🙏 I am **Kisan Sahayak**, your agricultural AI assistant.\n\nI am synchronized with your farm: **${profile.crop}** in **${profile.location.name}** (${profile.cropStage}). How can I assist you today?`;
      
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [language, profile.crop, profile.location.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Quick Action Chips for 1-tap inquiries (no typing needed)
  const quickChips = language === 'hi' ? [
    { label: '🌧️ कल बारिश होगी क्या?', query: 'कल बारिश होगी क्या?' },
    { label: '🚫 क्या कल दवा छिड़क सकते हैं?', query: 'क्या कल दवा छिड़क सकते हैं?' },
    { label: '💰 सबसे ज्यादा भाव किस मंडी में है?', query: 'मेरी फसल का सबसे ज्यादा भाव किस मंडी में मिलेगा?' },
    { label: '💧 आज कितना पानी देना चाहिए?', query: 'आज कितना पानी देना चाहिए?' },
    { label: '🌿 रोग और दवा की सही मात्रा बताओ', query: 'रोग और कीटनाशक की सही मात्रा बताओ' },
  ] : [
    { label: '🌧️ Will it rain tomorrow?', query: 'Will it rain tomorrow?' },
    { label: '🚫 Can I spray pesticide tomorrow?', query: 'Can I spray pesticide tomorrow?' },
    { label: '💰 Which mandi pays the highest net return?', query: 'Which mandi pays the highest net return for my crop?' },
    { label: '💧 How much water does my crop need?', query: 'How much water does my crop need today?' },
    { label: '🌿 ICAR pesticide dosages & disease guide', query: 'What are the recommended ICAR pesticide dosages for my crop?' },
  ];

  const handleSendMessage = async (userText) => {
    const textToSend = userText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.map(m => ({ role: m.role, text: m.text })),
          farmProfile: profile,
          language: language,
          geminiApiKey: geminiApiKey || null
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.reply,
          source: data.source,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error("Chat request failed");
      }
    } catch (err) {
      console.error("Chat error", err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: language === 'hi' 
          ? "माफ़ कीजिए, उत्तर प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।"
          : "Sorry, I could not fetch a response. Please check your connection and retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Speech-to-Text (Voice Input)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech start error", err);
      setIsListening(false);
    }
  };

  // Text-to-Speech (Audio Read-Aloud for farmers)
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown bold and bullet symbols for natural voice speech
    const cleanSpeech = text
      .replace(/\*\*/g, '')
      .replace(/#/g, '')
      .replace(/- /g, ', ')
      .replace(/₹/g, 'Rupees ')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95; // Slightly slower for clarity
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-elevated hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20 group"
          title="Open Kisan AI Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-100" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-emerald-800 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-emerald-800" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black tracking-tight leading-tight">Kisan Sahayak</p>
            <p className="text-[10px] text-emerald-200">Tap to Ask AI 🌾</p>
          </div>
        </button>
      )}

      {/* Slide-over / Modal Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized
            ? 'bottom-6 right-6 w-72'
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[85vh] h-[640px]'
        } flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold tracking-tight">Kisan Sahayak</h3>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    AI Agronomist
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80 flex items-center gap-1">
                  <span>{profile.crop}</span> • <span>{profile.location.name.split(',')[0]}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"
                title="Toggle English / Hindi"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'हिंदी' : 'ENG'}</span>
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  if (isSpeaking) window.speechSynthesis.cancel();
                }}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context Pill Banner */}
              <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900 shrink-0">
                <span className="truncate">
                  🌱 <strong>Sync:</strong> {profile.crop} • {profile.cropStage.split('/')[0]} • {profile.location.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                  Live Context
                </span>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                        <span>{isUser ? 'You' : 'Kisan Sahayak'}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div className={`p-3.5 rounded-2xl max-w-[88%] text-xs leading-relaxed ${
                        isUser
                          ? 'bg-emerald-700 text-white rounded-br-none shadow-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                      }`}>
                        {/* Render simple markdown bold and breaks */}
                        <div className="space-y-1.5 whitespace-pre-line">
                          {msg.text}
                        </div>

                        {!isUser && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="italic">
                              {msg.source ? 'ICAR / Open-Meteo Grounded' : 'Agricultural Intelligence'}
                            </span>
                            <button
                              onClick={() => speakText(msg.text)}
                              className="text-emerald-700 hover:text-emerald-800 p-1 rounded-md hover:bg-emerald-50 flex items-center gap-1 font-semibold"
                              title="Listen to advice (Read aloud)"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Analyzing live weather and agronomic guidelines...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 1-Tap Quick Action Chips (Essential for farmers who avoid typing) */}
              <div className="px-3 py-2 border-t border-slate-100 bg-white overflow-x-auto shrink-0 flex items-center gap-1.5 no-scrollbar">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip.query)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-[11px] font-medium text-slate-700 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input Control Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
              >
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                  title={isListening ? "Listening... Speak now" : "Tap to Speak (Voice Input)"}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  placeholder={language === 'hi' ? "अपना सवाल पूछें या बोलें..." : "Type or speak agricultural question..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className={`p-2.5 rounded-xl text-white font-bold transition-all shrink-0 ${
                    !inputMessage.trim() || isLoading
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800 shadow-subtle'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
