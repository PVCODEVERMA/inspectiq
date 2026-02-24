import React from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';


export const Header = ({ title, shortTitle, subtitle }) => {
  const { profile, signOut, role } = useAuth();
  const { toggleMobileSidebar } = useSidebar();

  const userName = profile?.full_name || profile?.email || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-primary backdrop-blur-xl border-b border-border shadow-sm">
      <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="lg:hidden text-white hover:text-foreground hover:bg-muted/50 transition-colors p-4"
        >
          <Menu className="w-6 h-6 text-white" />
        </Button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-bold text-white truncate leading-tight mt-1">
            <span className="sm:hidden">{shortTitle || title || 'InspectIQ'}</span>
            <span className="hidden sm:inline">{title || 'Dashboard'}</span>
          </h1>
          {subtitle && (
            <p className="text-xs text-white/80 truncate hidden md:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-full">
        {/* Search */}
        <div className="relative hidden md:block ">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer" />
          <Input
            placeholder="Search inspections, vendors..."
            className="w-64 pl-10 bg-secondary border-transparent focus:border-primary/50"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-white hover:text-foreground">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" sideOffset={8} className="w-[90vw] sm:w-80 sm:align-end mx-auto p-2">
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

