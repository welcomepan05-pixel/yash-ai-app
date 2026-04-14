import { useState } from 'react';
import { Sparkles, Download, Wand2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ai } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const STYLES = [
  { id: 'default', label: 'Default', icon: Sparkles },
  { id: 'realistic', label: 'Realistic', icon: ImageIcon },
  { id: 'anime', label: 'Anime', icon: Wand2 },
  { id: 'cinematic', label: 'Cinematic', icon: ImageIcon },
  { id: '3d', label: '3D Render', icon: ImageIcon },
];

export default function ImageGenView() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const { saveGeneratedImage } = useAppStore();

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      const fullPrompt = selectedStyle === 'default' ? prompt : `${prompt} in ${selectedStyle} style`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
      });

      let imageUrl = null;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setGeneratedImageUrl(imageUrl);
        await saveGeneratedImage(prompt, imageUrl, selectedStyle);
      }
    } catch (error) {
      console.error("Image generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white overflow-y-auto custom-scrollbar">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-200">Image Generator</span>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full p-8 space-y-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create something amazing.</h2>
            <p className="text-gray-500">Describe the image you want to generate with AI.</p>
          </div>

          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with neon lights and flying cars..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-6 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none min-h-[120px] text-lg"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={cn(
                "absolute right-4 bottom-4 p-3 rounded-xl transition-all",
                prompt.trim() && !isGenerating ? "bg-white text-black hover:bg-gray-200" : "bg-white/5 text-gray-600 cursor-not-allowed"
              )}
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            </button>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Style Presets</span>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                    selectedStyle === style.id 
                      ? "bg-white/10 border-white/20 text-white" 
                      : "bg-transparent border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"
                  )}
                >
                  <style.icon className="w-3.5 h-3.5" />
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-[400px] rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-center relative overflow-hidden group">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-500 animate-pulse">Dreaming up your image...</p>
              </motion.div>
            ) : generatedImageUrl ? (
              <motion.div 
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full"
              >
                <img 
                  src={generatedImageUrl} 
                  alt="Generated" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a 
                    href={generatedImageUrl} 
                    download="generated-image.png"
                    className="p-4 bg-white text-black rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-2 font-semibold"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-gray-600">
                <ImageIcon className="w-12 h-12 opacity-20" />
                <p className="text-sm">Your masterpiece will appear here</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
