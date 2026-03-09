import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import SubmitButton from '../components/common/SubmitButton';
import CameraCapture from '../components/camera/CameraCapture';
import { uploadPdf, uploadImageFromCamera } from '../services/api';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const TABS = [
    { id: 'pdf', label: 'PDF', icon: PdfIcon },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'camera', label: 'Camera', icon: CameraIcon },
];

export default function PdfInput() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pdf');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const pdfInputRef = useRef(null);
    const imageInputRef = useRef(null);


    /* ── File selection ── */
    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setStatus(null);
        if (selected.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(selected));
        } else {
            setPreview(null);
        }
    };

    const clearFile = () => {
        setFile(null);
        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview(null);
        }
        setStatus(null);
        [pdfInputRef, imageInputRef].forEach((ref) => {
            if (ref.current) ref.current.value = '';
        });
    };

    const switchTab = (id) => {
        clearFile();
        setActiveTab(id);
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        setStatus(null);

        try {
            // Route to the correct API based on active tab
            const apiFn = activeTab === 'pdf' ? uploadPdf : uploadImageFromCamera;
            const data = await apiFn(file);

            // ── Debug: inspect the raw API response ──
            console.group(`%c Image API response [tab: ${activeTab}]`, 'color:#818cf8;font-weight:bold');
            console.log('Raw response:', data);
            console.log('Type:', typeof data);
            if (data?.synthesis !== undefined) console.log('response.synthesis:', data.synthesis);
            if (data?.content !== undefined) console.log('response.content:', data.content);
            console.groupEnd();
            clearFile();

            // Navigate to results page passing the full API response object
            navigate('/pdf/result', { state: { data } });
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Upload failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <motion.div
                className="max-w-xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
                {/* Header */}
                <motion.div variants={fadeUp} className="mb-10 relative">
                    <div className="absolute -left-8 top-0 flex flex-col gap-1.5 opacity-20">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        ))}
                    </div>

                    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-medium glass border-white/10">
                        <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="text-slate-400">Document Processing</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-3">
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-300 bg-clip-text text-transparent">
                            Upload Document
                        </span>
                    </h1>
                    <p className="text-slate-400 leading-relaxed">
                        Upload a PDF, image, or capture a photo for AI-powered analysis.
                    </p>

                    <div className="mt-6 h-[2px] w-24 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full opacity-60" />
                </motion.div>

                {/* ── Tab selector ── */}
                <motion.div variants={fadeUp} className="mb-6">
                    <div className="flex rounded-xl glass p-1 gap-1">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => switchTab(id)}
                                className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                                    ${activeTab === id ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                {activeTab === id && (
                                    <motion.div
                                        layoutId="input-tab"
                                        className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.06]"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon />
                                    <span className="hidden sm:inline">{label}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Hidden file inputs */}
                <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileChange} />
                <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />

                {/* ── Main content area ── */}
                <motion.div variants={fadeUp}>
                    <AnimatePresence mode="wait">
                        {/* ═══════ PDF / Image tabs: no file selected ═══════ */}
                        {(activeTab === 'pdf' || activeTab === 'image') && !file && (
                            <motion.button
                                key="dropzone"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.25 }}
                                onClick={() => (activeTab === 'pdf' ? pdfInputRef : imageInputRef).current?.click()}
                                className="w-full rounded-2xl glass p-10 sm:p-14 flex flex-col items-center justify-center gap-4 text-center cursor-pointer border border-dashed border-white/10 hover:border-violet-500/40 transition-colors duration-300 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600/20 to-primary-400/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ring-2 ring-primary-500/20">
                                    {activeTab === 'pdf' ? <PdfIcon className="w-6 h-6 text-violet-400" /> : <ImageIcon className="w-6 h-6 text-violet-400" />}
                                </div>
                                <div>
                                    <p className="text-slate-300 font-medium mb-1">
                                        {activeTab === 'pdf' ? 'Click to select a PDF' : 'Click to select an image'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {activeTab === 'pdf' ? 'PDF files only' : 'JPG, JPEG, PNG'}
                                    </p>
                                </div>
                            </motion.button>
                        )}

                        {/* ═══════ Camera tab: live viewfinder ═══════ */}
                        {activeTab === 'camera' && !file && (
                            <motion.div
                                key="camera-zone"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.25 }}
                            >
                                <CameraCapture
                                    onCapture={(capturedFile, blob) => {
                                        setFile(capturedFile);
                                        setPreview(URL.createObjectURL(blob));
                                    }}
                                    onCancel={() => setActiveTab('pdf')}
                                />
                            </motion.div>
                        )}

                        {/* ═══════ File selected: preview card ═══════ */}
                        {file && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.25 }}
                                className="rounded-2xl glass p-6"
                            >
                                {/* Image preview */}
                                {preview && (
                                    <div className="mb-5 rounded-xl overflow-hidden border border-white/[0.06]">
                                        <img src={preview} alt="Preview" className="w-full max-h-72 object-contain bg-black/20" />
                                    </div>
                                )}

                                {/* File info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600/20 to-primary-400/20 flex items-center justify-center shrink-0 ring-2 ring-primary-500/20">
                                        {file.type === 'application/pdf'
                                            ? <PdfIcon className="w-5 h-5 text-violet-400" />
                                            : <ImageIcon className="w-5 h-5 text-violet-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                                        <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                                    </div>
                                    <button
                                        onClick={() => { clearFile(); if (activeTab === 'camera') setCameraActive(false); }}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center glass text-slate-400 hover:text-red-400 hover:border-red-500/20 transition-colors"
                                        title="Remove file"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Status message */}
                <AnimatePresence>
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`mt-6 px-5 py-4 rounded-xl text-sm font-medium flex items-center gap-3
                                ${status.type === 'success'
                                    ? 'glass border-emerald-500/20 text-emerald-400'
                                    : 'glass border-red-500/20 text-red-400'
                                }`}
                            style={{
                                borderColor: status.type === 'success'
                                    ? 'rgba(16, 185, 129, 0.2)'
                                    : 'rgba(239, 68, 68, 0.2)',
                            }}
                        >
                            {status.type === 'success' ? (
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            )}
                            {status.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit */}
                <motion.div variants={fadeUp} className="mt-8 flex justify-end">
                    <SubmitButton
                        label={file?.type === 'application/pdf' ? 'Upload PDF' : 'Upload Image'}
                        loading={loading}
                        disabled={!file}
                        onClick={handleSubmit}
                    />
                </motion.div>
            </motion.div>
        </PageWrapper>
    );
}

/* ─────────────────────── Utilities ─────────────────────── */

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─────────────────────── Icons ─────────────────────── */

function PdfIcon({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    );
}

function ImageIcon({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zm16.5-13.5h.008v.008h-.008V7.5zm0 0A.375.375 0 1020.625 7.5a.375.375 0 00-.375 0z" />
        </svg>
    );
}

function CameraIcon({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
    );
}
