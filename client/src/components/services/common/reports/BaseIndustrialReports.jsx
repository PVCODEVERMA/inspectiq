import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, Calendar as CalendarIcon, Download } from 'lucide-react';
import { InspectionTable } from '@/components/dashboard/InspectionTable';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import * as XLSX from 'xlsx';
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
    const [selectedDate, setSelectedDate] = useState(null);
    const { setIsSearchOpen } = useSidebar();

    useEffect(() => {
        // Open search bar on mount for better discoverability on this page
        setIsSearchOpen(true);
        return () => setIsSearchOpen(false);
    }, []);

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

            const matchesDate = !selectedDate || (
                (insp.inspection_date || insp.date) &&
                isSameDay(new Date(insp.inspection_date || insp.date), selectedDate)
            );

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [inspections, searchTerm, statusFilter, selectedDate]);

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
            <div className="min-h-screen bg-background/50 pb-12">
                <Header title="Loading Reports..." subtitle="Fetching latest records" />
                <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                    {/* Skeletons for Navigation & Tabs */}
                    <div className="flex flex-col gap-6">
                        <Skeleton className="h-10 w-40 rounded-xl" />
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-9 w-24 rounded-xl shrink-0" />
                            ))}
                        </div>
                    </div>

                    {/* Skeleton for Filter Card */}
                    <Card className="rounded-3xl border-none shadow-premium bg-white">
                        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                            <Skeleton className="h-10 flex-1 rounded-2xl" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-24 rounded-xl" />
                                <Skeleton className="h-10 w-24 rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skeleton for Table */}
                    <Card className="rounded-[2.5rem] border-none shadow-premium bg-white overflow-hidden p-0">
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex gap-4 items-center">
                                    <Skeleton className="h-10 flex-1 rounded-xl" />
                                    <Skeleton className="h-10 w-32 rounded-xl" />
                                    <Skeleton className="h-10 w-24 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 pb-12">
            <Header
                title={`${service?.name || 'Service'} Reports`}
                subtitle=""
                showSearch={true}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by report no, client, or project..."
            />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">


                {/* Status Tabs */}
                <div className="flex overflow-x-auto pb-2 gap-2 sm:gap-3 no-scrollbar -mx-1 px-1">
                    {['all', 'approved', 'pending', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status);
                                setSearchParams({ status });
                            }}
                            className={cn(
                                "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-2xl font-bold transition-all whitespace-nowrap border-2 text-[10px] sm:text-sm",
                                statusFilter === status
                                    ? "bg-primary border-primary text-white shadow-glow translate-y-[-1px] sm:translate-y-[-2px]"
                                    : "bg-white border-slate-100 text-slate-600 hover:border-primary/20 hover:bg-primary/5"
                            )}
                        >
                            <span className="capitalize">{status}</span>
                            <span className={cn(
                                "text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5 rounded-md sm:rounded-lg font-black",
                                statusFilter === status ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                            )}>
                                {counts[status]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <Card className="rounded-2xl sm:rounded-3xl border-none shadow-premium bg-white">
                    <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-end">
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={cn(
                                            "rounded-xl h-10 w-10 sm:h-12 sm:w-12 transition-all",
                                            selectedDate && "border-primary bg-primary/5 text-primary"
                                        )}
                                    >
                                        <CalendarIcon className="w-4 h-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        initialFocus
                                        className="rounded-2xl"
                                    />
                                    {selectedDate && (
                                        <div className="p-2 border-t border-slate-100 flex justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedDate(null)}
                                                className="text-[10px] h-7 px-2 text-muted-foreground hover:text-destructive"
                                            >
                                                Clear Date
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>

                            <Button
                                variant="outline"
                                size="icon"
                                title="Export Excel"
                                className="rounded-xl h-10 w-10 sm:h-12 sm:w-12 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shrink-0"
                                onClick={() => {
                                    if (filteredInspections.length === 0) return toast.error("No reports to export");

                                    const loadingToast = toast.loading(`Generating Excel for ${filteredInspections.length} reports...`);

                                    try {
                                        // Prepare data for Excel
                                        const excelData = filteredInspections.map(insp => ({
                                            'Report No': insp.report_no || insp._id.slice(-6).toUpperCase(),
                                            'Client': insp.client_name || 'N/A',
                                            'Project': insp.project_name || 'N/A',
                                            'Date': (insp.inspection_date || insp.date) ? format(new Date(insp.inspection_date || insp.date), 'PP') : 'N/A',
                                            'Status': insp.status?.toUpperCase() || 'N/A',
                                            'Type': insp.report_type || serviceType
                                        }));

                                        // Create workbook and worksheet
                                        const worksheet = XLSX.utils.json_to_sheet(excelData);
                                        const workbook = XLSX.utils.book_new();
                                        XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

                                        // Set column widths
                                        worksheet['!cols'] = [
                                            { wch: 20 }, // Report No
                                            { wch: 30 }, // Client
                                            { wch: 30 }, // Project
                                            { wch: 15 }, // Date
                                            { wch: 15 }, // Status
                                            { wch: 25 }  // Type
                                        ];

                                        // Export file
                                        const fileName = `${serviceType}_reports_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
                                        XLSX.writeFile(workbook, fileName);

                                        toast.success("Excel exported successfully!", { id: loadingToast });
                                    } catch (error) {
                                        console.error("Excel Export Error:", error);
                                        toast.error("Failed to generate Excel", { id: loadingToast });
                                    }
                                }}
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="rounded-2xl sm:rounded-[2.5rem] border-none shadow-premium bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <InspectionTable
                            inspections={filteredInspections}
                            serviceId={id}
                            serviceType={serviceType}
                            onRefresh={fetchData}
                        />
                    </div>
                </Card>
            </div>
        </div >
    );
};

export default BaseIndustrialReports;
