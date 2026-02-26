import React, { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    TrendingUp,
    User,
    Plus,
} from 'lucide-react';

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { format, eachMonthOfInterval, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useInspectionsQuery } from '@/hooks/queryHooks';
import { useLoadingDelay } from '@/hooks/useLoadingDelay';
import { useHeader } from '@/contexts/HeaderContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Filter, Layers } from 'lucide-react';

const BaseIndustrialDashboard = () => {
    const { id, serviceType } = useParams();
    const navigate = useNavigate();
    const { setPageInfo } = useHeader();
    const [service, setService] = useState(null);
    const [isServiceLoading, setIsServiceLoading] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    // Filter States
    const [roleFilter, setRoleFilter] = useState('all');
    const [dateRange, setDateRange] = useState({
        from: subMonths(new Date(), 5),
        to: new Date()
    });

    const handleStatClick = (status) => {
        setIsNavigating(true);
        navigate(`/admin/services/${id}/${serviceType}/reports?status=${status}`);
    };

    const { data: inspections = [], isLoading: isQueryLoading } = useInspectionsQuery(id);
    const showSkeleton = useLoadingDelay(isQueryLoading || isServiceLoading, 300);

    const filteredInspections = useMemo(() => {
        return inspections.filter(insp => {
            // 1. Role Filter
            const userRole = insp.creator_role || insp.inspector_role || (insp.inspector?.role) || 'unknown';
            const matchesRole = roleFilter === 'all' || userRole.toLowerCase() === roleFilter.toLowerCase();

            // 2. Date Range Filter
            let matchesDate = true;
            if (dateRange?.from && dateRange?.to) {
                const inspDate = new Date(insp.inspection_date || insp.date || insp.createdAt);
                matchesDate = isWithinInterval(inspDate, {
                    start: startOfMonth(dateRange.from),
                    end: endOfMonth(dateRange.to)
                });
            }

            return matchesRole && matchesDate;
        });
    }, [inspections, roleFilter, dateRange]);

    const stats = useMemo(() => {
        const approved = filteredInspections.filter(i => i.status === 'approved').length;
        const pending = filteredInspections.filter(i => i.status === 'pending' || i.status === 'in_progress').length;
        const rejected = filteredInspections.filter(i => i.status === 'rejected').length;
        return {
            total: filteredInspections.length,
            approved,
            pending,
            rejected
        };
    }, [filteredInspections]);

    const pieData = useMemo(() => {
        return [
            { name: 'Approved', value: stats.approved, color: '#22c55e' },
            { name: 'Pending', value: stats.pending, color: '#f59e0b' },
            { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
        ].filter(d => d.value > 0);
    }, [stats]);

    const barData = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return [];

        const months = eachMonthOfInterval({
            start: startOfMonth(dateRange.from),
            end: endOfMonth(dateRange.to)
        });

        return months.map(month => {
            const label = format(month, 'MMM');
            const count = filteredInspections.filter(insp => {
                const date = new Date(insp.inspection_date || insp.date || insp.createdAt);
                return format(date, 'MMM yyyy') === format(month, 'MMM yyyy');
            }).length;
            return { month: label, count };
        });
    }, [filteredInspections, dateRange]);

    // Fetch Service Details
    useEffect(() => {
        const fetchService = async () => {
            if (!id) return;
            setIsServiceLoading(true);
            try {
                const serviceRes = await api.get(`/services/details/${id}`);
                setService(serviceRes.data);
            } catch (err) {
                console.error("Error fetching service details:", err);
            } finally {
                setIsServiceLoading(false);
            }
        };
        fetchService();
    }, [id]);

    // Update Header Info
    useEffect(() => {
        if (service) {
            setPageInfo(service.name, isNavigating ? "Opening Reports..." : `${serviceType?.toUpperCase()} Dashboard`);
        } else if (isServiceLoading) {
            setPageInfo("Loading...", "Fetching module details");
        }
    }, [service, isServiceLoading, isNavigating, serviceType, setPageInfo]);

    if (showSkeleton || isNavigating) {
        return (
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="rounded-3xl border-none shadow-sm h-24 lg:h-32 flex items-center px-6">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-8 w-12" />
                            </div>
                            <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl" />
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="rounded-[2.5rem] border-none shadow-sm h-64 p-6 space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                        <div className="flex-1 flex items-center justify-center">
                            <Skeleton className="w-32 h-32 rounded-full" />
                        </div>
                    </Card>
                    <Card className="rounded-[2.5rem] border-none shadow-sm h-64 p-6 space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                        <div className="flex-1 flex items-end gap-4 px-4 pb-4">
                            <Skeleton className="h-24 flex-1 rounded-t-lg" />
                            <Skeleton className="h-16 flex-1 rounded-t-lg" />
                            <Skeleton className="h-32 flex-1 rounded-t-lg" />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (!service && !isServiceLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Service Not Found</h2>
            <Button onClick={() => navigate('/admin/services')} className="rounded-xl">Go Back</Button>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Top Action Bar */}
            <div className="flex items-center justify-end">
                <Link to={`/admin/services/${id}/${serviceType.toLowerCase()}/new/selection`}>
                    <Button className="rounded-xl shadow-glow text-white font-bold bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" /> New {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
                    </Button>
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card onClick={() => handleStatClick('all')} className={cn("group rounded-3xl border-none shadow-premium cursor-pointer transition-all hover:scale-[1.02] active:scale-95 bg-white/40 backdrop-blur-sm")}>
                    <CardContent className="p-3 lg:p-6 flex justify-between items-center text-slate-800">
                        <div>
                            <p className="text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Total Reports</p>
                            <h3 className="text-xl lg:text-4xl font-black mt-1 group-hover:text-primary transition-colors">{stats.total}</h3>
                        </div>
                        <div className="p-2 lg:p-4 bg-primary/10 text-primary rounded-xl lg:rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                            <FileText className="w-4 h-4 lg:w-6 lg:h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card onClick={() => handleStatClick('approved')} className={cn("group rounded-3xl border-none shadow-premium cursor-pointer transition-all hover:scale-[1.02] active:scale-95 bg-white/40 backdrop-blur-sm")}>
                    <CardContent className="p-3 lg:p-6 flex justify-between items-center text-slate-800">
                        <div>
                            <p className="text-[10px] lg:text-xs font-bold text-green-600 uppercase tracking-widest group-hover:text-green-700 transition-colors">Approved</p>
                            <h3 className="text-xl lg:text-4xl font-black mt-1 text-green-700">{stats.approved}</h3>
                        </div>
                        <div className="p-2 lg:p-4 bg-green-100 text-green-600 rounded-xl lg:rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <CheckCircle2 className="w-4 h-4 lg:w-6 lg:h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card onClick={() => handleStatClick('pending')} className={cn("group rounded-3xl border-none shadow-premium cursor-pointer transition-all hover:scale-[1.02] active:scale-95 bg-white/40 backdrop-blur-sm")}>
                    <CardContent className="p-3 lg:p-6 flex justify-between items-center text-slate-800">
                        <div>
                            <p className="text-[10px] lg:text-xs font-bold text-amber-600 uppercase tracking-widest group-hover:text-amber-700 transition-colors">Pending</p>
                            <h3 className="text-xl lg:text-4xl font-black mt-1 text-amber-700">{stats.pending}</h3>
                        </div>
                        <div className="p-2 lg:p-4 bg-amber-100 text-amber-600 rounded-xl lg:rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <Clock className="w-4 h-4 lg:w-6 lg:h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card onClick={() => handleStatClick('rejected')} className={cn("group rounded-3xl border-none shadow-premium cursor-pointer transition-all hover:scale-[1.02] active:scale-95 bg-white/40 backdrop-blur-sm")}>
                    <CardContent className="p-3 lg:p-6 flex justify-between items-center text-slate-800">
                        <div>
                            <p className="text-[10px] lg:text-xs font-bold text-red-600 uppercase tracking-widest group-hover:text-red-700 transition-colors">Rejected</p>
                            <h3 className="text-xl lg:text-4xl font-black mt-1 text-red-700">{stats.rejected}</h3>
                        </div>
                        <div className="p-2 lg:p-4 bg-red-100 text-red-600 rounded-xl lg:rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <XCircle className="w-4 h-4 lg:w-6 lg:h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-[2.5rem] border-none shadow-premium bg-white p-6 overflow-visible">
                    <CardHeader className="px-0 pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6">
                        <div>
                            <CardTitle className="text-xl font-black">Volume Trends</CardTitle>
                            <CardDescription>Inspections over selected interval</CardDescription>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl border-dashed gap-2 px-3 justify-start sm:justify-center">
                                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span className="font-bold text-xs lg:text-sm truncate">
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                `${format(dateRange.from, "MMM yy")} - ${format(dateRange.to, "MMM yy")}`
                                            ) : (
                                                format(dateRange.from, "MMM yyyy")
                                            )
                                        ) : (
                                            "Select range"
                                        )}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] sm:w-auto p-0 rounded-2xl border-none shadow-2xl overflow-hidden" align="end" sideOffset={8}>
                                <div className="p-1">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={1}
                                        disabled={(date) => date > new Date()}
                                        className="rounded-xl border-none"
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </CardHeader>
                    <CardContent className="h-64 px-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-none shadow-premium bg-white p-6 overflow-visible">
                    <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0 pb-6">
                        <div>
                            <CardTitle className="text-xl font-black">Status Distribution</CardTitle>
                            <CardDescription>Live breakdown of inspection outcomes</CardDescription>
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[130px] rounded-xl border-dashed">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="All Roles" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="inspector">Inspectors</SelectItem>
                                <SelectItem value="company_admin">Admins</SelectItem>
                                <SelectItem value="super_admin">Super Admins</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="h-64 px-0">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground italic">
                                Insufficient data for status analysis
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className="max-w-3xl mb-32">
                <Card className="rounded-[2.5rem] border-none shadow-premium bg-white p-5 sm:p-8">
                    <CardHeader className="px-0 pt-0 pb-6">
                        <CardTitle className="text-xl font-black">Quick Actions</CardTitle>
                        <CardDescription>Frequent management tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <Button variant="outline" className="group w-full justify-start rounded-2xl p-4 sm:p-6 h-auto border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 transition-all text-left border-slate-200">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors truncate">Operational Stats</p>
                                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-slate-500 transition-colors line-clamp-1">Detailed performance analysis</p>
                                </div>
                            </div>
                        </Button>
                        <Button variant="outline" className="group w-full justify-start rounded-2xl p-4 sm:p-6 h-auto border-dashed border-2 hover:bg-green-500/5 hover:border-green-500/50 transition-all text-left border-slate-200">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-800 group-hover:text-green-600 transition-colors truncate">Assigned Inspectors</p>
                                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-slate-500 transition-colors line-clamp-1">Manage field personnel</p>
                                </div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BaseIndustrialDashboard;
