import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LiftFormSection } from './LiftFormSection';
import { FileText, Calendar, Boxes, Building } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const GeneralInfoSection = ({
  formData,
  onChange,
  activeServices = [],
  clients = []
}) => {
  return (
    <LiftFormSection title="1. General Information" icon={FileText}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="serviceId" className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-primary" />
            Inspection Service Type *
          </Label>
          <Select
            value={formData.serviceId}
            onValueChange={(value) => onChange('serviceId', value)}
          >
            <SelectTrigger id="serviceId" className="h-12 bg-muted/20 border-muted">
              <SelectValue placeholder="Select the relevant service module..." />
            </SelectTrigger>
            <SelectContent>
              {activeServices.map((service) => (
                <SelectItem key={service._id} value={service._id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground italic px-1">
            Categorizing the inspection allows for accurate cross-service quality analytics.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspectionType" className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Inspection Type *
          </Label>
          <Select
            value={formData.inspectionTypes?.[0] || ''}
            onValueChange={(value) => onChange('inspectionTypes', [value])}
          >
            <SelectTrigger id="inspectionType" className="h-12 bg-muted/20 border-muted">
              <SelectValue placeholder="Select inspection type..." />
            </SelectTrigger>
            <SelectContent>
              {['Annual', 'Semi-Annual', 'Quarterly', 'Routine', 'Third Party', 'Acceptance'].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientName" className="flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            Client Name *
          </Label>
          <Select
            value={formData.clientName}
            onValueChange={(value) => {
              const client = clients.find(c => c.name === value);
              if (client) {
                onChange('clientName', client.name);
                if (client.address) {
                  onChange('warehouseAddress', client.address);
                }
              }
            }}
          >
            <SelectTrigger id="clientName" className="h-12 bg-muted/20 border-muted">
              <SelectValue placeholder="Select a client company..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client._id} value={client.name}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reportNo">Report No.</Label>
          <Input
            id="reportNo"
            value={formData.reportNo || ''}
            onChange={(e) => onChange('reportNo', e.target.value)}
            placeholder="Auto-generated"
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspectorName">Inspector Name</Label>
          <Input
            id="inspectorName"
            value={formData.inspectorName || ''}
            onChange={(e) => onChange('inspectorName', e.target.value)}
            placeholder="Auto from login"
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reportReference">Report Reference</Label>
          <Input
            id="reportReference"
            value={formData.reportReference || ''}
            onChange={(e) => onChange('reportReference', e.target.value)}
            placeholder="Enter reference"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouseName">Warehouse Name</Label>
          <Input
            id="warehouseName"
            value={formData.warehouseName || ''}
            onChange={(e) => onChange('warehouseName', e.target.value)}
            placeholder="Enter warehouse name"
          />
        </div>

        <div className="space-y-2 flex flex-col">
          <Label>Date of Inspection *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.inspectionDate && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {formData.inspectionDate
                  ? format(new Date(formData.inspectionDate), 'PPP')
                  : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.inspectionDate ? new Date(formData.inspectionDate) : null}
                onSelect={(date) => onChange('inspectionDate', date || new Date())}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="warehouseAddress">Warehouse Address</Label>
          <Textarea
            id="warehouseAddress"
            value={formData.warehouseAddress || ''}
            onChange={(e) => onChange('warehouseAddress', e.target.value)}
            placeholder="Enter full address"
            rows={2}
          />
        </div>
      </div>
    </LiftFormSection>
  );
};
