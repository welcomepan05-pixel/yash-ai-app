import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0d] text-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            Lumina AI
          </h1>
          <p className="text-gray-400 text-lg">Experience the next generation of conversation.</p>
        </div>

        <button
          onClick={handleLogin}
          className="group relative flex items-center justify-center w-full py-4 px-6 bg-white text-black font-semibold rounded-2xl transition-all hover:bg-gray-200 active:scale-[0.98]"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Continue with Google
        </button>

        <div className="pt-8 grid grid-cols-3 gap-4 opacity-30">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-1 bg-white rounded-full" />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
