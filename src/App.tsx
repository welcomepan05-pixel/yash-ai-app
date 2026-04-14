import { useEffect, useState, lazy, Suspense } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import { useAppStore } from './store/useAppStore';

// Lazy load views
const ChatArea = lazy(() => import('./components/ChatArea'));
const ImageGenView = lazy(() => import('./components/ImageGenView'));
const PhotoEditorView = lazy(() => import('./components/PhotoEditorView'));
const DashboardView = lazy(() => import('./components/DashboardView'));
const HistoryView = lazy(() => import('./components/HistoryView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const ToolsView = lazy(() => import('./components/ToolsView'));
const MarketplaceView = lazy(() => import('./components/MarketplaceView'));
const FileManagerView = lazy(() => import('./components/FileManagerView'));
const CodePreviewView = lazy(() => import('./components/CodePreviewView'));
const ProductivityView = lazy(() => import('./components/ProductivityView'));
const LabView = lazy(() => import('./components/LabView'));
const Onboarding = lazy(() => import('./components/Onboarding'));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center bg-[#0d0d0d]">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { 
    currentView, 
    userProfile,
    theme,
    fontSize,
    fetchChats, 
    fetchChatFolders,
    fetchGeneratedImages, 
    fetchPhotoEdits, 
    fetchUserProfile,
    fetchMemories,
    fetchMarketplace,
    fetchTasks,
    fetchStickyNotes,
    fetchAchievements,
    isFocusMode
  } = useAppStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Handle Theme
    const applyTheme = (t: string) => {
      root.classList.remove('light', 'dark');
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(t);
      }
    };
    applyTheme(theme);

    // Handle Font Size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.fontSize = fontSizes[fontSize];

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, fontSize]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        fetchUserProfile();
        fetchChats();
        fetchChatFolders();
        fetchGeneratedImages();
        fetchPhotoEdits();
        fetchMemories();
        fetchMarketplace();
        fetchTasks();
        fetchStickyNotes();
        fetchAchievements();
      }
    });

    return () => unsubscribe();
  }, [fetchChats, fetchChatFolders, fetchGeneratedImages, fetchPhotoEdits, fetchUserProfile, fetchMemories, fetchMarketplace, fetchTasks, fetchStickyNotes, fetchAchievements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (userProfile && !userProfile.onboarded) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Onboarding />
      </Suspense>
    );
  }

  const renderView = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {(() => {
          switch (currentView) {
            case 'chat':
              return <ChatArea />;
            case 'image-gen':
              return <ImageGenView />;
            case 'photo-editor':
              return <PhotoEditorView />;
            case 'dashboard':
              return <DashboardView />;
            case 'history':
              return <HistoryView />;
            case 'settings':
              return <SettingsView />;
            case 'tools':
              return <ToolsView />;
            case 'marketplace':
              return <MarketplaceView />;
            case 'files':
              return <FileManagerView />;
            case 'code-preview':
              return <CodePreviewView />;
            case 'tasks':
              return <ProductivityView />;
            case 'lab':
              return <LabView />;
            default:
              return <ChatArea />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white overflow-hidden font-sans selection:bg-white/20">
      {!isFocusMode && <Sidebar />}
      <main className="flex-1 relative overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
}
