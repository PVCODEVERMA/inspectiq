import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LiftFormSection } from './LiftFormSection';
import { MessageSquare, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

export const ObservationsSection = ({
  formData,
  onChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceToText = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recognition is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    if (!isRecording) {
      recognition.start();
      setIsRecording(true);
      toast.info('Listening... Speak now');

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        onChange('observations', (formData.observations || '') + ' ' + transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        toast.error('Voice recognition error');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      // Auto stop after 30 seconds
      setTimeout(() => {
        recognition.stop();
        setIsRecording(false);
      }, 30000);
    }
  };

  return (
    <LiftFormSection title="9. Observations" icon={MessageSquare}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="observations">Inspection Observations</Label>
          <Button
            type="button"
            variant={isRecording ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleVoiceToText}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </> ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Voice to Text
              </>
            )}
          </Button>
        </div>
        <Textarea
          id="observations"
          value={formData.observations || ''}
          onChange={(e) => onChange('observations', e.target.value)}
          placeholder="Enter detailed observations from the inspection..."
          rows={6}
          className="resize-none"
        />
      </div>
    </LiftFormSection>
  );
};
