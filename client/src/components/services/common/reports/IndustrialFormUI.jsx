import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Save,
    Download,
    ChevronLeft,
    Check,
    Upload,
    Trash2,
    ChevronsUpDown,
    Plus,
    X,
    Printer,
    Camera,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { toast } from 'react-hot-toast';
import ImageViewer from '@/components/ui/ImageViewer';

export const IndustrialFormUI = ({
    formData,
    activeTemplate,
    isLoading,
    cameraOpen, setCameraOpen,
    cameraFieldId, setCameraFieldId,
    clients,
    clientSearchOpen, setClientSearchOpen,
    clientSearch, setClientSearch,
    viewerOpen, setViewerOpen,
    viewerData, setViewerData,
    pageTitle,
    handleInputChange,
    handleSelectChange,
    handleCheckboxGroup,
    handleGridInput,
    handleClientChange,
    handlePhotoUpload,
    handlePhotoRename,
    handleTableAdd,
    handleTableChange,
    handleTableRemove,
    handleSave,
    navigate
}) => {
    const confirmDeletePhoto = (fieldId, index) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="text-sm font-medium text-slate-900 leading-tight">
                    Are you sure you want to delete this photo?
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-xs font-semibold hover:bg-[#131212]"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 px-3 text-xs font-bold shadow-sm"
                        onClick={() => {
                            const existing = Array.isArray(formData[fieldId]) ? formData[fieldId] : [];
                            const updated = existing.filter((_, i) => i !== index);
                            handleInputChange({ target: { id: fieldId, value: updated } });
                            toast.dismiss(t.id);
                            setViewerOpen(false);
                            toast.success("Photo deleted", { icon: '🗑️', duration: 2000 });
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'top-center'
        });
    };
    return (
        <>
            <div className="min-h-screen bg-slate-50/50 pb-32">
                <Header
                    title={pageTitle || formData.report_title || activeTemplate?.title}
                    subtitle={`${activeTemplate?.subTitle ? activeTemplate.subTitle + ' Report' : 'New Report'}`}
                />

                <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
                    {activeTemplate?.steps?.map((step) => (
                        <div key={step.id} className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden relative">
                            <div className={cn("px-8 py-6 border-b", activeTemplate?.bg)}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-3 rounded-xl bg-white shadow-sm", activeTemplate?.color)}>
                                        {step.icon && <step.icon className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <h2 className={cn("text-xl font-black tracking-tight", activeTemplate?.color)}>{step.title}</h2>
                                        {step.description && <p className="text-muted-foreground text-sm mt-1">{step.description}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                {step.fields && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {step.fields.map(field => {
                                            if (field.type === 'grid_input') {
                                                return (
                                                    <div key={field.id} className="col-span-1 md:col-span-2 space-y-3">
                                                        <Label className="font-bold">{field.label}</Label>
                                                        <div className="overflow-x-auto border rounded-xl">
                                                            <table className="w-full text-sm text-left">
                                                                <thead className="bg-slate-50 text-xs uppercase">
                                                                    <tr>
                                                                        <th className="p-3">Parameter</th>
                                                                        {field.columns.map(col => <th key={col} className="p-3 border-l">{col}</th>)}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {field.rows.map(row => (
                                                                        <tr key={row} className="border-t">
                                                                            <td className="p-3 font-medium">{row}</td>
                                                                            {field.columns.map(col => (
                                                                                <td key={`${row}_${col}`} className="p-0 border-l">
                                                                                    <input
                                                                                        className="w-full h-full p-3 bg-transparent outline-none focus:bg-blue-50/50"
                                                                                        value={formData[field.id]?.[`${row}_${col}`] || ''}
                                                                                        onChange={(e) => handleGridInput(field.id, row, col, e.target.value)}
                                                                                    />
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            if (field.type === 'checkbox_group') {
                                                const currentValues = Array.isArray(formData[field.id]) ? formData[field.id] : [];
                                                return (
                                                    <div key={field.id} className="space-y-3">
                                                        <Label className="font-bold">{field.label}</Label>
                                                        <div className="flex flex-wrap gap-3">
                                                            {field.options.map(opt => (
                                                                <div key={opt} className="flex items-center space-x-2 border px-3 py-2 rounded-lg bg-slate-50 hover:bg-white transition-colors cursor-pointer" onClick={() => handleCheckboxGroup(field.id, opt, !currentValues.includes(opt))}>
                                                                    <Checkbox checked={currentValues.includes(opt)} onCheckedChange={(checked) => handleCheckboxGroup(field.id, opt, checked)} />
                                                                    <span className="text-sm font-medium cursor-pointer">{opt}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            if (field.type === 'image_upload') {
                                                const existingImages = Array.isArray(formData[field.id]) ? formData[field.id] : (formData[field.id] ? [formData[field.id]] : []);
                                                const globalImagesCount = Object.keys(formData).reduce((acc, key) => {
                                                    const value = formData[key];
                                                    if (activeTemplate.steps.some(s => s.fields && s.fields.some(f => f.id === key && f.type === 'image_upload'))) {
                                                        return acc + (Array.isArray(value) ? value.length : (value ? 1 : 0));
                                                    }
                                                    return acc;
                                                }, 0);
                                                const picLabel = `PIC(${globalImagesCount + 1})`;
                                                return (
                                                    <div key={field.id} className="col-span-1 md:col-span-2 space-y-4">
                                                        <Label className="font-bold">{field.label}</Label>
                                                        {existingImages.length > 0 && (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                                {existingImages.map((img, idx) => {
                                                                    const url = typeof img === 'object' ? img.url : img;
                                                                    const name = typeof img === 'object' ? img.name : `Image ${idx + 1}`;
                                                                    return (
                                                                        <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 cursor-pointer" onClick={() => { setViewerData({ url, name, fieldId: field.id, index: idx }); setViewerOpen(true); }}>
                                                                            <img src={url} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                                                                                <span className="text-[10px] text-white font-medium truncate w-full mb-2">{name}</span>
                                                                                <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); confirmDeletePhoto(field.id, idx); }}>
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                        <div className="grid grid-cols-1 gap-3">
                                                            <label className="relative flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-primary/40 transition-colors cursor-pointer group">
                                                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                                                                <span className="text-xs font-semibold text-slate-500 group-hover:text-primary transition-colors text-center px-2">Add Photos / Open Gallery</span>
                                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handlePhotoUpload(e, field.id)} accept="image/*" multiple />
                                                            </label>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={field.id} className={cn("space-y-2", field.type === 'textarea' && "col-span-1 md:col-span-2")}>
                                                    <Label htmlFor={field.id} className="text-sm font-bold text-slate-700">{field.label}</Label>
                                                    {field.id === 'client_name' ? (
                                                        <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" role="combobox" className="w-full justify-between h-12 bg-slate-50 border-slate-200">
                                                                    {formData.client_name || "Select Client"}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[300px] p-0">
                                                                <Command>
                                                                    <CommandInput placeholder="Search or enter new client..." onValueChange={setClientSearch} />
                                                                    <CommandList>
                                                                        <CommandEmpty className="p-2">
                                                                            <p className="text-sm text-muted-foreground pb-2">No client found.</p>
                                                                            <Button variant="outline" size="sm" className="w-full justify-start font-normal" onClick={() => { handleInputChange({ target: { id: 'client_name', value: clientSearch } }); setClientSearchOpen(false); }}>
                                                                                <Plus className="mr-2 h-4 w-4" /> Use "{clientSearch}"
                                                                            </Button>
                                                                        </CommandEmpty>
                                                                        <CommandGroup>
                                                                            {clients.map(client => (
                                                                                <CommandItem key={client._id} onSelect={() => { handleClientChange(client._id); setClientSearchOpen(false); }}>
                                                                                    {client.name}
                                                                                    <Check className={cn("ml-auto h-4 w-4", formData.client_name === client.name ? "opacity-100" : "opacity-0")} />
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                    ) : field.type === 'textarea' ? (
                                                        <Textarea id={field.id} placeholder={field.placeholder || "Enter description details"} className="bg-slate-50 border-slate-200 border-2 focus:bg-white min-h-[100px]" value={formData[field.id] || ''} onChange={handleInputChange} />
                                                    ) : field.type === 'select' ? (
                                                        <Select value={formData[field.id]} onValueChange={(v) => handleSelectChange(field.id, v)}>
                                                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"><SelectValue placeholder={field.placeholder || "Select an option"} /></SelectTrigger>
                                                            <SelectContent>{field.options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Input id={field.id} type={field.type} placeholder={field.placeholder || "Enter data..."} className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all" value={formData[field.id] || ''} onChange={handleInputChange} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {step.type === 'dynamic_table' && (
                                    <div className="space-y-4">
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 -mx-2 sm:mx-0">
                                            <table className="min-w-[640px] w-full text-sm text-left">
                                                <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    <tr>
                                                        <th className="p-3 w-10">#</th>
                                                        {step.columns.map(col => <th key={col.key} className="p-3 min-w-[120px]">{col.label}</th>)}
                                                        <th className="p-3 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {(formData[step.id] || []).map((row, idx) => (
                                                        <tr key={idx} className="bg-white hover:bg-slate-50">
                                                            <td className="p-3 font-bold text-slate-400 text-center">{idx + 1}</td>
                                                            {step.columns.map(col => (
                                                                <td key={col.key} className="p-1.5 min-w-[120px]">
                                                                    {col.type === 'select' ? (
                                                                        <Select value={row[col.key]} onValueChange={(v) => handleTableChange(step.id, idx, col.key, v)}>
                                                                            <SelectTrigger className="h-10 border border-slate-200 bg-slate-50 text-sm focus:ring-1 focus:ring-primary/20"><SelectValue placeholder="Select" /></SelectTrigger>
                                                                            <SelectContent>{col.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                                                        </Select>
                                                                    ) : (
                                                                        <input className="w-full h-10 bg-slate-50 border border-slate-200 outline-none px-3 rounded-lg text-sm hover:bg-white focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all" placeholder="Enter value" value={row[col.key] || ''} onChange={(e) => handleTableChange(step.id, idx, col.key, e.target.value)} />
                                                                    )}
                                                                </td>
                                                            ))}
                                                            <td className="p-2 text-center">
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleTableRemove(step.id, idx)}><Trash2 className="w-4 h-4" /></Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <Button variant="outline" className="w-full h-12 border-dashed text-primary border-[#201E1E] border-2 font-bold hover:bg-primary/5 hover:text-[#201E1E] transition-colors" onClick={() => handleTableAdd(step.id, step.columns)}><Plus className="w-4 h-4 mr-2" /> Add New Entry</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 p-6 sm:p-8 mt-8">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-2 hover:bg-[#F44034] text-[#F44034] gap-2 font-bold order-2 sm:order-1" onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5" /> Back</Button>
                            <div className="flex gap-2 order-1 sm:order-2 flex-1">
                                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-2 border-slate-200 hover:bg-[#201E1E]" onClick={() => handleSave(true, 'print')} disabled={isLoading}><Printer className="w-5 h-5" /></Button>
                                <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 border-slate-200 hover:bg-[#201E1E] gap-2 font-bold" onClick={() => handleSave(true, 'download')} disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Download className="w-5 h-5" />
                                    )}
                                    {isLoading ? "Generating..." : "Generate PDF"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {viewerOpen && viewerData && (
                <ImageViewer
                    open={viewerOpen}
                    onClose={() => setViewerOpen(false)}
                    image={{ url: viewerData.url, name: viewerData.name }}
                    onUpdate={(newName) => handlePhotoRename(viewerData.fieldId, viewerData.index, newName)}
                    onDelete={() => confirmDeletePhoto(viewerData.fieldId, viewerData.index)}
                />
            )}
        </>
    );
};
