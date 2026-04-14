import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'motion/react';
import { User, Sparkles, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const { updateUserProfile, userProfile } = useAppStore();
  const [name, setName] = useState(userProfile?.displayName || '');
  const [age, setAge] = useState('');
  const [step, setStep] = useState(1);

  const handleComplete = async () => {
    if (!name || !age) return;
    await updateUserProfile({
      displayName: name,
      age: parseInt(age),
      onboarded: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d0d] p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Lumina</h1>
          <p className="text-gray-500">Let's personalize your AI experience.</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
          {step === 1 ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">What should I call you?</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={() => name && setStep(2)}
                disabled={!name}
                className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">How old are you?</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <p className="text-[10px] text-gray-600">This helps me tailor my responses to you.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 text-white py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!age}
                  className="flex-[2] bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
