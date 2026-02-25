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
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Member Directory</CardTitle>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [1, 2, 3, 4, 5].map(i => (
                          <TableRow key={`user-skeleton-${i}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow
                            key={user._id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={getFileUrl(user.profile?.avatar_url)} />
                                    <AvatarFallback className="text-xs uppercase bg-accent">
                                      {(user.profile?.full_name || user.email).charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div>
                                  <p className="font-medium">{user.profile?.full_name || 'N/A'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{user.email}</p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{user.phoneNumber || user.profile?.phone || 'N/A'}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize bg-muted text-white">
                                {user.role === 'inspector' ? 'Inspector Engineer' : user.role.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                {user.role !== 'master_admin' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEdit(user);
                                      }}
                                      className="text-primary"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
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