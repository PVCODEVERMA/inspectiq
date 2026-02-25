import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Smartphone,
    Shield,
    Calendar,
    ChevronLeft,
    Activity,
    Boxes,
    Camera,
    MapPin,
    Briefcase,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { getFileUrl, cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const MemberProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMemberDetails();
    }, [id]);

    const fetchMemberDetails = async () => {
        if (!id) {
            toast.error('Invalid Member ID');
            navigate('/admin');
            return;
        }

        setIsLoading(true);
        try {
            console.log(`[MemberProfile] Requesting details for ID: ${id}`);
            const response = await api.get(`/admin/users/${id}`);

            if (!response.data) {
                throw new Error('No data received from node');
            }

            setMember(response.data);
        } catch (error) {
            console.error('[MemberProfile] Fetch Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            toast.error(error.response?.data?.message || 'Failed to load member profile');
            navigate('/admin');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-6 space-y-8 animate-in fade-in duration-500">
                <div className="max-w-6xl mx-auto space-y-8">
                    <Skeleton className="h-12 w-48 rounded-2xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Skeleton className="h-[400px] rounded-[32px]" />
                        <Skeleton className="lg:col-span-2 h-[400px] rounded-[32px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!member) return null;

    const roleLabel = member.role === 'inspector' ? 'Inspector Engineer' : member.role.replace(/_/g, ' ');

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Header with Back Button */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 p-4 sm:p-6 mb-8">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-2xl h-10 w-10 sm:h-12 sm:w-12 bg-white shadow-sm border border-slate-100 hover:bg-slate-50"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </Button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">Member Profile</h1>
                            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">TEAM DIRECTORY NODE</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="px-4 py-2 bg-primary/5 text-primary border-primary/20 rounded-xl font-black text-[10px] uppercase tracking-wider">
                        Active Access
                    </Badge>
                </div>
            </div>

            <main className="px-4 sm:px-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar: Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-none shadow-premium rounded-[32px] overflow-hidden animate-in slide-in-from-left-8 duration-700">
                            <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-600 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 left-0 w-20 h-20 bg-white rotate-45 transform -translate-x-10 -translate-y-10" />
                                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rotate-45 transform translate-x-16 translate-y-16" />
                                </div>
                            </div>
                            <div className="px-6 pb-8 -mt-16 relative z-10 text-center">
                                <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-xl rounded-[40px]">
                                    <AvatarImage src={getFileUrl(member.profile?.avatar_url)} />
                                    <AvatarFallback className="bg-primary/5 text-primary text-4xl font-black uppercase">
                                        {(member.profile?.full_name || member.email).charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="mt-4 space-y-1">
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{member.profile?.full_name || 'N/A'}</h2>
                                    <p className="text-sm font-bold text-muted-foreground">{member.email}</p>
                                </div>
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    <Badge variant="hero" className="rounded-xl px-4 py-1.5 font-black text-[10px] tracking-widest uppercase">
                                        {roleLabel}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="px-6 pb-8 space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic font-bold text-xs text-slate-500">
                                    <Calendar className="w-4 h-4 text-primary/40 shrink-0" />
                                    <span>Joined on {new Date(member.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-xs text-slate-500">
                                    <Smartphone className="w-4 h-4 text-primary/40 shrink-0" />
                                    <span>{member.phoneNumber || member.profile?.phone || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-premium rounded-[32px] p-6 animate-in slide-in-from-left-8 duration-700 delay-100 fill-mode-both">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Security Protocol</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-muted-foreground uppercase tracking-widest">Account Status</span>
                                    <span className={cn("px-3 py-1 rounded-full uppercase tracking-tighter", member.isActive ? "bg-success/10 text-success" : "bg-slate-100 text-slate-400")}>
                                        {member.isActive ? 'Active Node' : 'Suspended'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold pt-4 border-t border-slate-50">
                                    <span className="text-muted-foreground uppercase tracking-widest">Encryption Level</span>
                                    <span className="text-slate-800">SHA-256 HIGH</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold pt-4 border-t border-slate-50">
                                    <span className="text-muted-foreground uppercase tracking-widest">Master Key Status</span>
                                    <Badge variant="outline" className="text-[10px] font-black uppercase text-success border-success/20 bg-success/5">VERIFIED</Badge>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-8 animate-in slide-in-from-right-8 duration-700">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Tasks', value: '42', icon: Activity, color: 'text-primary', bg: 'bg-primary/5' },
                                { label: 'Assigned', value: member.assignedServices?.length || '0', icon: Boxes, color: 'text-orange-500', bg: 'bg-orange-500/5' },
                                { label: 'Efficiency', value: '94%', icon: Activity, color: 'text-success', bg: 'bg-success/5' },
                                { label: 'Points', value: '1.2k', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/5' }
                            ].map((stat, i) => (
                                <Card key={i} className="border-none shadow-premium rounded-[24px] p-4 text-center space-y-2 hover:translate-y-[-4px] transition-all">
                                    <div className={cn("w-10 h-10 mx-auto rounded-xl flex items-center justify-center", stat.bg)}>
                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-lg font-black text-slate-800 leading-none">{stat.value}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Assigned Services / Quality Modules */}
                        <Card className="border-none shadow-premium rounded-[32px] overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 p-6 sm:p-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                                        <Boxes className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-black tracking-tight">Active Quality Modules</CardTitle>
                                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Specific service access permissions</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 sm:p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {member.assignedServices && member.assignedServices.length > 0 ? (
                                        member.assignedServices.map((service, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <Briefcase className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 text-sm">{service.name}</p>
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-wider">Level 1 ACCESS</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 text-center space-y-4 bg-slate-50 rounded-[28px] border-2 border-dashed border-slate-200 opacity-30">
                                            <Boxes className="w-12 h-12 mx-auto text-slate-300" />
                                            <p className="text-xs font-black uppercase tracking-[0.2em]">No quality modules assigned</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Info / About */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="border-none shadow-premium rounded-[32px] p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Operational Base</h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-800">Primary Inspection Node</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Assigned to HQ Industrial Site A. Coverage includes NDT-RT and Welding Assessments.</p>
                                </div>
                            </Card>

                            <Card className="border-none shadow-premium rounded-[32px] p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Device Access</h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-800">Mobile Unit #402</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Authenticated via Samsung Galaxy Tab S9. Last logged in from Mumbai Node.</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MemberProfilePage;
