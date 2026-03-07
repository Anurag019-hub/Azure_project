import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileUpload({ accept, label, icon, onFileSelect }) {
    const inputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (f) => {
        if (!f) return;
        setFile(f);
        onFileSelect?.(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const removeFile = (e) => {
        e.stopPropagation();
        setFile(null);
        onFileSelect?.(null);
    };

    return (
        <motion.div
            className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer glass overflow-hidden
                ${dragOver
                    ? 'border-primary-400 bg-primary-500/10 scale-[1.01]'
                    : 'border-white/10 hover:border-white/20'
                }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {/* Gradient accent on drag */}
            <AnimatePresence>
                {dragOver && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-accent/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
            />

            {/* Icon with gradient ring */}
            <div className="relative mx-auto mb-5 w-16 h-16">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-600/30 to-accent/20 animate-pulse-glow" />
                <div className="relative w-full h-full rounded-2xl bg-surface-900/80 backdrop-blur-sm flex items-center justify-center text-3xl border border-white/10">
                    {icon}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {file ? (
                    <motion.div
                        key="file-info"
                        className="space-y-2 relative z-10"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                    >
                        <p className="text-lg font-heading font-semibold text-white truncate max-w-xs mx-auto">
                            {file.name}
                        </p>
                        <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                        <button
                            type="button"
                            onClick={removeFile}
                            className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors mt-1 px-3 py-1 rounded-lg hover:bg-red-500/10"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Remove file
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="drop-prompt"
                        className="space-y-2 relative z-10"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                    >
                        <p className="text-lg font-medium text-slate-200 font-heading">{label}</p>
                        <p className="text-sm text-slate-500">
                            Drag & drop here or{' '}
                            <span className="text-primary-400 font-medium">click to browse</span>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative corners */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-primary-500/30 rounded-tl-md" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-primary-500/30 rounded-tr-md" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-accent/30 rounded-bl-md" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-accent/30 rounded-br-md" />
        </motion.div>
    );
}
