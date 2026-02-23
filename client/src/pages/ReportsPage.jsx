import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Download,
  Search,
  Calendar,
  Building2,
  Filter,
  Eye,
  Share2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

const allInspections = [];
const allCompanies = [];

const ReportsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const completedInspections = allInspections.filter(
    (i) => i.status === 'completed' || i.status === 'approved'
  );

  const filteredReports = completedInspections.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getCompanyName = (companyId) => {
    if (!companyId) return 'N/A';
    const company = allCompanies.find((c) => c.id === companyId);
    return company?.name || 'Unknown';
  };

  const handleDownload = (reportId, title) => {
    toast.success('Report Downloaded', {
      description: `${title} has been downloaded`,
    });
  };

  const handleShare = (reportId, title) => {
    navigator.clipboard.writeText(`${window.location.origin}/reports/${reportId}`);
    toast.success('Link Copied', {
      description: 'Report link copied to clipboard',
    });
  };

  const getTypeLabel = (type) => {
    const types = {
      engineering: 'Engineering',
      pre_shipment: 'Pre-Shipment',
      vendor_assessment: 'Vendor Assessment',
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen">
      <Header title="Reports" subtitle="View and download completed inspection reports" />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap gap-4">
          <div className="relative flex-1 w-full sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="flex-1 sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="pre_shipment">Pre-Shipment</SelectItem>
                <SelectItem value="vendor_assessment">Vendor Assessment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedInspections.length}</p>
                <p className="text-muted-foreground text-sm">Total Reports</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
                <Download className="w-6 h-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {completedInspections.filter((i) => i.status === 'approved').length}
                </p>
                <p className="text-muted-foreground text-sm">Approved</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">This Month</p>
                <p className="text-muted-foreground text-sm">
                  {completedInspections.filter((i) => {
                    const now = new Date();
                    return (
                      i.completedAt &&
                      i.completedAt.getMonth() === now.getMonth() &&
                      i.completedAt.getFullYear() === now.getFullYear()
                    );
                  }).length}{' '}
                  Reports
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report, index) => (
            <div
              key={report.id}
              className="glass-card rounded-2xl p-6 animate-slide-up hover:shadow-xl transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">{report.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {report.vendorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {report.completedAt?.toLocaleDateString() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{getTypeLabel(report.type)}</Badge>
                      <Badge
                        variant={report.status === 'approved' ? 'default' : 'secondary'}
                      >
                        {report.status}
                      </Badge>
                      {report.score && (
                        <Badge className="bg-success/10 text-success">
                          Score: {report.score}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report.id, report.title)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(report.id, report.title)}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
