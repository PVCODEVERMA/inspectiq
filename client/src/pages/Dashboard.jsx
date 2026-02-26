import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
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
  Search
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { PremiumMetricCard } from '@/components/dashboard/PremiumMetricCard';
import { useSidebar } from '@/contexts/SidebarContext';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHeader } from '@/contexts/HeaderContext';

const Dashboard = () => {
  const { profile, role } = useAuth();
  const { searchQuery, setSearchQuery, isSearchOpen } = useSidebar();
  const { setHeader } = useHeader();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
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

  const getRoleTitle = () => {
    switch (role) {
      case 'super_admin': return 'Super Admin Dashboard';
      case 'company_admin': return 'Company Dashboard';
      case 'inspector': return 'Inspector Dashboard';
      default: return 'Dashboard';
    }
  };

  useEffect(() => {
    setHeader({
      title: searchQuery ? `Searching: ${searchQuery}` : getRoleTitle(),
      subtitle: searchQuery ? null : "Welcome back to QC Welding Management",
      showSearch: true
    });
  }, [searchQuery, role, setHeader]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return { services: [], reports: [] };

    const options = {
      includeScore: true,
      threshold: 0.3,
      keys: []
    };

    const serviceFuse = new Fuse(services, { ...options, keys: ['name', 'category', 'description'] });
    const matchedServices = serviceFuse.search(searchQuery).map(result => result.item);

    const reportFuse = new Fuse(inspections, { ...options, keys: ['report_no', 'client_name', 'project_name', 'vendor_name'] });
    const matchedReports = reportFuse.search(searchQuery).map(result => result.item);

    return { services: matchedServices, reports: matchedReports };
  }, [searchQuery, services, inspections]);

  const showSearchUI = searchQuery || isSearchOpen;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {showSearchUI ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {(filteredResults.services.length > 0 || isSearching || !searchQuery) && (
            <div className="space-y-4">
              <h2 className="text-xl font-display font-black flex items-center gap-2 text-slate-800">
                <Briefcase className="w-6 h-6 text-primary" />
                Search result {(isSearching || !searchQuery) && <Skeleton className="h-6 w-24" />}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(isSearching || !searchQuery) ? (
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
                        setSearchQuery('');
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
                              <p className="font-black text-lg leading-none mb-1 group-hover:text-primary transition-colors text-slate-800">{s.name}</p>
                              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{s.category || 'General Service'}</p>
                            </div>
                          </div>
                          <div className="p-2 bg-muted rounded-xl group-hover:bg-primary/20 transition-colors">
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                          </div>
                        </div>
                        {s.description && (
                          <p className="mt-4 text-sm text-slate-600 line-clamp-2 leading-relaxed">
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

          {searchQuery && filteredResults.services.length === 0 && filteredResults.reports.length === 0 && !isSearching && (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground transition-all animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No matching results</h3>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InspectionTrendChart />
            </div>
            <InspectionStatusChart />
          </div>

          {role !== 'master_admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActions />
              <ActivityFeed activities={[]} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
