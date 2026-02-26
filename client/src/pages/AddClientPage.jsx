import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeader } from '@/contexts/HeaderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Building2, MapPin, User, Mail, Phone, FileText, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

const AddClientPage = () => {
    const navigate = useNavigate();
    const { setPageInfo } = useHeader();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setPageInfo("Register New Client", "Add a new company to your inspection network");
    }, [setPageInfo]);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact_person: '',
        email: '',
        phone: '',
        gst_number: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error('Client name is required');

        setIsSubmitting(true);
        try {
            await api.post('/clients', formData);
            toast.success('Client created successfully');
            navigate('/admin/clients');
        } catch (error) {
            console.error('Error saving client:', error);
            toast.error(error.response?.data?.message || 'Failed to save client');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background/50 pb-12">

            <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/admin/clients')}
                        className="flex items-center gap-2 rounded-xl"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Clients
                    </Button>
                </div>

                <Card className="rounded-[2.5rem] border-none shadow-premium bg-white overflow-hidden uppercase">
                    <CardHeader className="bg-primary/5 pb-8 pt-8 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black">Client Details</CardTitle>
                                <CardDescription>Enter the official information for the new client</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Client Name */}
                                <div className="space-y-2 lg:col-span-3">
                                    <Label className="text-sm font-bold ml-1">Client Name *</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            name="name"
                                            placeholder="Enter registered company name"
                                            className="pl-11 h-12 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-sm font-bold ml-1">Office Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                                        <textarea
                                            name="address"
                                            placeholder="Enter full primary office address"
                                            className="w-full min-h-[100px] pl-11 pr-4 py-3 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary outline-none text-sm transition-all"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Contact Person */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold ml-1">Contact Person</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            name="contact_person"
                                            placeholder="Full Name"
                                            className="pl-11 h-12 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary"
                                            value={formData.contact_person}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold ml-1">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            name="phone"
                                            placeholder="+91 00000 00000"
                                            className="pl-11 h-12 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Email Address */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold ml-1">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            name="email"
                                            type="email"
                                            placeholder="office@client.com"
                                            className="pl-11 h-12 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* GST Number */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold ml-1">GST Number</Label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            name="gst_number"
                                            placeholder="22AAAAA0000A1Z5"
                                            className="pl-11 h-12 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary"
                                            value={formData.gst_number}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-glow hover:bg-primary/90 transition-all"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-2" />
                                            Create Client
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/admin/clients')}
                                    className="h-14 rounded-2xl border-2 px-8 font-bold text-slate-600"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddClientPage;
