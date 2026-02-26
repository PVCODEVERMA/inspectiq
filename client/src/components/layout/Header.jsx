import React, { useCallback } from 'react';
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
import { useHeader } from '@/contexts/HeaderContext';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';

export const Header = (props) => {
  const context = useHeader();
  // Merge props and context
  const {
    title,
    shortTitle,
    subtitle,
    showSearch,
    searchValue,
    onSearchChange,
    searchPlaceholder,
  } = { ...context, ...props };

  const { profile, signOut, role } = useAuth();
  const { toggleMobileSidebar, isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, toggleSearch } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleTranscript = useCallback((transcript) => {
    if (onSearchChange) {
      onSearchChange(transcript);
    } else if (context.onSearchChange) {
      context.onSearchChange(transcript);
    } else {
      setSearchQuery(transcript);
    }
  }, [onSearchChange, context.onSearchChange, setSearchQuery]);

  const { isListening, isTranslating, toggleListening, isSupported } = useVoiceSearch(handleTranscript);

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
              <div className="searchbar max-w-none h-9 border-none bg-white/10 focus-within:bg-white/15">
                <div className="searchbar-wrapper px-2">
                  <div className="searchbar-left pr-2">
                    <Search className="w-3.5 h-3.5 text-white/60" />
                  </div>
                  <div className="searchbar-center">
                    <input
                      autoFocus
                      placeholder="Search..."
                      value={searchValue !== undefined ? searchValue : searchQuery}
                      onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : (e) => setSearchQuery(e.target.value)}
                      className="searchbar-input text-white text-xs placeholder:text-white/40 h-full"
                    />
                  </div>
                  <div className="searchbar-right gap-1 flex items-center">
                    {isSupported && (
                      <button
                        onClick={() => toggleListening('hi-IN')}
                        className={cn(
                          "p-1 rounded-full transition-all",
                          isListening ? "bg-red-500 animate-pulse" :
                            isTranslating ? "bg-amber-500 animate-bounce" : "text-white/40 hover:text-white"
                        )}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                      </button>
                    )}
                    {(searchValue || searchQuery) && (
                      <XCircle
                        className="w-3.5 h-3.5 text-white/40 cursor-pointer hover:text-white"
                        onClick={onSearchChange ? () => onSearchChange('') : () => setSearchQuery('')}
                      />
                    )}
                  </div>
                </div>
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
          <div className="searchbar hidden md:flex">
            <div className="searchbar-wrapper">
              <div className="searchbar-left">
                <div className="search-icon-wrapper">
                  <span className="search-icon searchbar-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="searchbar-center">
                <input
                  type="text"
                  className="searchbar-input"
                  placeholder={searchPlaceholder || "Search inspections, vendors..."}
                  value={searchValue !== undefined ? searchValue : searchQuery}
                  onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : (e) => setSearchQuery(e.target.value)}
                  title="Search"
                />
              </div>

              <div className="searchbar-right">
                {(searchValue || searchQuery) && (
                  <XCircle
                    className="w-4 h-4 text-slate-400 cursor-pointer hover:text-primary transition-colors"
                    onClick={onSearchChange ? () => onSearchChange('') : () => setSearchQuery('')}
                  />
                )}
                <div
                  className={cn(
                    "voice-search-container flex items-center gap-1 p-1 rounded-full px-2 transition-all cursor-pointer",
                    isListening ? "bg-red-50 text-red-500 shadow-inner" :
                      isTranslating ? "bg-amber-50 text-amber-600 shadow-inner" : "hover:bg-slate-100"
                  )}
                  onClick={() => toggleListening('hi-IN')}
                  title={isListening ? "Listening... Speak Hindi" : isTranslating ? "Translating to English..." : "Voice Search (Hindi -> English)"}
                >
                  <svg className={cn("voice-search w-5 h-5 transition-all", (isListening || isTranslating) && "animate-pulse scale-110")} role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill={isListening ? "#ef4444" : isTranslating ? "#d97706" : "#4285f4"} d="m12 15c1.66 0 3-1.31 3-2.97v-7.02c0-1.66-1.34-3.01-3-3.01s-3 1.34-3 3.01v7.02c0 1.66 1.34 2.97 3 2.97z" />
                    <path fill={isListening ? "#ef4444" : isTranslating ? "#d97706" : "#34a853"} d="m11 18.08h2v3.92h-2z" />
                    <path fill={isListening ? "#ef4444" : isTranslating ? "#d97706" : "#fbbc05"} d="m7.05 16.87c-1.27-1.33-2.05-2.83-2.05-4.87h2c0 1.45 0.56 2.42 1.47 3.38v0.32l-1.15 1.18z" />
                    <path fill={isListening ? "#ef4444" : isTranslating ? "#d97706" : "#ea4335"} d="m12 16.93a4.97 5.25 0 0 1 -3.54 -1.55l-1.41 1.49c1.26 1.34 3.02 2.13 4.95 2.13 3.87 0 6.99-2.92 6.99-7h-1.99c0 2.92-2.24 4.93-5 4.93z" />
                  </svg>
                  {isListening && <span className="text-[10px] font-black uppercase animate-pulse">Lsn...</span>}
                  {isTranslating && <span className="text-[10px] font-black uppercase animate-bounce">Trans...</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="flex items-center">
          {/* Mobile Bell: Link to Notifications */}
          <div
            className="bell-button relative md:hidden"
            onClick={() => navigate('/notifications')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/notifications')}
          >
            <svg viewBox="0 0 448 512" className="bell-icon">
              <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z" />
            </svg>
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs shadow-md border-2 border-primary">
              1
            </Badge>
          </div>

          {/* Desktop Bell: Link to Notifications */}
          <div className="hidden md:block">
            <div
              className="bell-button relative group cursor-pointer overflow-visible"
              onClick={() => navigate('/notifications')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/notifications')}
              title="Notifications"
            >
              <svg viewBox="0 0 448 512" className="bell-icon">
                <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z" />
              </svg>
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs shadow-md border-2 border-primary">
                1
              </Badge>
            </div>
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

