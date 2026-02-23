import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  GripVertical,
  Trash2,
  Save,
  Eye,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  FileText,
  Camera,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: Type },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'select', label: 'Dropdown', icon: List },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'textarea', label: 'Text Area', icon: FileText },
  { value: 'photo', label: 'Photo Upload', icon: Camera },
  { value: 'location', label: 'GPS Location', icon: MapPin },
];

const FormBuilderPage = () => {
  const [formName, setFormName] = useState('New Inspection Form');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState([
    {
      id: '1',
      title: 'General Information',
      fields: [
        { id: '1-1', type: 'text', label: 'Inspection Title', required: true },
        { id: '1-2', type: 'date', label: 'Inspection Date', required: true },
        { id: '1-3', type: 'text', label: 'Location', required: false },
      ],
    },
  ]);

  const addSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: 'New Section',
      fields: [],
    };
    setSections([...sections, newSection]);
    toast.success('Section Added');
  };

  const addField = (sectionId, fieldType) => {
    const fieldInfo = fieldTypes.find((f) => f.value === fieldType);
    const newField = {
      id: `${sectionId}-${Date.now()}`,
      type: fieldType,
      label: fieldInfo?.label || 'New Field',
      required: false,
      options: fieldType === 'select' ? ['Option 1', 'Option 2'] : [],
    };

    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
    );
    toast.success('Field Added');
  };

  const updateSectionTitle = (sectionId, title) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, title: title } : section
      )
    );
  };

  const updateFieldLabel = (sectionId, fieldId, label) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            fields: section.fields.map((field) =>
              field.id === fieldId ? { ...field, label: label } : field
            ),
          }
          : section
      )
    );
  };

  const toggleFieldRequired = (sectionId, fieldId) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            fields: section.fields.map((field) =>
              field.id === fieldId ? { ...field, required: !field.required } : field
            ),
          }
          : section
      )
    );
  };

  const deleteField = (sectionId, fieldId) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            fields: section.fields.filter((field) => field.id !== fieldId),
          }
          : section
      )
    );
    toast.success('Field Removed');
  };

  const deleteSection = (sectionId) => {
    setSections(sections.filter((section) => section.id !== sectionId));
    toast.success('Section Removed');
  };

  const handleSave = () => {
    toast.success('Form Saved', {
      description: 'Your inspection form has been saved',
    });
  };

  const handlePreview = () => {
    toast.info('Preview Mode', {
      description: 'Form preview is not available in this demo',
    });
  };

  const getFieldIcon = (type) => {
    const fieldType = fieldTypes.find((f) => f.value === type);
    return fieldType?.icon || Type;
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="Form Builder" subtitle="Create and customize inspection forms" />

      <div className="p-6 space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Form Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of this form..."
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Button variant="hero" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Form
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              className="glass-card rounded-2xl overflow-hidden animate-slide-up"
              style={{ animationDelay: `${sectionIndex * 50}ms` }}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                  <Input
                    value={section.title}
                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    className="font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{section.fields.length} fields</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteSection(section.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Fields */}
              <div className="p-4 space-y-3">
                {section.fields.map((field) => {
                  const FieldIcon = getFieldIcon(field.type);
                  return (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FieldIcon className="w-4 h-4 text-primary" />
                      </div>
                      <Input
                        value={field.label}
                        onChange={(e) =>
                          updateFieldLabel(section.id, field.id, e.target.value)
                        }
                        className="flex-1 bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                      />
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Required</Label>
                        <Switch
                          checked={field.required}
                          onCheckedChange={() => toggleFieldRequired(section.id, field.id)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteField(section.id, field.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}

                {/* Add Field */}
                <div className="pt-3 border-t border-border">
                  <Select onValueChange={(value) => addField(section.id, value)}>
                    <SelectTrigger className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Add a field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Section Button */}
        <Button
          variant="outline"
          className="w-full py-8 border-dashed"
          onClick={addSection}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Section
        </Button>
      </div>
    </div>
  );
};

export default FormBuilderPage;
