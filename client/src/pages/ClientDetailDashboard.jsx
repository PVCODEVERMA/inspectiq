import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Building2,
    FileText,
    Plus,
    Search,
    Download,
    Mail,
    MoreVertical,
    Pencil,
    Trash2,
    MapPin,
    Phone,
    Calendar,
    Loader2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '@/assets/qcws-logo.png'; // Assuming logo exists

const ClientDetailDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [inspections, setInspections] = useState([]);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch client details and services
                const [clientRes, servicesRes] = await Promise.all([
                    api.get(`/clients/${id}`),
                    api.get('/services/active')
                ]);

                setClient(clientRes.data);
                setServices(servicesRes.data);

                // Fetch client inspections
                if (clientRes.data?.name) {
                    const inspectionsRes = await api.get(`/inspections`, {
                        params: { client_name: clientRes.data.name }
                    });
                    setInspections(inspectionsRes.data);
                }
            } catch (error) {
                console.error('Error fetching client dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const stats = useMemo(() => {
        return {
            total: inspections.length,
            pending: inspections.filter(i => i.status === 'pending').length,
            approved: inspections.filter(i => i.status === 'approved').length,
            completed: inspections.filter(i => i.status === 'submitted' || i.status === 'approved').length
        };
    }, [inspections]);

    const filteredInspections = inspections.filter(insp =>
        insp.report_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insp.lift_identification_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateInspection = () => {
        navigate('/inspections/new', {
            state: {
                prefill: {
                    clientName: client.name,
                    warehouseAddress: client.address,
                }
            }
        });
    };

    const generatePDF = async (inspection) => {
        const doc = new jsPDF();

        // -- Header --
        // Add Logo (if possible, load image data first) - placeholder for now
        // doc.addImage(logo, 'PNG', 10, 10, 30, 30); 

        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185); // Primary Blue
        doc.text('INSPECTION REPORT', 105, 20, null, 'center');

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Quality Concept', 105, 28, null, 'center');

        // -- Info Table --
        doc.autoTable({
            startY: 40,
            head: [['Client Details', 'Inspection Details']],
            body: [[
                `Client: ${inspection.client_name}\nAddress: ${inspection.warehouse_address || 'N/A'}\nContact: ${inspection.warehouse_name || 'N/A'}`,
                `Report No: ${inspection.report_no}\nDate: ${format(new Date(inspection.inspection_date), 'PPP')}\nLift ID: ${inspection.lift_identification_no}\nResult: ${inspection.inspection_result?.toUpperCase() || 'Start'}`
            ]],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { cellPadding: 5 }
        });

        // -- Checklists --
        // Example: Safety Devices
        if (inspection.safety_devices_tested?.length > 0) {
            doc.text('Safety Devices Tested', 14, doc.lastAutoTable.finalY + 10);
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 15,
                head: [['Item', 'Result', 'Remarks']],
                body: inspection.safety_devices_tested.map(item => [item.item, item.result?.toUpperCase(), item.remarks || '-']),
                theme: 'striped'
            });
        }

        // -- Footer --
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount}`, 190, 290, null, 'right');
            doc.text(`Generated by InspectIQ on ${new Date().toLocaleDateString()}`, 10, 290);
        }

        doc.save(`Report_${inspection.report_no}.pdf`);
        toast.success('Report downloaded successfully');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!client) return <div className="p-8 text-center">Client not found</div>;

    return (
        <div className="min-h-screen bg-background pb-12">
            <Header
                title={client.name}
                subtitle={`Client Dashboard • ${client.gst_number || 'No GST'} • ${client.address}`}
            />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Inspections</CardDescription>
                            <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-amber-600">Pending</CardDescription>
                            <CardTitle className="text-3xl font-bold text-amber-600">{stats.pending}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-green-600">Completed</CardDescription>
                            <CardTitle className="text-3xl font-bold text-green-600">{stats.completed}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-blue-600">Approved</CardDescription>
                            <CardTitle className="text-3xl font-bold text-blue-600">{stats.approved}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Inspections List */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Inspection History</CardTitle>
                            <CardDescription>Manage and generate reports for this client</CardDescription>
                        </div>
                        <Button onClick={handleCreateInspection} className="rounded-xl shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" />
                            New Inspection
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-4 border-b bg-muted/20">
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by Report No or Lift ID..."
                                    className="pl-9 bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead>Report No</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Lift ID</TableHead>
                                    <TableHead>Inspector</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Result</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInspections.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No inspections found for this client.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInspections.map((insp) => (
                                        <TableRow key={insp._id} className="group hover:bg-muted/20 transition-colors">
                                            <TableCell className="font-medium">{insp.report_no}</TableCell>
                                            <TableCell>{format(new Date(insp.inspection_date), 'dd MMM yyyy')}</TableCell>
                                            <TableCell>{insp.lift_identification_no}</TableCell>
                                            <TableCell>{insp.inspector_name || 'Unknown'}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    insp.status === 'approved' ? 'success' :
                                                        insp.status === 'submitted' ? 'default' :
                                                            insp.status === 'rejected' ? 'destructive' : 'secondary'
                                                } className="uppercase text-[10px]">
                                                    {insp.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {insp.inspection_result ? (
                                                    <Badge variant="outline" className={
                                                        insp.inspection_result === 'safe' ? 'border-green-500 text-green-600 bg-green-50' :
                                                            insp.inspection_result === 'not_safe' ? 'border-red-500 text-red-600 bg-red-50' :
                                                                'border-amber-500 text-amber-600 bg-amber-50'
                                                    }>
                                                        {insp.inspection_result.replace(/_/g, ' ').toUpperCase()}
                                                    </Badge>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => navigate(`/inspections/lifts/${insp._id}`)}>
                                                            <Pencil className="w-4 h-4 mr-2" />
                                                            Edit Inspection
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => generatePDF(insp)}>
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            Generate PDF Report
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => toast.success('Email feature coming soon!')}>
                                                            <Mail className="w-4 h-4 mr-2" />
                                                            Email Report
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ClientDetailDashboard;
