import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, Calendar, Download } from 'lucide-react';
import { InspectionTable } from '@/components/dashboard/InspectionTable';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { generateEngineeringInspection } from '@/components/services/tpi/pdf/generateEngineeringInspection';

const BaseIndustrialReports = () => {
    const { id, serviceType } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const statusParam = searchParams.get('status') || 'all';

    const [service, setService] = useState(null);
    const [inspections, setInspections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(statusParam);

    useEffect(() => {
        setStatusFilter(statusParam);
    }, [statusParam]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Service Details
            const serviceRes = await api.get(`/services/details/${id}`);
            setService(serviceRes.data);

            // Fetch All Inspection Types in Parallel
            const endpoints = [
                '/inspections',
                '/ndt/ultrasonic',
                '/ndt/magnetic-particle',
                '/ndt/liquid-penetrant',
                '/ndt/summary'
            ];

            const results = await Promise.all(
                endpoints.map(ep =>
                    api.get(`${ep}?serviceId=${id}`)
                        .then(res => res.data.map(item => ({ ...item, _endpoint: ep })))
                        .catch(err => {
                            console.warn(`Failed to fetch from ${ep}`, err);
                            return [];
                        })
                )
            );

            // Combine and Sort
            const allInspections = results.flat().sort((a, b) =>
                new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
            );

            setInspections(allInspections);
        } catch (error) {
            console.error(`Error fetching reports:`, error);
            toast.error(`Failed to load reports`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const filteredInspections = useMemo(() => {
        return inspections.filter(insp => {
            const matchesSearch =
                (insp.report_no?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (insp.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (insp.project_name?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || insp.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [inspections, searchTerm, statusFilter]);

    const counts = useMemo(() => {
        return {
            all: inspections.length,
            approved: inspections.filter(i => i.status === 'approved').length,
            pending: inspections.filter(i => i.status === 'pending').length,
            rejected: inspections.filter(i => i.status === 'rejected').length,
        };
    }, [inspections]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 pb-12">
            <Header
                title={`${service?.name || 'Service'} Reports`}
                subtitle={`Viewing all ${statusFilter !== 'all' ? statusFilter : ''} records for ${serviceType}`}
            />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
                <Button
                    variant="ghost"
                    onClick={() => navigate(`/admin/services/${id}/${serviceType}`)}
                    className="flex items-center gap-2 hover:bg-white/50 rounded-xl mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Button>

                {/* Status Tabs */}
                <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                    {['all', 'approved', 'pending', 'rejected'].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                setStatusFilter(status);
                                setSearchParams({ status });
                            }}
                            className="capitalize rounded-xl whitespace-nowrap"
                        >
                            {status}
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "ml-2",
                                    statusFilter === status ? "bg-primary-foreground/20 text-primary-foreground" : ""
                                )}
                            >
                                {counts[status]}
                            </Badge>
                        </Button>
                    ))}
                </div>

                {/* Filters */}
                <Card className="rounded-3xl border-none shadow-premium bg-white">
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by report no, client, or project..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 rounded-2xl bg-secondary/30 border-none"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" className="rounded-xl flex-1 sm:flex-none">
                                <Calendar className="w-4 h-4 mr-2" />
                                Date
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-xl flex-1 sm:flex-none"
                                onClick={async () => {
                                    if (filteredInspections.length === 0) return toast.error("No reports to export");
                                    const loadingToast = toast.loading(`Exporting ${filteredInspections.length} reports...`);
                                    try {
                                        // Dynamic imports
                                        const { generateIndustrialPDF } = await import('@/components/services/common/pdf/generateIndustrialPDF');
                                        const { reportTemplates } = await import('@/data/reportTemplates');
                                        const { industrialReportTypes } = await import('@/data/industrialReportTypes');

                                        for (const insp of filteredInspections) {
                                            const fType = insp.formType;
                                            let endpoint = `/inspections/${insp._id}`;

                                            if (fType === 'ultrasonic-test') endpoint = `/ndt/ultrasonic/${insp._id}`;
                                            else if (fType === 'magnetic-particle') endpoint = `/ndt/magnetic-particle/${insp._id}`;
                                            else if (fType === 'liquid-penetrant') endpoint = `/ndt/liquid-penetrant/${insp._id}`;
                                            else if (fType === 'ndt-summary-report') endpoint = `/ndt/summary/${insp._id}`;
                                            else if (fType === 'welding-assessment-audit') endpoint = `/consultancy/welding-audit/${insp._id}`;
                                            else if (fType === 'Engineering Inspection Report' || fType === 'Engineering Inspection' || fType === 'engineering-inspection') endpoint = `/tpi/engineering/${insp._id}`;

                                            const res = await api.get(endpoint);
                                            const data = res.data;

                                            // Find template
                                            const fTypeData = data.formType || '';
                                            const normalizedType = fTypeData.toLowerCase().replace(/[\s\-_]+/g, '-');
                                            let template = reportTemplates[fTypeData] || reportTemplates[normalizedType];

                                            if (!template) {
                                                Object.values(industrialReportTypes).forEach(group => {
                                                    const found = group.find(t => t.id === fTypeData || t.title === fTypeData || t.id === normalizedType);
                                                    if (found) {
                                                        template = reportTemplates[found.id] || found;
                                                    }
                                                });
                                            }

                                            if (template) {
                                                await generateIndustrialPDF(data, template);
                                            } else {
                                                // The original instruction was to replace generateInspectionPDF with generateEngineeringInspection.
                                                // The provided Code Edit snippet was syntactically incorrect for this context.
                                                // Assuming the intent was to call generateEngineeringInspection with the 'data' object,
                                                // similar to how generateInspectionPDF was called.
                                                await generateEngineeringInspection(data);
                                            }
                                        }
                                        toast.success("Export completed", { id: loadingToast });
                                    } catch (err) {
                                        console.error(err);
                                        toast.error("Export failed", { id: loadingToast });
                                    }
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="rounded-[2.5rem] border-none shadow-premium bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <InspectionTable inspections={filteredInspections} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default BaseIndustrialReports;
