import { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Download, 
  Trash2, 
  Edit3, 
  Loader2, 
  Image as ImageIcon,
  Layers,
  Sun,
  Contrast,
  Maximize
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ai } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const OPERATIONS = [
  { id: 'remove-bg', label: 'Remove Background', icon: Layers, description: 'Automatically remove the background from your image.' },
  { id: 'upscale', label: 'Upscale', icon: Maximize, description: 'Enhance image quality and resolution.' },
  { id: 'cinematic', label: 'Cinematic Filter', icon: Sparkles, description: 'Apply a cinematic color grade.' },
  { id: 'hdr', label: 'HDR Effect', icon: Sun, description: 'Boost dynamic range and details.' },
];

export default function PhotoEditorView() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [currentOp, setCurrentOp] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { savePhotoEdit } = useAppStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setEditedImageUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async (operation: string) => {
    if (!selectedImage || isProcessing) return;

    setIsProcessing(true);
    setCurrentOp(operation);

    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      const prompt = `Perform ${operation} on this image. Return the edited image.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ],
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
        setEditedImageUrl(imageUrl);
        await savePhotoEdit(selectedImage, imageUrl, operation);
      }
    } catch (error) {
      console.error("Photo editing error:", error);
    } finally {
      setIsProcessing(false);
      setCurrentOp(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white overflow-y-auto custom-scrollbar">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">Photo Editor</span>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Controls */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">AI Editing Suite</h2>
            <p className="text-sm text-gray-500">Professional tools powered by Gemini.</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-white/10 rounded-3xl hover:border-white/20 hover:bg-white/5 transition-all group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Upload Photo</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </button>

            <div className="grid grid-cols-1 gap-2">
              {OPERATIONS.map((op) => (
                <button
                  key={op.id}
                  disabled={!selectedImage || isProcessing}
                  onClick={() => handleProcess(op.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                    !selectedImage 
                      ? "opacity-50 cursor-not-allowed border-white/5" 
                      : "border-white/5 hover:border-white/10 hover:bg-white/5"
                  )}
                >
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                    {isProcessing && currentOp === op.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    ) : (
                      <op.icon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{op.label}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{op.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-square lg:aspect-video rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden relative group">
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                >
                  <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-sm font-medium animate-pulse">Processing with AI...</p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {editedImageUrl || selectedImage ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img 
                  src={editedImageUrl || selectedImage!} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                
                {editedImageUrl && (
                  <div className="absolute bottom-6 right-6 flex gap-3">
                    <button 
                      onClick={() => {
                        setSelectedImage(null);
                        setEditedImageUrl(null);
                      }}
                      className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <a 
                      href={editedImageUrl} 
                      download="edited-photo.png"
                      className="px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 font-bold"
                    >
                      <Download className="w-5 h-5" />
                      Save Result
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-600">
                <ImageIcon className="w-16 h-16 opacity-10" />
                <p className="text-sm font-medium">Upload an image to start editing</p>
              </div>
            )}
          </div>

          {selectedImage && !editedImageUrl && (
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden">
                  <img src={selectedImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="text-xs text-gray-400">Ready for AI processing</span>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-xs text-red-400 hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
