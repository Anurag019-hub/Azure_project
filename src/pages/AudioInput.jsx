import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import FileUpload from '../components/ui/FileUpload';
import SubmitButton from '../components/common/SubmitButton';
import { uploadAudio } from '../services/api';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function AudioInput() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    /* ── Recording helpers ── */
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const recorded = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
                setFile(recorded);
                stream.getTracks().forEach((t) => t.stop());
            };

            mediaRecorder.start();
            setRecording(true);
        } catch {
            setStatus({ type: 'error', message: 'Microphone access denied. Please allow microphone permissions.' });
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        setStatus(null);

        try {
            const data = await uploadAudio(file);

            // ── Debug: inspect the raw API response ──
            console.group(`%c Audio API response`, 'color:#2dd4bf;font-weight:bold');
            console.log('Raw response:', data);
            console.log('Type:', typeof data);
            if (data?.synthesis !== undefined) console.log('response.synthesis:', data.synthesis);
            if (data?.content !== undefined) console.log('response.content:', data.content);
            if (data?.result !== undefined) console.log('response.result:', data.result);
            console.groupEnd();

            setFile(null);

            navigate('/audio/result', { state: { data } });
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
                    {/* Decorative waveform dots */}
                    <div className="absolute -left-8 top-0 flex flex-col gap-1.5 opacity-20">
                        {[3, 5, 4, 6, 3, 5].map((h, i) => (
                            <div key={i} className="w-1.5 rounded-full bg-cyan-400" style={{ height: `${h * 3}px` }} />
                        ))}
                    </div>

                    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-medium glass border-white/10">
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                        <span className="text-slate-400">Audio Processing</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-3">
                        <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-300 bg-clip-text text-transparent">
                            Audio Upload
                        </span>
                    </h1>
                    <p className="text-slate-400 leading-relaxed">
                        Upload an audio file or record directly from your microphone for AI-powered transcription.
                    </p>

                    {/* Decorative gradient line */}
                    <div className="mt-6 h-[2px] w-24 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full opacity-60" />
                </motion.div>

                {/* Upload area */}
                <motion.div variants={fadeUp}>
                    <FileUpload
                        accept="audio/*"
                        label="Choose an audio file"
                        icon="🎙️"
                        onFileSelect={setFile}
                    />
                </motion.div>

                {/* Or divider */}
                <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[11px] text-slate-500 uppercase tracking-[0.25em] font-heading font-medium px-3 py-1 rounded-full glass">or</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </motion.div>

                {/* Record button */}
                <motion.div variants={fadeUp}>
                    <button
                        type="button"
                        onClick={recording ? stopRecording : startRecording}
                        className={`mt-6 w-full relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-heading font-semibold transition-all duration-300 overflow-hidden
                            ${recording
                                ? 'glass text-red-400'
                                : 'glass glass-hover text-slate-300 hover:text-white'
                            }`}
                        style={recording ? { borderColor: 'rgba(239, 68, 68, 0.3)' } : undefined}
                    >
                        {/* Recording pulse rings */}
                        {recording && (
                            <>
                                <div className="absolute inset-0 rounded-2xl border border-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5" />
                            </>
                        )}

                        {recording ? (
                            <span className="relative flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                                </span>
                                Stop Recording
                            </span>
                        ) : (
                            <span className="relative flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                                Record from Microphone
                            </span>
                        )}
                    </button>
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
                                    ? 'glass text-emerald-400'
                                    : 'glass text-red-400'
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
                        label="Upload Audio"
                        loading={loading}
                        disabled={!file}
                        onClick={handleSubmit}
                    />
                </motion.div>
            </motion.div>
        </PageWrapper>
    );
}
