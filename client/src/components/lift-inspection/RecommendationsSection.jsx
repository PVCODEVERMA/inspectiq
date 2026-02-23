import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LiftFormSection } from './LiftFormSection';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ClipboardList, Calendar } from 'lucide-react';

export const RecommendationsSection = ({
  formData,
  onChange,
}) => {
  return (
    <LiftFormSection title="10. Recommendations" icon={ClipboardList}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recommendations">Recommended Actions</Label>
          <Textarea
            id="recommendations"
            value={formData.recommendations || ''}
            onChange={(e) => onChange('recommendations', e.target.value)}
            placeholder="Enter recommendations for corrective actions..."
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="space-y-2 flex flex-col">
          <Label>Corrective Action Completion Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full md:w-[280px] justify-start text-left font-normal',
                  !formData.correctiveActionDate && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {formData.correctiveActionDate
                  ? format(new Date(formData.correctiveActionDate), 'PPP')
                  : 'Select completion date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.correctiveActionDate ? new Date(formData.correctiveActionDate) : null}
                onSelect={(date) => onChange('correctiveActionDate', date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </LiftFormSection>
  );
};
