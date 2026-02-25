import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Building2,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const allUsers = [];
const allCompanies = [];
const allInspections = [];

const InspectorsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { searchQuery } = useSidebar();
  const [statusFilter, setStatusFilter] = useState('all');

  const inspectors = allUsers.filter(u => u.role === 'inspector');

  const filteredInspectors = inspectors.filter(inspector => {
    const matchesSearch = inspector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspector.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'completed' ? (inspector.status === 'completed' || inspector.status === 'approved') : inspector.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const getCompanyName = (companyId) => {
    if (!companyId) return 'N/A';
    const company = allCompanies.find(c => c.id === companyId);
    return company?.name || 'Unknown';
  };

  const getInspectorStats = (inspectorId) => {
    const assigned = allInspections.filter(i => i.assignedTo === inspectorId);
    const completed = assigned.filter(i => i.status === 'completed' || i.status === 'approved');
    const pending = assigned.filter(i => i.status === 'pending' || i.status === 'in_progress');
    const avgScore = completed.filter(i => i.score).reduce((acc, i) => acc + (i.score || 0), 0) /
      (completed.filter(i => i.score).length || 1);

    return { total: assigned.length, completed: completed.length, pending: pending.length, avgScore: Math.round(avgScore) };
  };

  const activeInspectors = inspectors.filter(i => i.status === 'active').length;
  const suspendedInspectors = inspectors.filter(i => i.status === 'suspended').length;

  return (
    <div className="min-h-screen">
      <Header
        title="Inspectors"
        subtitle="Manage your inspection team"
      />

      <div className="p-6 space-y-6">
        {/* Actions Bar - Simplified to just Add Button as Search is in Header */}
        <div className="flex justify-end">
          <Button variant="hero" onClick={() => navigate('/members/new')} className="rounded-2xl h-12 px-6">
            <Plus className="w-5 h-5 mr-2" />
            Add Inspector
          </Button>
        </div>

        {/* Stats Cards - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div
            className={cn(
              "glass-card rounded-2xl p-4 sm:p-6 cursor-pointer transition-all border-2",
              statusFilter === 'all' ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-glow" : "border-transparent"
            )}
            onClick={() => setStatusFilter('all')}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-black truncate">{inspectors.length}</p>
                <p className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total</p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "glass-card rounded-2xl p-4 sm:p-6 cursor-pointer transition-all border-2",
              statusFilter === 'active' ? "border-success bg-success/5 ring-4 ring-success/10" : "border-transparent"
            )}
            onClick={() => setStatusFilter('active')}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-success flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-success-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-black truncate">{activeInspectors}</p>
                <p className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider">Active</p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "glass-card rounded-2xl p-4 sm:p-6 cursor-pointer transition-all border-2",
              statusFilter === 'suspended' ? "border-warning bg-warning/5 ring-4 ring-warning/10" : "border-transparent"
            )}
            onClick={() => setStatusFilter('suspended')}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-warning flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5 sm:w-6 sm:h-6 text-warning-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-black truncate">{suspendedInspectors}</p>
                <p className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider">Suspended</p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "glass-card rounded-2xl p-4 sm:p-6 cursor-pointer transition-all border-2",
              statusFilter === 'completed' ? "border-accent bg-accent/5 ring-4 ring-accent/10 shadow-glow-red" : "border-transparent"
            )}
            onClick={() => setStatusFilter('completed')}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-accent flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-black truncate">
                  {allInspections.filter(i => i.status === 'completed' || i.status === 'approved').length}
                </p>
                <p className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider">Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inspectors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInspectors.map((inspector, index) => {
            const stats = getInspectorStats(inspector.id);
            return (
              <div
                key={inspector.id}
                className="glass-card rounded-2xl p-6 animate-slide-up hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={inspector.avatar} alt={inspector.name} />
                      <AvatarFallback>{inspector.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-display font-semibold text-lg">{inspector.name}</h3>
                      <p className="text-muted-foreground text-sm">{inspector.email}</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{getCompanyName(inspector.companyId)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {inspector.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 py-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Assigned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-success">{stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-warning">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-accent">{stats.avgScore}%</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Badge variant={inspector.status === 'active' ? 'default' : 'destructive'}>
                    {inspector.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Last active: {inspector.lastActive.toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInspectors.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No inspectors found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectorsPage;
