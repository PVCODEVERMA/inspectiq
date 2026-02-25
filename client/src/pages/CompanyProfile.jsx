import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Globe,
    FileText,
    CreditCard,
    Palette,
    Save,
    Loader2,
    Upload,
    Landmark,
    ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { getFileUrl } from '@/lib/utils';

const CompanyProfile = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logoUrl: '',
        gstin: '',
        pan: '',
        bankDetails: {
            bankName: '',
            accountNo: '',
            ifscCode: '',
            branch: ''
        },
        reportBranding: {
            headerColor: '#F44034',
            footerText: ''
        }
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/company-profile');
            if (response.data) {
                setFormData(response.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load company profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value, section = null) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put('/company-profile', formData);
            toast.success('Company profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await api.post('/upload', uploadData);
            handleInputChange('logoUrl', response.data.url);
            toast.success('Logo uploaded successfully');
        } catch (error) {
            console.error('Logo upload error:', error);
            toast.error('Failed to upload logo');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            <Header
                title="Company Profile"
                subtitle="Manage your organization"
            />

            <main className="p-4 sm:p-6 max-w-5xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="general" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <TabsList className="bg-muted/50 p-1 rounded-2xl h-12">
                                <TabsTrigger value="general" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    General
                                </TabsTrigger>
                                <TabsTrigger value="registration" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                    Registration
                                </TabsTrigger>
                                <TabsTrigger value="bank" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Landmark className="w-4 h-4 mr-2" />
                                    Banking
                                </TabsTrigger>
                                <TabsTrigger value="branding" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Palette className="w-4 h-4 mr-2" />
                                    Reports
                                </TabsTrigger>
                            </TabsList>

                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="rounded-2xl h-12 px-8 shadow-lg shadow-primary/20 animate-in fade-in zoom-in"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* General Info */}
                        <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-4">
                            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                                <CardHeader className="pb-4">
                                    <CardTitle>Organization Identity</CardTitle>
                                    <CardDescription>Basic contact and identification details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative group">
                                                <div className="w-32 h-32 rounded-3xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/20 group-hover:border-primary/50 transition-all">
                                                    {formData.logoUrl ? (
                                                        <img src={getFileUrl(formData.logoUrl)} alt="Logo" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <Building2 className="w-12 h-12 text-muted-foreground/30" />
                                                    )}
                                                </div>
                                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl cursor-pointer">
                                                    <Upload className="w-8 h-8 text-white" />
                                                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                                </label>
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Company Logo</span>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 col-span-full">
                                                <Label className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-primary" /> Company Name
                                                </Label>
                                                <Input
                                                    placeholder="Enter full company name"
                                                    className="rounded-xl h-12"
                                                    value={formData.companyName}
                                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-full">
                                                <Label className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-primary" /> Registered Address
                                                </Label>
                                                <Input
                                                    placeholder="Full registered address"
                                                    className="rounded-xl h-12"
                                                    value={formData.address}
                                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-primary" /> Contact Number
                                                </Label>
                                                <Input
                                                    placeholder="+91 XXXXX XXXXX"
                                                    className="rounded-xl h-12"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-primary" /> Official Email
                                                </Label>
                                                <Input
                                                    type="email"
                                                    placeholder="contact@company.com"
                                                    className="rounded-xl h-12"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-full">
                                                <Label className="flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-primary" /> Website URL
                                                </Label>
                                                <Input
                                                    placeholder="https://www.company.com"
                                                    className="rounded-xl h-12"
                                                    value={formData.website}
                                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Registration Details */}
                        <TabsContent value="registration" className="animate-in fade-in slide-in-from-bottom-4">
                            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                                <CardHeader>
                                    <CardTitle>Compliance & ID</CardTitle>
                                    <CardDescription>Identification numbers for billing and reports</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-primary" /> GSTIN
                                        </Label>
                                        <Input
                                            placeholder="27XXXXX0000X1ZX"
                                            className="rounded-xl h-12 font-mono uppercase"
                                            value={formData.gstin}
                                            onChange={(e) => handleInputChange('gstin', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-primary" /> PAN Number
                                        </Label>
                                        <Input
                                            placeholder="ABCDE1234F"
                                            className="rounded-xl h-12 font-mono uppercase"
                                            value={formData.pan}
                                            onChange={(e) => handleInputChange('pan', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Bank Details */}
                        <TabsContent value="bank" className="animate-in fade-in slide-in-from-bottom-4">
                            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                                <CardHeader>
                                    <CardTitle>Bank Information</CardTitle>
                                    <CardDescription>Primary bank account for transactions</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Bank Name</Label>
                                        <Input
                                            placeholder="e.g. HDFC Bank"
                                            className="rounded-xl h-12"
                                            value={formData.bankDetails?.bankName}
                                            onChange={(e) => handleInputChange('bankName', e.target.value, 'bankDetails')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Account Number</Label>
                                        <Input
                                            placeholder="XXXX XXXX XXXX"
                                            className="rounded-xl h-12 font-mono"
                                            value={formData.bankDetails?.accountNo}
                                            onChange={(e) => handleInputChange('accountNo', e.target.value, 'bankDetails')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>IFSC Code</Label>
                                        <Input
                                            placeholder="HDFC0001234"
                                            className="rounded-xl h-12 font-mono uppercase"
                                            value={formData.bankDetails?.ifscCode}
                                            onChange={(e) => handleInputChange('ifscCode', e.target.value, 'bankDetails')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Branch</Label>
                                        <Input
                                            placeholder="Branch name or location"
                                            className="rounded-xl h-12"
                                            value={formData.bankDetails?.branch}
                                            onChange={(e) => handleInputChange('branch', e.target.value, 'bankDetails')}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Report Branding */}
                        <TabsContent value="branding" className="animate-in fade-in slide-in-from-bottom-4">
                            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                                <CardHeader>
                                    <CardTitle>Report Customization</CardTitle>
                                    <CardDescription>Appearance of generated PDF reports</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Palette className="w-4 h-4 text-primary" /> Primary Brand Color
                                        </Label>
                                        <div className="flex gap-4 items-center">
                                            <div
                                                className="w-12 h-12 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-200"
                                                style={{ backgroundColor: formData.reportBranding?.headerColor }}
                                            />
                                            <Input
                                                type="color"
                                                className="w-16 h-12 p-1 rounded-xl cursor-copy"
                                                value={formData.reportBranding?.headerColor}
                                                onChange={(e) => handleInputChange('headerColor', e.target.value, 'reportBranding')}
                                            />
                                            <Input
                                                className="rounded-xl h-12 font-mono"
                                                value={formData.reportBranding?.headerColor}
                                                onChange={(e) => handleInputChange('headerColor', e.target.value, 'reportBranding')}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Global Footer Text</Label>
                                        <Input
                                            placeholder="e.g. This is a computer generated report."
                                            className="rounded-xl h-12"
                                            value={formData.reportBranding?.footerText}
                                            onChange={(e) => handleInputChange('footerText', e.target.value, 'reportBranding')}
                                        />
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider pl-1">
                                            This text will appear at the bottom-most center of all reports.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </main>
        </div>
    );
};

export default CompanyProfile;
