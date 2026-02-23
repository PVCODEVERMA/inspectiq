import React from 'react';
import { Header } from '@/components/layout/Header';
import { InspectionTrendChart, InspectionStatusChart } from '@/components/dashboard/InspectionChart';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Factory,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const allInspections = [];
const allVendors = [];
const allUsers = [];
const allCompanies = [];

const AnalyticsPage = () => {
  // Calculate stats
  const totalInspections = allInspections.length;
  const completedInspections = allInspections.filter(i => i.status === 'completed' || i.status === 'approved').length;
  const pendingInspections = allInspections.filter(i => i.status === 'pending').length;
  const inProgressInspections = allInspections.filter(i => i.status === 'in_progress').length;
  const rejectedInspections = allInspections.filter(i => i.status === 'rejected').length;

  const approvalRate = totalInspections ? Math.round((completedInspections / totalInspections) * 100) : 0;
  const avgScore = allInspections.filter(i => i.score).reduce((acc, i) => acc + (i.score || 0), 0) /
    (allInspections.filter(i => i.score).length || 1);

  const inspectionsByType = {
    engineering: allInspections.filter(i => i.type === 'engineering').length,
    pre_shipment: allInspections.filter(i => i.type === 'pre_shipment').length,
    vendor_assessment: allInspections.filter(i => i.type === 'vendor_assessment').length,
  };

  const riskDistribution = {
    low: allInspections.filter(i => i.riskLevel === 'low').length,
    medium: allInspections.filter(i => i.riskLevel === 'medium').length,
    high: allInspections.filter(i => i.riskLevel === 'high').length,
  };

  const topInspectors = allUsers
    .filter(u => u.role === 'inspector')
    .map(inspector => {
      const inspections = allInspections.filter(i => i.assignedTo === inspector.id);
      const completed = inspections.filter(i => i.status === 'completed' || i.status === 'approved').length;
      const avgScore = inspections.filter(i => i.score).reduce((acc, i) => acc + (i.score || 0), 0) /
        (inspections.filter(i => i.score).length || 1);
      return { ...inspector, total: inspections.length, completed, avgScore: Math.round(avgScore) };
    })
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5);

  return (
    <div className="min-h-screen">
      <Header
        title="Analytics"
        subtitle="Insights and performance metrics"
      />

      <div className="p-6 space-y-6">
        {/* Export Button */}
        <div className="flex justify-end">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-1 text-success text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+15%</span>
              </div>
            </div>
            <p className="text-3xl font-bold">{totalInspections}</p>
            <p className="text-muted-foreground text-sm">Total Inspections</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-foreground" />
              </div>
              <div className="flex items-center gap-1 text-success text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+8%</span>
              </div>
            </div>
            <p className="text-3xl font-bold">{approvalRate}%</p>
            <p className="text-muted-foreground text-sm">Approval Rate</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="flex items-center gap-1 text-success text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+4%</span>
              </div>
            </div>
            <p className="text-3xl font-bold">{Math.round(avgScore)}%</p>
            <p className="text-muted-foreground text-sm">Avg. Score</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning-foreground" />
              </div>
              <div className="flex items-center gap-1 text-destructive text-sm">
                <TrendingDown className="w-4 h-4" />
                <span>-2</span>
              </div>
            </div>
            <p className="text-3xl font-bold">{pendingInspections}</p>
            <p className="text-muted-foreground text-sm">Pending</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InspectionTrendChart />
          </div>
          <InspectionStatusChart />
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inspection Types */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Inspections by Type</CardTitle>
              <CardDescription>Distribution of inspection categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Engineering Inspection</span>
                  <span className="text-sm text-muted-foreground">{inspectionsByType.engineering}</span>
                </div>
                <Progress value={(inspectionsByType.engineering / totalInspections) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pre-Shipment Inspection</span>
                  <span className="text-sm text-muted-foreground">{inspectionsByType.pre_shipment}</span>
                </div>
                <Progress value={(inspectionsByType.pre_shipment / totalInspections) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Vendor Assessment</span>
                  <span className="text-sm text-muted-foreground">{inspectionsByType.vendor_assessment}</span>
                </div>
                <Progress value={(inspectionsByType.vendor_assessment / totalInspections) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Risk Distribution</CardTitle>
              <CardDescription>Inspections categorized by risk level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-success/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-medium">Low Risk</span>
                </div>
                <span className="text-2xl font-bold text-success">{riskDistribution.low}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-warning/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="font-medium">Medium Risk</span>
                </div>
                <span className="text-2xl font-bold text-warning">{riskDistribution.medium}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <span className="font-medium">High Risk</span>
                </div>
                <span className="text-2xl font-bold text-destructive">{riskDistribution.high}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Top Inspectors</CardTitle>
            <CardDescription>Best performing inspection team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topInspectors.map((inspector, index) => (
                <div
                  key={inspector.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{inspector.name}</p>
                    <p className="text-sm text-muted-foreground">{inspector.email}</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-lg font-semibold">{inspector.total}</p>
                    <p className="text-xs text-muted-foreground">Assigned</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-lg font-semibold text-success">{inspector.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-lg font-semibold text-accent">{inspector.avgScore}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Building2 className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{demoCompanies.length}</p>
                  <p className="text-sm text-muted-foreground">Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-info" />
                <div>
                  <p className="text-2xl font-bold">{demoUsers.filter(u => u.role === 'inspector').length}</p>
                  <p className="text-sm text-muted-foreground">Inspectors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Factory className="w-8 h-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{demoVendors.length}</p>
                  <p className="text-sm text-muted-foreground">Vendors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <XCircle className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{rejectedInspections}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
