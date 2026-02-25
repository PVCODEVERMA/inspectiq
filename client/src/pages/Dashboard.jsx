import React from 'react';
import { Header } from '@/components/layout/Header';
import Fuse from 'fuse.js';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { InspectionTable } from '@/components/dashboard/InspectionTable';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { InspectionTrendChart, InspectionStatusChart } from '@/components/dashboard/InspectionChart';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Plus,
  IndianRupee,
  Briefcase,
  ShieldCheck,
  Users2,
  Boxes,
  ChevronRight,
  FileText,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { PremiumMetricCard } from '@/components/dashboard/PremiumMetricCard';
import { useSidebar } from '@/contexts/SidebarContext';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { profile, role } = useAuth();
  const { searchQuery, setSearchQuery } = useSidebar();
  const navigate = useNavigate();
  const [services, setServices] = React.useState([]);
  const [inspections, setInspections] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const fetchSearchData = async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const [servicesRes, inspectionsRes] = await Promise.all([
            api.get('/services/active'),
            api.get('/inspections')
          ]);
          if (active) {
            setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
            setInspections(Array.isArray(inspectionsRes.data) ? inspectionsRes.data : []);
          }
        } catch (error) {
          console.error('Error fetching search data:', error);
          if (active) {
            setServices([]);
            setInspections([]);
          }
        } finally {
          if (active) setIsSearching(false);
        }
      } else {
        setServices([]);
        setInspections([]);
        setIsSearching(false);
      }
    };
    fetchSearchData();
    return () => { active = false; };
  }, [searchQuery]);

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

  const filteredResults = React.useMemo(() => {
    if (!searchQuery.trim()) return { services: [], reports: [] };

    // Fuse.js options
    const options = {
      includeScore: true,
      threshold: 0.3, // 0.0 means perfect match, 1.0 means match anything
      keys: []
    };

    // Filter Services
    const serviceFuse = new Fuse(services, { ...options, keys: ['name', 'category', 'description'] });
    const matchedServices = serviceFuse.search(searchQuery).map(result => result.item);

    // Filter Inspections/Reports
    const reportFuse = new Fuse(inspections, { ...options, keys: ['report_no', 'client_name', 'project_name', 'vendor_name'] });
    const matchedReports = reportFuse.search(searchQuery).map(result => result.item);

    return { services: matchedServices, reports: matchedReports };
  }, [searchQuery, services, inspections]);

  const userName = profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen">
      <Header
        title={searchQuery ? `Searching: ${searchQuery}` : getRoleTitle()}
      />

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {searchQuery ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Search Results - Services */}
            {(filteredResults.services.length > 0 || isSearching) && (
              <div className="space-y-4">
                <h2 className="text-xl font-display font-black flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-primary" />
                  Matching Services {isSearching && <Skeleton className="h-6 w-24" />}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isSearching ? (
                    [1, 2, 3].map(i => (
                      <Card key={`s-skeleton-${i}`} className="rounded-3xl border-none shadow-premium overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-2xl" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-3 w-1/3" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Skeleton className="h-9 flex-1 rounded-xl" />
                            <Skeleton className="h-9 flex-1 rounded-xl" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    filteredResults.services.map((s, idx) => (
                      <Card
                        key={s._id}
                        className="rounded-3xl border-none shadow-premium hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer hover:bg-muted/50 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                        style={{ animationDelay: `${idx * 75}ms` }}
                        onClick={() => {
                          setSearchQuery(''); // Clear search on navigation
                          navigate(`/admin/services/${s._id}/${s.name.toLowerCase().replace(/\s+/g, '-')}`);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <Boxes className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-black text-lg leading-none mb-1 group-hover:text-primary transition-colors">{s.name}</p>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{s.category || 'General Service'}</p>
                              </div>
                            </div>
                            <div className="p-2 bg-muted rounded-xl group-hover:bg-primary/20 transition-colors">
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                          </div>
                          {s.description && (
                            <p className="mt-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {s.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Search Results - Reports */}
            {(filteredResults.reports.length > 0 || isSearching) && (
              <div className="space-y-4">
                <h2 className="text-xl font-display font-black flex items-center gap-2 pt-4">
                  <FileText className="w-6 h-6 text-primary" />
                  Matching Reports {isSearching && <Skeleton className="h-6 w-24" />}
                </h2>
                <div className="rounded-[2.5rem] border-none shadow-premium bg-white overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-secondary/30">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Report #</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Client / Project</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {isSearching ? (
                        [1, 2, 3, 4].map(i => (
                          <tr key={`r-skeleton-${i}`}>
                            <td className="px-6 py-5"><Skeleton className="h-5 w-24" /></td>
                            <td className="px-6 py-5 space-y-2">
                              <Skeleton className="h-5 w-48" />
                              <Skeleton className="h-3 w-32" />
                            </td>
                            <td className="px-6 py-5"><Skeleton className="h-6 w-20 rounded-full" /></td>
                          </tr>
                        ))
                      ) : (
                        filteredResults.reports.map(insp => (
                          <tr key={insp._id} className="hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => navigate(`/inspections/${insp._id}`)}>
                            <td className="px-6 py-5">
                              <span className="font-bold text-primary group-hover:underline">{insp.report_no || 'TBD'}</span>
                            </td>
                            <td className="px-6 py-5">
                              <p className="font-bold text-foreground">{insp.client_name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{insp.project_name || 'No Project'}</p>
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
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Results Fallback */}
            {filteredResults.services.length === 0 && filteredResults.reports.length === 0 && !isSearching && (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground transition-all animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No matching results</h3>
                <p className="text-sm max-w-[300px] text-center">
                  We couldn't find any services or reports matching <span className="text-primary font-bold">"{searchQuery}"</span>.
                  Try checking your spelling or use more general terms.
                </p>
                <Button
                  variant="outline"
                  className="mt-8 rounded-xl px-8"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Premium Metrics Row for Master Admin and Super Admin */}
            {(role === 'master_admin' || role === 'super_admin') && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <PremiumMetricCard
                  label="Total Revenue"
                  value="₹2.5L"
                  change="12"
                  icon={IndianRupee}
                  variant="red"
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                />
                <PremiumMetricCard
                  label="Active Projects"
                  value="47"
                  change="8"
                  icon={Briefcase}
                  variant="green"
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                />
                <PremiumMetricCard
                  label="Total Clients"
                  value="156"
                  change="5"
                  icon={ShieldCheck}
                  variant="orange"
                  className="animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both"
                />
                <PremiumMetricCard
                  label="Total Employees"
                  value="89"
                  change="3"
                  icon={Users2}
                  variant="blue"
                  className="animate-in fade-in slide-in-from-bottom-4 duration-[1200ms] fill-mode-both"
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuickActions />
                <ActivityFeed activities={[]} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
