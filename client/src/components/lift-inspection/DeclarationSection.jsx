import React, { useRef, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LiftFormSection } from './LiftFormSection';
import { UserCheck, Pen, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import SignatureCanvas from 'react-signature-canvas';

export const DeclarationSection = ({
  formData,
  onChange,
}) => {
  const sigCanvas = useRef({});

  const clearSignature = () => {
    sigCanvas.current.clear();
    onChange('inspectorSignatureUrl', '');
  };

  const handleEnd = () => {
    const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    onChange('inspectorSignatureUrl', dataUrl);
  };

  return (
    <LiftFormSection title="12. Inspector's Declaration" icon={UserCheck}>
      <div className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-xl">
          <p className="text-sm text-muted-foreground leading-relaxed">
            I hereby certify that the above lift has been inspected in accordance with
            applicable codes, standards, and regulations. The observations and
            recommendations stated in this report are true and correct to the best of my
            knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Inspector Name</Label>
            <div className="p-3 bg-muted rounded-lg text-sm">
              {formData.inspectorName || 'Auto-filled from login'}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Declaration Date</Label>
            <div className="p-3 bg-muted rounded-lg text-sm">
              {formData.declarationDate ? format(new Date(formData.declarationDate), 'PPP') : 'N/A'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Digital Signature *</Label>
            <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
          <div className="border-2 border-dashed border-border rounded-xl p-2 bg-background">
            <SignatureCanvas
              ref={sigCanvas}
              penColor='black'
              canvasProps={{
                className: 'w-full h-40 cursor-crosshair touch-none',
                style: { width: '100%', height: '160px' }
              }}
              onEnd={handleEnd}
            />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Pen className="w-3 h-3" />
            Draw your signature above
          </p>
        </div>

        <div className="flex items-center space-x-3 p-4 border rounded-xl">
          <Checkbox
            id="declaration"
            checked={formData.inspectorDeclarationConfirmed}
            onCheckedChange={(checked) =>
              onChange('inspectorDeclarationConfirmed', !!checked)
            }
          />
          <Label htmlFor="declaration" className="cursor-pointer">
            I certify that the inspection details provided above are correct and accurate
          </Label>
        </div>
      </div>
    </LiftFormSection>
  );
};
