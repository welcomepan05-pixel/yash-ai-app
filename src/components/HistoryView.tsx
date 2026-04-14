import { useAppStore } from '../store/useAppStore';
import { History as HistoryIcon, MessageSquare, Image as ImageIcon, Edit3, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';

export default function HistoryView() {
  const { chats, generatedImages, photoEdits, deleteChat } = useAppStore();

  const allActivity = useMemo(() => [
    ...chats.map(c => ({ ...c, type: 'chat' as const, date: c.updatedAt?.toDate ? c.updatedAt.toDate() : new Date() })),
    ...generatedImages.map(i => ({ ...i, type: 'image' as const, date: i.createdAt?.toDate ? i.createdAt.toDate() : new Date() })),
    ...photoEdits.map(e => ({ ...e, type: 'edit' as const, date: e.createdAt?.toDate ? e.createdAt.toDate() : new Date() })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()), [chats, generatedImages, photoEdits]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white overflow-y-auto custom-scrollbar">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-gray-200">Activity History</span>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Your Journey</h2>
          <p className="text-sm text-gray-500">A timeline of everything you've created.</p>
        </div>

        <div className="space-y-4">
          {allActivity.map((item, idx) => (
            <div key={idx} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                {item.type === 'chat' && <MessageSquare className="w-5 h-5 text-purple-400" />}
                {item.type === 'image' && <ImageIcon className="w-5 h-5 text-blue-400" />}
                {item.type === 'edit' && <Edit3 className="w-5 h-5 text-pink-400" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {item.type === 'chat' ? (item as any).title : (item as any).prompt || (item as any).operation}
                  </p>
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                    {format(item.date, 'MMM d, yyyy')}
                  </span>
                </div>
                
                <div className="mt-2 flex items-center gap-4">
                  {(item as any).imageUrl || (item as any).editedImageUrl ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 relative">
                      <img 
                        src={(item as any).imageUrl || (item as any).editedImageUrl} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                      {item.type}
                    </span>
                    {item.type === 'chat' && (
                      <button 
                        onClick={() => deleteChat(item.id)}
                        className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete Thread
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {allActivity.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <HistoryIcon className="w-12 h-12 text-gray-700 mx-auto opacity-20" />
              <p className="text-gray-500 italic">No activity recorded yet. Start creating!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
