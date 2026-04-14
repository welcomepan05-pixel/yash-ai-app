import { useState } from 'react';
import { 
  Folder, 
  File, 
  Image as ImageIcon, 
  MessageSquare, 
  MoreVertical, 
  Download, 
  Trash2, 
  Search,
  Grid,
  List,
  Clock,
  Filter
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function FileManagerView() {
  const { chats, generatedImages, photoEdits, deleteChat } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'chats' | 'images'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allFiles = [
    ...chats.map(c => ({ ...c, type: 'chat' })),
    ...generatedImages.map(i => ({ ...i, type: 'image' })),
    ...photoEdits.map(e => ({ ...e, type: 'edit' }))
  ].sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

  const filteredFiles = allFiles.filter(file => {
    const matchesSearch = (file as any).title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (file as any).prompt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'chats' && file.type === 'chat') ||
                      (activeTab === 'images' && (file.type === 'image' || file.type === 'edit'));
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white overflow-hidden">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-200">File Manager</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-white transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-white/20 transition-all w-64"
            />
          </div>
          <div className="flex items-center bg-white/5 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300")}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-lg transition-all", viewMode === 'list' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300")}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            {['all', 'chats', 'images'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all relative",
                  activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                )}
              </button>
            ))}
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredFiles.map((file: any) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:border-white/10 transition-all"
                >
                  <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
                    {file.type === 'chat' ? (
                      <MessageSquare className="w-12 h-12 text-gray-700" />
                    ) : (
                      <img 
                        src={file.imageUrl || file.editedImageUrl} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-xs font-medium truncate">{file.title || file.prompt || 'Untitled'}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {file.createdAt ? format(file.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button className="p-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/70 transition-all">
                      <Download className="w-3 h-3" />
                    </button>
                    <button className="p-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-red-500/50 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file: any) => (
                <div 
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                      {file.type === 'chat' ? (
                        <MessageSquare className="w-5 h-5 text-gray-500" />
                      ) : (
                        <img src={file.imageUrl || file.editedImageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.title || file.prompt || 'Untitled'}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{file.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-xs text-gray-500">{file.createdAt ? format(file.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}</p>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all"><Download className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
