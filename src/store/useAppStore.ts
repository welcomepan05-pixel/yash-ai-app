import { create } from 'zustand';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  Timestamp,
  getDocs,
  increment,
  limit
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';

export type ViewType = 'chat' | 'image-gen' | 'photo-editor' | 'history' | 'settings' | 'dashboard' | 'tools' | 'marketplace' | 'files' | 'chatbot-gen' | 'code-preview' | 'tasks' | 'lab';
export type ThemeType = 'dark' | 'light' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'model';
  content: string;
  imageBase64?: string | null;
  bookmarked?: boolean;
  createdAt: any;
}

interface UserTask {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  dueDate?: any;
  createdAt: any;
}

interface StickyNote {
  id: string;
  userId: string;
  content: string;
  color: string;
  x: number;
  y: number;
  createdAt: any;
}

interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  unlockedAt: any;
}

interface Chat {
  id: string;
  userId: string;
  title: string;
  pinned?: boolean;
  folderId?: string | null;
  isPublic?: boolean;
  encrypted?: boolean;
  createdAt: any;
  updatedAt: any;
}

interface PromptTemplate {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  likes: number;
  createdAt: any;
}

interface UserMemory {
  id: string;
  userId: string;
  content: string;
  importance: number;
  createdAt: any;
}

interface ChatFolder {
  id: string;
  userId: string;
  name: string;
  createdAt: any;
}

interface GeneratedImage {
  id: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  style?: string;
  createdAt: any;
}

interface PhotoEdit {
  id: string;
  userId: string;
  originalImageUrl: string;
  editedImageUrl: string;
  operation: string;
  createdAt: any;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  age?: number;
  onboarded?: boolean;
  customSystemPrompt?: string;
  preferredLanguage?: string;
  memoriesEnabled?: boolean;
  encryptionKey?: string;
  credits: number;
  streakCount: number;
  lastActiveDate?: string;
  createdAt: any;
}

interface AppState {
  currentView: ViewType;
  theme: ThemeType;
  fontSize: FontSize;
  userProfile: UserProfile | null;
  chats: Chat[];
  activeChatIds: string[]; // For multi-tab
  currentChatId: string | null;
  messages: Message[];
  generatedImages: GeneratedImage[];
  photoEdits: PhotoEdit[];
  isLoading: boolean;
  isStreaming: boolean;
  chatFolders: ChatFolder[];
  searchQuery: string;
  memories: UserMemory[];
  marketplacePrompts: PromptTemplate[];
  currentCode: { html: string; css: string; js: string };
  tasks: UserTask[];
  stickyNotes: StickyNote[];
  achievements: Achievement[];
  isFocusMode: boolean;
  adminTargetUid: string | null;
  
  setView: (view: ViewType) => void;
  setTheme: (theme: ThemeType) => void;
  setFontSize: (size: FontSize) => void;
  setChats: (chats: Chat[]) => void;
  setSearchQuery: (query: string) => void;
  setCurrentChatId: (id: string | null) => void;
  openChatInTab: (id: string) => void;
  closeChatTab: (id: string) => void;
  setMessages: (messages: Message[]) => void;
  setFocusMode: (enabled: boolean) => void;
  setAdminTargetUid: (uid: string | null) => void;
  startNewChat: () => void;
  
