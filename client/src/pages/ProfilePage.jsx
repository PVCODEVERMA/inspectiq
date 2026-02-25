import React, { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, Shield, User, Smartphone, Loader2, UserPlus, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getFileUrl } from '@/lib/utils';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, profile, updateAvatar } = useAuth();
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB');
            return;
        }

        setIsUploading(true);
        try {
            await updateAvatar(file);
            toast.success('Profile picture updated');
        } catch (error) {
            console.error('Avatar update error:', error);
            toast.error('Failed to update profile picture');
        } finally {
            setIsUploading(false);
        }
    };

    const name = profile?.full_name || user?.email || 'User';
    const role = user?.role?.replace('_', ' ') || 'Member';

    return (
        <div className="min-h-screen bg-background pb-12">
            <Header title="My Profile" subtitle="Manage your account settings and profile picture" />

            <main className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Profile Header Card */}
                    <Card className="w-full lg:w-80 flex-shrink-0 border-none shadow-premium rounded-[32px] overflow-hidden animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/60 relative">
                            <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-4 pointer-events-none">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-white" />
                                ))}
                            </div>
                        </div>
                        <CardContent className="relative pt-0 flex flex-col items-center">
                            <div className="relative -mt-16 group">
                                <div className="p-1.5 bg-background rounded-full shadow-xl">
                                    <Avatar className="w-32 h-32 border-4 border-background overflow-hidden relative">
                                        <AvatarImage src={getFileUrl(profile?.avatar_url)} className="object-cover" />
                                        <AvatarFallback className="text-4xl bg-primary/5 text-primary uppercase font-black">
                                            {name.charAt(0)}
                                        </AvatarFallback>

                                        {isUploading && (
                                            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            </div>
                                        )}
                                    </Avatar>
                                </div>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-background hover:scale-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                                    disabled={isUploading}
                                    title="Change Profile Picture"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                            />

                            <div className="mt-6 text-center space-y-3 pb-8 w-full px-4">
                                <h2 className="text-2xl font-black tracking-tight text-slate-800 line-clamp-1">{name}</h2>
                                <div className="flex justify-center">
                                    <Badge className="bg-primary/10 text-primary border-none py-1.5 px-4 rounded-xl capitalize font-bold text-xs tracking-wider">
                                        <Shield className="w-3.5 h-3.5 mr-1.5" />
                                        {role}
                                    </Badge>
                                </div>
                                <div className="pt-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl text-xs font-medium text-muted-foreground">
                                        <Mail className="w-4 h-4 text-primary/60" />
                                        <span className="truncate">{user?.email}</span>
                                    </div>
                                    {profile?.phone && (
                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl text-xs font-medium text-muted-foreground">
                                            <Smartphone className="w-4 h-4 text-primary/60" />
                                            <span>{profile.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Info Section */}
                    <div className="flex-1 w-full space-y-6 animate-in fade-in slide-in-from-right-8 duration-700 delay-100 fill-mode-both">
                        <Card className="border-none shadow-premium rounded-[32px] overflow-hidden">
                            <CardHeader className="border-b border-slate-50 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-black tracking-tight">Personal Details</CardTitle>
                                        <CardDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">Manage your system identifying information</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { label: 'Full Name', value: profile?.full_name || 'N/A', icon: User, desc: 'Displayed on reports and dashboard' },
                                        { label: 'Email Address', value: user?.email || '', icon: Mail, desc: 'Used for login and notifications' },
                                        { label: 'Contact Phone', value: profile?.phone || 'Not provided', icon: Smartphone, desc: 'System contact number' },
                                        { label: 'Account Role', value: role, icon: Shield, desc: 'Your current system permissions', capitalize: true },
                                    ].map((item, idx) => (
                                        <div key={idx} className="space-y-3 group">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <item.icon className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors" />
                                                    {item.label}
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    value={item.value}
                                                    readOnly
                                                    className="h-14 bg-slate-50/50 border-slate-100 rounded-2xl font-bold text-slate-700 pl-4 transition-all group-hover:bg-white group-hover:border-primary/20 group-hover:shadow-sm"
                                                />
                                            </div>
                                            <p className="text-[10px] font-medium text-muted-foreground/60 pl-1">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Security Banner */}
                                <div className="bg-[#F44034]/5 border-2 border-[#F44034]/10 rounded-[24px] p-5 flex items-start gap-4 animate-in zoom-in duration-500 delay-500 fill-mode-both">
                                    <div className="w-10 h-10 rounded-xl bg-[#F44034]/10 flex-shrink-0 flex items-center justify-center text-[#F44034]">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-[#F44034] tracking-tight">Security Protocol</h4>
                                        <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                                            Your unique 10-digit private key is your identity signature within the InspectIQ system.
                                            <span className="font-bold text-[#F44034]"> Never share this key.</span> If you suspect any security breach, notify the Super Admin immediately.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Admin Sections */}
                        {(user?.role === 'master_admin' || user?.role === 'super_admin') && (
                            <Card className="border-none shadow-premium rounded-[32px] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
                                <CardHeader className="border-b border-slate-50 pb-6 bg-slate-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black tracking-tight">Administration Gateway</CardTitle>
                                            <CardDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">Quick access to member management</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <Button
                                            variant="outline"
                                            className="h-32 rounded-3xl border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary group transition-all duration-300 relative overflow-hidden"
                                            onClick={() => navigate('/key-generation')}
                                        >
                                            <div className="flex flex-col items-center gap-2 relative z-10 transition-transform group-hover:-translate-y-1">
                                                <div className="w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                                    <UserPlus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                                                </div>
                                                <span className="font-black text-sm tracking-tight text-slate-700 group-hover:text-primary transition-colors">Generate New Key</span>
                                                <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest">Generate new key</p>
                                            </div>
                                            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none transition-transform group-hover:translate-x-4 group-hover:-translate-y-4">
                                                <div className="absolute top-0 right-0 w-full h-full bg-primary/10 [clip-path:polygon(0_0,100%_0,100%_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="h-32 rounded-3xl border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary group transition-all duration-300 relative overflow-hidden"
                                            onClick={() => navigate('/admin')}
                                        >
                                            <div className="flex flex-col items-center gap-2 relative z-10 transition-transform group-hover:-translate-y-1">
                                                <div className="w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                                    <Users className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                                                </div>
                                                <span className="font-black text-sm tracking-tight text-slate-700 group-hover:text-primary transition-colors">Team Directory</span>
                                                <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest">View member details</p>
                                            </div>
                                            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none transition-transform group-hover:translate-x-4 group-hover:-translate-y-4">
                                                <div className="absolute top-0 right-0 w-full h-full bg-primary/10 [clip-path:polygon(0_0,100%_0,100%_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
