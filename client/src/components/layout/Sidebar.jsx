import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn, getFileUrl } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import api from '@/lib/api';
import { LayoutDashboard, ClipboardCheck, Users, Building2, FileText, Settings, BarChart3, Shield, LogOut, ChevronLeft, ChevronRight, Zap, FolderOpen, UserCheck, Key, PlusCircle, ChevronDown, X, UserPlus, Boxes, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logo from '@/assets/qcws-logo.png';

const baseNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['super_admin', 'company_admin', 'inspector', 'master_admin'] },
  {
    icon: Shield,
    label: 'Members',
    roles: ['master_admin'],
    subItems: [
      { icon: UserPlus, label: 'Create Member', path: '/key-generation' },
      { icon: Users, label: 'Member Details', path: '/admin' },
    ]
  },
  {
    icon: Boxes,
    label: 'Services',
    roles: ['master_admin', 'service_manager', 'inspection_coordinator', 'technical_coordinator', 'inspector'],
    isDynamic: true, // Marker for dynamic sub-items
    subItems: []
  },
  {
    icon: ClipboardCheck,
    label: 'Inspections',
    path: '/inspections',
    roles: ['super_admin', 'company_admin', 'inspector']
  },
  {
    icon: ClipboardCheck,
    label: 'Inspections',
    roles: ['master_admin'],
    subItems: [
      { label: 'All Inspections', path: '/inspections' },
    ]
  },
  { icon: FolderOpen, label: 'Form Builder', path: '/form-builder', roles: ['super_admin', 'company_admin', 'master_admin'] },
  { icon: Building2, label: 'Companies', path: '/admin/clients', roles: ['super_admin', 'master_admin'] },
  { icon: Users, label: 'Inspectors', path: '/inspectors', roles: ['super_admin', 'company_admin'] },
  { icon: UserCheck, label: 'Vendors', path: '/vendors', roles: ['super_admin', 'company_admin', 'master_admin'] },
  { icon: FileText, label: 'Reports', path: '/reports', roles: ['super_admin', 'company_admin', 'inspector', 'master_admin'] },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', roles: ['super_admin', 'company_admin'] },
  { icon: Zap, label: 'AI Engine', path: '/ai-engine', roles: ['super_admin'] },
  { icon: Shield, label: 'Security', path: '/security', roles: ['super_admin'] },
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['super_admin', 'company_admin', 'inspector'] },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user, profile, role, signOut } = useAuth();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
  const [openMenus, setOpenMenus] = React.useState({});
  const [activeServices, setActiveServices] = React.useState([]);

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services/active');
        let services = response.data;

        // Filter for non-master admins
        if (role !== 'master_admin' && user?.assignedServices) {
          const assignedIds = user.assignedServices.map(s => s._id || s);
          services = services.filter(s => assignedIds.includes(s._id));
        }

        setActiveServices(services);
      } catch (error) {
        console.error('Error fetching sidebar services:', error);
      }
    };

    if (role) {
      fetchServices();
    }
  }, [role, user, location.pathname]);

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const navItems = baseNavItems.map(item => {
    if (item.label === 'Services' && item.isDynamic) {
      const dynamicSubItems = activeServices.map(s => {
        const name = s.name.toUpperCase();
        let type = 'engineering';

        if (name.includes('LIFT')) type = 'lifts';
        else if (name.includes('PRE-SHIPMENT')) type = 'pre-shipment';
        else if (name.includes('VENDOR ASSESSMENT')) type = 'vendor-assessment';
        else if (name.includes('THIRD PARTY')) type = 'third-party-inspection';
        else if (name.includes('EXPEDITING')) type = 'expediting';
        else if (name.includes('WELDING')) type = 'welding-consultancy';
        else if (name.includes('TRAINING')) type = 'training-certifications';
        else if (name.includes('NDT')) type = 'ndt-services';
        else if (name.includes('PWHT')) type = 'pwht-services';
        else if (name.includes('SAFETY')) type = 'industrial-safety';
        else if (name.includes('PMI')) type = 'pmi-services';
        else if (name.includes('ENVIRONMENTAL')) type = 'environmental-survey';
        else if (name.includes('ISO')) type = 'iso-certifications';

        return {
          label: s.name,
          path: `/admin/services/${s._id}/${type}`,
          icon: Boxes
        };
      });
      return {
        ...item,
        subItems: [...item.subItems, ...dynamicSubItems]
      };
    }
    return item;
  });

  const filteredNavItems = navItems.filter(item =>
    role && item.roles.includes(role)
  );

  const getRoleBadge = (userRole) => {
    const badges = {
      super_admin: { label: 'Super Admin', class: 'bg-accent/20 text-white' },
      company_admin: { label: 'Company Admin', class: 'bg-success/20 text-white' },
      inspector: { label: 'Inspector', class: 'bg-warning/20 text-white' },
      master_admin: { label: 'Master Admin', class: 'bg-primary/20 text-white' },
      service_manager: { label: 'Service Manager', class: 'bg-purple-500/20 text-white' },
      inspection_coordinator: { label: 'Inspection Coordinator', class: 'bg-blue-500/20 text-white' },
      technical_coordinator: { label: 'Technical Coordinator', class: 'bg-green-500/20 text-white' },
    };
    return badges[userRole];
  };

  const userName = profile?.full_name || profile?.email || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white backdrop-blur-xl transition-all duration-300 flex flex-col border-slate-200 shadow-xl shadow-black/5',
          'lg:translate-x-0', // Always show on desktop
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0', // Toggle on mobile
          isCollapsed ? 'lg:w-20' : 'lg:w-72',
          'w-[280px]' // Default width on mobile
        )}
      >
        {/* Logo */}
        <div className="relative overflow-hidden flex items-center justify-between p-4 border-b border-slate-100 bg-white">
          {/* Diagonal Decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-full h-full bg-primary [clip-path:polygon(40%_0,100%_0,100%_40%)]" />
            <div className="absolute top-0 right-0 w-full h-full bg-primary [clip-path:polygon(40%_0,100%_40%,100%_80%,20%_0)]" />
          </div>

          <Link to="/dashboard" className="flex items-center gap-3 relative z-10">
            <img src={logo} alt="Quality Concept" className="w-10 h-10 object-contain" />
            {(isMobileOpen || !isCollapsed) && (
              <div className="animate-fade-in flex flex-col">
                <h1 className="font-display font-black text-base text-slate-800 leading-none tracking-tighter">QUALITY CONCEPT</h1>
                <p className="text-[10px] font-bold text-primary mt-0.5 leading-none">Welding Solutions Pvt. Ltd</p>
              </div>
            )}
          </Link>
          <div className="flex items-center gap-1 relative z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden lg:flex text-slate-400 hover:text-primary hover:bg-slate-50"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMobileSidebar}
              className="lg:hidden text-slate-400 hover:text-primary hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-slate">
          {filteredNavItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isMenuOpen = openMenus[item.label];
            const isActive = item.path ? (location.pathname === item.path || location.pathname.startsWith(item.path + '/')) : false;

            if (hasSubItems) {
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      'flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all duration-200',
                      isMenuOpen ? 'bg-slate-50 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      isCollapsed && 'lg:justify-center lg:px-3 text-sm'
                    )}
                  >
                    <item.icon className={cn('w-5 h-5 shrink-0', isMenuOpen ? 'text-primary' : 'text-slate-400')} />
                    {(isMobileOpen || !isCollapsed) && (
                      <>
                        <span className="flex-1 animate-fade-in font-medium">{item.label}</span>
                        <ChevronDown className={cn('w-4 h-4 transition-transform duration-200 opacity-50', isMenuOpen && 'rotate-180 opacity-100')} />
                      </>
                    )}
                  </button>
                  {isMenuOpen && (isMobileOpen || !isCollapsed) && (
                    <div className="pl-6 space-y-1 animate-fade-in relative">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />
                      {item.subItems.filter(si => !si.roles || si.roles.includes(role)).map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={cn(
                              'block py-2.5 px-6 text-sm rounded-lg transition-all',
                              isSubActive
                                ? 'bg-primary/5 text-primary font-bold'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {subItem.icon && <subItem.icon className="w-3.5 h-3.5" />}
                              {subItem.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.path || item.label}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  isCollapsed && 'lg:justify-center lg:px-3'
                )}
              >
                <item.icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                {(isMobileOpen || !isCollapsed) && <span className="animate-fade-in font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-2xl transition-all',
            isCollapsed && 'lg:justify-center'
          )}>
            <div className="relative">
              <Avatar className="w-10 h-10 border-2 border-white shadow-md ring-1 ring-slate-200">
                <AvatarImage src={getFileUrl(profile?.avatar_url)} alt={userName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            {(isMobileOpen || !isCollapsed) && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-sm font-bold text-slate-800 truncate tracking-tight">{userName}</p>
                {role && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider', getRoleBadge(role)?.class)}>
                      {getRoleBadge(role)?.label}
                    </span>
                  </div>
                )}
              </div>
            )}
            {(isMobileOpen || !isCollapsed) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
