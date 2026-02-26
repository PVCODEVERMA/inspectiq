import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export const useVoiceSearch = (onTranscript) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Web Speech API is not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        // Support English (India) and Hindi (India)
        recognition.lang = 'en-IN'; // Default to English, can be toggled if needed

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (onTranscript) {
                onTranscript(transcript);
            }
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);

            if (event.error === 'not-allowed') {
                toast.error('Microphone access denied. Please enable it in browser settings.');
            } else if (event.error === 'network') {
                toast.error('Network error occurred during speech recognition.');
            } else {
                toast.error(`Error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onTranscript]);

    const startListening = useCallback((lang = 'en-IN') => {
        if (!recognitionRef.current) {
            toast.error('Voice search is not supported in your browser.');
            return;
        }

        try {
            recognitionRef.current.lang = lang;
            recognitionRef.current.start();
        } catch (error) {
            console.error('Recognition start error:', error);
            // If already started, just ignore
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const toggleListening = useCallback((lang = 'en-IN') => {
        if (isListening) {
            stopListening();
        } else {
            startListening(lang);
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        startListening,
        stopListening,
        toggleListening,
        isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    };
};
