import React, { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Mail, Shield, User, Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getFileUrl } from '@/lib/utils';

const ProfilePage = () => {
    const { user, profile, updateAvatar } = useAuth();
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB');
            return;
        }

        setIsUploading(true);
        try {
            await updateAvatar(file);
        } finally {
            setIsUploading(false);
        }
    };

    const name = profile?.full_name || user?.email || 'User';
    const role = user?.role?.replace('_', ' ') || 'Member';

    return (
        <div className="min-h-screen bg-background">
            <Header title="My Profile" subtitle="Manage your account settings and profile picture" />

            <main className="p-6 max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar Section */}
                    <Card className="w-full md:w-80 flex-shrink-0">
                        <CardContent className="pt-8 flex flex-col items-center">
                            <div className="relative group">
                                <Avatar className="w-32 h-32 border-4 border-muted">
                                    <AvatarImage src={getFileUrl(profile?.avatar_url)} />
                                    <AvatarFallback className="text-4xl bg-accent text-accent-foreground uppercase">
                                        {name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-white" />
                                    )}
                                </button>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                            />

                            <div className="mt-6 text-center space-y-2">
                                <h2 className="text-xl font-bold">{name}</h2>
                                <Badge variant="hero" className="capitalize">
                                    {role}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Section */}
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>Your personal details and system role</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-muted-foreground">
                                        <User className="w-4 h-4" /> Full Name
                                    </Label>
                                    <Input value={profile?.full_name || 'N/A'} readOnly className="bg-muted/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4" /> Email Address
                                    </Label>
                                    <Input value={user?.email || ''} readOnly className="bg-muted/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-muted-foreground">
                                        <Smartphone className="w-4 h-4" /> Phone Number
                                    </Label>
                                    <Input value={profile?.phone || 'Not provided'} readOnly className="bg-muted/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-muted-foreground">
                                        <Shield className="w-4 h-4" /> Access Level
                                    </Label>
                                    <Input value={role} readOnly className="bg-muted/50 capitalize" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <div className="bg-accent/10 rounded-xl p-4 flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-accent mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold">Security Note</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Your 10-digit private key is your unique identifier. Do not share it with anyone.
                                            If you believe your account is compromised, contact the Master Admin immediately.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
