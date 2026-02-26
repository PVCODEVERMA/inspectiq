import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export const useVoiceSearch = (onTranscript) => {
    const [isListening, setIsListening] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const recognitionRef = useRef(null);

    const translateToEnglish = async (text) => {
        if (!text || !/[^\x00-\x7F]/.test(text)) return text; // If purely English-like, skip translation

        try {
            setIsTranslating(true);
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=hi|en`);
            const data = await response.json();
            setIsTranslating(false);

            if (data.responseData && data.responseData.translatedText) {
                return data.responseData.translatedText;
            }
            return text;
        } catch (error) {
            console.error('Translation error:', error);
            setIsTranslating(false);
            return text;
        }
    };

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
        recognition.lang = 'hi-IN'; // Default to Hindi to capture it accurately

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);

            // Always translate to English as requested
            const translatedText = await translateToEnglish(transcript);

            if (onTranscript) {
                onTranscript(translatedText);
            }
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

    const startListening = useCallback((lang = 'hi-IN') => {
        if (!recognitionRef.current) {
            toast.error('Voice search is not supported in your browser.');
            return;
        }

        try {
            recognitionRef.current.lang = lang;
            recognitionRef.current.start();
        } catch (error) {
            console.error('Recognition start error:', error);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const toggleListening = useCallback((lang = 'hi-IN') => {
        if (isListening) {
            stopListening();
        } else {
            startListening(lang);
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        isTranslating,
        startListening,
        stopListening,
        toggleListening,
        isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    };
};
