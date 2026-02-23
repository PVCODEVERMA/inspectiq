import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Edit2,
    Power,
    PowerOff,
    Search,
    RefreshCw,
    Boxes,
    FileDown,
    Share2,
    User,
    Clock,
    Shield,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    FileText,
    LayoutDashboard as DashboardIcon,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ServicesManagement = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('id') || '');
    const [currentService, setCurrentService] = useState(null);

    // Update search term when id param changes to highlight/scroll to specific service
    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSearchTerm(id);
        }
    }, [searchParams]);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/services');
            setServices(response.data);
        } catch (error) {
            toast.error('Failed to fetch services');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleToggleStatus = async (service) => {
        try {
            const response = await api.put(`/services/${service._id}`, {
                isActive: !service.isActive
            });
            // Update the local state with the returned populated service if possible, 
            // or just re-fetch to get fresh stats and audit data
            fetchServices();
            toast.success(`Service ${!service.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to update service status');
        }
    };



    const handleExportPDF = (service) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(255, 0, 0); // Pure Red
        doc.text('QUALITY CONCEPT', 14, 20);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Service Matrix Report: ${service.name}`, 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);
        doc.text(`Module ID: ${service._id}`, 14, 40);

        // Service Details
        doc.setFontSize(12);
        doc.setTextColor(50);
        doc.text('Description:', 14, 50);
        const splitDescription = doc.splitTextToSize(service.description || 'No description provided.', 180);
        doc.text(splitDescription, 14, 55);

        // Stats Table
        const statsData = [
            ['Total Inspections', service.stats?.total || 0],
            ['Approved', service.stats?.approved || 0],
            ['Pending', service.stats?.pending || 0],
            ['Rejected', service.stats?.rejected || 0],
        ];

        doc.autoTable({
            startY: 70,
            head: [['Metric', 'Count']],
            body: statsData,
            theme: 'striped',
            headStyles: { fillColor: [255, 0, 0] }
        });

        // Audit Info
        const auditY = doc.autoTable.previous.finalY + 20;
        doc.text('Audit Trail:', 14, auditY);
        doc.setFontSize(10);
        doc.text(`Created By: ${service.createdBy?.full_name} (${service.createdBy?.role})`, 14, auditY + 7);
        if (service.updatedBy) {
            doc.text(`Last Modified By: ${service.updatedBy?.full_name} (${service.updatedBy?.role})`, 14, auditY + 14);
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        doc.save(`${service.name.replace(/\s+/g, '_')}_Matrix_Report.pdf`);
        toast.success(`PDF downloaded for ${service.name}`);
    };

    const handleShare = (service) => {
        if (navigator.share) {
            navigator.share({
                title: service.name,
                text: service.description,
                url: window.location.href
            }).catch(() => toast.error('Share failed'));
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        }
    };

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service._id === searchTerm
    );

    const getRoleBadgeColor = (role) => {
        const colors = {
            master_admin: 'bg-primary/20 text-primary',
            super_admin: 'bg-accent/20 text-accent',
            company_admin: 'bg-success/20 text-success',
            inspector: 'bg-warning/20 text-warning'
        };
        return colors[role] || 'bg-muted text-muted-foreground';
    };

    const StatItem = ({ label, value, icon: Icon, colorClass }) => (
        <div className="flex items-center gap-2 group/stat">
            <div className={cn("p-1.5 rounded-lg", colorClass)}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">{label}</span>
                <span className="text-sm font-black tabular-nums">{value}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-12">
            <Header
                title="Service Matrix"
                subtitle="Master control for quality concept inspection modules & status tracking"
            />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-5 rounded-3xl border shadow-premium">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                        <Input
                            placeholder="Search by service name..."
                            className="pl-12 bg-muted/30 border-none focus-visible:ring-primary/20 rounded-2xl h-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchServices}
                            disabled={isLoading}
                            className="shrink-0 rounded-2xl w-12 h-12 border-muted"
                        >
                            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Services Matrix Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Card key={i} className="animate-pulse h-[400px] rounded-3xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service) => (
                                <Card key={service._id} className={cn(
                                    "group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-none bg-card/60 backdrop-blur-xl rounded-[2.5rem] flex flex-col h-full",
                                    !service.isActive && "opacity-60 grayscale-[0.5]"
                                )}>
                                    {/* Action Shortcuts Overlay */}
                                    <div className="absolute top-6 right-6 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm" onClick={() => handleExportPDF(service)}>
                                                        <FileDown className="w-4.5 h-4.5 text-primary" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>Export Report</p></TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm" onClick={() => handleShare(service)}>
                                                        <Share2 className="w-4.5 h-4.5 text-blue-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>Share Matrix</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-4 rounded-3xl transition-all duration-500 shadow-lg group-hover:scale-110",
                                                service.isActive ? "bg-gradient-to-br from-primary to-primary/80 text-white" : "bg-muted text-muted-foreground"
                                            )}>
                                                <Boxes className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black leading-none">{service.name}</CardTitle>
                                                <CardDescription className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground/60 mt-1.5">Module ID: {service._id.slice(-6)}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 space-y-6">
                                        {/* Status Analytics */}
                                        <div className="bg-muted/30 p-5 rounded-3xl space-y-4 border border-white/50">
                                            <div className="flex justify-between items-center px-1">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Inspection Metrics</h4>
                                                <TrendingUp className="w-3.5 h-3.5 text-success animate-pulse" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <StatItem
                                                    label="Approved"
                                                    value={service.stats?.approved || 0}
                                                    icon={CheckCircle}
                                                    colorClass="bg-success/10 text-success"
                                                />
                                                <StatItem
                                                    label="Pending"
                                                    value={service.stats?.pending || 0}
                                                    icon={Clock}
                                                    colorClass="bg-warning/10 text-warning"
                                                />
                                                <StatItem
                                                    label="Rejected"
                                                    value={service.stats?.rejected || 0}
                                                    icon={AlertCircle}
                                                    colorClass="bg-destructive/10 text-destructive"
                                                />
                                                <StatItem
                                                    label="Total Flow"
                                                    value={service.stats?.total || 0}
                                                    icon={FileText}
                                                    colorClass="bg-primary/10 text-primary"
                                                />
                                            </div>
                                        </div>

                                        {/* Audit Trail */}
                                        <div className="space-y-4 px-1">
                                            <div className="flex items-center gap-2 group/audit cursor-pointer" onClick={() => toast(`Created by ${service.createdBy?.full_name}`)}>
                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border-2 border-background ring-2 ring-primary/5">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-black text-muted-foreground/50">Created By</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-bold hover:text-primary transition-colors">{service.createdBy?.full_name}</span>
                                                        <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase", getRoleBadgeColor(service.createdBy?.role))}>
                                                            {service.createdBy?.role?.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {service.updatedBy && (
                                                <div className="flex items-center gap-2" onClick={() => toast(`Updated by ${service.updatedBy?.full_name}`)}>
                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border-2 border-background ring-2 ring-accent/5">
                                                        <Shield className="w-4 h-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-black text-muted-foreground/50">Last Modified</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-bold">{service.updatedBy?.full_name}</span>
                                                            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ", getRoleBadgeColor(service.updatedBy?.role))}>
                                                                {service.updatedBy?.role?.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>

                                    <div className="p-6 mt-auto bg-muted/20 border-t border-white/40 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-4 rounded-xl font-bold gap-2 text-primary hover:bg-primary/10"
                                                    onClick={() => {
                                                        setCurrentService(service);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "h-9 px-4 rounded-xl font-bold gap-2",
                                                        service.isActive ? "text-destructive hover:bg-destructive/10" : "text-success hover:bg-success/10"
                                                    )}
                                                    onClick={() => handleToggleStatus(service)}
                                                >
                                                    {service.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                    {service.isActive ? 'Suspend' : 'Resume'}
                                                </Button>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] uppercase font-black text-muted-foreground/50">Updated</span>
                                                <span className="text-[11px] font-bold tabular-nums">{new Date(service.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full h-10 rounded-xl font-bold gap-2 shadow-sm"
                                            onClick={() => {
                                                const name = service.name.toUpperCase();
                                                let type = 'engineering';
                                                if (name.includes('LIFT')) type = 'lifts';
                                                else if (name.includes('PRE-SHIPMENT')) type = 'pre-shipment';
                                                else if (name.includes('VENDOR ASSESSMENT')) type = 'vendor-assessment';

                                                navigate(`/admin/services/${service._id}/${type}`);
                                            }}
                                        >
                                            <DashboardIcon className="w-4 h-4" />
                                            View Specialized Dashboard
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-32 text-center space-y-6">
                                <div className="bg-muted p-8 rounded-[2rem] w-24 h-24 mx-auto flex items-center justify-center shadow-inner">
                                    <Search className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black">No services matches found</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">Try refining your search or create a new quality module from the control bar above.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesManagement;
