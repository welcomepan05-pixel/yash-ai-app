import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { 
  Send, 
  Sparkles, 
  Copy, 
  RotateCcw, 
  User, 
  Image as ImageIcon, 
  Mic, 
  MicOff, 
  Volume2, 
  X, 
  MessageSquare, 
  Plus, 
  Maximize2, 
  Minimize2, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  Share2,
  Globe
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ai, CHAT_MODEL } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';

const MessageItem = memo(({ 
  message, 
  onSpeak, 
  onCopy, 
  onRegenerate, 
  onToggleBookmark, 
  onShare, 
  onTogglePublic,
  onOpenInCodeLab,
  isPublic
}: { 
  message: any; 
  onSpeak: (text: string) => void;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
  onToggleBookmark: () => void;
  onShare: () => void;
  onTogglePublic: () => void;
  onOpenInCodeLab: (code: string, lang: string) => void;
  isPublic: boolean;
}) => {
  return (
    <div className={cn(
      "flex gap-3 max-w-2xl mx-auto group",
      message.role === 'user' ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border",
        message.role === 'user' ? "bg-white text-black border-white" : "bg-purple-500/20 text-purple-400 border-purple-500/20"
      )}>
        {message.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
      </div>
      
      <div className={cn(
        "flex flex-col gap-1.5 max-w-[85%]",
        message.role === 'user' ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-3 py-2 rounded-2xl text-sm leading-relaxed",
          message.role === 'user' 
            ? "bg-white/10 text-white rounded-tr-none" 
            : "bg-transparent text-gray-200"
        )}>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const code = String(children).replace(/\n$/, '');
                  const lang = match ? match[1] : '';
                  
                  if (!inline && (lang === 'html' || lang === 'css' || lang === 'js' || lang === 'javascript')) {
                    return (
                      <div className="relative group/code my-4">
                        <pre className={cn(className, "rounded-xl !bg-black/40 !p-4 border border-white/5")} {...props}>
                          {children}
                        </pre>
                        <button
                          onClick={() => onOpenInCodeLab(code, lang)}
                          className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-blue-500 text-white rounded-lg text-[10px] font-bold opacity-0 group-hover/code:opacity-100 transition-all hover:bg-blue-600 shadow-lg"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Run in Code Lab
                        </button>
                      </div>
                    );
                  }
                  return <code className={className} {...props}>{children}</code>;
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        
        {message.role === 'model' && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onSpeak(message.content)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
              title="Speak message"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onCopy(message.content)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
              title="Copy to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={onRegenerate}
              className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
              title="Regenerate response"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={onToggleBookmark}
              className={cn(
                "p-1.5 hover:bg-white/5 rounded-lg transition-all",
                message.bookmarked ? "text-yellow-400" : "text-gray-500 hover:text-white"
              )}
              title={message.bookmarked ? "Remove bookmark" : "Bookmark response"}
            >
              {message.bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
            <button 
              onClick={onShare}
              className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
              title="Share to Marketplace"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={onTogglePublic}
              className={cn(
                "p-1.5 hover:bg-white/5 rounded-lg transition-all",
                isPublic ? "text-blue-400" : "text-gray-500 hover:text-white"
              )}
              title="Toggle Public Link"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default function ChatArea() {
  const { 
    currentChatId, 
    messages, 
    sendMessage, 
    createNewChat, 
    userProfile, 
    activeChatIds, 
    chats,
    setCurrentChatId,
    closeChatTab,
    memories,
    setView,
    setCurrentCode,
    isFocusMode,
    setFocusMode,
    toggleBookmarkMessage,
    togglePublicChat,
    shareToMarketplace,
    startNewChat
  } = useAppStore();
  const [input, setInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [activePersona, setActivePersona] = useState('default');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareDesc, setShareDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser;

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.displayName?.split(' ')[0] || 'there';
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, streamingMessage]);

  const personas: Record<string, string> = {
    default: "You are Lumina, a smart and friendly human-like AI assistant.",
    teacher: "You are Professor Lumina, a patient and encouraging teacher. Explain topics simply and use analogies.",
    coder: "You are Lumina Dev, a senior software engineer. Focus on clean code, best practices, and technical precision.",
    friend: "You are Lumina, a supportive and casual friend. Use emojis and speak in a very relaxed, informal tone."
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    let chatId = currentChatId;
    if (!chatId) {
      chatId = await createNewChat();
    }

    const userMessage = input;
    const imageBase64 = selectedImage;
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);
    setStreamingMessage('');

    try {
      await sendMessage(chatId, userMessage, imageBase64 || undefined);

      const memoryContext = memories.length > 0 && userProfile?.memoriesEnabled
        ? `\nUser Memories:\n${memories.map(m => `- ${m.content}`).join('\n')}`
        : '';

      const systemInstruction = userProfile?.customSystemPrompt || `${personas[activePersona]}
        The user's name is ${userProfile?.displayName || 'User'}.${memoryContext}
        - Respond in short, clear lines or bullet points.
        - Do NOT use paragraphs or long sentences.
        - Keep answers between 5 to 6 lines total.
        - Use casual but professional language.
        - Be direct and only give useful info.`;

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const userParts: any[] = [{ text: userMessage }];
      if (imageBase64) {
        userParts.push({
          inlineData: {
            mimeType: "image/png",
            data: imageBase64.split(',')[1]
          }
        });
      }

      const result = await ai.models.generateContentStream({
        model: CHAT_MODEL,
        contents: [...history, { role: 'user', parts: userParts }],
        config: {
          systemInstruction: systemInstruction
        }
      });
      
      let fullResponse = '';
      for await (const chunk of result) {
        fullResponse += chunk.text;
        setStreamingMessage(fullResponse);
      }

      const { db } = await import('../lib/firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const messagesRef = collection(db, 'users', user!.uid, 'chats', chatId, 'messages');
      
      await addDoc(messagesRef, {
        chatId,
        role: 'model',
        content: fullResponse,
        createdAt: serverTimestamp(),
      });

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
      setStreamingMessage('');
    }
  }, [input, isTyping, currentChatId, createNewChat, sendMessage, memories, userProfile, activePersona, messages, user]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const handleRegenerate = useCallback(async (messageIndex: number) => {
    if (isTyping) return;
    const lastUserMessage = messages.slice(0, messageIndex).reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
    }
  }, [isTyping, messages]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (!isRecording) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + ' ' + transcript);
          setIsRecording(false);
        };
        recognition.start();
        setIsRecording(true);
      }
    } else {
      setIsRecording(false);
    }
  }, [isRecording]);

  const speak = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleOpenInCodeLab = useCallback((code: string, language: string) => {
    if (language === 'html') setCurrentCode({ html: code });
    else if (language === 'css') setCurrentCode({ css: code });
    else if (language === 'javascript' || language === 'js') setCurrentCode({ js: code });
    else setCurrentCode({ html: code });
    
    setView('code-preview');
  }, [setCurrentCode, setView]);

  const handleShareToMarketplace = useCallback(async () => {
    if (!shareTitle.trim() || !shareDesc.trim()) return;
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'model');
    if (!lastAssistantMessage) return;

    await shareToMarketplace(shareTitle, shareDesc, lastAssistantMessage.content, 'Chat');
    setShowShareModal(false);
    setShareTitle('');
    setShareDesc('');
  }, [shareTitle, shareDesc, messages, shareToMarketplace]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white relative">
      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Share to Marketplace</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-white/5 rounded-xl">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Title</label>
                  <input 
                    type="text" 
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder="e.g. Creative Writing Assistant"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Description</label>
                  <textarea 
                    value={shareDesc}
                    onChange={(e) => setShareDesc(e.target.value)}
                    placeholder="Describe what this prompt does..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-purple-500/50 h-24 resize-none"
                  />
                </div>
              </div>
              <button 
                onClick={handleShareToMarketplace}
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 rounded-xl text-sm font-bold transition-all"
              >
                Publish to Marketplace
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Header & Tabs */}
      <header className="border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-200">Lumina AI</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-gray-500 font-mono uppercase tracking-wider">Pro</span>
          </div>
          <button 
            onClick={() => setFocusMode(!isFocusMode)}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
            title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
        
        {activeChatIds.length > 0 && (
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
              {activeChatIds.map(id => {
                const chat = chats.find(c => c.id === id);
                return (
                  <div 
                    key={id}
                    onClick={() => setCurrentChatId(id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap border",
                      currentChatId === id 
                        ? "bg-white/10 text-white border-white/10" 
                        : "text-gray-500 hover:bg-white/5 border-transparent"
                    )}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span className="max-w-[100px] truncate">{chat?.title || 'New Chat'}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); closeChatTab(id); }}
                      className="p-0.5 hover:bg-white/10 rounded-md transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              <button 
                onClick={() => startNewChat()}
                className="p-1.5 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              {(['default', 'teacher', 'coder', 'friend'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setActivePersona(p)}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    activePersona === p ? "bg-white text-black" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar"
      >
        {messages.length === 0 && !isTyping && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">
                {getGreeting()}! How can I help?
              </h2>
              <p className="text-xs text-gray-500">I remember you're {userProfile?.age} years old.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {['Write a poem', 'Explain quantum physics', 'Code a React component', 'Plan a trip'].map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="p-3 text-xs text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageItem 
            key={message.id}
            message={message}
            onSpeak={speak}
            onCopy={copyToClipboard}
            onRegenerate={() => handleRegenerate(messages.indexOf(message))}
            onToggleBookmark={() => toggleBookmarkMessage(message.chatId, message.id)}
            onShare={() => setShowShareModal(true)}
            onTogglePublic={() => togglePublicChat(message.chatId)}
            onOpenInCodeLab={handleOpenInCodeLab}
            isPublic={chats.find(c => c.id === message.chatId)?.isPublic || false}
          />
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-2xl mx-auto">
            <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex flex-col gap-1.5 max-w-[85%]">
              <div className="px-3 py-2 rounded-2xl text-sm leading-relaxed bg-transparent text-gray-200">
                <div className="prose prose-invert max-w-none">
                  {streamingMessage ? (
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const code = String(children).replace(/\n$/, '');
                          const lang = match ? match[1] : '';
                          
                          if (!inline && (lang === 'html' || lang === 'css' || lang === 'js' || lang === 'javascript')) {
                            return (
                              <div className="relative group/code my-4">
                                <pre className={cn(className, "rounded-xl !bg-black/40 !p-4 border border-white/5")} {...props}>
                                  {children}
                                </pre>
                                <button
                                  onClick={() => handleOpenInCodeLab(code, lang)}
                                  className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-blue-500 text-white rounded-lg text-[10px] font-bold opacity-0 group-hover/code:opacity-100 transition-all hover:bg-blue-600 shadow-lg"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Run in Code Lab
                                </button>
                              </div>
                            );
                          }
                          return <code className={className} {...props}>{children}</code>;
                        }
                      }}
                    >
                      {streamingMessage}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex gap-1 items-center h-6">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent">
        <div className="max-w-2xl mx-auto space-y-3">
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10"
              >
                <img src={selectedImage} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/80 transition-all"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
 
          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="absolute left-3 bottom-2.5 flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                title="Upload image"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleVoice}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isRecording ? "bg-red-500/10 text-red-400" : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
                title="Voice input"
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>
 
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Lumina..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-20 pr-10 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all resize-none min-h-[48px] max-h-[150px] text-sm custom-scrollbar"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isTyping}
              className={cn(
                "absolute right-2.5 bottom-2.5 p-1.5 rounded-lg transition-all",
                (input.trim() || selectedImage) && !isTyping ? "bg-white text-black hover:bg-gray-200" : "bg-white/5 text-gray-600 cursor-not-allowed"
              )}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-[9px] text-center text-gray-600 mt-2 uppercase tracking-widest">
          Lumina can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
