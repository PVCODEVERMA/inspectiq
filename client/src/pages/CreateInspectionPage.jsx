import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, ChevronRight, ChevronLeft, Upload, FileText, User, Briefcase, ListChecks, Calendar, X, ArrowLeft, Plus, Trash2, Save, Download } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { generateEngineeringInspection } from '@/components/services/tpi/pdf/generateEngineeringInspection';
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';

const steps = [
    { id: 1, title: 'Project Details', icon: FileText },
    { id: 2, title: 'Assignment', icon: User },
    { id: 3, title: 'Scope & Summary', icon: Briefcase },
    { id: 4, title: 'Checklist', icon: ListChecks },
    { id: 5, title: 'Items & Tools', icon: Briefcase },
    { id: 6, title: 'Finalization', icon: Check },
    { id: 7, title: 'Review', icon: Check }
];

const CreateInspectionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [staff, setStaff] = useState([]);
    const [services, setServices] = useState([]);
    const [clients, setClients] = useState([]);

    // Refs for Signature Canvas
    const sigCanvas1 = useRef({});
    const sigCanvas2 = useRef({});

    // Expanded Form State
    const [formData, setFormData] = useState({
        // Page 1: Basic Info
        projectName: '',
        siteLocation: '',
        inspectionDate: format(new Date(), 'yyyy-MM-dd'),
        priority: 'Medium',
        status: 'pending',

        // Assignment
        serviceManager: '',
        inspectionCoordinator: '',
        technicalCoordinator: '',
        inspector: '',
        expectedCompletionDate: '',
        slaDuration: '',

        // Page 3: Scope & Summary
        poNumber: '',
        rfiNumber: '',
        itpNumber: '',
        vendorName: '',
        scope: {},
        ncrIssued: 'No',
        orderCompleted: 'No',
        overallResult: 'Satisfactory',

        // Checklist 
        checklistItems: [],

        // Details
        offeredItems: [],
        detailedObservation: '',
        attendees: [],

        // Instruments & Docs
        referredDocs: [],
        testInstruments: [],
        documents: [],

        // Signatures
        signatureInspector: '',
        signatureClient: ''
    });

    const checklistTemplates = {
        'Annual': [
            { parameter: 'Governor Rope Tension', standard: 'Taut & Secure', observed: '', result: '', remarks: '' },
            { parameter: 'Safety Gear Mechanism', standard: 'Free & Lubricated', observed: '', result: '', remarks: '' },
            { parameter: 'Buffer Oil Level', standard: 'Full', observed: '', result: '', remarks: '' }
        ],
        'Routine': [
            { parameter: 'Car Lighting', standard: 'Functional', observed: '', result: '', remarks: '' },
            { parameter: 'Door Sensor', standard: 'Responsive', observed: '', result: '', remarks: '' },
            { parameter: 'Alarm Bell', standard: 'Audible', observed: '', result: '', remarks: '' }
        ],
        'Third Party': [
            { parameter: 'Load Test', standard: '125% Load', observed: '', result: '', remarks: '' },
            { parameter: 'Over-speed Governor', standard: 'Trips at 115%', observed: '', result: '', remarks: '' }
        ],
        'Engineering Inspection': [
            { parameter: 'Visual Inspection', standard: 'No Defects', observed: '', result: '', remarks: '' },
            { parameter: 'Dimensional Check', standard: 'As per Drawing', observed: '', result: '', remarks: '' },
            { parameter: 'Operational Test', standard: 'Smooth Operation', observed: '', result: '', remarks: '' }
        ]
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [staffRes, servicesRes, clientsRes] = await Promise.all([
                    api.get('/users/staff'),
                    api.get('/services/active'),
                    api.get('/clients')
                ]);
                setStaff(staffRes.data);
                setServices(servicesRes.data);
                setClients(clientsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load form data");
            }
        };
        fetchData();
    }, []);

    // Handle Prefills from Navigation
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const serviceId = queryParams.get('serviceId');

        // New Prefills
        const inspectionType = queryParams.get('inspectionType');
        const scope = queryParams.get('scope');

        setFormData(prev => {
            const updates = { ...prev };
            if (serviceId) updates.serviceId = serviceId;
            if (inspectionType) updates.inspectionType = inspectionType;
            if (scope) {
                // If scope matches a key in our scope object (e.g. 'pim', 'welding')
                // We need to map the ID to the key used in usage: { pim: true }
                // The IDs in industrialReportTypes are like 'pim', 'welding', etc. which match.
                updates.scope = { ...prev.scope, [scope]: true };
            }
            if (location.state?.prefill) {
                updates.clientName = location.state.prefill.clientName || prev.clientName;
                updates.siteLocation = location.state.prefill.warehouseAddress || prev.siteLocation;
            }
            return updates;
        });
    }, [location.state, location.search]);

    // Auto-populate checklist
    useEffect(() => {
        if (formData.inspectionType && checklistTemplates[formData.inspectionType]) {
            setFormData(prev => ({
                ...prev,
                checklistItems: checklistTemplates[formData.inspectionType]
            }));
        }
    }, [formData.inspectionType]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCompanyChange = (clientId) => {
        const selectedClient = clients.find(c => c._id === clientId);
        if (selectedClient) {
            setFormData(prev => ({
                ...prev,
                clientName: selectedClient.name,
                siteLocation: selectedClient.address || prev.siteLocation
            }));
        }
    };

    const handleChecklistChange = (index, field, value) => {
        const newItems = [...formData.checklistItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, checklistItems: newItems }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newDocs = files.map(f => ({
            name: f.name,
            category: 'General',
            url: URL.createObjectURL(f),
            file: f
        }));
        setFormData(prev => ({ ...prev, documents: [...prev.documents, ...newDocs] }));
    };

    const removeDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = {
                serviceId: formData.serviceId,
                client_name: formData.clientName,
                project_name: formData.projectName,
                site_location: formData.siteLocation,
                inspection_date: formData.inspectionDate,
                priority: formData.priority,
                status: 'pending',

                service_manager: formData.serviceManager,
                inspection_coordinator: formData.inspectionCoordinator,
                technical_coordinator: formData.technicalCoordinator,
                inspector: formData.inspector,

                expected_completion_date: formData.expectedCompletionDate,
                sla_duration: formData.slaDuration,

                po_number: formData.poNumber,
                rfi_number: formData.rfiNumber,
                itp_number: formData.itpNumber,
                vendor_name: formData.vendorName,

                scope_selection: formData.scope,
                summary_result: {
                    ncr_issued: formData.ncrIssued,
                    order_completed: formData.orderCompleted,
                    overall_result: formData.overallResult
                },

                offered_items: formData.offeredItems,
                detailed_observation: formData.detailedObservation,
                attendees: formData.attendees,
                referred_documents: formData.referredDocs,
                test_instruments: formData.testInstruments,

                inspector_signature_url: formData.signatureInspector,
                reviewed_by_client: {
                    signature_url: formData.signatureClient,
                    date: new Date()
                },

                custom_checklists: [{
                    category: 'General',
                    items: formData.checklistItems.map(item => ({
                        parameter: item.parameter,
                        standard_value: item.standard,
                        observed_value: item.observed,
                        result: item.result,
                        remarks: item.remarks
                    }))
                }],

                lift_identification_no: 'N/A',
                report_no: null
            };

            const response = await api.post('/inspections', payload);
            toast.success("Inspection Created Successfully!");

            // Generate PDF with the returned data (which includes generated Report No)
            const serviceName = services.find(s => s._id === formData.serviceId)?.name || 'Engineering Inspection';
            await generateEngineeringInspection({ ...response.data, service_name: serviceName });

            navigate('/dashboard');
        } catch (error) {
            console.error("Creation failed:", error);
            toast.error("Failed to create inspection");
        }
        setIsLoading(false);
    };

    const getStaffByRole = (role) => staff.filter(u => u.role === role);

    const handleNext = () => { if (currentStep < 7) setCurrentStep(currentStep + 1); };
    const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

    const queryParams = new URLSearchParams(location.search);
    const pageTitle = queryParams.get('title') || "Create New Inspection";

    return (
        <div className="min-h-screen bg-background">
            <Header title={pageTitle} subtitle="Follow the steps to schedule a new inspection" />

            <div className="max-w-5xl mx-auto p-6">
                <Button variant="ghost" className="mb-4" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>

                {/* Steps Indicator */}
                <div className="flex items-center justify-between mb-8 px-10">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center relative z-10">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2
                                    ${currentStep === step.id ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-glow' :
                                        currentStep > step.id ? 'bg-green-500 text-white border-green-500' : 'bg-background text-muted-foreground border-muted'}
                                `}>
                                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.icon && <step.icon className="w-4 h-4" />}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${currentStep === step.id ? 'text-primary' : 'text-muted-foreground'}`}>{step.title}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`h-1 w-full -mx-4 mb-6 ${currentStep > step.id ? 'bg-green-500' : 'bg-muted'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <Card className="border shadow-lg">
                    <CardHeader className="border-b bg-muted/5">
                        <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                        <CardDescription>Step {currentStep} of 6</CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 min-h-[400px]">
                        {/* STEP 1: BASIC INFO */}
                        {currentStep === 1 && (
                            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label>Service Name *</Label>
                                    <Select value={formData.serviceId} onValueChange={v => handleChange('serviceId', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                                        <SelectContent>
                                            {services.map(s => <SelectItem key={s._id} value={s._id}>{s.name || 'Unnamed Service'}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Inspection Type *</Label>
                                    <Select value={formData.inspectionType} onValueChange={v => handleChange('inspectionType', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Annual">Annual</SelectItem>
                                            <SelectItem value="Routine">Routine</SelectItem>
                                            <SelectItem value="Third Party">Third Party</SelectItem>
                                            <SelectItem value="Engineering Inspection">Engineering Inspection</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Select Company *</Label>
                                    <Select
                                        value={clients.find(c => c.name === formData.clientName)?._id || ""}
                                        onValueChange={handleCompanyChange}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger>
                                        <SelectContent>
                                            <ScrollArea className="h-[200px]">
                                                {clients.map(c => (
                                                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                                                ))}
                                                {clients.length === 0 && (
                                                    <div className="p-2 text-xs text-center text-muted-foreground">No companies found</div>
                                                )}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground">Select an existing company from the database</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Project Name</Label>
                                    <Input value={formData.projectName} onChange={e => handleChange('projectName', e.target.value)} placeholder="e.g. Metro Line 1" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Site Location</Label>
                                    <Input value={formData.siteLocation} onChange={e => handleChange('siteLocation', e.target.value)} placeholder="Full address" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Inspection Date</Label>
                                    <Input type="date" value={formData.inspectionDate} onChange={e => handleChange('inspectionDate', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select value={formData.priority} onValueChange={v => handleChange('priority', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: ASSIGNMENT */}
                        {currentStep === 2 && (
                            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label>Service Manager</Label>
                                    <Select value={formData.serviceManager} onValueChange={v => handleChange('serviceManager', v)}>
                                        <SelectTrigger><SelectValue placeholder="Auto Assign / Select" /></SelectTrigger>
                                        <SelectContent>
                                            {getStaffByRole('service_manager').map(u => <SelectItem key={u._id} value={u._id}>{u.full_name || u.email}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Inspection Coordinator</Label>
                                    <Select value={formData.inspectionCoordinator} onValueChange={v => handleChange('inspectionCoordinator', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Coordinator" /></SelectTrigger>
                                        <SelectContent>
                                            {getStaffByRole('inspection_coordinator').map(u => <SelectItem key={u._id} value={u._id}>{u.full_name || u.email}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Technical Coordinator</Label>
                                    <Select value={formData.technicalCoordinator} onValueChange={v => handleChange('technicalCoordinator', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Tech Coordinator" /></SelectTrigger>
                                        <SelectContent>
                                            {getStaffByRole('technical_coordinator').map(u => <SelectItem key={u._id} value={u._id}>{u.full_name || u.email}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Inspector / Engineer</Label>
                                    <Select value={formData.inspector} onValueChange={v => handleChange('inspector', v)}>
                                        <SelectTrigger><SelectValue placeholder="Assign Inspector" /></SelectTrigger>
                                        <SelectContent>
                                            {getStaffByRole('inspector').map(u => <SelectItem key={u._id} value={u._id}>{u.full_name || u.email}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Completion</Label>
                                    <Input type="date" value={formData.expectedCompletionDate} onChange={e => handleChange('expectedCompletionDate', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>SLA Duration</Label>
                                    <Input value={formData.slaDuration} onChange={e => handleChange('slaDuration', e.target.value)} placeholder="e.g. 5 Days" />
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SCOPE & REFERENCE */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in">
                                {/* References Section (Moved here or kept in Page 1, user asked for box 2) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>PO Number</Label>
                                        <Input value={formData.poNumber} onChange={e => handleChange('poNumber', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>RFI / Notification No</Label>
                                        <Input value={formData.rfiNumber} onChange={e => handleChange('rfiNumber', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ITP / QAP No</Label>
                                        <Input value={formData.itpNumber} onChange={e => handleChange('itpNumber', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Vendor Name</Label>
                                        <Input value={formData.vendorName} onChange={e => handleChange('vendorName', e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-4 border p-4 rounded-lg bg-muted/10">
                                    <h3 className="font-bold border-b pb-2">Scope of Inspection</h3>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        {['PIM', 'In Process', 'Final',
                                            'Mechanical', 'Electrical', 'Instrumentation',
                                            'Visual', 'Dimensions', 'Painting', 'Document Review',
                                            'DT Witness', 'NDT Witness', 'TPM', 'FAT'].map(item => {
                                                const key = item.toLowerCase().replace(/ /g, '');
                                                return (
                                                    <div key={key} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={key}
                                                            checked={formData.scope?.[key] || false}
                                                            onCheckedChange={(checked) => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    scope: { ...prev.scope, [key]: checked }
                                                                }));
                                                            }}
                                                        />
                                                        <label htmlFor={key} className="font-medium cursor-pointer">{item}</label>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold border-b pb-2">Inspection Summary (Box 4)</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>NCR Issued?</Label>
                                            <Select value={formData.ncrIssued} onValueChange={v => handleChange('ncrIssued', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Order Completed?</Label>
                                            <Select value={formData.orderCompleted} onValueChange={v => handleChange('orderCompleted', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Overall Result</Label>
                                            <Select value={formData.overallResult} onValueChange={v => handleChange('overallResult', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                                                    <SelectItem value="Not Satisfactory">Not Satisfactory</SelectItem>
                                                    <SelectItem value="Conditional">Conditional</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: CHECKLIST */}
                        {currentStep === 4 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <ListChecks className="w-5 h-5" />
                                        {formData.inspectionType || 'Standard'} Checklist
                                    </h3>
                                    <Badge variant="outline">{formData.checklistItems.length} Items</Badge>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="grid grid-cols-12 gap-2 bg-muted/50 p-3 text-sm font-medium border-b">
                                        <div className="col-span-3">Parameter</div>
                                        <div className="col-span-3">Standard</div>
                                        <div className="col-span-2">Observed</div>
                                        <div className="col-span-2">Result</div>
                                        <div className="col-span-2">Remarks</div>
                                    </div>
                                    <ScrollArea className="h-[400px]">
                                        <div className="divide-y">
                                            {formData.checklistItems.map((item, idx) => (
                                                <div key={idx} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-muted/20 transition-colors">
                                                    <div className="col-span-3 text-sm font-medium">{item.parameter}</div>
                                                    <div className="col-span-3 text-xs text-muted-foreground">{item.standard}</div>
                                                    <div className="col-span-2">
                                                        <Input
                                                            className="h-8 text-xs"
                                                            placeholder="Value"
                                                            value={item.observed}
                                                            onChange={(e) => handleChecklistChange(idx, 'observed', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Select
                                                            value={item.result}
                                                            onValueChange={(v) => handleChecklistChange(idx, 'result', v)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="-" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Pass" className="text-green-600">Pass</SelectItem>
                                                                <SelectItem value="Fail" className="text-red-600">Fail</SelectItem>
                                                                <SelectItem value="NA" className="text-gray-500">N/A</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Input
                                                            className="h-8 text-xs"
                                                            placeholder="Remarks"
                                                            value={item.remarks}
                                                            onChange={(e) => handleChecklistChange(idx, 'remarks', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {formData.checklistItems.length === 0 && (
                                                <div className="p-8 text-center text-muted-foreground text-sm">
                                                    No checklist items defined. Select an Inspection Type first.
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        )}



                        {/* STEP 5: ITEMS & INSTRUMENTS */}
                        {currentStep === 5 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Offered Items Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Briefcase className="w-5 h-5" /> Offered Items
                                        </h3>
                                        <Button size="sm" onClick={() => setFormData(prev => ({ ...prev, offeredItems: [...prev.offeredItems, { description: '', inspectedQty: 0, acceptedQty: 0 }] }))}>
                                            <Plus className="w-4 h-4 mr-2" /> Add Item
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-12 gap-2 text-xs font-bold uppercase text-muted-foreground px-2">
                                        <div className="col-span-6">Description</div>
                                        <div className="col-span-3">Inspected Qty</div>
                                        <div className="col-span-2">Accepted Qty</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.offeredItems.map((item, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-6"><Input value={item.description} onChange={e => {
                                                    const newItems = [...formData.offeredItems];
                                                    newItems[idx].description = e.target.value;
                                                    setFormData(prev => ({ ...prev, offeredItems: newItems }));
                                                }} placeholder="Item description..." className="h-9" /></div>
                                                <div className="col-span-3"><Input type="number" value={item.inspectedQty} onChange={e => {
                                                    const newItems = [...formData.offeredItems];
                                                    newItems[idx].inspectedQty = Number(e.target.value);
                                                    setFormData(prev => ({ ...prev, offeredItems: newItems }));
                                                }} className="h-9" /></div>
                                                <div className="col-span-2"><Input type="number" value={item.acceptedQty} onChange={e => {
                                                    const newItems = [...formData.offeredItems];
                                                    newItems[idx].acceptedQty = Number(e.target.value);
                                                    setFormData(prev => ({ ...prev, offeredItems: newItems }));
                                                }} className="h-9" /></div>
                                                <div className="col-span-1 border-hidden flex justify-end">
                                                    <Button variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, offeredItems: prev.offeredItems.filter((_, i) => i !== idx) }))} className="text-red-500 h-9 w-9">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.offeredItems.length === 0 && <p className="text-sm text-center text-muted-foreground italic border border-dashed p-4 rounded-lg">No items added. Click "Add Item" to begin.</p>}
                                    </div>
                                </div>

                                {/* Test Instruments Used */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Briefcase className="w-5 h-5" /> Test Instruments Used
                                        </h3>
                                        <Button size="sm" onClick={() => setFormData(prev => ({ ...prev, testInstruments: [...prev.testInstruments, { name: '', idNumber: '', calibrationDue: '' }] }))}>
                                            <Plus className="w-4 h-4 mr-2" /> Add Instrument
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-12 gap-2 text-xs font-bold uppercase text-muted-foreground px-2">
                                        <div className="col-span-5">Instrument Name</div>
                                        <div className="col-span-3">ID Number</div>
                                        <div className="col-span-3">Cal Due Date</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.testInstruments.map((inst, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-5"><Input value={inst.name} onChange={e => {
                                                    const newItems = [...formData.testInstruments];
                                                    newItems[idx].name = e.target.value;
                                                    setFormData(prev => ({ ...prev, testInstruments: newItems }));
                                                }} placeholder="e.g. Multimeter" className="h-9" /></div>
                                                <div className="col-span-3"><Input value={inst.idNumber} onChange={e => {
                                                    const newItems = [...formData.testInstruments];
                                                    newItems[idx].idNumber = e.target.value;
                                                    setFormData(prev => ({ ...prev, testInstruments: newItems }));
                                                }} placeholder="ID-001" className="h-9" /></div>
                                                <div className="col-span-3"><Input type="date" value={inst.calibrationDue} onChange={e => {
                                                    const newItems = [...formData.testInstruments];
                                                    newItems[idx].calibrationDue = e.target.value;
                                                    setFormData(prev => ({ ...prev, testInstruments: newItems }));
                                                }} className="h-9" /></div>
                                                <div className="col-span-1 border-hidden flex justify-end">
                                                    <Button variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, testInstruments: prev.testInstruments.filter((_, i) => i !== idx) }))} className="text-red-500 h-9 w-9">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.testInstruments.length === 0 && <p className="text-sm text-center text-muted-foreground italic border border-dashed p-4 rounded-lg">No instruments added.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 6: FINALIZATION (Attendees, Signatures & Files) */}
                        {currentStep === 6 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Attendees Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <User className="w-5 h-5" /> Attendees
                                        </h3>
                                        <Button size="sm" onClick={() => setFormData(prev => ({ ...prev, attendees: [...prev.attendees, { name: '', position: '', company: '', contact: '' }] }))}>
                                            <Plus className="w-4 h-4 mr-2" /> Add Attendee
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.attendees.map((a, idx) => (
                                            <div key={idx} className="grid grid-cols-4 gap-2 border p-3 rounded-lg relative group">
                                                <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 bg-background border shadow-sm text-red-500 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setFormData(prev => ({ ...prev, attendees: prev.attendees.filter((_, i) => i !== idx) }))}>
                                                    <X className="w-3 h-3" />
                                                </Button>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase text-muted-foreground">Name</Label>
                                                    <Input value={a.name} onChange={e => {
                                                        const newItems = [...formData.attendees];
                                                        newItems[idx].name = e.target.value;
                                                        setFormData(prev => ({ ...prev, attendees: newItems }));
                                                    }} className="h-8 text-xs" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase text-muted-foreground">Position</Label>
                                                    <Input value={a.position} onChange={e => {
                                                        const newItems = [...formData.attendees];
                                                        newItems[idx].position = e.target.value;
                                                        setFormData(prev => ({ ...prev, attendees: newItems }));
                                                    }} className="h-8 text-xs" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase text-muted-foreground">Company</Label>
                                                    <Input value={a.company} onChange={e => {
                                                        const newItems = [...formData.attendees];
                                                        newItems[idx].company = e.target.value;
                                                        setFormData(prev => ({ ...prev, attendees: newItems }));
                                                    }} className="h-8 text-xs" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase text-muted-foreground">Contact</Label>
                                                    <Input value={a.contact} onChange={e => {
                                                        const newItems = [...formData.attendees];
                                                        newItems[idx].contact = e.target.value;
                                                        setFormData(prev => ({ ...prev, attendees: newItems }));
                                                    }} className="h-8 text-xs" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Signatures (Moved/Existing) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Inspector Signature</Label>
                                        <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                                            <SignatureCanvas
                                                penColor="black"
                                                canvasProps={{ className: 'sigCanvas w-full h-[150px]' }}
                                                ref={sigCanvas1}
                                                onEnd={() => setFormData(prev => ({ ...prev, signatureInspector: sigCanvas1.current.toDataURL() }))}
                                            />
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-[10px] text-muted-foreground">Draw signature above</p>
                                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { sigCanvas1.current.clear(); setFormData(prev => ({ ...prev, signatureInspector: '' })); }}>Clear</Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">Client Signature</Label>
                                        <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                                            <SignatureCanvas
                                                penColor="black"
                                                canvasProps={{ className: 'sigCanvas w-full h-[150px]' }}
                                                ref={sigCanvas2}
                                                onEnd={() => setFormData(prev => ({ ...prev, signatureClient: sigCanvas2.current.toDataURL() }))}
                                            />
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-[10px] text-muted-foreground">Draw signature above</p>
                                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { sigCanvas2.current.clear(); setFormData(prev => ({ ...prev, signatureClient: '' })); }}>Clear</Button>
                                        </div>
                                    </div>
                                </div>

                                {/* File Uploads (Quick version) */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Upload className="w-5 h-5" /> Photos & Attachments
                                    </h3>
                                    <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-muted/10 transition-colors relative">
                                        <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} />
                                        <div className="flex flex-col items-center gap-1 pointer-events-none">
                                            <Upload className="w-8 h-8 text-primary mb-2" />
                                            <p className="text-sm font-medium">Click or drag photos/files</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.documents.map((doc, i) => (
                                            <Badge key={i} variant="secondary" className="gap-2 py-1 px-3">
                                                <FileText className="w-3 h-3" /> {doc.name.slice(0, 15)}...
                                                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeDocument(i)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 7: REVIEW */}
                        {currentStep === 7 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-muted/30 p-6 rounded-xl space-y-4 border">
                                    <h3 className="font-semibold text-lg flex items-center"><Check className="w-5 h-5 mr-2 text-green-500" /> Ready to Submit</h3>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                        <div><span className="text-muted-foreground block text-xs uppercase">Client</span> {formData.clientName}</div>
                                        <div><span className="text-muted-foreground block text-xs uppercase">Project</span> {formData.projectName}</div>
                                        <div><span className="text-muted-foreground block text-xs uppercase">Location</span> {formData.siteLocation}</div>
                                        <div><span className="text-muted-foreground block text-xs uppercase">Date</span> {formData.inspectionDate}</div>
                                        <div><span className="text-muted-foreground block text-xs uppercase">Priority</span> {formData.priority}</div>
                                        <div><span className="text-muted-foreground block text-xs uppercase">Checklist</span> {formData.checklistItems.length} Items</div>
                                        <div><span className="text-muted-foreground block text-xs uppercase">Offered Items</span> {formData.offeredItems.length}</div>
                                        <div><span className="text-muted-foreground block text-xs uppercase">Instruments</span> {formData.testInstruments.length}</div>
                                        <div><span className="text-muted-foreground block text-xs uppercase">Attendees</span> {formData.attendees.length}</div>
                                        <div><span className="text-muted-foreground block text-xs uppercase">Files</span> {formData.documents.length}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-center text-muted-foreground">Please review all details before creating the inspection.</p>
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6 bg-muted/5">
                        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <div className="gap-2 flex">
                            {currentStep < 7 ? (
                                <Button onClick={() => setCurrentStep(currentStep + 1)}>
                                    Next <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary hover:bg-primary/90 min-w-[150px]">
                                    <Save className="w-4 h-4 mr-2" />
                                    {isLoading ? 'Saving...' : 'Generate Report'}
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default CreateInspectionPage;
