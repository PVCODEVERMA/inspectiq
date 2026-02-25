import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getFileUrl, cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  Users,
  ClipboardCheck,
  FileText,
  CheckCircle,
  Search,
  RefreshCw,
  Shield,
  UserCog,
  Activity,
  Key,
  MessageSquare,
  Pencil,
  User,
  Boxes,
  Eye,
  Calendar,
  Mail,
  Smartphone
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { role, createUser, user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalInspections: 0,
    totalReports: 0,
  });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState('all');

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phoneNumber: '',
    role: '',
    password: '',
    assignedServices: []
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (role === 'master_admin') {
      fetchAllData();
      fetchServices();
    }
  }, [role]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/active');
      setAvailableServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
      ]);
      setUsers(usersRes.data);

      // Calculate local stats as fallback
      const localStats = {
        totalUsers: usersRes.data.length,
        activeUsers: usersRes.data.filter(u => u.isActive).length,
        serviceManagers: usersRes.data.filter(u => u.role === 'service_manager').length,
        technicalCoordinators: usersRes.data.filter(u => u.role === 'technical_coordinator').length,
        inspectors: usersRes.data.filter(u => u.role === 'inspector').length,
        inspectionCoordinators: usersRes.data.filter(u => u.role === 'inspection_coordinator').length,
      };

      if (statsRes.data) {
        console.log('Fetched Stats:', statsRes.data);
        // Merge preferring non-zero values
        setStats(prev => ({
          ...prev,
          ...localStats,
          ...Object.fromEntries(Object.entries(statsRes.data).filter(([_, v]) => v > 0))
        }));
      } else {
        setStats(prev => ({ ...prev, ...localStats }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.profile?.full_name || '',
      email: user.email,
      phoneNumber: user.phoneNumber || user.profile?.phone || '',
      role: user.role,
      password: '', // Keep password empty for security, only update if filled
      assignedServices: user.assignedServices?.map(s => s._id) || []
    });
    setIsEditModalOpen(true);
  };

  const handleServiceToggle = (serviceId) => {
    setEditFormData(prev => {
      const current = prev.assignedServices || [];
      if (current.includes(serviceId)) {
        return { ...prev, assignedServices: current.filter(id => id !== serviceId) };
      } else {
        return { ...prev, assignedServices: [...current, serviceId] };
      }
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.put(`/admin/users/${editingUser._id}`, editFormData);
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.profile?.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesRole = activeRoleFilter === 'all' || u.role === activeRoleFilter;
    return matchesSearch && matchesRole;
  });

  if (role !== 'master_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need Master Admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Master Admin Dashboard"
        subtitle="Full System Role & Access Management"
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'All Members', value: stats.totalUsers, icon: Users, color: 'text-primary', bg: 'bg-primary/10', role: 'all' },
            { label: 'Active', value: stats.activeUsers, icon: Activity, color: 'text-success', bg: 'bg-success/10', role: 'all' },
            { label: 'Service Managers', value: stats.serviceManagers, icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10', role: 'service_manager' },
            { label: 'Technical Coordinators', value: stats.technicalCoordinators, icon: UserCog, color: 'text-green-500', bg: 'bg-green-500/10', role: 'technical_coordinator' },
            { label: 'Inspector Engineers', value: stats.inspectors, icon: ClipboardCheck, color: 'text-warning', bg: 'bg-warning/10', role: 'inspector' },
            { label: 'Coordination', value: stats.inspectionCoordinators, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10', role: 'inspection_coordinator' },
          ].map((stat, index) => (
            <Card
              key={stat.label}
              className={cn(
                "animate-fade-in cursor-pointer transition-all hover:scale-105 active:scale-95",
                activeRoleFilter === stat.role && stat.role !== 'all' ? "border-primary ring-1 ring-primary" : ""
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setActiveRoleFilter(stat.role)}
            >
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {isLoading ? <Skeleton className="h-5 w-8 mx-auto" /> : stat.value || 0}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-1">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Member Management Tabs */}
        <Tabs defaultValue="members" className="space-y-4">


          <TabsContent value="members">
            <Card>
              <CardHeader className="border-b border-slate-50 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight">Member Directory</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">System-wide team access overview</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4 sm:p-8">
                  {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                      <Card key={`skeleton-${i}`} className="border-none shadow-premium rounded-[28px] bg-white h-64 flex flex-col p-6 space-y-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-14 h-14 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="pt-4 flex gap-2">
                          <Skeleton className="h-10 flex-1 rounded-xl" />
                          <Skeleton className="h-10 w-10 rounded-xl" />
                        </div>
                      </Card>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4 opacity-30">
                      <Users className="w-20 h-20 mx-auto" />
                      <p className="text-sm font-black uppercase tracking-widest">No members found in this node</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <Card key={user._id} className="border-none shadow-premium hover:shadow-xl transition-all duration-300 rounded-[32px] overflow-hidden group bg-white border border-slate-100 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
                        <CardContent className="p-6 flex flex-col h-full space-y-5">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4 min-w-0">
                              <Avatar className="w-14 h-14 border-2 border-slate-50 shadow-sm shrink-0">
                                <AvatarImage src={getFileUrl(user.profile?.avatar_url)} />
                                <AvatarFallback className="bg-primary/5 text-primary text-lg font-black uppercase">
                                  {(user.profile?.full_name || user.email).charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <h4 className="font-black text-slate-800 truncate mb-1 text-base tracking-tight">{user.profile?.full_name || 'N/A'}</h4>
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest py-0.5 px-2 bg-slate-50 text-slate-500 border-none rounded-lg">
                                  {user.role === 'inspector' ? 'Inspector Engineer' : user.role.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-success' : 'bg-slate-200'} border-2 border-white shadow-sm shrink-0 mt-1.5`} />
                          </div>

                          <div className="space-y-3 pt-2 text-[11px] font-bold text-slate-600 flex-1">
                            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                              <Mail className="w-4 h-4 text-primary/40" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                              <Smartphone className="w-4 h-4 text-primary/40" />
                              <span>{user.phoneNumber || user.profile?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-1 text-muted-foreground/40 font-black uppercase tracking-tighter italic">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="pt-4 flex items-center gap-3">
                            <Button
                              variant="outline"
                              className="flex-1 rounded-2xl h-12 text-xs font-black tracking-tight hover:bg-primary hover:text-white border-slate-100 hover:border-primary transition-all shadow-sm hover:shadow-lg hover:shadow-primary/20"
                              onClick={() => navigate(`/admin/members/${user._id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              VIEW PROFILE
                            </Button>
                            {user.role !== 'master_admin' && (
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary transition-all border-none"
                                onClick={() => handleOpenEdit(user)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>System audit logs will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-primary" />
                Edit Member Details
              </DialogTitle>
              <DialogDescription>
                Update role, password, and profile details for {editingUser?.profile?.full_name || editingUser?.email}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Full Name</Label>
                  <Input
                    id="edit_name"
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_role">Role</Label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(val) => setEditFormData({ ...editFormData, role: val })}
                  >
                    <SelectTrigger id="edit_role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service_manager">Service Manager</SelectItem>
                      <SelectItem value="inspection_coordinator">Inspection Coordinator</SelectItem>
                      <SelectItem value="technical_coordinator">Technical Coordinator</SelectItem>
                      <SelectItem value="inspector">Inspector Engineer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_phone">Phone Number</Label>
                  <Input
                    id="edit_phone"
                    value={editFormData.phoneNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-semibold">Assigned Services (Quality Modules)</Label>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-2xl border border-dashed">
                  {availableServices.map((service) => (
                    <div key={service._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${service._id}`}
                        checked={editFormData.assignedServices?.includes(service._id)}
                        onCheckedChange={() => handleServiceToggle(service._id)}
                        className="rounded-[6px]"
                      />
                      <label
                        htmlFor={`edit-${service._id}`}
                        className="text-xs font-medium leading-none cursor-pointer"
                      >
                        {service.name}
                      </label>
                    </div>
                  ))}
                  {availableServices.length === 0 && (
                    <p className="text-[10px] text-muted-foreground col-span-full text-center">No active services found</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_password">New Password (Optional)</Label>
                <Input
                  id="edit_password"
                  type="password"
                  placeholder="Enter new password to change"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;