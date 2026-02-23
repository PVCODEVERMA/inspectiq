import React from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LiftFormSection } from './LiftFormSection';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const ChecklistTable = ({
  title,
  sectionNumber,
  icon,
  items,
  onChange,
  statusOptions,
  statusField = 'condition',
}) => {
  return (
    <LiftFormSection title={`${sectionNumber}. ${title}`} icon={icon}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Item</TableHead>
              <TableHead className="min-w-[200px]">
                {statusField === 'result' ? 'Result' : statusField === 'status' ? 'Status' : 'Condition'}
              </TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.item}</TableCell>
                <TableCell>
                  <RadioGroup
                    value={item[statusField] || ''}
                    onValueChange={(value) => onChange(index, statusField, value)}
                    className="flex flex-wrap gap-2"
                  >
                    {statusOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-1">
                        <RadioGroupItem
                          value={option.value}
                          id={`${index}-${option.value}`}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`${index}-${option.value}`}
                          className="text-xs cursor-pointer whitespace-nowrap"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </TableCell>
                <TableCell>
                  <Input
                    value={item.remarks}
                    onChange={(e) => onChange(index, 'remarks', e.target.value)}
                    placeholder="Add remarks..."
                    className="min-w-[150px]"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </LiftFormSection>
  );
};
