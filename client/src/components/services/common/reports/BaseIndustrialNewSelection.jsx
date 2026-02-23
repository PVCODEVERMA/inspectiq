import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    ArrowLeft,
    FileText,
    ClipboardCheck,
    ShieldCheck,
    Activity,
    FileSearch,
    ChevronRight,
    Search,
    FileSearch as FileSearchIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { industrialReportTypes } from '@/data/industrialReportTypes';

const BaseIndustrialNewSelection = () => {
    const { id, serviceType } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');

    const normalizedServiceType = (serviceType || '').toLowerCase() === 'tpi' ? 'third-party-inspection' : serviceType;
    const specificTypes = industrialReportTypes[normalizedServiceType] || industrialReportTypes[serviceType] || [];

    const filteredTypes = specificTypes.filter(type =>
        type.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If no specific types found, do not use generic fallback
    const displayTypes = filteredTypes;

    return (
        <div className="min-h-screen bg-background/50 pb-12">
            <Header
                title="Create New Report"
                subtitle={`Select the type of ${serviceType} report you want to generate`}
            />

            <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-end">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search report types..."
                            className="rounded-2xl pl-10 h-12 bg-white border-none shadow-sm focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayTypes.map((type) => (
                        <Card
                            key={type.id}
                            onClick={() => navigate(`/admin/services/${id}/${serviceType}/new?formType=${type.id}&title=${encodeURIComponent(type.title)}`)}
                            className={cn(
                                "group rounded-[2rem] border-2 border-transparent shadow-premium cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 bg-white"
                            )}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-5">
                                    <div className={cn("p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-110", type.bg || 'bg-slate-50', type.color || 'text-slate-600')}>
                                        <type.icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-black text-slate-800 truncate">{type.title}</h3>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                        </div>
                                        <p className="text-slate-500 text-xs line-clamp-2">
                                            {type.description || `Create a new ${type.title} for ${serviceType.replace(/-/g, ' ')}.`}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {displayTypes.length === 0 && (
                    <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <FileSearch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">No report types found</h3>
                        <p className="text-slate-500">Try a different search term or check the service category.</p>
                    </div>
                )}

                <div className="pt-8 text-center">
                    <p className="text-muted-foreground text-sm italic">
                        All reports are automatically synced with the main service dashboard.
                    </p>
                </div>
            </div>
        </div>

    );
};

export default BaseIndustrialNewSelection;
