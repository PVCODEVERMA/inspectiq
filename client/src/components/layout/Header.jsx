import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn, getFileUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  Search,
  Sun,
  Moon,
  Settings,
  LogOut,
  User,
  Menu,
  Plus,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';


export const Header = ({ title, shortTitle, subtitle, showSearch = true, searchValue, onSearchChange, searchPlaceholder }) => {
  const { profile, signOut, role } = useAuth();
  const { toggleMobileSidebar, isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, toggleSearch } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const isFormRoute =
    location.pathname.includes('/new') ||
    location.pathname.includes('/edit/') ||
    location.pathname.includes('/selection');

  const userName = profile?.full_name || profile?.email || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className={cn(
      "sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-primary backdrop-blur-xl border-b border-border shadow-sm",
      isFormRoute && "hidden md:flex"
    )}>
      <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">

        <div className={cn("flex items-center gap-2 flex-1 min-w-0 transition-all duration-200", isSearchOpen ? "sm:flex" : "flex")}>
          <div className={cn("flex flex-col min-w-0 flex-1", isSearchOpen && "hidden sm:flex")}>
            <h1 className="text-lg font-bold text-white truncate leading-tight mt-1">
              <span className="sm:hidden">{shortTitle || title || 'QCWS'}</span>
              <span className="hidden sm:inline">{title || 'QC Welding'}</span>
            </h1>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-white/80 truncate max-w-[200px] sm:max-w-none">
                {subtitle}
              </p>
            )}
          </div>

          {/* Mobile Search Overlay/Input */}
          {showSearch && (
            <div className={cn(
              "flex-1 min-w-0 animate-in slide-in-from-right-2 duration-300 sm:hidden",
              !isSearchOpen && "hidden"
            )}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60" />
                <Input
                  autoFocus
                  placeholder={searchPlaceholder || "Search..."}
                  value={searchValue !== undefined ? searchValue : searchQuery}
                  onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : (e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 h-9 bg-white/10 border-none text-white text-xs placeholder:text-white/40 rounded-lg focus:ring-0 focus:bg-white/15"
                />
                {(searchValue || searchQuery) && (
                  <XCircle
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 cursor-pointer hover:text-white"
                    onClick={onSearchChange ? () => onSearchChange('') : () => setSearchQuery('')}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search Trigger */}
        {showSearch && !isSearchOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white sm:hidden -mr-2"
            onClick={toggleSearch}
          >
            <Search className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 rounded-full">


        {/* Search */}
        {showSearch && (
          <div className="relative hidden md:block w-full max-w-[200px] lg:max-w-[400px] transition-all duration-300">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 cursor-pointer" />
            <Input
              placeholder={searchPlaceholder || "Search inspections, vendors..."}
              value={searchValue !== undefined ? searchValue : searchQuery}
              onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : (e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 bg-white/10 border-white/10 focus:bg-white/15 focus:border-white/20 text-white placeholder:text-white/40 rounded-xl h-10 transition-all"
            />
            {(searchValue || searchQuery) && (
              <XCircle
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 cursor-pointer hover:text-white"
                onClick={onSearchChange ? () => onSearchChange('') : () => setSearchQuery('')}
              />
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="flex items-center">
          {/* Mobile Bell: Link to Dashboard */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-white hover:text-foreground md:hidden"
            onClick={() => navigate('/dashboard')}
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
              3
            </Badge>
          </Button>

          {/* Desktop Bell: Dropdown Menu */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:text-foreground">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-2">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer hover:bg-[#373435] hover:text-white focus:bg-[#373435] focus:text-white">
                  <p className="font-medium">New inspection assigned</p>
                  <p className="text-xs text-muted-foreground">Heat Exchanger Inspection - HE-2024-008</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer hover:bg-[#373435] hover:text-white focus:bg-[#373435] focus:text-white">
                  <p className="font-medium">Inspection approved</p>
                  <p className="text-xs text-muted-foreground">PSI-2024-045 has been approved</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer hover:bg-[#373435] hover:text-white focus:bg-[#373435] focus:text-white">
                  <p className="font-medium">AI Alert</p>
                  <p className="text-xs text-muted-foreground">Missing photos detected in VCA-2024-012</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>


        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
              <Avatar className="h-9 w-9 border-2 border-[#F6F7F8]">
                <AvatarImage src={getFileUrl(profile?.avatar_url)} alt={profile?.full_name || 'User'} />
                <AvatarFallback className="bg-[#F6F7F8] text-primary">
                  {userInitial}
                </AvatarFallback>
              </Avatar>

              <span className="hidden md:inline text-sm font-medium capitalize">{profile?.role}</span>

            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span>My Account</span>
              {role && <span className="text-xs font-normal text-muted-foreground capitalize">{role.replace(/_/g, ' ')}</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header >
  );
};

