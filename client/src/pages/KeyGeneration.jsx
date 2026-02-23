import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
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
import api from '@/lib/api';
import {
    Key,
    UserPlus,
    Copy,
    CheckCircle,
    Shield,
    Send,
    RefreshCw,
    Boxes,
} from 'lucide-react';

const KeyGeneration = () => {
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
                toast.success('Secret key generated successfully!');
            }
        } catch (error) {
            toast.error('Failed to generate key');
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
Welcome to InspectIQ! 

Login Email: ${generatedData.email}
Password: ${generatedData.password || generatedData.privateKey}
Role: ${generatedData.role.replace('_', ' ').toUpperCase()}
            `.trim();
            navigator.clipboard.writeText(details);
            toast.success('Login details copied!');
        }
    };

    const handleWhatsAppShare = () => {
        if (generatedData) {
            const message = `
*Welcome to InspectIQ!* 🚀

 Your account is ready:
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
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="pt-6 text-center">
                        <Key className="w-16 h-16 mx-auto text-destructive mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                        <p className="text-muted-foreground">You need Master Admin privileges to access this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header
                title="Create Member"
                subtitle="Generate secure login credentials for new team members"
            />

            <div className="p-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Key Generation Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-primary" />
                                Member Details
                            </CardTitle>
                            <CardDescription>
                                Fill in the details to create a new member account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleGenerateKey} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name *</Label>
                                    <Input
                                        id="full_name"
                                        placeholder="Enter full name"
                                        value={formData.full_name}
                                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@company.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">WhatsApp Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        placeholder="+91 XXXXX XXXXX"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Initial Password (Optional)</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Leave blank to use Secret Key"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role Assignment *</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(val) => handleInputChange('role', val)}
                                    >
                                        <SelectTrigger id="role">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="service_manager">Service Manager</SelectItem>
                                            <SelectItem value="inspection_coordinator">Inspection Coordinator</SelectItem>
                                            <SelectItem value="technical_coordinator">Technical Coordinator</SelectItem>
                                            <SelectItem value="inspector">Inspector Engineer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Boxes className="w-4 h-4 text-primary" />
                                        <Label className="text-sm font-semibold">Assign Services (Quality Modules)</Label>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/30 rounded-2xl border border-dashed">
                                        {availableServices.map((service) => (
                                            <div key={service._id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={service._id}
                                                    checked={formData.assignedServices?.includes(service._id)}
                                                    onCheckedChange={() => handleServiceToggle(service._id)}
                                                    className="rounded-[6px]"
                                                />
                                                <label
                                                    htmlFor={service._id}
                                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {service.name}
                                                </label>
                                            </div>
                                        ))}
                                        {availableServices.length === 0 && (
                                            <p className="text-[10px] text-muted-foreground col-span-full text-center">No active services found</p>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isGenerating}
                                    variant="hero"
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Member...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Create Account
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Member Details Display */}
                    <Card className={generatedData ? 'border-primary' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Login Credentials
                            </CardTitle>
                            <CardDescription>
                                {generatedData
                                    ? 'Share these login details with the member'
                                    : 'Credentials will appear here after creation'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {generatedData ? (
                                <div className="space-y-5">
                                    <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                                        <CheckCircle className="w-10 h-10 mx-auto text-success mb-2" />
                                        <p className="text-sm font-semibold text-success uppercase tracking-wider">Account Created!</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Login Email</Label>
                                                <p className="font-semibold text-sm truncate">{generatedData.email}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Password</Label>
                                                <p className="font-semibold text-sm truncate">{generatedData.password || generatedData.privateKey}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Full Name</Label>
                                            <p className="font-medium text-sm">{generatedData.full_name}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Role</Label>
                                                <p className="font-medium text-sm capitalize">{generatedData.role.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <Button
                                            className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center gap-2"
                                            onClick={handleWhatsAppShare}
                                            disabled={!generatedData.phoneNumber}
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                            </svg>
                                            Share on WhatsApp
                                        </Button>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={handleCopyAllDetails}
                                            >
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy Details
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={handleReset}
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                New Creation
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground opacity-30">
                                    <Shield className="w-20 h-20 mx-auto mb-4" />
                                    <p className="text-sm font-medium">Account details will be<br />displayed here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default KeyGeneration;
