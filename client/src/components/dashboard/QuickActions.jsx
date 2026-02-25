import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  FileSearch,
  Users,
  Building2,
  Download,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

export const QuickActions = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const getActionsForRole = () => {
    switch (role) {
      case 'super_admin':
        return [
          { icon: LayoutDashboard, label: 'Admin Dashboard', onClick: () => navigate('/admin') },
          { icon: Building2, label: 'Manage Companies', onClick: () => navigate('/companies') },
          { icon: Users, label: 'Manage Clients', onClick: () => navigate('/admin/clients') },
          { icon: Users, label: 'Manage Users', onClick: () => navigate('/inspectors') },
          { icon: FileSearch, label: 'View All Inspections', onClick: () => navigate('/inspections') },
        ];
      case 'company_admin':
        return [
          { icon: Plus, label: 'New Inspection', onClick: () => navigate('/inspections/new') },
          { icon: Users, label: 'Manage Clients', onClick: () => navigate('/admin/clients') },
          { icon: Users, label: 'View Inspectors', onClick: () => navigate('/inspectors') },
          { icon: FileSearch, label: 'View Inspections', onClick: () => navigate('/inspections') },
          { icon: Download, label: 'Export Reports', onClick: () => navigate('/reports') },
        ];
      case 'inspector':
        return [
          { icon: FileSearch, label: 'My Inspections', onClick: () => navigate('/inspections') },
          { icon: Plus, label: 'Start Inspection', onClick: () => navigate('/inspections/new') },
          { icon: Download, label: 'Download Reports', onClick: () => navigate('/reports') },
          { icon: Settings, label: 'My Profile', onClick: () => navigate('/dashboard') },
        ];
      default:
        return [];
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="font-display font-semibold text-lg mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-accent/10 hover:border-accent transition-all"
            onClick={action.onClick}
          >
            <action.icon className="w-5 h-5 text-accent" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
