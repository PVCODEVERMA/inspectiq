import React, { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    TrendingUp,
    Calendar,
    User,
    ChevronRight,
    PieChart as PieChartIcon,
    Plus,

    Search,

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
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

const BaseIndustrialDashboard = () => {
    const { id, serviceType } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [inspections, setInspections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isNavigating, setIsNavigating] = useState(false);

    const handleStatClick = (status) => {
        setIsNavigating(true);
        navigate(`/admin/services/${id}/${serviceType}/reports?status=${status}`);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Service Details
            const serviceRes = await api.get(`/services/details/${id}`);
            setService(serviceRes.data);

            // Fetch All Inspection Types in Parallel
            const endpoints = [
                '/ndt/liquid-penetrant',
                '/inspections',
                '/ndt/ultrasonic',
                '/ndt/magnetic-particle',
                '/ndt/summary'
            ];

            const results = await Promise.all(
                endpoints.map(ep =>
                    api.get(`${ep}?serviceId=${id}`)
                        .then(res => res.data.map(item => ({ ...item, _endpoint: ep }))) // Tag source
                        .catch(err => {
                            console.warn(`Failed to fetch from ${ep}`, err);
                            return [];
                        })
                )
            );

            // Combine and Sort by Date
            const allInspections = results.flat().sort((a, b) =>
                new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
            );

            setInspections(allInspections);
        } catch (error) {
            console.error(`Error fetching ${serviceType} service data:`, error);
            toast.error(`Failed to load ${serviceType} dashboard`);
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

    const stats = useMemo(() => {
        if (!service?.stats) return { total: 0, approved: 0, pending: 0, rejected: 0 };
        return service.stats;
    }, [service]);

    const pieData = useMemo(() => {
        return [
            { name: 'Approved', value: stats.approved, color: '#22c55e' },
            { name: 'Pending', value: stats.pending, color: '#f59e0b' },
            { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
        ].filter(d => d.value > 0);
    }, [stats]);

    const barData = useMemo(() => {
        const months = eachMonthOfInterval({
            start: subMonths(new Date(), 5),
            end: new Date()
        });

        return months.map(month => {
            const label = format(month, 'MMM');
            const count = inspections.filter(insp => {
                const date = new Date(insp.inspection_date || insp.createdAt);
                return format(date, 'MMM yyyy') === format(month, 'MMM yyyy');
            }).length;
            return { month: label, count };
        });
    }, [inspections]);

    if (isLoading || isNavigating) {
        return (
            <div className="min-h-screen bg-background/50 pb-12">
                {/* Header visible during loading */}
                <Header title={service?.name || "Loading..."} subtitle={isNavigating ? "Opening Reports..." : `${serviceType?.toUpperCase()} Dashboard`} />

                <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
                    {/* Skeleton Action Button */}
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-32 rounded-xl" />
                    </div>

                    {/* Skeleton KPI Cards */}
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

                    {/* Skeleton Charts */}
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
                                <Skeleton className="h-[40%] flex-1 rounded-t-lg" />
                                <Skeleton className="h-[70%] flex-1 rounded-t-lg" />
                                <Skeleton className="h-[50%] flex-1 rounded-t-lg" />
                                <Skeleton className="h-[90%] flex-1 rounded-t-lg" />
                            </div>
                        </Card>
                    </div>

                    {/* Skeleton Bottom Actions */}
                    <div className="max-w-3xl">
                        <Card className="rounded-[2.5rem] border-none shadow-sm h-48 p-8 space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-16 rounded-2xl" />
                                <Skeleton className="h-16 rounded-2xl" />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (!service) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
            <Button onClick={() => navigate('/admin/services')}>Go Back</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background/50 pb-12">
            <Header title={service.name} subtitle={`${serviceType.toUpperCase()} Quality Control & Inspection Management`} />

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
                    <Card className="rounded-[2.5rem] border-none shadow-premium bg-white p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-xl font-black">Status Distribution</CardTitle>
                            <CardDescription>Live breakdown of inspection outcomes</CardDescription>
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

                    <Card className="rounded-[2.5rem] border-none shadow-premium bg-white p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-xl font-black">Volume Trends</CardTitle>
                            <CardDescription>Total inspections over last 6 months</CardDescription>
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
                </div>

                {/* Bottom Section */}
                <div className="max-w-3xl">
                    <Card className="rounded-[2.5rem] border-none shadow-premium bg-white p-8">
                        <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black">Quick Actions</CardTitle>
                                <CardDescription>Frequent management tasks</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button variant="outline" className="group w-full justify-start rounded-2xl p-6 h-auto border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 transition-all text-left border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors">Operational Stats</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-slate-500 transition-colors">Detailed performance analysis</p>
                                    </div>
                                </div>
                            </Button>
                            <Button variant="outline" className="group w-full justify-start rounded-2xl p-6 h-auto border-dashed border-2 hover:bg-green-500/5 hover:border-green-500/50 transition-all text-left border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 group-hover:text-green-600 transition-colors">Assigned Inspectors</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-slate-500 transition-colors">Manage field personnel</p>
                                    </div>
                                </div>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BaseIndustrialDashboard;
