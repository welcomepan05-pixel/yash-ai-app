import { useState } from 'react';
import { 
  FileText, 
  Code, 
  BarChart3, 
  Video, 
  Palette, 
  Search, 
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Download,
  ExternalLink,
  GraduationCap,
  CalendarDays,
  Mail,
  UserCircle,
  Lightbulb,
  BrainCircuit,
  Share2,
  X
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ai, CHAT_MODEL } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type ToolType = 'notes' | 'code' | 'data' | 'script' | 'seo';

export default function ToolsView() {
  const { 
    setCurrentCode, 
    setView, 
    shareToMarketplace 
  } = useAppStore();
  const [activeTool, setActiveTool] = useState<ToolType>('notes');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareDesc, setShareDesc] = useState('');

  const tools = [
    { id: 'notes', label: 'AI Notes Maker', icon: FileText, description: 'Convert long text into structured notes and summaries.' },
    { id: 'code', label: 'Code Generator', icon: Code, description: 'Generate, debug, and optimize code in any language.' },
    { id: 'data', label: 'Data Analyzer', icon: BarChart3, description: 'Get insights and visualizations from your raw data.' },
    { id: 'script', label: 'Video Script', icon: Video, description: 'Create viral scripts for Reels, Shorts, and TikToks.' },
    { id: 'seo', label: 'SEO Content', icon: Search, description: 'Generate SEO-optimized blogs, captions, and keywords.' },
    { id: 'tutor', label: 'AI Tutor', icon: GraduationCap, description: 'Explain complex topics and generate practice quizzes.' },
    { id: 'planner', label: 'AI Planner', icon: CalendarDays, description: 'Generate optimized daily schedules and plans.' },
    { id: 'email', label: 'Email Writer', icon: Mail, description: 'Write professional emails or generate smart replies.' },
    { id: 'resume', label: 'Resume Builder', icon: UserCircle, description: 'Build professional resumes and cover letters.' },
    { id: 'ideas', label: 'Idea Gen', icon: Lightbulb, description: 'Generate creative ideas for projects, business, or fun.' },
    { id: 'brainstorm', label: 'Brainstorm', icon: BrainCircuit, description: 'Generate multiple diverse perspectives on a topic.' },
  ];

  const handleProcess = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setOutput('');

    const prompts = {
      notes: "Act as a professional note-taker. Convert the following text into structured, easy-to-read notes with bullet points and a summary: ",
      code: "Act as a senior software engineer. Generate or debug the following code. Provide explanations and best practices: ",
      data: "Act as a data scientist. Analyze the following data and provide key insights, trends, and a summary: ",
      script: "Act as a viral content creator. Create a high-energy video script for a short-form video (Reel/Short) based on this topic: ",
      seo: "Act as an SEO expert. Generate an optimized blog post outline, meta description, and 10 high-ranking keywords for: ",
      tutor: "Act as an expert tutor. Explain the following topic clearly and generate a 5-question multiple-choice quiz with answers: ",
      planner: "Act as a productivity coach. Create a detailed daily schedule and action plan based on these goals/tasks: ",
      email: "Act as a professional communicator. Write a clear, effective email or reply based on this context: ",
      resume: "Act as a career coach. Create a professional resume or cover letter based on this background/job description: ",
      ideas: "Act as a creative consultant. Generate 10 unique and actionable ideas for: ",
      brainstorm: "Act as a diverse panel of experts. Provide 5 different perspectives and approaches to solving this problem: ",
    };

    try {
      const result = await ai.models.generateContentStream({
        model: CHAT_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompts[activeTool] + input }] }],
      });
      
      let fullText = '';
      for await (const chunk of result) {
        fullText += chunk.text;
        setOutput(fullText);
      }
    } catch (error) {
      console.error("Tool error:", error);
      setOutput("Error generating content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToMarketplace = async () => {
    if (!shareTitle.trim() || !shareDesc.trim()) return;
    await shareToMarketplace(shareTitle, shareDesc, output, activeTool);
    setShowShareModal(false);
    setShareTitle('');
    setShareDesc('');
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white overflow-hidden relative">
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
      <header className="h-14 border-b border-white/5 flex items-center px-6 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">AI Power Tools</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-white/5 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Select Tool</p>
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id as ToolType); setOutput(''); setInput(''); }}
              className={cn(
                "w-full flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-sm transition-all text-left",
                activeTool === tool.id 
                  ? "bg-white/10 text-white border border-white/10" 
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              )}
            >
              <div className="flex items-center gap-2">
                <tool.icon className="w-4 h-4" />
                <span className="font-medium">{tool.label}</span>
              </div>
              <p className="text-[10px] text-gray-600 line-clamp-1">{tool.description}</p>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{tools.find(t => t.id === activeTool)?.label}</h2>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-purple-500/10 text-[10px] text-purple-400 font-bold uppercase tracking-wider">Pro Feature</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm">{tools.find(t => t.id === activeTool)?.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Input Data</label>
                  <span className="text-[10px] text-gray-600">{input.length} characters</span>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Paste your ${activeTool === 'code' ? 'code' : 'text'} here...`}
                  className="w-full h-[400px] bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none custom-scrollbar"
                />
                <button
                  onClick={handleProcess}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                    input.trim() && !isLoading 
                      ? "bg-white text-black hover:bg-gray-200" 
                      : "bg-white/5 text-gray-600 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Process with AI
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Output */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">AI Result</label>
                  {output && (
                    <div className="flex items-center gap-2">
                      {activeTool === 'code' && (
                        <button 
                          onClick={() => {
                            useAppStore.getState().setCurrentCode({ html: output }); // Default to HTML
                            useAppStore.getState().setView('code-preview');
                          }}
                          className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-bold hover:bg-blue-500/20 transition-all"
                          title="Open in Code Lab"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Code Lab
                        </button>
                      )}
                      <button 
                        onClick={() => setShowShareModal(true)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-500 hover:text-white"
                        title="Share to Marketplace"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-500 hover:text-white"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button 
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-500 hover:text-white"
                        title="Download as file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-full h-[400px] bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-sm overflow-y-auto custom-scrollbar prose prose-invert max-w-none">
                  {output ? (
                    <div className="whitespace-pre-wrap">{output}</div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-600 space-y-4">
                      <Sparkles className="w-8 h-8 opacity-20" />
                      <p className="text-xs">Your AI-generated results will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
