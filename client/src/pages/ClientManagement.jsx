import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    Search,
    Building2,
    MapPin,
    Phone,
    Mail,
    FileText,
    Pencil,
    Trash2,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';

const ClientManagement = () => {
    const { searchQuery, setSearchQuery } = useSidebar();
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact_person: '',
        email: '',
        phone: '',
        gst_number: ''
    });

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('Failed to load clients');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenDialog = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                name: client.name,
                address: client.address,
                contact_person: client.contact_person || '',
                email: client.email || '',
                phone: client.phone || '',
                gst_number: client.gst_number || ''
            });
        } else {
            setEditingClient(null);
            setFormData({
                name: '',
                address: '',
                contact_person: '',
                email: '',
                phone: '',
                gst_number: ''
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.address) {
            toast.error('Name and Address are required');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient._id}`, formData);
                toast.success('Client updated successfully');
            } else {
                await api.post('/clients', formData);
                toast.success('Client created successfully');
            }
            setIsDialogOpen(false);
            fetchClients();
        } catch (error) {
            console.error('Error saving client:', error);
            toast.error(error.response?.data?.message || 'Failed to save client');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this client?')) return;

        try {
            await api.delete(`/clients/${id}`);
            toast.success('Client deleted successfully');
            fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
            toast.error('Failed to delete client');
        }
    };

    const filteredClients = React.useMemo(() => {
        if (!searchQuery.trim()) return clients;
        const fuse = new Fuse(clients, {
            keys: ['name', 'contact_person', 'email', 'phone', 'location'],
            threshold: 0.3
        });
        return fuse.search(searchQuery).map(result => result.item);
    }, [clients, searchQuery]);

    return (
        <div className="min-h-screen bg-background pb-12">
            <Header
                title="Client Management"
                subtitle="Manage your client companies and their details"
            />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search clients..."
                            className="pl-9 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="rounded-xl shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Client
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Card key={`client-skeleton-${i}`} className="border-none shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="w-11 h-11 rounded-xl" />
                                    </div>
                                    <Skeleton className="h-6 w-3/4 mt-4" />
                                    <Skeleton className="h-3 w-1/3 mt-2" />
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-4 h-4 rounded-full" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-4 h-4 rounded-full" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-4 h-4 rounded-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients.map((client) => (
                            <Card
                                key={client._id}
                                className="group hover:shadow-premium transition-all duration-300 border-none shadow-sm rounded-2xl overflow-hidden hover:-translate-y-1 cursor-pointer"
                                onClick={() => navigate(`/admin/clients/${client._id}`)}
                            >
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-white p-2.5 rounded-xl shadow-sm">
                                            <Building2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white" onClick={(e) => { e.stopPropagation(); handleOpenDialog(client); }}>
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete(client._id); }}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="mt-4 text-lg font-bold line-clamp-1" title={client.name}>
                                        {client.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 text-xs">
                                        <FileText className="w-3 h-3" />
                                        GST: {client.gst_number || 'N/A'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3 text-sm">
                                    <div className="flex items-start gap-3 text-muted-foreground">
                                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span className="line-clamp-2">{client.address}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Phone className="w-4 h-4 shrink-0" />
                                        <span>{client.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Mail className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{client.email || 'N/A'}</span>
                                    </div>
                                    {client.contact_person && (
                                        <div className="pt-2 mt-2 border-t border-dashed flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Person</span>
                                            <span className="font-semibold">{client.contact_person}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                            <DialogDescription>
                                {editingClient ? 'Update company details.' : 'Add a new company to your client list.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Company Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter company name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address *</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    placeholder="Full address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_person">Contact Person</Label>
                                    <Input
                                        id="contact_person"
                                        name="contact_person"
                                        placeholder="Name"
                                        value={formData.contact_person}
                                        onChange={handleInputChange}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gst_number">GST Number</Label>
                                    <Input
                                        id="gst_number"
                                        name="gst_number"
                                        placeholder="GSTIN"
                                        value={formData.gst_number}
                                        onChange={handleInputChange}
                                        className="rounded-xl uppercase"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="company@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        placeholder="Contact number"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="rounded-xl">
                                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {editingClient ? 'Update Client' : 'Create Client'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default ClientManagement;
