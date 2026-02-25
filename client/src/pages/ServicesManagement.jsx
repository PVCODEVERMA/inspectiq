import  { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import {
    Boxes,
    ChevronRight,
    Users2,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

const ServicesManagement = () => {
    const navigate = useNavigate();
    const { searchQuery } = useSidebar();
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/services');
            setServices(response.data);
        } catch (error) {
            toast.error('Failed to fetch services');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            setIsFiltering(true);
            const timer = setTimeout(() => {
                setIsFiltering(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchQuery]);

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getServiceType = (name) => {
        const n = name.toUpperCase();
        if (n.includes('LIFT')) return 'lifts';
        if (n.includes('PRE-SHIPMENT')) return 'pre-shipment';
        if (n.includes('VENDOR ASSESSMENT')) return 'vendor-assessment';
        return 'engineering';
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            <Header
                title="Service Management"
                subtitle="Select a module to manage inspections and metrics"
            />

            <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white/40 backdrop-blur-sm p-4 rounded-[2rem] border-2 border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-3 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Users2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 leading-none">Company Profile</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/admin/clients')}
                        className="rounded-xl bg-primary h-10 px-6 font-bold text-white shadow-glow"
                    >
                        Clients
                    </Button>
                </div>

                {(isLoading || isFiltering) ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-5 bg-card border rounded-2xl animate-pulse"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-muted" />
                                    <div className="h-5 w-32 bg-muted rounded-lg" />
                                </div>
                                <div className="w-5 h-5 bg-muted rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service, idx) => (
                                <Link
                                    key={service._id}
                                    to={`/admin/services/${service._id}/${getServiceType(service.name)}`}
                                    className="group flex items-center justify-between p-5 bg-card hover:bg-primary/5 border rounded-2xl transition-all hover:scale-[1.01] hover:shadow-md animate-in fade-in slide-in-from-left-4 fill-mode-both"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                            <Boxes className="w-5 h-5" />
                                        </div>
                                        <span className="text-lg font-bold text-slate-700 tracking-tight">{service.name}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-muted-foreground">No services found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesManagement;
