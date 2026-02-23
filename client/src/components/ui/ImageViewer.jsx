import React, { useState, useEffect } from 'react';
import { X, Pencil, Check, RotateCw } from 'lucide-react';
import { Button } from './button';

const ImageViewer = ({ open, image, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');

    useEffect(() => {
        if (image) {
            setEditedName(image.name || '');
        }
        setIsEditing(false);
    }, [image, open]);

    if (!open || !image) return null;

    const handleSave = (e) => {
        e.stopPropagation();
        if (onUpdate) {
            onUpdate(editedName);
        }
        setIsEditing(false);
    };

    return (
        <div
            className="fixed inset-0 z-[300] bg-black/95 flex flex-col backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 bg-black/40 border-b border-white/10 z-10 transition-colors">
                <div className="flex flex-1 items-center gap-3">
                    {isEditing ? (
                        <div className="flex items-center gap-2 w-full max-w-md" onClick={e => e.stopPropagation()}>
                            <input
                                autoFocus
                                type="text"
                                className="bg-slate-900 border border-primary/50 text-white rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave(e);
                                    if (e.key === 'Escape') setIsEditing(false);
                                }}
                            />
                            <Button size="icon" className="h-8 w-8 bg-primary hover:bg-primary/80" onClick={handleSave}>
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setIsEditing(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm uppercase tracking-wider">Photo View</span>
                                <span className="text-slate-400 text-[10px] font-medium">{image.name || "Untitled Photo"}</span>
                            </div>
                            <Pencil className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>

            {/* Image Area */}
            <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
                <img
                    src={image.url}
                    alt={image.name}
                    className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Footer / Info */}
            <div className="p-6 bg-gradient-to-t from-black to-transparent text-center">
                <p className="text-slate-400 text-xs italic">Tap anywhere outside to close • Click title to edit name</p>
            </div>
        </div>
    );
};

export default ImageViewer;