  fetchChats: () => void;
  fetchChatFolders: () => void;
  fetchMessages: (chatId: string) => void;
  fetchGeneratedImages: () => void;
  fetchPhotoEdits: () => void;
  fetchUserProfile: () => void;
  fetchMemories: () => void;
  fetchMarketplace: () => void;
  fetchTasks: () => void;
  fetchStickyNotes: () => void;
  fetchAchievements: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  createNewChat: (folderId?: string) => Promise<string>;
  sendMessage: (chatId: string, content: string, imageBase64?: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  togglePinChat: (chatId: string) => Promise<void>;
  togglePublicChat: (chatId: string) => Promise<void>;
  moveChatToFolder: (chatId: string, folderId: string | null) => Promise<void>;
  toggleBookmarkMessage: (chatId: string, messageId: string) => Promise<void>;
  
  createFolder: (name: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  
  addMemory: (content: string) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  
  sharePrompt: (template: Omit<PromptTemplate, 'id' | 'userId' | 'authorName' | 'likes' | 'createdAt'>) => Promise<void>;
  likePrompt: (id: string) => Promise<void>;
  
  addTask: (title: string, dueDate?: Date) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  addStickyNote: (content: string, color: string) => Promise<void>;
  updateStickyNote: (id: string, data: Partial<StickyNote>) => Promise<void>;
  deleteStickyNote: (id: string) => Promise<void>;
  shareToMarketplace: (title: string, description: string, prompt: string, category: string) => Promise<void>;
  
  saveGeneratedImage: (prompt: string, base64Data: string, style?: string) => Promise<void>;
  savePhotoEdit: (originalBase64: string, editedBase64: string, operation: string) => Promise<void>;
  setCurrentCode: (code: { html?: string; css?: string; js?: string }) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'chat',
  theme: (localStorage.getItem('lumina-theme') as ThemeType) || 'dark',
  fontSize: (localStorage.getItem('lumina-font-size') as FontSize) || 'medium',
  userProfile: null,
  chats: [],
  activeChatIds: [],
  currentChatId: null,
  messages: [],
  generatedImages: [],
  photoEdits: [],
  isLoading: false,
  isStreaming: false,
  chatFolders: [],
  searchQuery: '',
  memories: [],
  marketplacePrompts: [],
  currentCode: { html: '', css: '', js: '' },
  tasks: [],
  stickyNotes: [],
  achievements: [],
  isFocusMode: false,
  adminTargetUid: null,

  setView: (currentView) => set({ currentView }),
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('lumina-theme', theme);
  },
  setFontSize: (fontSize) => {
    set({ fontSize });
    localStorage.setItem('lumina-font-size', fontSize);
  },
  setChats: (chats) => set({ chats }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCurrentChatId: (currentChatId) => {
    set({ currentChatId });
    if (currentChatId) {
      const active = get().activeChatIds;
      if (!active.includes(currentChatId)) {
        set({ activeChatIds: [...active, currentChatId] });
      }
      get().fetchMessages(currentChatId);
    } else {
      set({ messages: [] });
    }
  },
  openChatInTab: (id) => {
    const active = get().activeChatIds;
    if (!active.includes(id)) {
      set({ activeChatIds: [...active, id] });
    }
    set({ currentChatId: id, currentView: 'chat' });
    get().fetchMessages(id);
  },
  closeChatTab: (id) => {
    const active = get().activeChatIds.filter(tabId => tabId !== id);
    set({ activeChatIds: active });
    if (get().currentChatId === id) {
      set({ currentChatId: active.length > 0 ? active[active.length - 1] : null });
    }
  },
  setMessages: (messages) => set({ messages }),
  setFocusMode: (isFocusMode) => set({ isFocusMode }),
  setAdminTargetUid: (adminTargetUid) => {
    set({ adminTargetUid });
    // Re-fetch everything for the new target
    get().fetchChats();
    get().fetchChatFolders();
    get().fetchGeneratedImages();
    get().fetchPhotoEdits();
    get().fetchMemories();
    get().fetchTasks();
    get().fetchStickyNotes();
    get().fetchAchievements();
  },

  startNewChat: () => {
    set({ currentChatId: null, messages: [], currentView: 'chat' });
  },

  fetchChats: () => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const chatsRef = collection(db, 'users', targetUid, 'chats');
    const q = query(chatsRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      set({ chats });
    }, (error) => {
      console.error("Error fetching chats:", error);
    });
  },

