import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LiftFormSection } from './LiftFormSection';
import { Gauge } from 'lucide-react';

export const OperationalTestSection = ({
  formData,
  onChange,
}) => {
  return (
    <LiftFormSection title="8. Operational Test" icon={Gauge}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="font-medium">Leveling Accuracy</Label>
          <RadioGroup
            value={formData.levelingAccuracy}
            onValueChange={(value) => onChange('levelingAccuracy', value)}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="within_limits" id="leveling-within" />
              <Label htmlFor="leveling-within" className="cursor-pointer">
                Within Limits
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="out_of_tolerance" id="leveling-out" />
              <Label htmlFor="leveling-out" className="cursor-pointer">
                Out of Tolerance
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Noise / Vibration</Label>
          <RadioGroup
            value={formData.noiseVibration}
            onValueChange={(value) => onChange('noiseVibration', value)}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="noise-normal" />
              <Label htmlFor="noise-normal" className="cursor-pointer">
                Normal
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excessive" id="noise-excessive" />
              <Label htmlFor="noise-excessive" className="cursor-pointer">
                Excessive
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </LiftFormSection>
  );
};
