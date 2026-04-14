import { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  StickyNote as StickyNoteIcon, 
  Calendar,
  Clock,
  Check,
  X,
  Palette
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function ProductivityView() {
  const { tasks, addTask, toggleTask, deleteTask, stickyNotes, addStickyNote, updateStickyNote, deleteStickyNote } = useAppStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-yellow-500/20');

  const colors = [
    'bg-yellow-500/20',
    'bg-blue-500/20',
    'bg-purple-500/20',
    'bg-emerald-500/20',
    'bg-pink-500/20'
  ];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle);
    setNewTaskTitle('');
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    addStickyNote(newNoteContent, selectedColor);
    setNewNoteContent('');
    setShowNoteForm(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d0d] text-white overflow-hidden">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <CheckSquare className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-200">Productivity</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Tasks & Notes</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Tasks Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-orange-400" />
                Task Tracker
              </h2>
              <span className="text-xs text-gray-500">{tasks.filter(t => !t.completed).length} pending</span>
            </div>

            <form onSubmit={handleAddTask} className="relative">
              <input 
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new task..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {tasks.map(task => (
                  <motion.div 
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-xl border transition-all",
                      task.completed 
                        ? "bg-white/[0.02] border-white/5 opacity-50" 
                        : "bg-white/5 border-white/10 hover:border-orange-500/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                          "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                          task.completed 
                            ? "bg-orange-500 border-orange-500 text-white" 
                            : "border-white/20 hover:border-orange-500"
                        )}
                      >
                        {task.completed && <Check className="w-3 h-3" />}
                      </button>
                      <span className={cn("text-sm", task.completed && "line-through text-gray-500")}>
                        {task.title}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Sticky Notes Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <StickyNoteIcon className="w-5 h-5 text-yellow-400" />
                Sticky Notes
              </h2>
              <button 
                onClick={() => setShowNoteForm(true)}
                className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {showNoteForm && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn("p-4 rounded-2xl border border-white/10 space-y-4", selectedColor)}
                  >
                    <textarea 
                      autoFocus
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Write a note..."
                      className="w-full bg-transparent text-sm outline-none resize-none h-24 placeholder:text-white/30"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {colors.map(c => (
                          <button 
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className={cn("w-4 h-4 rounded-full border border-white/10", c, selectedColor === c && "ring-2 ring-white")}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowNoteForm(false)} className="p-1 text-white/50 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={handleAddNote} className="p-1 text-white hover:scale-110 transition-all">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {stickyNotes.map(note => (
                <motion.div 
                  key={note.id}
                  layout
                  className={cn("p-4 rounded-2xl border border-white/10 group relative min-h-[120px]", note.color)}
                >
                  <p className="text-sm text-white/90 whitespace-pre-wrap">{note.content}</p>
                  <button 
                    onClick={() => deleteStickyNote(note.id)}
                    className="absolute top-2 right-2 p-1.5 text-white/20 group-hover:text-white/60 hover:!text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-2 right-2 text-[10px] text-white/30">
                    {note.createdAt?.toDate ? format(note.createdAt.toDate(), 'MMM d') : ''}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
