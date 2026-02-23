import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ClipboardCheck,
  Users,
  BarChart3,
  Zap,
  ArrowRight,
  Globe,
  Lock,
  Sparkles,
  Download,
  Smartphone,
  ShieldCheck,
  Cpu,
  Activity
} from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { toast } from 'sonner';
import { Footer } from '@/components/layout/Footer';
import logo from '@/assets/qcws-logo.png';

const Index = () => {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleInstall = async () => {
    if (isInstalled) {
      toast.info('App is already installed!');
      return;
    }

    const success = await installApp();
    if (success) {
      toast.success('App installed successfully!');
    } else if (!isInstallable) {
      toast.info('To install, use your browser menu to "Add to Home Screen"');
    }
  };

  const features = [
    { icon: ClipboardCheck, title: 'Smart Inspection Forms', description: 'Dynamic forms with AI-powered field detection and real-time validation.' },
    { icon: ShieldCheck, title: 'Enterprise Compliance', description: 'Ensure ISO and safety standards with automated audit trails.' },
    { icon: BarChart3, title: 'Real-Time Analytics', description: 'Monitor productivity and risk levels with executive dashboards.' },
    { icon: Cpu, title: 'AI-Powered Insights', description: 'Auto-generate summaries and predictive risk scoring.' },
    { icon: Globe, title: 'Global Connectivity', description: 'Cloud-synced data available across all your regional sites.' },
    { icon: Lock, title: 'Bank-Grade Security', description: 'End-to-end encryption with advanced role-based access control.' },
  ];

  const stats = [
    { value: '50K+', label: 'Audits Completed', icon: Activity },
    { value: '1.2K+', label: 'Global Clients', icon: Globe },
    { value: '99.9%', label: 'Uptime SLA', icon: ShieldCheck },
    { value: '24/7', label: 'Support Coverage', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-mesh selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <img src={logo} alt="Quality Concept" className="w-10 h-10 transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight">Quality Concept</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none">Engineering & Audits</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            {(isInstallable || !isInstalled) && (
              <Button
                variant="ghost"
                onClick={handleInstall}
                className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Download className="w-4 h-4" />
                Get App
              </Button>
            )}
            <div className="h-6 w-[1px] bg-border/50 hidden sm:block" />
            <Button variant="ghost" onClick={() => navigate('/auth')} className="font-medium">Sign In</Button>
            <Button
              variant="default"
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-full px-8 hidden sm:flex"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.05)_0%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Next-Gen Compliance Platform</span>
          </div>

          <h1 className="reveal font-display text-5xl md:text-8xl font-black leading-[1.1] tracking-tight">
            The Future of <br />
            <span className="text-gradient">Industrial Inspection</span>
          </h1>

          <p className="reveal text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Move beyond paper and legacy systems. InspectIQ provides high-fidelity data capture,
            AI-driven analytics, and seamless compliance reporting for modern industry.
          </p>

          <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="h-14 px-10 rounded-full bg-primary hover:scale-105 transition-transform shadow-xl shadow-primary/25 text-base font-bold"
            >
              Access Portal <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleInstall}
              className="h-14 px-10 rounded-full border-2 hover:bg-muted/50 transition-all text-base font-bold bg-background/50 backdrop-blur-sm"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Download Mobile App
            </Button>
          </div>

          <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-5xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="relative group p-6 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="absolute top-4 right-4 text-primary/20 group-hover:text-primary/40 transition-colors">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="font-display text-4xl font-extrabold tracking-tight">{stat.value}</div>
                <div className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1 opacity-70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder - Logos */}
      <section className="py-12 border-y border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground mb-10 opacity-50">Leading Industry Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all">
            <div className="font-display text-2xl font-bold italic tracking-tighter">TECHCORP</div>
            <div className="font-display text-2xl font-bold italic tracking-tighter">MAXBUILD</div>
            <div className="font-display text-2xl font-bold italic tracking-tighter">GENERA</div>
            <div className="font-display text-2xl font-bold italic tracking-tighter">NOVAENG</div>
            <div className="font-display text-2xl font-bold italic tracking-tighter">STEELEX</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48" />
        <div className="max-w-7xl mx-auto">
          <div className="reveal text-center mb-20">
            <h2 className="font-display text-3xl md:text-5xl font-black mb-6">Built for High-Stakes Environments</h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-medium">Precision inspection tools designed specifically for engineering, manufacturing, and supply chain audit teams.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="reveal group hover-lift glass-morph rounded-[2rem] p-10 bg-white/40 border border-white/30 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-black mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PWA CTA */}
      {(isInstallable || !isInstalled) && (
        <section className="reveal py-20 px-6 mx-6 md:mx-auto max-w-5xl mb-24">
          <div className="relative rounded-[3rem] overflow-hidden p-12 lg:p-20 bg-sidebar border border-sidebar-border shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-full gradient-primary opacity-10 blur-3xl -rotate-12 translate-x-1/2" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left space-y-6">
                <h3 className="font-display text-3xl md:text-5xl font-black text-sidebar-foreground leading-tight">Take Control From Anywhere.</h3>
                <p className="text-sidebar-foreground/60 text-lg font-medium leading-relaxed">
                  Install the InspectIQ Progressive Web App today. Access your audits offline, capture photos directly, and sync when you're back online.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleInstall}
                    className="h-14 px-10 rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-base font-bold w-full sm:w-auto"
                  >
                    <Download className="w-5 h-5 mr-3" />
                    Install Now
                  </Button>
                  <p className="text-xs text-sidebar-foreground/40 font-bold uppercase tracking-widest hidden sm:block">Works on iOS & Android</p>
                </div>
              </div>
              <div className="w-full lg:w-1/3 flex justify-center">
                <div className="relative w-48 h-96 rounded-[3rem] border-8 border-sidebar-border bg-sidebar-accent shadow-2xl overflow-hidden animate-float">
                  <div className="w-full h-1/3 bg-primary/20 p-6 flex flex-col gap-4">
                    <div className="w-full h-4 bg-primary/40 rounded-full animate-pulse" />
                    <div className="w-2/3 h-4 bg-primary/20 rounded-full" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="w-full h-24 bg-sidebar/50 rounded-2xl border border-white/5" />
                    <div className="w-full h-24 bg-sidebar/50 rounded-2xl border border-white/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
