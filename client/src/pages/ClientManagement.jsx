import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    const [isLoading, setIsLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const navigate = useNavigate();

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

    return (
        <div className="min-h-screen bg-background pb-12">
            <Header
                title="Client Management"
                subtitle="Manage your client companies and their details"
            />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-end">
                    <Button onClick={() => navigate('/admin/clients/new')} className="rounded-xl shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Client
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Card key={`client-skeleton-${i}`} className="border-none shadow-sm rounded-2xl overflow-hidden animate-pulse">
                                <CardHeader className="bg-muted/20 pb-4">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="w-11 h-11 rounded-xl bg-muted/40" />
                                    </div>
                                    <Skeleton className="h-6 w-3/4 mt-4 bg-muted/40" />
                                    <Skeleton className="h-3 w-1/3 mt-2 bg-muted/40" />
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <Skeleton className="h-4 w-full bg-muted/30" />
                                    <Skeleton className="h-4 w-2/3 bg-muted/30" />
                                    <Skeleton className="h-4 w-1/2 bg-muted/30" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clients.map((client, idx) => (
                            <Card
                                key={client._id}
                                className="group hover:shadow-premium transition-all duration-300 border-none shadow-sm rounded-2xl overflow-hidden hover:-translate-y-1 cursor-pointer animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                                style={{ animationDelay: `${idx * 50}ms` }}
                                onClick={() => navigate(`/admin/clients/${client._id}`)}
                            >
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-white p-2.5 rounded-xl shadow-sm">
                                            <Building2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white" onClick={(e) => { e.stopPropagation(); navigate(`/admin/clients/${client._id}/edit`); }}>
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
            </div>
        </div>
    );
};

export default ClientManagement;
