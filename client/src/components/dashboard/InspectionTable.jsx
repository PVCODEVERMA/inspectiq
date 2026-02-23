import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Share2,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';
import { generateEngineeringInspection } from '@/components/services/tpi/pdf/generateEngineeringInspection';
import { toast } from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', class: 'status-pending' },
  in_progress: { label: 'In Progress', class: 'status-in-progress' },
  completed: { label: 'Completed', class: 'bg-accent/10 text-accent' },
  approved: { label: 'Approved', class: 'status-passed' },
  rejected: { label: 'Rejected', class: 'status-failed' },
};

const typeConfig = {
  engineering: { label: 'Engineering', class: 'bg-primary/10 text-primary' },
  pre_shipment: { label: 'Pre-Shipment', class: 'bg-info/10 text-info' },
  vendor_assessment: { label: 'Vendor Audit', class: 'bg-warning/10 text-warning' },
  lifts: { label: 'Lifts Inspection', class: 'bg-accent/10 text-accent' },
};

const riskConfig = {
  low: { label: 'Low', class: 'bg-success/10 text-success' },
  medium: { label: 'Medium', class: 'bg-warning/10 text-warning' },
  high: { label: 'High', class: 'bg-destructive/10 text-destructive' },
  critical: { label: 'Critical', class: 'bg-destructive text-destructive-foreground' },
};

export const InspectionTable = ({
  inspections,
  showActions = true,
}) => {
  const navigate = useNavigate();

  const getFormPath = (type, id, formType) => {
    // If it's an NDT report, route to the generic form with query param
    if (formType && ['ultrasonic-test', 'magnetic-particle', 'liquid-penetrant', 'ndt-summary-report'].includes(formType)) {
      // Assume the parent route is /admin/services/:id/:serviceType/edit/:inspectionId
      // We might need to construct it carefully or just rely on the parent router context
      // Ideally: /admin/services/:serviceId/:serviceType/edit/:id?formType=...
      // But we don't have serviceId here easily unless passed. 
      // Use a relative path if possible or generic
      return `edit/${id}?formType=${formType}`;
    }

    const paths = {
      engineering: `/inspections/engineering/${id}`,
      pre_shipment: `/inspections/pre-shipment/${id}`,
      vendor_assessment: `/inspections/vendor-assessment/${id}`,
      lifts: `/inspections/lifts/${id}`,
      lift: `/inspections/lifts/${id}`,
    };
    return paths[type] || `/inspections/${id}`;
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Report No</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Client / Vendor</TableHead>
            <TableHead className="font-semibold">Inspector</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            {showActions && <TableHead className="text-right font-semibold">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {inspections.map((inspection, index) => (
            <TableRow
              key={inspection._id}
              className="hover:bg-muted/30 cursor-pointer transition-colors animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(getFormPath(inspection.inspection_type, inspection._id, inspection.formType))}
            >
              <TableCell className="font-medium">{inspection.report_no || inspection._id.slice(-6).toUpperCase()}</TableCell>
              <TableCell>
                <Badge className={cn('rounded-full', typeConfig[inspection.inspection_type]?.class || 'bg-slate-100')}>
                  {typeConfig[inspection.inspection_type]?.label || inspection.formType || inspection.inspection_type}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{inspection.client_name}</p>
                  <p className="text-xs text-muted-foreground">{inspection.vendor_name || 'N/A'}</p>
                </div>
              </TableCell>
              <TableCell>{inspection.inspector_name}</TableCell>
              <TableCell>
                <span className={cn('status-badge', statusConfig[inspection.status]?.class)}>
                  {statusConfig[inspection.status]?.label || inspection.status}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {inspection.inspection_date || inspection.date ? format(new Date(inspection.inspection_date || inspection.date), 'MMM dd, yyyy') : 'N/A'}
              </TableCell>
              {showActions && (
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(getFormPath(inspection.type, inspection._id, inspection.formType))}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(getFormPath(inspection.type, inspection._id, inspection.formType))}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async () => {
                        try {
                          let endpoint = `/inspections/${inspection._id}`;
                          const fType = inspection.formType;

                          if (fType === 'ultrasonic-test') endpoint = `/ndt/ultrasonic/${inspection._id}`;
                          else if (fType === 'magnetic-particle') endpoint = `/ndt/magnetic-particle/${inspection._id}`;
                          else if (fType === 'liquid-penetrant') endpoint = `/ndt/liquid-penetrant/${inspection._id}`;
                          else if (fType === 'ndt-summary-report') endpoint = `/ndt/summary/${inspection._id}`;
                          else if (fType === 'welding-assessment-audit') endpoint = `/consultancy/welding-audit/${inspection._id}`;
                          else if (fType === 'engineering-inspection' || fType === 'Engineering Inspection Report' || fType === 'Engineering Inspection') endpoint = `/tpi/engineering/${inspection._id}`;

                          const response = await api.get(endpoint);

                          // Dynamic Import PDF Generator
                          const { generateIndustrialPDF } = await import('@/components/services/common/pdf/generateIndustrialPDF');
                          const { reportTemplates } = await import('@/data/reportTemplates');
                          const { industrialReportTypes } = await import('@/data/industrialReportTypes');

                          // Find template from either source
                          const normalizedType = (fType || '').toLowerCase().replace(/[\s\-_]+/g, '-');
                          let template = reportTemplates[fType] || reportTemplates[normalizedType];

                          if (!template) {
                            // Search by ID or Title in industrialReportTypes
                            Object.values(industrialReportTypes).forEach(group => {
                              const found = group.find(t => t.id === fType || t.title === fType || t.id === normalizedType);
                              if (found) {
                                template = reportTemplates[found.id] || found;
                              }
                            });
                          }

                          if (template) {
                            await generateIndustrialPDF(response.data, template);
                          } else {
                            // Fallback for legacy
                            await generateEngineeringInspection(response.data);
                          }

                          toast.success('Report downloaded Successfully!');
                        } catch (error) {
                          console.error('Download error:', error);
                          toast.error('Failed to generate report');
                        }
                      }}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      {inspection.status === 'completed' && (
                        <>
                          <DropdownMenuItem className="text-success">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
