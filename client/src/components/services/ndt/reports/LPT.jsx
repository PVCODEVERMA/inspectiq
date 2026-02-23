import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import { toast } from 'react-hot-toast';
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
    ClipboardCheck,
    FileSearch,
    FlaskConical,
    Zap,
    ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';
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
import CameraCapture from '@/components/ui/CameraCapture';
import ImageViewer from '@/components/ui/ImageViewer';

const LPT = () => {
    const { id, serviceType, inspectionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const serviceIdFromUrl = queryParams.get('serviceId');
    const pageTitle = queryParams.get('title') || 'Liquid Penetrant Test';

    const isValidObjectId = (str) => /^[0-9a-fA-F]{24}$/.test(str);
    const validServiceId = isValidObjectId(id) ? id : (isValidObjectId(serviceIdFromUrl) ? serviceIdFromUrl : null);
    const reportId = isValidObjectId(inspectionId) ? inspectionId : null;

    const [isLoading, setIsLoading] = useState(false);
    const isSavingRef = useRef(false);
    // Tracks the saved report _id synchronously (state updates are async and cause duplicate POST)
    const savedIdRef = useRef(reportId || null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraFieldId, setCameraFieldId] = useState(null);
    const [clients, setClients] = useState([]);
    const [clientSearch, setClientSearch] = useState("");
    const [clientSearchOpen, setClientSearchOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerData, setViewerData] = useState(null);

    const [formData, setFormData] = useState({
        serviceId: validServiceId || '',
        formType: 'liquid-penetrant',
        status: 'draft',
        client_name: '',
        report_no: '',
        vendor_name: '',
        date: new Date().toISOString().split('T')[0],
        item: '',
        location: '',
        procedure_no: '',
        penetrant_type: '',
        acceptance_std: '',
        developer_form: '',
        penetrant_make: '',
        penetrant_batch: '',
        penetrant_type_check: [],
        developer_make: '',
        developer_batch: '',
        developer_form_check: [],
        surface_temp: '',
        dwell_time: '',
        light_intensity: '',
        developing_time: '',
        results: [],
        findings_any: '',
        photos: []
    });

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await api.get('/clients');
                setClients(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };
        fetchClients();
    }, []);

    useEffect(() => {
        const fetchReport = async () => {
            if (!reportId) return;
            try {
                setIsLoading(true);
                const res = await api.get(`/ndt/liquid-penetrant/${reportId}`);
                const data = res.data;
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    date: data.date ? new Date(data.date).toISOString().split('T')[0] : prev.date,
                    results: data.results || data.testResults || [],
                    penetrant_type_check: data.penetrant_type_check || data.penetrantTypeCheck || [],
                    developer_form_check: data.developer_form_check || data.developerFormCheck || []
                }));
            } catch (error) {
                console.error("Error fetching report:", error);
                toast.error("Failed to load report details");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [reportId]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxGroup = (fieldId, option, checked) => {
        setFormData(prev => {
            const current = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
            if (checked) {
                return { ...prev, [fieldId]: [...current, option] };
            } else {
                return { ...prev, [fieldId]: current.filter(item => item !== option) };
            }
        });
    };

    const handleClientChange = (clientId) => {
        const client = clients.find(c => c._id === clientId);
        if (client) {
            setFormData(prev => ({
                ...prev,
                client_name: client.name,
                location: client.address || prev.location
            }));
        }
    };

    const handlePhotoUpload = async (e, fieldId = 'photos') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const uploadPromises = Array.from(files).map(async (file) => {
            const uploadData = new FormData();
            uploadData.append('photo', file);
            try {
                const response = await api.post('/upload/single', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return { url: `http://localhost:5000${response.data.url}`, name: file.name };
            } catch (error) {
                console.error("Upload error:", error);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve({ url: reader.result, name: file.name });
                    reader.readAsDataURL(file);
                });
            }
        });

        const newImages = await Promise.all(uploadPromises);
        setFormData(prev => ({
            ...prev,
            [fieldId]: [...(Array.isArray(prev[fieldId]) ? prev[fieldId] : []), ...newImages]
        }));
        toast.success("Photos added");
    };

    const handleTableAdd = () => {
        const emptyRow = { item_name: '', observations: '', result: 'Accept' };
        setFormData(prev => ({
            ...prev,
            results: [...prev.results, emptyRow]
        }));
    };

    const handleTableChange = (idx, key, value) => {
        setFormData(prev => {
            const newTable = [...prev.results];
            newTable[idx] = { ...newTable[idx], [key]: value };
            return { ...prev, results: newTable };
        });
    };

    const handleTableRemove = (idx) => {
        setFormData(prev => ({
            ...prev,
            results: prev.results.filter((_, i) => i !== idx)
        }));
    };

    const handleSave = async (isDraft = true, exportMode = null) => {
        if (!formData.client_name) {
            toast.error("Please enter the Client Name to proceed.");
            return;
        }

        if (isSavingRef.current) return;
        isSavingRef.current = true;

        try {
            setIsLoading(true);
            const payload = {
                ...formData,
                status: isDraft ? 'draft' : 'submitted',
                serviceType: serviceType || 'NDT',
                inspection_date: formData.date
            };

            // Mapping for backend model compatibility
            payload.testResults = formData.results;
            payload.penetrantTypeCheck = formData.penetrant_type_check;
            payload.developerFormCheck = formData.developer_form_check;

            let savedReport;
            const endpoint = '/ndt/liquid-penetrant';
            // Use ref (synchronous) to get the saved ID — avoids race condition from async setState
            const effectiveId = reportId || savedIdRef.current;

            if (effectiveId) {
                // Strip report_no from PUT to avoid unique-index conflict
                const { report_no, _id, ...updatePayload } = payload;
                const res = await api.put(`${endpoint}/${effectiveId}`, updatePayload);
                savedReport = res.data;
                if (!exportMode) toast.success(isDraft ? "Draft Updated!" : "Report Updated!");
            } else {
                const res = await api.post(endpoint, payload);
                savedReport = res.data;
                // Store the ID immediately in ref so the next call uses PUT
                savedIdRef.current = savedReport._id;
                setFormData(prev => ({ ...prev, ...savedReport }));
                if (!exportMode) toast.success(isDraft ? "Draft Saved!" : "Report Submitted!");
                navigate(`/services/industrial-inspection/${serviceType}/${savedReport._id}/edit?formType=liquid-penetrant`, { replace: true });
            }

            if (exportMode && savedReport) {
                const { generateIndustrialPDF } = await import('@/components/services/common/pdf/generateIndustrialPDF');
                const template = { id: 'liquid-penetrant', title: 'Liquid Penetrant Test', subTitle: 'QCWS/NDT/F-04' };
                await generateIndustrialPDF({ ...formData, ...savedReport, formType: 'liquid-penetrant' }, template, exportMode);
                toast.success(`Report ${exportMode === 'print' ? 'printed' : 'downloaded'} successfully!`);
            }

            if (!exportMode && !isDraft) navigate(-1);
        } catch (error) {
            console.error("Save Error:", error);
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setIsLoading(false);
            setTimeout(() => { isSavingRef.current = false; }, 1000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-32">
            <Header title={pageTitle} subtitle="QCWS/NDT/F-01 Report" />

            <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">

                {/* Section 1: General Information */}
                <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden relative">
                    <div className="px-8 py-6 border-b bg-purple-50 text-purple-600">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white shadow-sm">
                                <ClipboardCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight">General Information</h2>
                                <p className="text-muted-foreground text-sm mt-1">Basic report details</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Client</Label>
                            <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between h-12 bg-slate-50 border-slate-200">
                                        {formData.client_name || "Select Client"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search client..." onValueChange={setClientSearch} />
                                        <CommandList>
                                            <CommandEmpty className="p-2 text-sm text-center">
                                                No client found. <button onClick={() => { setFormData(p => ({ ...p, client_name: clientSearch })); setClientSearchOpen(false); }} className="text-primary font-bold">Use "{clientSearch}"</button>
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {clients.map(c => (
                                                    <CommandItem key={c._id} onSelect={() => { handleClientChange(c._id); setClientSearchOpen(false); }}>
                                                        {c.name} <Check className={cn("ml-auto h-4 w-4", formData.client_name === c.name ? "opacity-100" : "opacity-0")} />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Report No <span className="text-xs font-normal text-slate-400">(leave blank to auto-generate)</span></Label>
                            <Input id="report_no" className="h-12 bg-slate-50 border-slate-200" value={formData.report_no || ''} onChange={handleInputChange} placeholder="e.g. PT-2026-0001" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Vendor</Label>
                            <Input id="vendor_name" className="h-12 bg-slate-50 border-slate-200" value={formData.vendor_name} onChange={handleInputChange} placeholder="Enter vendor name" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Date</Label>
                            <Input id="date" type="date" className="h-12 bg-slate-50 border-slate-200" value={formData.date} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Item</Label>
                            <Input id="item" className="h-12 bg-slate-50 border-slate-200" value={formData.item} onChange={handleInputChange} placeholder="Item description" />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label className="text-sm font-bold text-slate-700">Inspection Location</Label>
                            <Input id="location" className="h-12 bg-slate-50 border-slate-200" value={formData.location} onChange={handleInputChange} placeholder="Site or factory address" />
                        </div>
                    </div>
                </div>

                {/* Section 2: Process Info */}
                <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden relative">
                    <div className="px-8 py-6 border-b bg-purple-50 text-purple-600">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white shadow-sm">
                                <FileSearch className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight">Process Info</h2>
                        </div>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Procedure No</Label>
                            <Input id="procedure_no" className="h-12 bg-slate-50 border-slate-200" value={formData.procedure_no} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Type Of Penetrant</Label>
                            <Input id="penetrant_type" className="h-12 bg-slate-50 border-slate-200" value={formData.penetrant_type} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Acceptance Standard</Label>
                            <Input id="acceptance_std" className="h-12 bg-slate-50 border-slate-200" value={formData.acceptance_std} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Developer Form</Label>
                            <Input id="developer_form" className="h-12 bg-slate-50 border-slate-200" value={formData.developer_form} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

                {/* Section 3: Consumables */}
                <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden relative">
                    <div className="px-8 py-6 border-b bg-purple-50 text-purple-600">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white shadow-sm">
                                <FlaskConical className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight">Consumables</h2>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Penetrant Make</Label>
                                <Input id="penetrant_make" className="h-12 bg-slate-50 border-slate-200" value={formData.penetrant_make} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Penetrant Batch</Label>
                                <Input id="penetrant_batch" className="h-12 bg-slate-50 border-slate-200" value={formData.penetrant_batch} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="font-bold">Penetrant Type</Label>
                            <div className="flex flex-wrap gap-3">
                                {['Florescent', 'Non Florescent'].map(opt => (
                                    <div key={opt} className="flex items-center space-x-2 border px-3 py-2 rounded-lg bg-slate-50 hover:bg-white transition-colors cursor-pointer" onClick={() => handleCheckboxGroup('penetrant_type_check', opt, !formData.penetrant_type_check?.includes(opt))}>
                                        <Checkbox checked={formData.penetrant_type_check?.includes(opt)} onCheckedChange={(c) => handleCheckboxGroup('penetrant_type_check', opt, c)} />
                                        <span className="text-sm font-medium">{opt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Developer Make</Label>
                                <Input id="developer_make" className="h-12 bg-slate-50 border-slate-200" value={formData.developer_make} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Developer Batch</Label>
                                <Input id="developer_batch" className="h-12 bg-slate-50 border-slate-200" value={formData.developer_batch} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="font-bold">Developer Form</Label>
                            <div className="flex flex-wrap gap-3">
                                {['Wet', 'Dry'].map(opt => (
                                    <div key={opt} className="flex items-center space-x-2 border px-3 py-2 rounded-lg bg-slate-50 hover:bg-white transition-colors cursor-pointer" onClick={() => handleCheckboxGroup('developer_form_check', opt, !formData.developer_form_check?.includes(opt))}>
                                        <Checkbox checked={formData.developer_form_check?.includes(opt)} onCheckedChange={(c) => handleCheckboxGroup('developer_form_check', opt, c)} />
                                        <span className="text-sm font-medium">{opt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Test Parameters */}
                <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden relative">
                    <div className="px-8 py-6 border-b bg-purple-50 text-purple-600">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white shadow-sm">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight">Test Parameters</h2>
                        </div>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { id: 'surface_temp', label: 'Surface Temp' },
                            { id: 'dwell_time', label: 'Dwell Time' },
                            { id: 'light_intensity', label: 'Light Intensity' },
                            { id: 'developing_time', label: 'Developing Time' }
                        ].map(f => (
                            <div key={f.id} className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">{f.label}</Label>
                                <Input id={f.id} className="h-12 bg-slate-50 border-slate-200" value={formData[f.id]} onChange={handleInputChange} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 5: Test Results Table */}
                <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden relative">
                    <div className="px-8 py-6 border-b bg-purple-50 text-purple-600">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white shadow-sm">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight">Test Results</h2>
                        </div>
                    </div>
                    <div className="p-8 space-y-4">
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="min-w-[640px] w-full text-sm text-left">
                                <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="p-3 w-10 text-center">#</th>
                                        <th className="p-3">Item Name / Number</th>
                                        <th className="p-3">Observations</th>
                                        <th className="p-3 w-40">Result</th>
                                        <th className="p-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {formData.results.map((row, idx) => (
                                        <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                                            <td className="p-3 font-bold text-slate-400 text-center">{idx + 1}</td>
                                            <td className="p-1.5"><input className="w-full h-10 bg-slate-50 border border-slate-200 outline-none px-3 rounded-lg" value={row.item_name} onChange={(e) => handleTableChange(idx, 'item_name', e.target.value)} /></td>
                                            <td className="p-1.5"><input className="w-full h-10 bg-slate-50 border border-slate-200 outline-none px-3 rounded-lg" value={row.observations} onChange={(e) => handleTableChange(idx, 'observations', e.target.value)} /></td>
                                            <td className="p-1.5">
                                                <Select value={row.result} onValueChange={(v) => handleTableChange(idx, 'result', v)}>
                                                    <SelectTrigger className="h-10 border-slate-200"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {['Accept', 'Reject', 'Repair', 'Pending'].map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-2 text-center">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-600" onClick={() => handleTableRemove(idx)}><Trash2 className="w-4 h-4" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Button variant="outline" className="w-full h-12 border-2 border-dashed border-slate-300 font-bold text-primary hover:bg-primary/5" onClick={handleTableAdd}>
                            <Plus className="w-4 h-4 mr-2" /> Add New Row
                        </Button>
                    </div>
                </div>

                {/* Section 6: Findings & Photos */}
                <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 p-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Findings If Any</Label>
                        <Textarea id="findings_any" className="bg-slate-50 border-slate-200 min-h-[100px]" value={formData.findings_any} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-4">
                        <Label className="font-bold">Photos</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {formData.photos.map((img, idx) => (
                                <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200">
                                    <img src={img.url} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => setFormData(p => ({ ...p, photos: p.photos.filter((_, i) => i !== idx) }))}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                                <Upload className="w-6 h-6 text-slate-400" />
                                <span className="text-xs font-bold text-slate-500">Upload</span>
                                <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" multiple />
                            </label>
                            <button type="button" onClick={() => setCameraOpen(true)} className="flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100">
                                <Camera className="w-6 h-6 text-slate-400" />
                                <span className="text-xs font-bold text-slate-500">Camera</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Final Actions */}
                <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 p-8">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-2 hover:bg-[#F44034] text-[#F44034] gap-2 font-bold order-2 sm:order-1" onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5" /> Back</Button>
                        <div className="flex flex-1 flex-col sm:flex-row gap-3 order-1 sm:order-2">
                            <Button variant="outline" size="lg" className="flex-1 h-14 rounded-2xl border-2 border-[#201E1E] text-[#201E1E] hover:bg-[#363434] hover:text-white gap-2 font-bold" onClick={() => handleSave(true)} disabled={isLoading}><Save className="w-5 h-5" /> Save Draft</Button>
                            <Button size="lg" className="flex-1 h-14 rounded-2xl bg-[#F44034] hover:bg-[#201E1E] shadow-lg gap-2 font-bold" onClick={() => handleSave(false)} disabled={isLoading}><Check className="w-5 h-5" /> Submit Report</Button>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-2 border-slate-200 hover:bg-[#201E1E] hover:text-white" onClick={() => handleSave(true, 'print')} disabled={isLoading}><Printer className="w-5 h-5" /></Button>
                                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-2 border-slate-200 hover:bg-[#201E1E] hover:text-white" onClick={() => handleSave(true, 'download')} disabled={isLoading}><Download className="w-5 h-5" /></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CameraCapture
                open={cameraOpen}
                onCapture={(imgObj) => {
                    // CameraCapture returns { url, name } object directly
                    setFormData(prev => ({
                        ...prev,
                        photos: [...(Array.isArray(prev.photos) ? prev.photos : []), { url: imgObj.url, name: imgObj.name || `capture_${Date.now()}.jpg` }]
                    }));
                    toast.success('Photo captured!');
                    setCameraOpen(false);
                }}
                onClose={() => setCameraOpen(false)}
                title="Capture Photo"
            />
        </div>
    );
};

export default LPT;
