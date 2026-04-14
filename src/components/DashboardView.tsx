import { useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Image as ImageIcon, 
  Edit3, 
  TrendingUp, 
  Clock,
  ArrowRight,
  Zap,
  Award,
  Flame
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export default function DashboardView() {
  const { 
    chats, 
    generatedImages, 
    photoEdits, 
    userProfile,
    fetchChats, 
    fetchGeneratedImages, 
    fetchPhotoEdits,
    fetchAchievements,
    achievements,
    setView
  } = useAppStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.displayName?.split(' ')[0] || 'there';
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  useEffect(() => {
    // Data is already fetched in App.tsx on auth change
    // Only fetch if explicitly needed or for refresh
  }, []);

  const stats = [
    { label: 'Conversations', value: chats.length, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Images Generated', value: generatedImages.length, icon: ImageIcon, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Daily Streak', value: userProfile?.streakCount || 0, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white overflow-y-auto custom-scrollbar">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-gray-200">Dashboard</span>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full p-8 space-y-10">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">{getGreeting()}.</h2>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-bold text-yellow-500">{userProfile?.credits || 0} Credits</span>
              </div>
            </div>
          </div>
          <p className="text-gray-500">Here's an overview of your creative activity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Recent Creations</h3>
              <button onClick={() => setView('history')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {generatedImages.slice(0, 4).map((img) => (
                <div key={img.id} className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img src={img.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{img.prompt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-600" />
                      <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                        {img.createdAt?.toDate ? format(img.createdAt.toDate(), 'MMM d, h:mm a') : 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {generatedImages.length === 0 && (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-3xl text-gray-600">
                  <p className="text-sm italic">No images generated yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Chats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Recent Chats</h3>
              <button onClick={() => setView('chat')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                New Chat <PlusIcon className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {chats.slice(0, 4).map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => { setView('chat'); useAppStore.getState().setCurrentChatId(chat.id); }}
                  className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all"
                >
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">
                      Last active: {chat.updatedAt?.toDate ? format(chat.updatedAt.toDate(), 'MMM d') : 'Today'}
                    </p>
                  </div>
                </div>
              ))}
              {chats.length === 0 && (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-3xl text-gray-600">
                  <p className="text-sm italic">No conversations yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Achievements</h3>
            <span className="text-xs text-gray-400">{achievements.length} unlocked</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {achievements.map(achievement => (
              <div key={achievement.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center space-y-2 group hover:bg-white/[0.04] transition-all">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-300">{achievement.title}</p>
              </div>
            ))}
            {achievements.length === 0 && (
              <div className="col-span-full p-8 text-center border border-dashed border-white/10 rounded-3xl text-gray-600">
                <p className="text-sm italic">Keep using Lumina to unlock badges!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
