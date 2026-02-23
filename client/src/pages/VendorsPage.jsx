import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Factory,
  Plus,
  Search,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Star,
  Shield,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Edit,
  Trash2,
  Eye,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const vendors = [];

const VendorsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskBadgeVariant = (risk) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'low': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const approvedVendors = vendors.filter(v => v.status === 'approved').length;
  const pendingVendors = vendors.filter(v => v.status === 'pending').length;
  const avgRating = vendors.length ? vendors.reduce((acc, v) => acc + v.rating, 0) / vendors.length : 0;

  return (
    <div className="min-h-screen">
      <Header
        title="Vendors"
        subtitle="Manage vendor database and assessments"
      />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Factory className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vendors.length}</p>
                <p className="text-muted-foreground text-sm">Total Vendors</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedVendors}</p>
                <p className="text-muted-foreground text-sm">Approved</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingVendors}</p>
                <p className="text-muted-foreground text-sm">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                <Star className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                <p className="text-muted-foreground text-sm">Avg. Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVendors.map((vendor, index) => (
            <div
              key={vendor.id}
              className="glass-card rounded-2xl p-6 animate-slide-up hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-lg">{vendor.name}</h3>
                  <p className="text-muted-foreground text-sm">{vendor.category}</p>
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
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="w-4 h-4 mr-2" />
                      View Assessment
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(vendor.rating) ? 'text-warning fill-warning' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{vendor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{vendor.address}</span>
                </div>
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-2 mb-4">
                {vendor.certifications.slice(0, 2).map((cert) => (
                  <Badge key={cert} variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
                {vendor.certifications.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{vendor.certifications.length - 2} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  {getRiskIcon(vendor.riskLevel)}
                  <Badge variant={getRiskBadgeVariant(vendor.riskLevel)}>
                    {vendor.riskLevel} risk
                  </Badge>
                </div>
                <Badge variant={vendor.status === 'approved' ? 'default' : vendor.status === 'pending' ? 'secondary' : 'destructive'}>
                  {vendor.status}
                </Badge>
              </div>

              {vendor.lastAuditDate && (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Last audit: {vendor.lastAuditDate.toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <Factory className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No vendors found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorsPage;
