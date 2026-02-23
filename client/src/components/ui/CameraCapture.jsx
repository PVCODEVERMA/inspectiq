import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * CameraCapture
 * Opens the device camera via getUserMedia, lets the user take a photo,
 * and returns the result as a base64 data URL via onCapture().
 *
 * Props:
 *   open       – boolean, whether the camera overlay is visible
 *   onClose    – () => void
 *   onCapture  – (dataUrl: string) => void
 */
const CameraCapture = ({ open, onClose, onCapture, title = "PIC" }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [facingMode, setFacingMode] = useState('environment'); // rear camera first
    const [error, setError] = useState('');
    const [capturedImage, setCapturedImage] = useState(null);
    const [imageName, setImageName] = useState('');

    const startCamera = async (mode) => {
        // Stop any existing stream first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setError('Camera access denied. Please allow camera permission and try again.');
        }
    };

    useEffect(() => {
        if (open && !capturedImage) {
            startCamera(facingMode);
        } else {
            // Stop stream when closed or when previewing
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
        }
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, [open, capturedImage]);

    const flipCamera = () => {
        const next = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(next);
        startCamera(next);
    };

    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedImage(dataUrl);

        // Stop the stream immediately
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    const handleSave = () => {
        // Return object with photo and user-provided name
        onCapture({ url: capturedImage, name: imageName || title });
        resetAndClose();
    };

    const resetAndClose = () => {
        setCapturedImage(null);
        setImageName('');
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80 safe-area-top border-b border-white/10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={resetAndClose}
                >
                    <X className="w-6 h-6" />
                </Button>
                <span className="text-white font-semibold text-sm tracking-wide uppercase">
                    {capturedImage ? "Review Photo" : title}
                </span>
                {!capturedImage && !error ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={flipCamera}
                        title="Flip camera"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </Button>
                ) : (
                    <div className="w-10" />
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden bg-black flex flex-col">
                {capturedImage ? (
                    /* Review Mode */
                    <div className="absolute inset-0 flex flex-col">
                        <div className="flex-1 relative bg-black flex items-center justify-center">
                            <img src={capturedImage} alt="Capture" className="max-w-full max-h-full object-contain" />
                        </div>

                        {/* Naming Input Section */}
                        <div className="bg-black/90 p-6 space-y-4 pb-12 border-t border-white/10">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Photo Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Enter photo name (e.g. Plate Side A)"
                                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                                    value={imageName}
                                    onChange={(e) => setImageName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="border-[#EE2F34] text-[#EE2F34] hover:bg-[#020001] h-12 rounded-xl"
                                    onClick={() => setCapturedImage(null)}
                                >
                                    Retake
                                </Button>
                                <Button
                                    className="bg-white text-black hover:bg-slate-200 h-12 rounded-xl"
                                    onClick={handleSave}
                                >
                                    Save Photo
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Live View Mode */
                    <>
                        {error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                                <Camera className="w-12 h-12 text-red-400 mb-4" />
                                <p className="text-white text-sm">{error}</p>
                                <Button
                                    className="mt-4"
                                    onClick={() => startCamera(facingMode)}
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        )}

                        {/* Corner guides */}
                        {!error && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-white/50 rounded-tl-xl" />
                                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/50 rounded-tr-xl" />
                                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-white/50 rounded-bl-xl" />
                                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-white/50 rounded-br-xl" />
                            </div>
                        )}

                        {/* Shutter button overlay for live view */}
                        {!error && (
                            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center">
                                <button
                                    onClick={takePhoto}
                                    className="w-20 h-20 rounded-full bg-white/10 border-4 border-white shadow-2xl active:scale-95 transition-transform flex items-center justify-center group"
                                    aria-label="Take photo"
                                >
                                    <div className="w-14 h-14 rounded-full bg-white group-hover:bg-slate-100 transition-colors" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Hidden canvas for snapshot */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default CameraCapture;
