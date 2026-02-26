import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { useHeader } from '@/contexts/HeaderContext';
import { cn } from '@/lib/utils';
import {
  Heart,
  History,
  ChevronRight,
  Boxes,
  FileText,
  User,
  Clock,
  Trash2,
  Bookmark,
  Star,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

const ActivityPage = () => {
  const navigate = useNavigate();
  const { favorites, history, toggleFavorite, setHistory } = useSidebar();
  const { setPageInfo } = useHeader();

  useEffect(() => {
    setPageInfo('Activity & Favorites', 'Your personalized workspace shortcuts and history');
  }, [setPageInfo]);

  const clearHistory = () => {
    setHistory([]);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'service': return <Boxes className="w-5 h-5" />;
      case 'report': return <FileText className="w-5 h-5" />;
      case 'user': return <User className="w-5 h-5" />;
      default: return <Bookmark className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F8]">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

        {/* Favorites / Pinned Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-display font-black flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              Pinned Shortcuts
            </h2>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {favorites.length} Saved
            </span>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((item) => (
                <Card key={item.id} className="rounded-[2rem] border-none shadow-premium hover:shadow-xl transition-all group overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="p-5 flex items-center justify-between border-b border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <p className="font-black text-lg leading-tight">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {item.type} {item.subtitle && `• ${item.subtitle}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-[#FF2D55] hover:bg-pink-50 rounded-xl"
                        onClick={() => toggleFavorite(item)}
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </Button>
                    </div>
                    <button
                      onClick={() => navigate(item.url)}
                      className="w-full p-4 flex items-center justify-between text-sm font-bold text-primary hover:bg-slate-50 transition-colors"
                    >
                      Open Resource
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-[2.5rem] border-dashed border-2 bg-transparent shadow-none py-12 flex flex-col items-center justify-center text-muted-foreground italic">
              <Bookmark className="w-12 h-12 opacity-10 mb-4" />
              <p className="text-sm font-medium">No items pinned yet.</p>
              <p className="text-xs">Click the heart icon on any report or service to add it here.</p>
            </Card>
          )}
        </section>

        {/* History Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-display font-black flex items-center gap-2">
              <History className="w-6 h-6 text-primary" />
              Recent History
            </h2>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-muted-foreground hover:text-destructive gap-1"
                onClick={clearHistory}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-100">
            {history.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {history.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="p-4 hover:bg-slate-50 flex items-center justify-between group cursor-pointer transition-colors"
                    onClick={() => navigate(item.url)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span>{item.type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }) : 'recent'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground italic">
                <History className="w-12 h-12 opacity-10 mb-4" />
                <p className="text-sm font-medium">History is empty.</p>
                <p className="text-xs">Your recently visited items will appear here.</p>
              </div>
            )}
          </div>
        </section>

        <div className="pt-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
            InspectIQ Personalized Workspace • Beta
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
