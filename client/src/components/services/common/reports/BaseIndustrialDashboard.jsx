import React, { useState, useEffect, useMemo } from 'react';
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
                    <Card onClick={() => navigate(`/admin/services/${id}/${serviceType}/reports?status=all`)} className={cn("rounded-3xl border-none shadow-premium cursor-pointer transition-all hover:scale-[1.02] active:scale-95 bg-white/40 backdrop-blur-sm")}>
                        <CardContent className="p-3 lg:p-6 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Reports</p>
                                <h3 className="text-xl lg:text-4xl font-black mt-1">{stats.total}</h3>
                            </div>
                            <div className="p-2 lg:p-4 bg-primary/10 text-primary rounded-xl lg:rounded-2xl">
                                <FileText className="w-4 h-4 lg:w-6 lg:h-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card onClick={() => navigate(`/admin/services/${id}/${serviceType}/reports?status=approved`)} className={cn("rounded-3xl border-none shadow-premium cursor-pointer transition-all hover:scale-[1.02] active:scale-95 bg-white/40 backdrop-blur-sm")}>
                        <CardContent className="p-3 lg:p-6 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] lg:text-xs font-bold text-green-600 uppercase tracking-widest">Approved</p>
                                <h3 className="text-xl lg:text-4xl font-black mt-1 text-green-700">{stats.approved}</h3>
                            </div>
                            <div className="p-2 lg:p-4 bg-green-100 text-green-600 rounded-xl lg:rounded-2xl">
                                <CheckCircle2 className="w-4 h-4 lg:w-6 lg:h-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card onClick={() => navigate(`/admin/services/${id}/${serviceType}/reports?status=pending`)} className={cn("rounded-3xl border-none shadow-premium cursor-pointer transition-all hover:scale-[1.02] active:scale-95 bg-white/40 backdrop-blur-sm")}>
                        <CardContent className="p-3 lg:p-6 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] lg:text-xs font-bold text-amber-600 uppercase tracking-widest">Pending</p>
                                <h3 className="text-xl lg:text-4xl font-black mt-1 text-amber-700">{stats.pending}</h3>
                            </div>
                            <div className="p-2 lg:p-4 bg-amber-100 text-amber-600 rounded-xl lg:rounded-2xl">
                                <Clock className="w-4 h-4 lg:w-6 lg:h-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card onClick={() => navigate(`/admin/services/${id}/${serviceType}/reports?status=rejected`)} className={cn("rounded-3xl border-none shadow-premium cursor-pointer transition-all hover:scale-[1.02] active:scale-95 bg-white/40 backdrop-blur-sm")}>
                        <CardContent className="p-3 lg:p-6 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] lg:text-xs font-bold text-red-600 uppercase tracking-widest">Rejected</p>
                                <h3 className="text-xl lg:text-4xl font-black mt-1 text-red-700">{stats.rejected}</h3>
                            </div>
                            <div className="p-2 lg:p-4 bg-red-100 text-red-600 rounded-xl lg:rounded-2xl">
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

                {/* Information & List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-premium bg-white overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-border/50">
                            <div>
                                <CardTitle className="text-2xl font-black">Recent Inspections</CardTitle>
                                <CardDescription>Managing {service.name} workflow and items</CardDescription>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search reports..."
                                    className="pl-10 rounded-2xl bg-secondary/50 border-transparent focus:border-primary"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-secondary/30">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Report #</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Client / Project</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredInspections.length > 0 ? filteredInspections.map((insp) => (
                                            <tr key={insp._id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <span className="font-bold text-primary group-hover:underline cursor-pointer">
                                                        {insp.report_no || 'TBD'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="font-bold text-foreground">{insp.client_name}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{insp.project_name || 'No Project'}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {format(new Date(insp.inspection_date || insp.createdAt), 'dd MMM yyyy')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <Badge className={cn(
                                                        "rounded-full px-3 py-1 font-bold text-[10px] uppercase",
                                                        insp.status === 'approved' ? "bg-green-100 text-green-700" :
                                                            insp.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                                                insp.status === 'rejected' ? "bg-red-100 text-red-700" :
                                                                    "bg-gray-100 text-gray-700"
                                                    )}>
                                                        {insp.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/20">
                                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground italic">
                                                    No inspections found matching your criteria
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">

                        <Card className="rounded-[2.5rem] border-none shadow-premium bg-white p-6">
                            <CardHeader className="px-0 pt-0 pb-6">
                                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 space-y-3">
                                <Button variant="outline" className="w-full justify-start rounded-2xl p-6 h-auto border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 transition-all text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Operational Stats</p>
                                            <p className="text-xs text-muted-foreground">Detailed performance analysis</p>
                                        </div>
                                    </div>
                                </Button>
                                <Button variant="outline" className="w-full justify-start rounded-2xl p-6 h-auto border-dashed border-2 hover:bg-green-500/5 hover:border-green-500/50 transition-all text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Assigned Inspectors</p>
                                            <p className="text-xs text-muted-foreground">Manage field personnel</p>
                                        </div>
                                    </div>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BaseIndustrialDashboard;
