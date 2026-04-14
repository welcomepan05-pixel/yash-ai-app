import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  LogOut, 
  Image as ImageIcon, 
  Edit3, 
  History, 
  LayoutDashboard, 
  Settings,
  Search,
  Pin,
  FolderPlus,
  Folder,
  ChevronDown,
  MoreVertical,
  Sparkles,
  TrendingUp,
  Code2,
  CheckSquare,
  Beaker,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAppStore, ViewType } from '../store/useAppStore';
import { auth, db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback, memo } from 'react';

const ChatItem = memo(({ chat }: { chat: any }) => {
  const { currentChatId, setCurrentChatId, deleteChat, togglePinChat } = useAppStore();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
        currentChatId === chat.id 
          ? "bg-white/5 text-white border border-white/10" 
          : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
      )}
      onClick={() => setCurrentChatId(chat.id)}
    >
      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
      <span className="text-xs truncate pr-12">{chat.title}</span>
      
      <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePinChat(chat.id);
          }}
          className={cn(
            "p-1 hover:bg-white/10 rounded-lg transition-all",
            chat.pinned ? "text-orange-400" : "text-gray-600 hover:text-white"
          )}
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteChat(chat.id);
          }}
          className="p-1 hover:bg-white/10 rounded-lg transition-all text-gray-600 hover:text-red-400"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
});

const FolderItem = memo(({ folder, chats }: { folder: any; chats: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { createNewChat } = useAppStore();

  return (
    <div className="space-y-1">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-500 hover:bg-white/5 hover:text-gray-300 cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-3">
          <Folder className={cn("w-3.5 h-3.5", isOpen ? "text-blue-400" : "text-gray-600")} />
          <span className="text-xs font-medium">{folder.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); createNewChat(folder.id); }}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
          >
            <Plus className="w-3 h-3" />
          </button>
          <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>
      
      {isOpen && (
        <div className="pl-4 space-y-1 border-l border-white/5 ml-4">
          {chats.map(chat => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
          {chats.length === 0 && (
            <p className="text-[10px] text-gray-600 italic px-3 py-2">Empty folder</p>
          )}
        </div>
      )}
    </div>
  );
});

export default function Sidebar() {
  const { 
    chats, 
    chatFolders,
    currentChatId, 
    currentView, 
    searchQuery,
    setView, 
    createNewChat, 
    startNewChat,
    setCurrentChatId, 
    deleteChat,
    togglePinChat,
    createFolder,
    setSearchQuery,
    moveChatToFolder,
    setAdminTargetUid,
    adminTargetUid
  } = useAppStore();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const user = auth.currentUser;
  const OWNER_EMAIL = "welcomepan05@gmail.com";

  const handleSearchChange = useCallback((val: string) => {
    setSearchQuery(val);
    
    // Hidden Admin Command
    if (user?.email === OWNER_EMAIL && val.startsWith('admin:')) {
      const target = val.split(':')[1];
      if (target === 'reset') {
        setAdminTargetUid(null);
        setSearchQuery('');
      } else if (target === 'users') {
        // List users in console
        const fetchAllUsers = async () => {
          const usersRef = collection(db, 'users');
          const snapshot = await getDocs(usersRef);
          console.table(snapshot.docs.map(d => ({ uid: d.id, ...d.data() })));
        };
        fetchAllUsers();
        setSearchQuery('');
      } else if (target && target.length > 10) { // Basic UID length check
        setAdminTargetUid(target);
        setSearchQuery('');
      }
    }
  }, [user, OWNER_EMAIL, setAdminTargetUid, setSearchQuery]);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(c => c.pinned);
  const unpinnedChats = filteredChats.filter(c => !c.pinned);

  const navItems: { id: ViewType; label: string; icon: any; color?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'code-preview', label: 'Code Lab', icon: Code2, color: 'text-blue-400' },
    { id: 'tasks', label: 'Productivity', icon: CheckSquare, color: 'text-orange-400' },
    { id: 'lab', label: 'AI Lab', icon: Beaker, color: 'text-pink-400' },
    { id: 'tools', label: 'AI Tools', icon: Sparkles, color: 'text-purple-400' },
    { id: 'image-gen', label: 'Image Gen', icon: ImageIcon },
    { id: 'photo-editor', label: 'Photo Editor', icon: Edit3 },
    { id: 'marketplace', label: 'Marketplace', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'files', label: 'Files', icon: Folder },
    { id: 'history', label: 'History', icon: History },
  ];

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  return (
    <div className="w-64 h-screen bg-[#0d0d0d] border-r border-white/10 flex flex-col transition-all duration-300">
      <div className="p-3 space-y-3">
        <button 
          onClick={() => startNewChat()}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-white transition-colors" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search history..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-white/20 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-4 custom-scrollbar">
        {/* Navigation Items (Compact) */}
        <div className="space-y-0.5">
          {navItems.filter(item => item.id !== 'chat').map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-medium",
                currentView === item.id 
                  ? "bg-white/10 text-white" 
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              )}
            >
              <item.icon className={cn("w-3.5 h-3.5", item.color)} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="h-px bg-white/5 mx-2" />

        {/* Chat History */}
        <div className="space-y-4">
          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 mb-1">
                <Pin className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Pinned</span>
              </div>
              <div className="space-y-0.5">
                {pinnedChats.map(chat => (
                  <ChatItem key={chat.id} chat={chat} />
                ))}
              </div>
            </div>
          )}

          {/* Folders */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Folders</span>
              <button 
                onClick={() => setIsCreatingFolder(true)}
                className="p-1 hover:bg-white/10 rounded-lg transition-all text-gray-600 hover:text-white"
              >
                <FolderPlus className="w-3 h-3" />
              </button>
            </div>

            {isCreatingFolder && (
              <div className="px-2 py-1">
                <input 
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  onBlur={() => setIsCreatingFolder(false)}
                  placeholder="Folder name..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>
            )}

            <div className="space-y-0.5">
              {chatFolders.map(folder => (
                <FolderItem key={folder.id} folder={folder} chats={filteredChats.filter(c => c.folderId === folder.id)} />
              ))}
            </div>
          </div>

          {/* Recent Chats */}
          <div className="space-y-1">
            <div className="px-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Recent</span>
            </div>
            <div className="space-y-0.5">
              <AnimatePresence initial={false}>
                {unpinnedChats.filter(c => !c.folderId).map((chat) => (
                  <ChatItem key={chat.id} chat={chat} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`} 
            alt="Profile" 
            className="w-8 h-8 rounded-full border border-white/10"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.displayName}</p>
            <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider">Pro Plan</p>
          </div>
          <button 
            onClick={() => setView('settings')}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              currentView === 'settings' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
            )}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        
        <button 
          onClick={async () => {
            await auth.signOut();
            localStorage.clear();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
