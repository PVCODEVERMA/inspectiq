import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import Fuse from 'fuse.js';
import { InspectionTable } from '@/components/dashboard/InspectionTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
} from 'lucide-react';
import { InspectionTypeSelector } from '@/components/inspections/InspectionTypeSelector';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useSidebar } from '@/contexts/SidebarContext';

const InspectionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isNewInspection = location.pathname === '/inspections/new';
  const [inspections, setInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { searchQuery, setSearchQuery } = useSidebar();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchInspections = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/inspections');
        setInspections(response.data);
      } catch (error) {
        console.error("Error fetching inspections:", error);
        toast.error("Failed to load inspections");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInspections();
  }, []);

  const filteredInspections = React.useMemo(() => {
    let result = inspections;

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter);
    }

    // Type Filter
    if (typeFilter !== 'all') {
      result = result.filter(i => i.inspection_type === typeFilter);
    }

    // Search Query (Fuzzy Search with Fuse.js)
    if (searchQuery.trim()) {
      const fuse = new Fuse(result, {
        keys: ['report_no', 'client_name', 'vendor_name', 'project_name'],
        threshold: 0.3
      });
      result = fuse.search(searchQuery).map(res => res.item);
    }

    return result;
  }, [inspections, statusFilter, typeFilter, searchQuery]);

  const statusCounts = {
    all: inspections.length,
    pending: inspections.filter((i) => i.status === 'pending').length,
    in_progress: inspections.filter((i) => i.status === 'in_progress').length,
    completed: inspections.filter((i) => i.status === 'completed').length,
    approved: inspections.filter((i) => i.status === 'approved').length,
    rejected: inspections.filter((i) => i.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen">
      <Header
        title={isNewInspection ? "New Inspection" : "Inspections"}
        subtitle={isNewInspection ? "Select an inspection type to begin" : "Manage and track all inspection activities"}
      />

      <div className="p-6 space-y-6">
        {/* Inspection Type Selector - shown on /inspections/new */}
        {isNewInspection && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Choose Inspection Type</h2>
            <InspectionTypeSelector />
          </div>
        )}

        {/* Status Tabs - hidden on /inspections/new */}
        {!isNewInspection && (
          <>
            {/* Status Tabs - scrollable on mobile */}
            <div className="flex overflow-x-auto pb-2 scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0 gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize whitespace-nowrap"
                >
                  {status.replace('_', ' ')}
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${statusFilter === status ? 'bg-primary-foreground/20 text-primary-foreground' : ''}`}
                  >
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Filters Row */}
            <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center animate-fade-in text-sm">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search inspections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="flex-1 sm:w-[180px] h-10">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="pre_shipment">Pre-Shipment</SelectItem>
                    <SelectItem value="vendor_assessment">Vendor Assessment</SelectItem>
                    <SelectItem value="lifts">Lifts Inspection</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2 w-full lg:w-auto">
                <Button variant="outline" className="flex-1 lg:flex-none h-10">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Inspections Table */}
            <div className="overflow-x-auto">
              <InspectionTable inspections={filteredInspections} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InspectionsPage;
