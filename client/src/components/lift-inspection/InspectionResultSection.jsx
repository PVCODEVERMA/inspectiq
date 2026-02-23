import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LiftFormSection } from './LiftFormSection';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const resultOptions = [
  {
    value: 'safe',
    label: 'Lift is SAFE for use',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
  },
  {
    value: 'safe_with_action',
    label: 'Lift is SAFE subject to recommended action',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
  },
  {
    value: 'not_safe',
    label: 'Lift is NOT SAFE for use',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  },
];

export const InspectionResultSection = ({
  formData,
  onChange,
}) => {
  return (
    <LiftFormSection title="11. Inspection Result" icon={CheckCircle}>
      <RadioGroup
        value={formData.inspectionResult}
        onValueChange={(value) => onChange('inspectionResult', value)}
        className="space-y-3"
      >
        {resultOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = formData.inspectionResult === option.value;

          return (
            <div
              key={option.value}
              className={cn(
                'flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer',
                isSelected ? option.bg : 'border-border hover:border-muted-foreground/30'
              )}
              onClick={() => onChange('inspectionResult', option.value)}
            >
              <RadioGroupItem value={option.value} id={`result-${option.value}`} />
              <Icon className={cn('w-5 h-5', option.color)} />
              <Label
                htmlFor={`result-${option.value}`}
                className={cn('cursor-pointer font-medium', isSelected && option.color)}
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </LiftFormSection>
  );
};
