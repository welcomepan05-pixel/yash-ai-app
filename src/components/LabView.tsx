import { useState } from 'react';
import { 
  Beaker, 
  Sparkles, 
  Zap, 
  Users, 
  Bot, 
  Cpu, 
  Globe, 
  Lock,
  ArrowRight,
  Play,
  Settings,
  Shield,
  Code
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function LabView() {
  const [activeTab, setActiveTab] = useState<'experiments' | 'multi-agent' | 'api'>('experiments');

  const experiments = [
    {
      id: 'voice-cloning',
      title: 'AI Voice Cloning',
      description: 'Clone your voice with just 30 seconds of audio. (Beta)',
      status: 'Coming Soon',
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10'
    },
    {
      id: 'meme-gen',
      title: 'AI Meme Generator',
      description: 'Generate viral memes using trending templates and AI captions.',
      status: 'Active',
      icon: Sparkles,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      id: 'vision-pro',
      title: 'Vision Pro Mode',
      description: 'Advanced real-time object detection and scene analysis.',
      status: 'Coming Soon',
      icon: Cpu,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white overflow-hidden">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
            <Beaker className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-200">AI Lab</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Experimental Features</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl w-fit">
            {(['experiments', 'multi-agent', 'api'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                  activeTab === tab ? "bg-white text-black" : "text-gray-500 hover:text-gray-300"
                )}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          {activeTab === 'experiments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiments.map(exp => (
                <motion.div 
                  key={exp.id}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-all group"
                >
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", exp.bg)}>
                    <exp.icon className={cn("w-6 h-6", exp.color)} />
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-200">{exp.title}</h3>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter",
                        exp.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-500"
                      )}>
                        {exp.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{exp.description}</p>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-white/5 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    {exp.status === 'Active' ? 'Launch Experiment' : 'Notify Me'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'multi-agent' && (
            <div className="space-y-8">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-white/10">
                <div className="max-w-2xl space-y-4">
                  <h2 className="text-2xl font-bold">Multi-Agent Collaboration</h2>
                  <p className="text-gray-400 leading-relaxed">
                    Deploy multiple AI agents with specialized roles to work together on complex tasks. 
                    Perfect for software development, marketing campaigns, and research.
                  </p>
                  <button className="px-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Configure Agents
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-400" />
                    </div>
                    <h4 className="font-bold">The Architect</h4>
                  </div>
                  <p className="text-sm text-gray-500">Focuses on high-level structure, planning, and logic.</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Code className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h4 className="font-bold">The Developer</h4>
                  </div>
                  <p className="text-sm text-gray-500">Implements code, fixes bugs, and optimizes performance.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-400" />
                        API Access
                      </h3>
                      <button className="text-xs text-blue-400 font-bold hover:underline">Documentation</button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Your API Key</label>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          readOnly 
                          value="lumina_sk_live_************************" 
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-gray-400"
                        />
                        <button className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">Reveal</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Usage Limits</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Requests</span>
                          <span className="text-gray-500">0 / 1,000</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
