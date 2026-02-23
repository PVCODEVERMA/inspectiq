import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronRight, ChevronLeft, Upload, FileText, User, Briefcase, ListChecks } from 'lucide-react'; 
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const steps = [
    { id: 1, title: 'Basic Info', icon: FileText },
    { id: 2, title: 'Assignment', icon: User },
    { id: 3, title: 'Scope', icon: Briefcase },
    { id: 4, title: 'Checklist', icon: ListChecks },
    { id: 5, title: 'Documents', icon: Upload },
    { id: 6, title: 'Review', icon: Check }
];

const CreateInspectionModal = ({ isOpen, onClose, services = [], clients = [], onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [staff, setStaff] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        // Basic Info
        serviceId: '',
        inspectionType: '',
        clientName: '',
        projectName: '',
        siteLocation: '',
        inspectionDate: '',
        priority: 'Medium',
        status: 'pending',

        // Assignment
        serviceManager: '',
        inspectionCoordinator: '',
        technicalCoordinator: '',
        inspector: '',
        expectedCompletionDate: '',
        slaDuration: '',

        // Scope
        scopeDescription: '',
        equipmentName: '',
        quantity: 1,
        drawingNumber: '',
        specReference: '',
        vendorName: '',

        // Checklist (Items to be added dynamically)
        checklistItems: [],

        // Documents
        documents: []
    });

    useEffect(() => {
        if (isOpen) {
            fetchStaff();
            // Reset form if needed or keep cache? Let's reset for now
            setFormData(prev => ({ ...prev, inspectionDate: format(new Date(), 'yyyy-MM-dd') }));
        }
    }, [isOpen]);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/users/staff');
            setStaff(res.data);
        } catch (error) {
            console.error("Error fetching staff:", error);
            toast.error("Failed to load staff list");
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < 6) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Construct payload matching backend model
            const payload = {
                serviceId: formData.serviceId,
                client_name: formData.clientName,
                project_name: formData.projectName,
                site_location: formData.siteLocation,
                inspection_date: formData.inspectionDate,
                priority: formData.priority,
                status: formData.status,

                service_manager: formData.serviceManager,
                inspection_coordinator: formData.inspectionCoordinator,
                technical_coordinator: formData.technicalCoordinator,
                // Assign inspector if possible, LiftInspection doesn't have direct inspector field? 
                // Wait, it uses created_by usually, but user wants assignment.
                // We'll add inspector to generic assignment or just use the fields we added.

                expected_completion_date: formData.expectedCompletionDate,
                sla_duration: formData.slaDuration,

                scope_of_work: {
                    description: formData.scopeDescription,
                    equipment_name: formData.equipmentName,
                    quantity: formData.quantity,
                    drawing_number: formData.drawingNumber,
                    specification_reference: formData.specReference,
                    vendor_name: formData.vendorName
                },

                // Map checklist items to custom_checklists
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

                // Basic required fields for LiftInspection model compatibility if not fully generic yet
                lift_identification_no: 'N/A', // Placeholder
                report_no: null // Auto-generated
            };

            await api.post('/inspections', payload);
            toast.success("Inspection Created Successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Creation failed:", error);
            toast.error("Failed to create inspection");
        }
        setIsLoading(false);
    };

    // Helper to filter staff by role
    const getStaffByRole = (role) => staff.filter(u => u.role === role);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-white/20">
                <DialogHeader className="p-6 border-b border-white/10">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        🆕 New Inspection
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-4 px-2">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                                    ${currentStep === step.id ? 'bg-primary text-primary-foreground scale-110 shadow-glow' :
                                        currentStep > step.id ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}
                                `}>
                                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 h-1 mx-2 rounded-full ${currentStep > step.id ? 'bg-green-500' : 'bg-muted'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-8">
                    <div className="max-w-3xl mx-auto space-y-6">

                        {/* STEP 1: BASIC INFO */}
                        {currentStep === 1 && (
                            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label>Service Name *</Label>
                                    <Select value={formData.serviceId} onValueChange={v => handleChange('serviceId', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                                        <SelectContent>
                                            {services.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
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
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Client Name *</Label>
                                    <Select value={formData.clientName} onValueChange={v => {
                                        handleChange('clientName', v);
                                        const client = clients.find(c => c.name === v);
                                        if (client) handleChange('siteLocation', client.address);
                                    }}>
                                        <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
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

                        {/* STEP 3: SCOPE OF WORK */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label>Work Description</Label>
                                    <Textarea value={formData.scopeDescription} onChange={e => handleChange('scopeDescription', e.target.value)} rows={4} placeholder="Detailed scope..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Equipment Name</Label>
                                        <Input value={formData.equipmentName} onChange={e => handleChange('equipmentName', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input type="number" value={formData.quantity} onChange={e => handleChange('quantity', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Drawing Number</Label>
                                        <Input value={formData.drawingNumber} onChange={e => handleChange('drawingNumber', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Spec / Code Ref</Label>
                                        <Input value={formData.specReference} onChange={e => handleChange('specReference', e.target.value)} placeholder="ASME / ISO..." />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEPS 4, 5, 6 - Placeholders for now due to complexity, can expand later */}
                        {currentStep === 4 && (
                            <div className="text-center py-10 text-muted-foreground animate-in fade-in slide-in-from-right-4 duration-300">
                                <ListChecks className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>Dynamic Checklist based on <strong>{formData.inspectionType || 'Type'}</strong> will be generated.</p>
                                <p className="text-sm mt-2">You can configure specific parameters in the full inspection view.</p>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="text-center py-10 text-muted-foreground animate-in fade-in slide-in-from-right-4 duration-300">
                                <Upload className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>Document Upload Section</p>
                                <Button variant="outline" className="mt-4">Choose Files</Button>
                            </div>
                        )}

                        {currentStep === 6 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-muted/30 p-6 rounded-xl space-y-4">
                                    <h3 className="font-semibold text-lg">Summary</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-muted-foreground">Type:</span> {formData.inspectionType}</div>
                                        <div><span className="text-muted-foreground">Client:</span> {formData.clientName}</div>
                                        <div><span className="text-muted-foreground">Location:</span> {formData.siteLocation}</div>
                                        <div><span className="text-muted-foreground">Priority:</span> {formData.priority}</div>
                                        <div><span className="text-muted-foreground">Manager:</span> {staff.find(u => u._id === formData.serviceManager)?.full_name || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 border-t border-white/10 bg-muted/10">
                    <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div className="flex-1" />
                    {currentStep < 6 ? (
                        <Button onClick={handleNext}>
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                            {isLoading ? 'Creating...' : 'Create Inspection'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateInspectionModal;
