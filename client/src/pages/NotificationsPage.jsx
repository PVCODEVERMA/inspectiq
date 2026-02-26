import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeader } from '@/contexts/HeaderContext';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCircle2, Clock, AlertTriangle, Info, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { setHeader } = useHeader();
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "New inspection assigned",
            description: "Heat Exchanger Inspection - HE-2024-008",
            time: "2 hours ago",
            type: "assignment",
            icon: Bell,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            unread: true,
            link: "/inspections"
        },
        {
            id: 2,
            title: "Inspection approved",
            description: "PSI-2024-045 has been approved by the Quality Manager.",
            time: "5 hours ago",
            type: "approval",
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            unread: true,
            link: "/reports"
        },
        {
            id: 3,
            title: "AI Alert",
            description: "Missing photos detected in VCA-2024-012. Please review.",
            time: "1 day ago",
            type: "alert",
            icon: AlertTriangle,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            unread: true,
            link: "/inspections"
        },
        {
            id: 4,
            title: "System Update",
            description: "InspectIQ will be undergoing maintenance tonight at 12:00 AM.",
            time: "1 day ago",
            type: "info",
            icon: Info,
            color: "text-slate-500",
            bg: "bg-slate-500/10",
            unread: true,
            link: "/settings"
        }
    ]);

    useEffect(() => {
        setHeader({
            title: "Notifications",
            subtitle: "Stay updated with your latest activities",
            showSearch: false
        });
    }, [setHeader]);

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("Notification deleted");
    };

    const clearAll = () => {
        if (window.confirm("Are you sure you want to clear all notifications?")) {
            setNotifications([]);
            toast.success("All notifications cleared");
        }
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    };

    return (
        <div className="p-3 sm:p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <span className="text-[#020001] font-bold text-sm sm:text-base">Recent Alerts</span>
                </div>
                {notifications.length > 0 && (
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAll}
                            className="text-[10px] sm:text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 font-bold px-2 sm:px-3"
                        >
                            <Trash2 className="w-3.5 h-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Clear All</span>
                        </Button>
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-1.5 sm:px-2 py-0.5 h-6 text-[10px] sm:text-xs">
                            {notifications.length} <span className="hidden sm:inline ml-1">Unread</span>
                        </Badge>
                    </div>
                )}
            </div>

            <div className="grid gap-4">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={cn(
                            "group relative bg-white border border-slate-100 hover:border-primary/20 rounded-2xl p-4 sm:p-6 transition-all duration-300 shadow-sm hover:shadow-md",
                            !notif.unread && "opacity-60"
                        )}
                    >
                        <div className="flex gap-3 sm:gap-6 items-start">
                            <div className={cn("p-2.5 sm:p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110", notif.bg)}>
                                <notif.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", notif.color)} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                    <h3 className="font-bold text-slate-800 text-base sm:text-lg group-hover:text-primary transition-colors pr-6 sm:pr-8 truncate">
                                        {notif.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] sm:text-xs shrink-0">
                                        <Clock className="w-3 h-3" />
                                        <span>{notif.time}</span>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2 sm:line-clamp-none">
                                    {notif.description}
                                </p>
                                <div className="flex items-center gap-4">
                                    {notif.unread && (
                                        <button
                                            onClick={() => markAsRead(notif.id)}
                                            className="text-[10px] sm:text-xs font-bold text-primary hover:underline"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => notif.link && navigate(notif.link)}
                                        className="text-[10px] sm:text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={() => deleteNotification(notif.id)}
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Delete Notification"
                        >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        {notif.unread && (
                            <div className="absolute top-1/2 -right-0.5 sm:-right-1 w-1 sm:h-1.5 h-1 sm:h-1.5 rounded-full bg-primary transform -translate-y-1/2" />
                        )}
                    </div>
                ))}
            </div>

            {notifications.length === 0 && (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-200 animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Bell className="w-8 h-8 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">All caught up!</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                        You've cleared all your notifications. New alerts will appear here.
                    </p>
                    <Button
                        variant="link"
                        className="mt-6 text-primary font-bold"
                        onClick={() => window.location.reload()}
                    >
                        Reset Demo Data
                    </Button>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
