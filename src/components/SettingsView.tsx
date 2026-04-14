import { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Palette, 
  Shield, 
  ChevronRight, 
  Monitor, 
  Globe, 
  Bell,
  Check,
  Moon,
  Sun,
  Type,
  LogOut
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type Section = 'general' | 'personalization' | 'appearance' | 'account';

export default function SettingsView() {
  const { userProfile, updateUserProfile } = useAppStore();
  const [activeSection, setActiveSection] = useState<Section>('general');
  const [localProfile, setLocalProfile] = useState(userProfile);

  useEffect(() => {
    setLocalProfile(userProfile);
  }, [userProfile]);

  const handleUpdate = async (updates: any) => {
    const newProfile = { ...localProfile, ...updates };
    setLocalProfile(newProfile);
    await updateUserProfile(updates);
  };

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'personalization', label: 'Personalization', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account', icon: Shield },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white overflow-hidden">
      <header className="h-14 border-b border-white/5 flex items-center px-6 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-200">Settings</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/5 p-4 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as Section)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all",
                activeSection === section.id 
                  ? "bg-white/10 text-white" 
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              )}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">General Settings</h2>
                    <div className="space-y-4">
                      <SettingItem 
                        label="Launch at login" 
                        description="Automatically start Lumina when you log in."
                        control={<Toggle enabled={true} onChange={() => {}} />}
                      />
                      <SettingItem 
                        label="Language" 
                        description="Choose your preferred interface language."
                        control={
                          <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-white/20">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                          </select>
                        }
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'personalization' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Personalization</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Display Name</label>
                        <input 
                          type="text"
                          value={localProfile?.displayName || ''}
                          onChange={(e) => handleUpdate({ displayName: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Age (Optional)</label>
                        <input 
                          type="number"
                          value={localProfile?.age || ''}
                          onChange={(e) => handleUpdate({ age: parseInt(e.target.value) })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        />
                      </div>
                      <SettingItem 
                        label="Personalized Greetings" 
                        description="Lumina will greet you based on the time of day."
                        control={<Toggle enabled={true} onChange={() => {}} />}
                      />
                      <div className="space-y-2 pt-4 border-t border-white/5">
                        <label className="text-sm font-medium text-gray-400">Custom AI Personality</label>
                        <p className="text-xs text-gray-500 mb-2">Define how Lumina should behave and respond.</p>
                        <textarea 
                          value={localProfile?.customSystemPrompt || ''}
                          onChange={(e) => handleUpdate({ customSystemPrompt: e.target.value })}
                          placeholder="e.g. You are a helpful assistant who speaks like a pirate..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-all min-h-[100px] resize-none"
                        />
                      </div>
                      <SettingItem 
                        label="Memory Mode" 
                        description="Lumina will remember your preferences and past interactions."
                        control={
                          <Toggle 
                            enabled={localProfile?.memoriesEnabled || false} 
                            onChange={() => { handleUpdate({ memoriesEnabled: !localProfile?.memoriesEnabled }); }} 
                          />
                        }
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'appearance' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Appearance</h2>
                    <div className="space-y-4">
                      <SettingItem 
                        label="Theme" 
                        description="Switch between light, dark, or system mode."
                        control={
                          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            <button 
                              onClick={() => useAppStore.getState().setTheme('light')}
                              className={cn("p-2 rounded-lg transition-all", useAppStore.getState().theme === 'light' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300")}
                              title="Light Mode"
                            >
                              <Sun className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => useAppStore.getState().setTheme('dark')}
                              className={cn("p-2 rounded-lg transition-all", useAppStore.getState().theme === 'dark' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300")}
                              title="Dark Mode"
                            >
                              <Moon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => useAppStore.getState().setTheme('system')}
                              className={cn("p-2 rounded-lg transition-all", useAppStore.getState().theme === 'system' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300")}
                              title="System Mode"
                            >
                              <Monitor className="w-4 h-4" />
                            </button>
                          </div>
                        }
                      />
                      <SettingItem 
                        label="Text Size" 
                        description="Adjust the font size of the interface."
                        control={
                          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                            {(['small', 'medium', 'large'] as const).map((size) => (
                              <button
                                key={size}
                                onClick={() => useAppStore.getState().setFontSize(size)}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                                  useAppStore.getState().fontSize === size ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                                )}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        }
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'account' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Account</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={userProfile?.photoURL || ''} 
                            className="w-12 h-12 rounded-full border border-white/10" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold">{userProfile?.displayName}</p>
                            <p className="text-xs text-gray-500">{userProfile?.email}</p>
                          </div>
                        </div>
                        <button 
                          onClick={async () => {
                            await auth.signOut();
                            localStorage.clear();
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 rounded-xl text-sm font-bold transition-all border border-white/5 hover:border-red-500/20"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>

                      <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                        <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
                        <p className="text-xs text-red-400/60 mt-1">Deleting your account will permanently remove all your data.</p>
                        <button className="mt-4 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingItem({ label, description, control }: { label: string; description: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      {control}
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button 
      onClick={onChange}
      className={cn(
        "w-10 h-5 rounded-full transition-all relative",
        enabled ? "bg-emerald-500" : "bg-white/10"
      )}
    >
      <div className={cn(
        "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
        enabled ? "right-1" : "left-1"
      )} />
    </button>
  );
}
