import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Sparkles,
  Camera,
  CheckCircle,
  RefreshCw,
  Shield,
  Loader2,
  Users,
  Building2,
  ChevronLeft,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import logohome from '@/assets/logohome.png';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import api, { API_BASE_URL } from '@/lib/api';

const AuthPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { signIn, masterSignIn, registerMasterAdmin, isAuthenticated, isLoading: authLoading } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register-master'
  const [loginType, setLoginType] = useState('user'); // 'user' or 'master'

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Master Admin Register State
  const [masterRegData, setMasterRegData] = useState({
    full_name: '',
    email: '',
    password: '',
    avatar: null,
  });
  const [masterAvatarPreview, setMasterAvatarPreview] = useState(null);
  const [isRegisteringMaster, setIsRegisteringMaster] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [masterAdminExists, setMasterAdminExists] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const checkMasterAdmin = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/check-master-admin`);
        const data = await response.json();
        setMasterAdminExists(data.exists);
      } catch (error) {
        console.error('Error checking Master Admin:', error);
      }
    };
    checkMasterAdmin();
  }, []);

  const handleMasterAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Avatar must be less than 2MB');
        return;
      }
      setMasterRegData({ ...masterRegData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => setMasterAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (loginType === 'user') {
        const { error } = await signIn(email, password);
        if (!error) navigate('/dashboard');
      } else {
        const { error } = await masterSignIn(email, password);
        if (!error) navigate('/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterMasterAdmin = async (e) => {
    e.preventDefault();
    setIsRegisteringMaster(true);

    const formData = new FormData();
    formData.append('full_name', masterRegData.full_name);
    formData.append('email', masterRegData.email);
    formData.append('password', masterRegData.password);
    if (masterRegData.avatar) formData.append('avatar', masterRegData.avatar);

    try {
      const result = await registerMasterAdmin(formData);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Master Admin register error:', err);
    } finally {
      setIsRegisteringMaster(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh flex flex-col lg:flex-row overflow-hidden">
      {/* Decorative side panel (Asymmetrical) */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#F5463A] relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(239,68,68,0.1)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
            <div>
              <img src={logohome} alt="Quality Concept" className="h-10 sm:h-12 object-contain transition-transform group-hover:scale-105" />
            </div>
          </div>

          <div className="pt-20 space-y-6">
            <h2 className="font-display text-5xl font-black text-sidebar-foreground leading-tight">
              Enterprise <br />
              <span className=" italic">Security</span> First.
            </h2>
            <p className="text-sidebar-foreground/60 text-lg font-medium leading-relaxed max-w-sm">
              Our advanced RBAC and multi-layered encryption ensure that your inspection data remains confidential and audit-ready.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex gap-4">
          <div className="p-1 px-3 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest">
            <Shield className="w-3 h-3 text-primary" />
            ISO 27001 Certified
          </div>
          <div className="p-1 px-3 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest">
            <Lock className="w-3 h-3 text-primary" />
            AES-256 Encrypted
          </div>
        </div>
      </div>

      {/* Auth Content Area */}
      <div className="flex-1 flex flex-col relative bg-background/40 backdrop-blur-md">
        {/* Top bar for mobile / mobile logo */}
        <div className="lg:hidden p-6 flex justify-between items-center border-b border-border/50 bg-background/80">
          <div className="flex items-center gap-2">
            <img src={logohome} alt="QC" className="h-8 object-contain" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-[440px] space-y-4 animate-slide-up">
            <div className="space-y-2">
              {/* <h3 className="text-2xl font-display font-black text-foreground tracking-tight">
                {authMode === 'login' ? (loginType === 'user' ? 'Sign In' : 'Master Login') : 'Master Setup'}
              </h3> */}
              {/* <p className="text-muted-foreground font-medium">
                {authMode === 'login' ? 'Enter your credentials to access the secure portal.' : 'Complete the initial configuration for the Master Admin.'}
              </p> */}
            </div>

            {/* Role Selection Cards (only for login mode) */}
            {authMode === 'login' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLoginType('user')}
                  className={cn(
                    "relative overflow-hidden group p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center",
                    loginType === 'user'
                      ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                      : "border-border hover:border-primary/50 bg-background/50"
                  )}
                >
                  <Users
                    className={cn(
                      "w-5 h-5 mb-2",
                      loginType === 'user'
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <div className="font-semibold text-xs">Staff roles</div>
                </button>

                <button
                  onClick={() => setLoginType('master')}
                  className={cn(
                    "relative overflow-hidden group p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center",
                    loginType === 'master'
                      ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                      : "border-border hover:border-primary/50 bg-background/50"
                  )}
                >
                  <Key
                    className={cn(
                      "w-5 h-5 mb-2",
                      loginType === 'master'
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <div className="font-semibold text-xs">Master Admin</div>
                </button>
              </div>
            )}

            {/* Auth Form Container */}
            <div className="glass-card rounded-[2rem] p-8 bg-white shadow-2xl shadow-primary/5 border-white/50">
              {authMode === 'login' ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Work Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 bg-background/50 border-border/50 focus:ring-primary/20 transition-all rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                        {loginType === 'master' ? 'Admin Password' : 'Password'}
                      </Label>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-14 bg-background/50 border-border/50 focus:ring-primary/20 transition-all rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>



                  <Button
                    type="submit"
                    className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                /* Master Admin Registration Form */
                <form onSubmit={handleRegisterMasterAdmin} className="space-y-4">
                  <div className="flex flex-col items-center gap-2 mb-6">
                    <div
                      className="w-20 h-20 rounded-2xl bg-muted border-2 border-dashed border-primary/20 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {masterAvatarPreview ? (
                        <img src={masterAvatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-muted-foreground group-hover:scale-110 transition-transform" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleMasterAvatarChange} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Upload Profile Photo</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase ml-1 opacity-60">Full Name</Label>
                      <Input
                        placeholder="Admin Name"
                        value={masterRegData.full_name}
                        onChange={(e) => setMasterRegData({ ...masterRegData, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase ml-1 opacity-60">Email</Label>
                      <Input
                        type="email"
                        placeholder="admin@it.com"
                        value={masterRegData.email}
                        onChange={(e) => setMasterRegData({ ...masterRegData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase ml-1 opacity-60">Set Password</Label>
                    <div className="relative">
                      <Input
                        type={showMasterPassword ? "text" : "password"}
                        placeholder="Enter a strong password"
                        value={masterRegData.password}
                        onChange={(e) => setMasterRegData({ ...masterRegData, password: e.target.value })}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMasterPassword(!showMasterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showMasterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>



                  <Button type="submit" className="w-full h-12 mt-4 font-bold" disabled={isRegisteringMaster}>
                    {isRegisteringMaster ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Activate Master Account'}
                  </Button>
                </form>
              )}
            </div>

            {/* Bottom links */}
            <div className="flex items-center justify-between px-2">
              {!masterAdminExists && authMode === 'login' && (
                <button
                  onClick={() => setAuthMode('register-master')}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Configure Master Admin
                </button>
              )}
              {authMode === 'register-master' && (
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Return to Login
                </button>
              )}
              <div className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">
                Protected by Quality Concept
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (only on desktop) */}
        <div className="p-8 mt-auto hidden lg:flex justify-center border-t border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-widest gap-8">
          <span className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-primary" /> Multi-Tenant Architecture</span>
          <span className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-primary" /> Real-time Audit Logs</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;