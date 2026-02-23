import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, Shield, Key, MessageSquare, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getFileUrl } from '@/lib/utils';

const MemberProfileDialog = ({
    member,
    isOpen,
    onClose,
    onRegenerateKey,
    onToggleStatus,
    onDelete,
    onOpenChat
}) => {
    if (!member) return null;

    const getStatusColor = () => {
        if (member.isOnline) return 'bg-success';
        return 'bg-muted-foreground';
    };

    const getLastSeen = () => {
        if (member.isOnline) return 'Online';
        if (member.lastSeen) {
            return `Last seen ${formatDistanceToNow(new Date(member.lastSeen), { addSuffix: true })}`;
        }
        return 'Offline';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Member Profile</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={getFileUrl(member.profile?.avatar_url)} />
                                <AvatarFallback className="text-2xl uppercase bg-accent">
                                    {(member.profile?.full_name || member.email).charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor()}`} />
                        </div>

                        <div className="text-center">
                            <h3 className="text-xl font-bold">{member.profile?.full_name || 'N/A'}</h3>
                            <p className="text-sm text-muted-foreground">{getLastSeen()}</p>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Mail className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium">{member.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Phone className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm font-medium">{member.phoneNumber || member.profile?.phone || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Shield className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Role</p>
                                <Badge variant="outline" className="capitalize">
                                    {member.role.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Joined</p>
                                <p className="text-sm font-medium">{new Date(member.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Shield className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Account Status</p>
                                <Badge variant={member.isActive ? 'default' : 'secondary'} className={member.isActive ? 'bg-success/10 text-success' : ''}>
                                    {member.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {member.role !== 'master_admin' && (
                        <div className="flex flex-col gap-2 pt-4 border-t">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => {
                                    onOpenChat(member);
                                    onClose();
                                }}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Send Message
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => {
                                    onRegenerateKey(member);
                                    onClose();
                                }}
                            >
                                <Key className="w-4 h-4 mr-2" />
                                Regenerate Private Key
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => {
                                    onToggleStatus(member._id);
                                }}
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                {member.isActive ? 'Deactivate Account' : 'Activate Account'}
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start text-destructive hover:text-destructive"
                                onClick={() => {
                                    onDelete(member);
                                    onClose();
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Member
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MemberProfileDialog;
