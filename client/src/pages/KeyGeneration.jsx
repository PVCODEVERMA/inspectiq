import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import api, { getFileUrl } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import {
    Key,
    UserPlus,
    Copy,
    CheckCircle,
    Shield,
    Send,
    RefreshCw,
    Boxes,
    ChevronLeft,
    Mail,
    Smartphone,
    Lock,
    User,
    QrCode
} from 'lucide-react';

const KeyGeneration = () => {
    const navigate = useNavigate();
    const { createUser, role } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'inspector',
        assignedServices: []
    });
    const [availableServices, setAvailableServices] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedData, setGeneratedData] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get('/services/active');
                setAvailableServices(response.data);
            } catch (error) {
                console.error('Error fetching services:', error);
                toast.error('Failed to load available services');
            }
        };
        fetchServices();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleServiceToggle = (serviceId) => {
        setFormData(prev => {
            const current = prev.assignedServices || [];
            if (current.includes(serviceId)) {
                return { ...prev, assignedServices: current.filter(id => id !== serviceId) };
            } else {
                return { ...prev, assignedServices: [...current, serviceId] };
            }
        });
    };

    const handleGenerateKey = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const result = await createUser(formData);
            if (result.success) {
                setGeneratedData({
                    ...formData,
                    privateKey: result.data.privateKey,
                    userId: result.data.user.id
                });
                toast.success('Member created successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create member');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setFormData({
            full_name: '',
            email: '',
            phoneNumber: '',
            password: '',
            role: 'inspector',
            assignedServices: []
        });
        setGeneratedData(null);
    };

    const handleCopyAllDetails = () => {
        if (generatedData) {
            const details = `
Welcome to InspectIQ! 🚀

👤 Name: ${generatedData.full_name}
📧 Login Email: ${generatedData.email}
🔑 Password: ${generatedData.password || generatedData.privateKey}
🛡️ Role: ${generatedData.role.replace('_', ' ').toUpperCase()}

Please login at your company portal.
            `.trim();
            navigator.clipboard.writeText(details);
            toast.success('Login details copied!');
        }
    };

    const handleWhatsAppShare = () => {
        if (generatedData) {
            const message = `
*Welcome to InspectIQ!* 🚀

Hello *${generatedData.full_name}*, your team account is ready:

📧 *Email:* ${generatedData.email}
🔑 *Password:* ${generatedData.password || generatedData.privateKey}
👤 *Role:* ${generatedData.role.replace('_', ' ').toUpperCase()}

Please keep these credentials secure.
            `.trim();

            const phoneNumber = generatedData.phoneNumber.replace(/[^0-9]/g, '');
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    };

    if (role !== 'master_admin') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
                <Card className="w-full max-w-md border-none shadow-premium rounded-[32px] overflow-hidden">
                    <CardContent className="pt-12 pb-12 text-center space-y-4">
                        <div className="w-20 h-20 bg-destructive/10 rounded-[24px] flex items-center justify-center mx-auto text-destructive">
                            <Shield className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Access Denied</h2>
                        <p className="text-muted-foreground font-medium">You need Master Admin privileges to onboard new members.</p>
                        <Button variant="outline" className="rounded-2xl h-12 px-8" onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Custom Header with Back Button */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-2xl h-10 w-10 sm:h-12 sm:w-12 bg-white shadow-sm border border-slate-100 hover:bg-slate-50"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </Button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">Onboard Member</h1>
                            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">TEAM ACCESS MANAGEMENT</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black text-primary uppercase tracking-wider">Super Admin Node</span>
                    </div>
                </div>
            </div>

            <main className="px-4 sm:px-6 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                    {/* Form Section */}
                    <div className="lg:col-span-7 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                        <Card className="border-none shadow-premium rounded-[32px] overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 sm:p-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
                                        <UserPlus className="w-6 h-6" />
                                    </div>
                                    <div className="text-white">
                                        <CardTitle className="text-xl font-black tracking-tight">Member Identity</CardTitle>
                                        <CardDescription className="text-slate-300 font-medium text-xs">Fill in official details for system registration</CardDescription>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-6 sm:p-8 space-y-6">
                                <form onSubmit={handleGenerateKey} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2 group">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2 ml-1">
                                                <User className="w-3.5 h-3.5 text-primary/40 group-focus-within:text-primary transition-colors" />
                                                Full Name
                                            </Label>
                                            <Input
                                                placeholder="John Doe"
                                                className="h-12 sm:h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-bold focus:bg-white focus:ring-primary/20 transition-all px-4"
                                                value={formData.full_name}
                                                onChange={(e) => handleInputChange('full_name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2 ml-1">
                                                <Mail className="w-3.5 h-3.5 text-primary/40 group-focus-within:text-primary transition-colors" />
                                                Email Address
                                            </Label>
                                            <Input
                                                type="email"
                                                placeholder="email@company.com"
                                                className="h-12 sm:h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-bold focus:bg-white focus:ring-primary/20 transition-all px-4"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2 group">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2 ml-1">
                                                <Smartphone className="w-3.5 h-3.5 text-primary/40 group-focus-within:text-primary transition-colors" />
                                                WhatsApp Number
                                            </Label>
                                            <Input
                                                type="tel"
                                                placeholder="+91 XXXXX XXXXX"
                                                className="h-12 sm:h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-bold focus:bg-white focus:ring-primary/20 transition-all px-4"
                                                value={formData.phoneNumber}
                                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2 ml-1">
                                                <Lock className="w-3.5 h-3.5 text-primary/40 group-focus-within:text-primary transition-colors" />
                                                Set Password
                                            </Label>
                                            <Input
                                                type="password"
                                                placeholder="Leave empty for auto-key"
                                                className="h-12 sm:h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-bold focus:bg-white focus:ring-primary/20 transition-all px-4"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2 ml-1">
                                            <Shield className="w-3.5 h-3.5 text-primary/40 group-focus-within:text-primary transition-colors" />
                                            System Role
                                        </Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(val) => handleInputChange('role', val)}
                                        >
                                            <SelectTrigger className="h-12 sm:h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-bold px-4">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl p-2">
                                                <SelectItem value="service_manager" className="rounded-xl font-bold py-3 px-4">Service Manager</SelectItem>
                                                <SelectItem value="inspection_coordinator" className="rounded-xl font-bold py-3 px-4">Inspection Coordinator</SelectItem>
                                                <SelectItem value="technical_coordinator" className="rounded-xl font-bold py-3 px-4">Technical Coordinator</SelectItem>
                                                <SelectItem value="inspector" className="rounded-xl font-bold py-3 px-4">Inspector Engineer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Boxes className="w-4 h-4" />
                                                </div>
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-700">Service Permissions</Label>
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground/60">SELECT ALL THAT APPLY</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5 bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200">
                                            {availableServices.map((service) => (
                                                <div key={service._id} className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-100 hover:border-primary/20 transition-all">
                                                    <Checkbox
                                                        id={service._id}
                                                        checked={formData.assignedServices?.includes(service._id)}
                                                        onCheckedChange={() => handleServiceToggle(service._id)}
                                                        className="h-5 w-5 rounded-[6px]"
                                                    />
                                                    <label
                                                        htmlFor={service._id}
                                                        className="text-xs font-bold text-slate-700 cursor-pointer select-none leading-tight"
                                                    >
                                                        {service.name}
                                                    </label>
                                                </div>
                                            ))}
                                            {availableServices.length === 0 && (
                                                <p className="text-[10px] text-muted-foreground col-span-full text-center py-4 font-bold uppercase tracking-widest">No quality modules active</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-14 sm:h-16 w-full rounded-[24px] shadow-lg shadow-black/10 text-base font-black tracking-tight"
                                        disabled={isGenerating}
                                        variant="hero"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                                VERIFYING & CREATING...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="mr-2 h-5 w-5" />
                                                INITIALIZE MEMBER ACCOUNT
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Output Section */}
                    <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-8 duration-700 delay-100 fill-mode-both">
                        <Card className={`border-none shadow-premium rounded-[32px] overflow-hidden transition-all duration-500 ${generatedData ? 'ring-2 ring-primary bg-white' : 'bg-slate-100/50 border-2 border-dashed border-slate-200 shadow-none'}`}>
                            <div className={`p-6 sm:p-8 flex items-center justify-between ${generatedData ? 'bg-primary/5 border-b border-primary/10' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${generatedData ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black tracking-tight">Security Node</CardTitle>
                                        <CardDescription className="text-[11px] font-bold uppercase tracking-widest">Access Credentials</CardDescription>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-6 sm:p-8 min-h-[400px] flex flex-col justify-center">
                                {generatedData ? (
                                    <div className="space-y-8 animate-in zoom-in duration-500">
                                        <div className="flex flex-col items-center gap-4 py-4">
                                            <div className="w-20 h-20 bg-success/10 rounded-[32px] flex items-center justify-center text-success border-2 border-success/20 shadow-lg shadow-success/10">
                                                <CheckCircle className="w-10 h-10" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Onboarding Complete</h3>
                                                <p className="text-xs font-bold text-success uppercase tracking-widest mt-1">Credentials initialized</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-6 bg-slate-50 rounded-[28px] border border-slate-100 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <QrCode className="w-16 h-16 text-slate-800" />
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 relative z-10">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest ml-1">Portal User ID</Label>
                                                    <div className="p-4 bg-white rounded-xl border border-slate-100 font-bold text-sm shadow-sm">{generatedData.email}</div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest ml-1">Secure Passkey</Label>
                                                    <div className="p-4 bg-white rounded-xl border border-primary/20 font-mono font-black text-primary text-lg tracking-wider shadow-sm flex justify-between items-center group/key">
                                                        <span className="truncate">{generatedData.password || generatedData.privateKey}</span>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover/key:bg-primary/10 transition-colors" onClick={() => {
                                                            navigator.clipboard.writeText(generatedData.password || generatedData.privateKey);
                                                            toast.success('Passkey copied!');
                                                        }}>
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <Button
                                                className="h-14 w-full bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-2xl flex items-center justify-center gap-3 font-black shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-95"
                                                onClick={handleWhatsAppShare}
                                                disabled={!generatedData.phoneNumber}
                                            >
                                                <Send className="w-5 h-5" />
                                                SHARE ON WHATSAPP
                                            </Button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="h-14 rounded-2xl font-black border-2 border-slate-100 hover:border-primary/20"
                                                    onClick={handleCopyAllDetails}
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    COPY ALL
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    className="h-14 rounded-2xl font-black bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    onClick={handleReset}
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    NEW ENTRY
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4 opacity-30 group">
                                        <div className="w-24 h-24 bg-slate-200 rounded-[40px] flex items-center justify-center mx-auto text-slate-400 group-hover:scale-110 transition-transform duration-500">
                                            <Lock className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-800 tracking-tight">ENCRYPTED NODE</p>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Waiting for identity data...</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default KeyGeneration;
