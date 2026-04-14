import { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Play, 
  RotateCcw, 
  Copy, 
  Download, 
  Check, 
  Maximize2, 
  Minimize2,
  Terminal,
  Eye,
  Layout,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

export default function CodePreviewView() {
  const { currentCode, setCurrentCode } = useAppStore();
  const [html, setHtml] = useState(currentCode.html || '<!-- HTML -->\n<div class="container">\n  <h1>Hello Lumina!</h1>\n  <p>Start coding to see magic happen.</p>\n  <button id="btn">Click Me</button>\n</div>');
  const [css, setCss] = useState(currentCode.css || '/* CSS */\nbody {\n  background: #0f172a;\n  color: white;\n  font-family: system-ui, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n\n.container {\n  text-align: center;\n  padding: 2rem;\n  background: rgba(255,255,255,0.05);\n  border-radius: 1rem;\n  border: 1px solid rgba(255,255,255,0.1);\n}\n\nbutton {\n  background: #8b5cf6;\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 0.5rem;\n  cursor: pointer;\n  margin-top: 1rem;\n}');
  const [js, setJs] = useState(currentCode.js || '// JavaScript\ndocument.getElementById("btn").addEventListener("click", () => {\n  alert("Lumina says hi!");\n});');
  
  const [srcDoc, setSrcDoc] = useState('');
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConsole, setShowConsole] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <style>${css}</style>
          <body>
            ${html}
            <script>
              try {
                ${js}
              } catch (err) {
                console.error(err);
              }
            </script>
          </body>
        </html>
      `);
    }, 500);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleCopy = () => {
    const fullCode = `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JS\n${js}`;
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lumina-preview.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white overflow-hidden">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Code2 className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-200">Code Lab</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Real-time Preview</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            Copy All
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export HTML
          </button>
        </div>
      </header>

      <div ref={containerRef} className="flex-1 flex relative overflow-hidden">
        {/* Editor Side */}
        <div 
          style={{ width: `${leftWidth}%` }}
          className="flex flex-col border-r border-white/10 bg-[#0d0d0d]"
        >
          <div className="flex items-center bg-white/[0.02] border-b border-white/5 px-2">
            {(['html', 'css', 'js'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                  activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTabCode" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 relative">
            <textarea
              value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
              onChange={(e) => {
                const val = e.target.value;
                if (activeTab === 'html') setHtml(val);
                else if (activeTab === 'css') setCss(val);
                else setJs(val);
              }}
              spellCheck={false}
              className="w-full h-full bg-transparent p-6 text-sm font-mono outline-none resize-none custom-scrollbar leading-relaxed text-gray-300 focus:text-white transition-colors"
              placeholder={`Write your ${activeTab.toUpperCase()} here...`}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <div className="px-2 py-1 rounded bg-white/5 text-[10px] text-gray-500 font-mono border border-white/5">
                {activeTab.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div 
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute top-0 bottom-0 w-1 cursor-col-resize z-20 hover:bg-blue-500/50 transition-colors",
            isResizing && "bg-blue-500"
          )}
          style={{ left: `calc(${leftWidth}% - 0.5px)` }}
        />

        {/* Preview Side */}
        <div 
          style={{ width: `${100 - leftWidth}%` }}
          className="flex flex-col bg-white"
        >
          <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Preview</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 font-medium">Syncing</span>
              </div>
            </div>
          </div>
          <iframe
            srcDoc={srcDoc}
            title="preview"
            sandbox="allow-scripts"
            className="flex-1 w-full border-none bg-white"
          />
          
          {/* Console Overlay (Optional) */}
          <AnimatePresence>
            {showConsole && (
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="absolute bottom-0 left-0 right-0 h-48 bg-[#1a1a1a] border-t border-white/10 z-30"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Console</span>
                  </div>
                  <button onClick={() => setShowConsole(false)} className="text-gray-500 hover:text-white">
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4 font-mono text-xs text-gray-400 overflow-y-auto h-full custom-scrollbar">
                  <p className="text-emerald-500/80">&gt; Lumina Code Lab initialized.</p>
                  <p className="text-gray-600 mt-1">&gt; Ready for input...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showConsole && (
            <button 
              onClick={() => setShowConsole(true)}
              className="absolute bottom-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-xl text-gray-400 hover:text-white transition-all border border-white/10"
            >
              <Terminal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
