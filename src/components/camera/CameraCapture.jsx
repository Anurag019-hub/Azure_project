import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CameraCapture — fully self-contained camera component.
 *
 * Props:
 *   onCapture(file: File)  → called when the user captures a photo
 *   onCancel()             → called when the user clicks cancel
 */
export default function CameraCapture({ onCapture, onCancel }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [facingMode, setFacingMode] = useState('environment');
    const [flashAction, setFlashAction] = useState(false);

    /* ── Stop all tracks and clear video element ── */
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraReady(false);
    };

    /* ── Start camera ── */
    const startCamera = async (mode = facingMode) => {
        setCameraError(null);
        setCameraReady(false);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode },
                audio: false,
            });

            const video = videoRef.current;
            if (!video) {
                stream.getTracks().forEach(t => t.stop());
                return;
            }

            streamRef.current = stream;

            video.srcObject = stream;

            await video.play();

            setCameraReady(true);

        } catch (err) {
            console.error('Camera init error:', err);
            let msg = 'Unable to access camera.';
            if (err.name === 'NotAllowedError') msg = 'Camera permission denied. Please allow access in browser settings.';
            else if (err.name === 'NotFoundError') msg = 'No camera found on this device.';
            else if (err.name === 'NotReadableError') msg = 'Camera is already in use by another application.';
            setCameraError(msg);
            setCameraReady(false);
        }
    };

    /* ── Flip front ↔ rear ── */
    const toggleCamera = (e) => {
        e.stopPropagation();
        const newMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newMode);
        stopCamera();
        setTimeout(() => startCamera(newMode), 200);
    };

    /* ── Capture current frame ── */
    const captureImage = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            setCameraError('Camera not ready. Please wait a moment and try again.');
            return;
        }

        try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) throw new Error('Failed to get canvas 2D context');

            // Mirror front-camera capture to match preview
            if (facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    setCameraError('Failed to convert capture to an image. Please try again.');
                    return;
                }

                const captured = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });

                // Flash animation then pass captured file up
                setFlashAction(true);
                setTimeout(() => setFlashAction(false), 200);

                setTimeout(() => {
                    stopCamera();
                    onCapture(captured, blob);
                }, 150);

            }, 'image/png', 0.95);

        } catch (err) {
            console.error('Capture error:', err);
            setCameraError('Failed to capture image: ' + err.message);
        }
    };

    /* ── Handle cancel ── */
    const handleCancel = () => {
        stopCamera();
        if (onCancel) onCancel();
    };

    /* ── Lifecycle: start on mount, stop on unmount ── */
    useEffect(() => {
        startCamera();
        return () => stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ═══════════════════════ Render ═══════════════════════ */
    return (
        <div className="rounded-2xl glass overflow-hidden">

            {/* ── Error state ── */}
            {cameraError && (
                <div className="p-10 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center ring-2 ring-red-500/20">
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="text-red-400 text-sm mb-4">{cameraError}</p>
                    <button
                        onClick={() => { setCameraError(null); startCamera(); }}
                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* ── Live viewfinder (always mounted so videoRef is never null) ── */}
            <div className="relative bg-black rounded-b-2xl overflow-hidden">

                {/* Visual capture flash */}
                <AnimatePresence>
                    {flashAction && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-white z-20 pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                {/* Video feed — always in DOM */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full aspect-video object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
                />

                {/* Loading spinner while camera warms up */}
                {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-primary-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                )}

                {/* Viewfinder overlay */}
                <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${cameraReady ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-violet-400/80 rounded-tl-xl shadow-[inset_2px_2px_10px_rgba(139,92,246,0.2)]" />
                    <div className="absolute top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-violet-400/80 rounded-tr-xl shadow-[inset_-2px_2px_10px_rgba(139,92,246,0.2)]" />
                    <div className="absolute bottom-20 left-4 w-10 h-10 border-l-2 border-b-2 border-violet-400/80 rounded-bl-xl shadow-[inset_2px_-2px_10px_rgba(139,92,246,0.2)]" />
                    <div className="absolute bottom-20 right-4 w-10 h-10 border-r-2 border-b-2 border-violet-400/80 rounded-br-xl shadow-[inset_-2px_-2px_10px_rgba(139,92,246,0.2)]" />
                    {/* Crosshair */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-40">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/50" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/50" />
                    </div>
                </div>

                {/* Control bar */}
                <div className="absolute bottom-0 inset-x-0 h-24 flex items-center justify-between px-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    {/* Cancel */}
                    <button
                        onClick={handleCancel}
                        className="w-12 h-12 rounded-full glass flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Cancel"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Capture button */}
                    <button
                        onClick={captureImage}
                        disabled={!cameraReady}
                        className={`w-16 h-16 rounded-full bg-white flex items-center justify-center transition-all duration-200 ring-4 ring-white/20
                            ${cameraReady ? 'hover:scale-105 active:scale-95 hover:bg-slate-100 shadow-glow-md' : 'opacity-50 cursor-not-allowed'}
                        `}
                        title="Capture Frame"
                    >
                        <div className={`w-12 h-12 rounded-full border-[3px] border-slate-900 ${!cameraReady && 'opacity-50'}`} />
                    </button>

                    {/* Flip camera */}
                    <button
                        onClick={toggleCamera}
                        disabled={!cameraReady}
                        className={`w-12 h-12 rounded-full glass flex items-center justify-center text-slate-300 transition-colors
                            ${cameraReady ? 'hover:text-white hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}
                        `}
                        title="Flip Camera"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Off-screen canvas — used for frame capture */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
