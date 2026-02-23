import React from 'react';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { InspectionTable } from '@/components/dashboard/InspectionTable';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { InspectionTrendChart, InspectionStatusChart } from '@/components/dashboard/InspectionChart';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, IndianRupee, Briefcase, ShieldCheck, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PremiumMetricCard } from '@/components/dashboard/PremiumMetricCard';

const Dashboard = () => {
  const { profile, role } = useAuth();
  const navigate = useNavigate();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GM';
    if (hour < 17) return 'GA';
    return 'GE';
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'super_admin': return 'Super Admin Dashboard';
      case 'company_admin': return 'Company Dashboard';
      case 'inspector': return 'Inspector Dashboard';
      default: return 'Dashboard';
    }
  };

  const userName = profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen">
      <Header
        title={`${getWelcomeMessage()}, ${userName}!`}
        subtitle={getRoleTitle()}
      />

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Premium Metrics Row for Master Admin and Super Admin */}
        {(role === 'master_admin' || role === 'super_admin') && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <PremiumMetricCard
              label="Total Revenue"
              value="₹24.5L"
              change="12"
              icon={IndianRupee}
              variant="red"
            />
            <PremiumMetricCard
              label="Active Projects"
              value="47"
              change="8"
              icon={Briefcase}
              variant="green"
            />
            <PremiumMetricCard
              label="Total Clients"
              value="156"
              change="5"
              icon={ShieldCheck}
              variant="orange"
            />
            <PremiumMetricCard
              label="Total Employees"
              value="89"
              change="3"
              icon={Users2}
              variant="blue"
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InspectionTrendChart />
          </div>
          <InspectionStatusChart />
        </div>

        {/* Main Content */}
        {role !== 'master_admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inspections Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl font-display font-semibold">Recent Inspections</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  {role !== 'inspector' && (
                    <Button variant="hero" size="sm" className="flex-1 sm:flex-none" onClick={() => navigate('/inspections/new')}>
                      <Plus className="w-4 h-4 mr-1" />
                      New Inspection
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => navigate('/inspections')}>
                    View All
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <InspectionTable inspections={[]} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <QuickActions />
              <ActivityFeed activities={[]} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
