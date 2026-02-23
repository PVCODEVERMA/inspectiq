import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LiftFormSection } from './LiftFormSection';
import { Settings } from 'lucide-react';

const inspectionTypeOptions = ['Periodic', 'Initial', 'Major Repair', 'Annual'];
const referralCodeOptions = ['IS 15259', 'Factories Act 1948', 'EN 81-31', 'ASME B20.1'];
const liftTypeOptions = ['Passenger', 'Goods', 'Service', 'Hospital'];
const driveSystemOptions = ['Traction', 'MRL', 'Hydraulic'];
const controlSystemOptions = ['VVVF', 'AC', 'DC'];

export const LiftParticularsSection = ({
  formData,
  onChange,
}) => {
  const handleCheckboxChange = (field, value, checked) => {
    const currentValues = formData[field] || [];
    if (checked) {
      onChange(field, [...currentValues, value]);
    } else {
      onChange(field, currentValues.filter((v) => v !== value));
    }
  };

  return (
    <LiftFormSection title="2. Lift Particulars" icon={Settings}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="liftIdentificationNo">Lift Identification No. *</Label>
          <Input
            id="liftIdentificationNo"
            value={formData.liftIdentificationNo || ''}
            onChange={(e) => onChange('liftIdentificationNo', e.target.value)}
            placeholder="Enter lift ID"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            id="manufacturer"
            value={formData.manufacturer || ''}
            onChange={(e) => onChange('manufacturer', e.target.value)}
            placeholder="Enter manufacturer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearOfInstallation">Year of Installation</Label>
          <Input
            id="yearOfInstallation"
            type="number"
            value={formData.yearOfInstallation || ''}
            onChange={(e) => onChange('yearOfInstallation', e.target.value ? parseInt(e.target.value) : "")}
            placeholder="YYYY"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ratedLoadKg">Rated Load (kg)</Label>
          <Input
            id="ratedLoadKg"
            type="number"
            value={formData.ratedLoadKg || ''}
            onChange={(e) => onChange('ratedLoadKg', e.target.value ? parseFloat(e.target.value) : "")}
            placeholder="Enter load"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ratedSpeedMs">Rated Speed (m/s)</Label>
          <Input
            id="ratedSpeedMs"
            type="number"
            step="0.1"
            value={formData.ratedSpeedMs || ''}
            onChange={(e) => onChange('ratedSpeedMs', e.target.value ? parseFloat(e.target.value) : "")}
            placeholder="Enter speed"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfStops">Number of Stops/Floors</Label>
          <Input
            id="numberOfStops"
            type="number"
            value={formData.numberOfStops || ''}
            onChange={(e) => onChange('numberOfStops', e.target.value ? parseInt(e.target.value) : "")}
            placeholder="Enter stops"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border/50">
        <div className="space-y-3">
          <Label className="font-medium">Inspection Type</Label>
          <div className="space-y-2">
            {inspectionTypeOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`inspection-${option}`}
                  checked={(formData.inspectionTypes || []).includes(option)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('inspectionTypes', option, !!checked)
                  }
                />
                <label htmlFor={`inspection-${option}`} className="text-sm cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Referral Code</Label>
          <div className="space-y-2">
            {referralCodeOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`referral-${option}`}
                  checked={(formData.referralCodes || []).includes(option)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('referralCodes', option, !!checked)
                  }
                />
                <label htmlFor={`referral-${option}`} className="text-sm cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Type of Lift</Label>
          <div className="space-y-2">
            {liftTypeOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`lift-${option}`}
                  checked={(formData.liftTypes || []).includes(option)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('liftTypes', option, !!checked)
                  }
                />
                <label htmlFor={`lift-${option}`} className="text-sm cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/50">
        <div className="space-y-3">
          <Label className="font-medium">Drive System</Label>
          <RadioGroup
            value={formData.driveSystem || ''}
            onValueChange={(value) => onChange('driveSystem', value)}
            className="flex flex-wrap gap-4"
          >
            {driveSystemOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`drive-${option}`} />
                <label htmlFor={`drive-${option}`} className="text-sm cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Control System</Label>
          <RadioGroup
            value={formData.controlSystem || ''}
            onValueChange={(value) => onChange('controlSystem', value)}
            className="flex flex-wrap gap-4"
          >
            {controlSystemOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`control-${option}`} />
                <label htmlFor={`control-${option}`} className="text-sm cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </LiftFormSection>
  );
};
