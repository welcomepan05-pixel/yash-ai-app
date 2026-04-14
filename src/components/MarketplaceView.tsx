import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Sparkles, 
  Heart, 
  Share2, 
  Plus, 
  Tag, 
  User,
  ExternalLink,
  Filter,
  TrendingUp,
  Clock,
  Check
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function MarketplaceView() {
  const { marketplacePrompts, fetchMarketplace, likePrompt, sharePrompt } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSharing, setIsSharing] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ title: '', prompt: '', description: '', category: 'General' });

  useEffect(() => {
    fetchMarketplace();
  }, [fetchMarketplace]);

  const categories = ['All', 'Creative', 'Coding', 'Business', 'Marketing', 'Academic', 'Fun'];

  const filteredPrompts = useMemo(() => marketplacePrompts.filter(p => 
    (activeCategory === 'All' || p.category === activeCategory) &&
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [marketplacePrompts, activeCategory, searchQuery]);

  const handleShare = useCallback(async () => {
    if (!newPrompt.title || !newPrompt.prompt) return;
    await sharePrompt(newPrompt);
    setIsSharing(false);
    setNewPrompt({ title: '', prompt: '', description: '', category: 'General' });
  }, [newPrompt, sharePrompt]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white overflow-hidden">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-gray-200">Prompt Marketplace</span>
        </div>
        <button 
          onClick={() => setIsSharing(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Share Prompt
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 via-transparent to-emerald-500/10 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 blur-[100px] -z-10" />
            <div className="max-w-2xl space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">Discover the best AI prompts.</h2>
              <p className="text-gray-400 text-lg">Browse, share, and use high-performing prompts created by the Lumina community.</p>
              <div className="relative max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for prompts, categories..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap",
                  activeCategory === cat 
                    ? "bg-white text-black" 
                    : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Prompt Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPrompts.map((prompt) => (
                <motion.div
                  key={prompt.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{prompt.category}</span>
                    <button 
                      onClick={() => likePrompt(prompt.id)}
                      className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-xs font-medium">{prompt.likes}</span>
                    </button>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors">{prompt.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">{prompt.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-500">{prompt.authorName}</span>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold transition-all">
                      Use Prompt
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {isSharing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-[#121212] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Share your prompt</h3>
                <button onClick={() => setIsSharing(false)} className="text-gray-500 hover:text-white transition-colors">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Title</label>
                  <input 
                    value={newPrompt.title}
                    onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
                    placeholder="e.g. Creative Story Writer"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
                  <select 
                    value={newPrompt.category}
                    onChange={(e) => setNewPrompt({ ...newPrompt, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Prompt Content</label>
                  <textarea 
                    value={newPrompt.prompt}
                    onChange={(e) => setNewPrompt({ ...newPrompt, prompt: e.target.value })}
                    placeholder="Act as a..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-white/20 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
                  <input 
                    value={newPrompt.description}
                    onChange={(e) => setNewPrompt({ ...newPrompt, description: e.target.value })}
                    placeholder="What does this prompt do?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
              </div>
              <button 
                onClick={handleShare}
                className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                Publish to Marketplace
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