  fetchChatFolders: () => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const foldersRef = collection(db, 'users', targetUid, 'folders');
    const q = query(foldersRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const folders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatFolder));
      set({ chatFolders: folders });
    }, (error) => {
      console.error("Error fetching folders:", error);
    });
  },

  fetchMessages: (chatId) => {
    const user = auth.currentUser;
    if (!user || !chatId) return;
    const targetUid = get().adminTargetUid || user.uid;

    const messagesRef = collection(db, 'users', targetUid, 'chats', chatId, 'messages');
    // Limit to last 30 messages for performance
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(30));

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)).reverse();
      set({ messages });
    }, (error) => {
      console.error("Error fetching messages:", error);
    });
  },

  fetchGeneratedImages: () => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const imagesRef = collection(db, 'users', targetUid, 'generated_images');
    const q = query(imagesRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GeneratedImage));
      set({ generatedImages: images });
    }, (error) => {
      console.error("Error fetching images:", error);
    });
  },

  fetchPhotoEdits: () => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const editsRef = collection(db, 'users', targetUid, 'photo_edits');
    const q = query(editsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const edits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PhotoEdit));
      set({ photoEdits: edits });
    }, (error) => {
      console.error("Error fetching edits:", error);
    });
  },

  fetchUserProfile: () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    return onSnapshot(userRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const profile = { uid: snapshot.id, ...data } as UserProfile;
        set({ userProfile: profile });

        // Streak Logic
        const today = new Date().toISOString().split('T')[0];
        const lastActive = profile.lastActiveDate;

        if (lastActive !== today) {
          let newStreak = profile.streakCount || 0;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastActive === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }

          await updateDoc(userRef, {
            lastActiveDate: today,
            streakCount: newStreak,
            credits: increment(10) // Reward for daily login
          });
        }
      } else {
        // Initialize user profile if it doesn't exist
        const initialProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          onboarded: false,
          credits: 100,
          streakCount: 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, initialProfile);
        set({ userProfile: initialProfile as UserProfile });
      }
    });
  },

  fetchMemories: () => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const memoriesRef = collection(db, 'users', targetUid, 'memories');
    const q = query(memoriesRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const memories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserMemory));
      set({ memories });
    });
  },

  fetchMarketplace: () => {
    const marketplaceRef = collection(db, 'marketplace');
    const q = query(marketplaceRef, orderBy('likes', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const prompts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromptTemplate));
      set({ marketplacePrompts: prompts });
    });
  },

  fetchTasks: () => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const tasksRef = collection(db, 'users', targetUid, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserTask));
      set({ tasks });
    });
  },

  fetchStickyNotes: () => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const notesRef = collection(db, 'users', targetUid, 'sticky_notes');
    return onSnapshot(notesRef, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StickyNote));
      set({ stickyNotes: notes });
    });
  },

  fetchAchievements: () => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const achievementsRef = collection(db, 'users', targetUid, 'achievements');
    return onSnapshot(achievementsRef, (snapshot) => {
      const achievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
      set({ achievements: achievements });
    });
  },

  updateUserProfile: async (data) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const userRef = doc(db, 'users', targetUid);
    await updateDoc(userRef, { ...data });
  },

  createNewChat: async (folderId) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    const targetUid = get().adminTargetUid || user.uid;

    const chatsRef = collection(db, 'users', targetUid, 'chats');
    const newChat = {
      userId: targetUid,
      title: 'New Chat',
      pinned: false,
      folderId: folderId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(chatsRef, newChat);
    set({ currentChatId: docRef.id });
    return docRef.id;
  },

  sendMessage: async (chatId, content, imageBase64) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const messagesRef = collection(db, 'users', targetUid, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'users', targetUid, 'chats', chatId);

    await addDoc(messagesRef, {
      chatId,
      role: 'user',
      content,
      imageBase64: imageBase64 || null,
      createdAt: serverTimestamp(),
    });

    const messages = get().messages;
    if (messages.length === 0) {
      await updateDoc(chatRef, { 
        title: content.slice(0, 40) + (content.length > 40 ? '...' : ''),
        updatedAt: serverTimestamp() 
      });
    } else {
      await updateDoc(chatRef, { updatedAt: serverTimestamp() });
    }
  },

  deleteChat: async (chatId) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const chatRef = doc(db, 'users', targetUid, 'chats', chatId);
    await deleteDoc(chatRef);
    
    if (get().currentChatId === chatId) {
      set({ currentChatId: null, messages: [] });
    }
  },

  togglePinChat: async (chatId) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const chat = get().chats.find(c => c.id === chatId);
    if (!chat) return;

    const chatRef = doc(db, 'users', targetUid, 'chats', chatId);
    await updateDoc(chatRef, { pinned: !chat.pinned });
  },

  togglePublicChat: async (chatId) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const chat = get().chats.find(c => c.id === chatId);
    if (!chat) return;

    const chatRef = doc(db, 'users', targetUid, 'chats', chatId);
    await updateDoc(chatRef, { isPublic: !chat.isPublic });
  },

  toggleBookmarkMessage: async (chatId, messageId) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const message = get().messages.find(m => m.id === messageId);
    if (!message) return;

    const messageRef = doc(db, 'users', targetUid, 'chats', chatId, 'messages', messageId);
    await updateDoc(messageRef, { bookmarked: !message.bookmarked });
  },

  moveChatToFolder: async (chatId, folderId) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const chatRef = doc(db, 'users', targetUid, 'chats', chatId);
    await updateDoc(chatRef, { folderId });
  },

  createFolder: async (name) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const foldersRef = collection(db, 'users', targetUid, 'folders');
    await addDoc(foldersRef, {
      userId: targetUid,
      name,
      createdAt: serverTimestamp(),
    });
  },

  deleteFolder: async (folderId) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const folderRef = doc(db, 'users', targetUid, 'folders', folderId);
    await deleteDoc(folderRef);

    // Unset folderId for chats in this folder
    const chatsToUpdate = get().chats.filter(c => c.folderId === folderId);
    for (const chat of chatsToUpdate) {
      const chatRef = doc(db, 'users', targetUid, 'chats', chat.id);
      await updateDoc(chatRef, { folderId: null });
    }
  },

  addMemory: async (content) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const memoriesRef = collection(db, 'users', targetUid, 'memories');
    await addDoc(memoriesRef, {
      userId: targetUid,
      content,
      importance: 1,
      createdAt: serverTimestamp(),
    });
  },

  deleteMemory: async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    const memoryRef = doc(db, 'users', targetUid, 'memories', id);
    await deleteDoc(memoryRef);
  },

  sharePrompt: async (template) => {
    const user = auth.currentUser;
    if (!user) return;

    const marketplaceRef = collection(db, 'marketplace');
    await addDoc(marketplaceRef, {
      ...template,
      userId: user.uid,
      authorName: get().userProfile?.displayName || 'Anonymous',
      likes: 0,
      createdAt: serverTimestamp(),
    });
  },

  likePrompt: async (id) => {
    const promptRef = doc(db, 'marketplace', id);
    await updateDoc(promptRef, {
      likes: increment(1)
    });
  },

  addTask: async (title, dueDate) => {
    const user = auth.currentUser;
    if (!user) return;

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    await addDoc(tasksRef, {
      userId: user.uid,
      title,
      completed: false,
      dueDate: dueDate || null,
      createdAt: serverTimestamp(),
    });
  },

  toggleTask: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    const task = get().tasks.find(t => t.id === id);
    if (!task) return;

    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    await updateDoc(taskRef, { completed: !task.completed });
  },

  deleteTask: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    await deleteDoc(taskRef);
  },

  addStickyNote: async (content, color) => {
    const user = auth.currentUser;
    if (!user) return;

    const notesRef = collection(db, 'users', user.uid, 'sticky_notes');
    await addDoc(notesRef, {
      userId: user.uid,
      content,
      color,
      x: 100,
      y: 100,
      createdAt: serverTimestamp(),
    });
  },

  updateStickyNote: async (id, data) => {
    const user = auth.currentUser;
    if (!user) return;

    const noteRef = doc(db, 'users', user.uid, 'sticky_notes', id);
    await updateDoc(noteRef, { ...data });
  },

  deleteStickyNote: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    const noteRef = doc(db, 'users', user.uid, 'sticky_notes', id);
    await deleteDoc(noteRef);
  },

  shareToMarketplace: async (title, description, prompt, category) => {
    const user = auth.currentUser;
    if (!user) return;

    const marketplaceRef = collection(db, 'marketplace');
    await addDoc(marketplaceRef, {
      userId: user.uid,
      authorName: user.displayName || 'Anonymous',
      title,
      description,
      prompt,
      category,
      likes: 0,
      createdAt: serverTimestamp(),
    });
  },

  saveGeneratedImage: async (prompt, base64Data, style) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    try {
      // 1. Upload to Storage
      const storageRef = ref(storage, `users/${targetUid}/generated_images/${Date.now()}.png`);
      await uploadString(storageRef, base64Data, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);

      // 2. Save metadata to Firestore
      const imagesRef = collection(db, 'users', targetUid, 'generated_images');
      await addDoc(imagesRef, {
        userId: targetUid,
        prompt,
        imageUrl: downloadUrl,
        style: style || 'default',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving generated image:", error);
      throw error;
    }
  },

  savePhotoEdit: async (originalBase64, editedBase64, operation) => {
    const user = auth.currentUser;
    if (!user) return;
    const targetUid = get().adminTargetUid || user.uid;

    try {
      // 1. Upload edited image to Storage
      const storageRef = ref(storage, `users/${targetUid}/photo_edits/${Date.now()}.png`);
      await uploadString(storageRef, editedBase64, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);

      // 2. Save metadata to Firestore
      const editsRef = collection(db, 'users', targetUid, 'photo_edits');
      await addDoc(editsRef, {
        userId: targetUid,
        originalImageUrl: originalBase64.length > 1000000 ? "Original too large for Firestore" : originalBase64, // Still risky, but focusing on the edited one
        editedImageUrl: downloadUrl,
        operation,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving photo edit:", error);
      throw error;
    }
  },

  setCurrentCode: (code) => {
    set({ currentCode: { ...get().currentCode, ...code } });
  },
}));
