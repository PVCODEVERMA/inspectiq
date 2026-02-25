import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { toast } from 'react-hot-toast';
import { UserPlus, ArrowLeft, Building2, Mail, Smartphone, User } from 'lucide-react';

const companies = []; // This would normally come from an API

const AddMemberPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        companyId: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            toast.error('Please fill in Name and Email');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast.success('Member invitation sent successfully!');
            setIsLoading(false);
            navigate('/inspectors');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <Header
                title="Create New Member"
                subtitle="Add a new inspector to your organization"
            />

            <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-2 -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <Card className="rounded-[2.5rem] shadow-premium overflow-hidden border-none bg-white">
                    <CardHeader className="p-8 pb-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                            <UserPlus className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-black">Member Details</CardTitle>
                        <CardDescription>
                            Enter the member's information. An invitation will be sent to their email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <form id="add-member-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" /> Full Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="rounded-xl h-12"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" /> Email Address *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className="rounded-xl h-12"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-muted-foreground" /> Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                        className="rounded-xl h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company" className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-muted-foreground" /> Assign to Company
                                    </Label>
                                    <Select
                                        value={formData.companyId}
                                        onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                                    >
                                        <SelectTrigger className="rounded-xl h-12">
                                            <SelectValue placeholder="Select a company" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.length > 0 ? (
                                                companies.map((company) => (
                                                    <SelectItem key={company.id} value={company.id}>
                                                        {company.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>No companies found</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="p-8 pt-0 flex justify-end gap-4">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            form="add-member-form"
                            type="submit"
                            variant="hero"
                            className="rounded-xl px-8"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Member'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default AddMemberPage;
