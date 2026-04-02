import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Beaker, LayoutDashboard, CreditCard, LogOut, Package, Radar, Zap, QrCode } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loading } from './Loading';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { Logo } from './Logo';

export const Layout: React.FC = () => {
  const { user, profile, loading, logOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Regulatory Radar', path: '/radar', icon: Radar },
    { name: 'Substitutions', path: '/substitutions', icon: Zap, minTier: 'pro' },
    { name: 'Passports (DPP)', path: '/passports', icon: QrCode, minTier: 'enterprise' },
    { name: 'Pricing', path: '/pricing', icon: CreditCard },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.minTier) return true;
    const tier = profile?.tier || 'none';
    if (item.minTier === 'pro') {
      return tier === 'pro' || tier === 'enterprise';
    }
    if (item.minTier === 'enterprise') {
      return tier === 'enterprise';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-industrial-950 text-slate-200 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-industrial-900 border-r border-zinc-border flex flex-col z-20">
        <div className="h-20 flex items-center px-6 border-b border-zinc-border">
          <Logo size="sm" />
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 emerald-glow" 
                    : "text-zinc-muted hover:bg-industrial-800 hover:text-slate-200 border border-transparent"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 mr-3 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="text-sm font-semibold tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-zinc-border bg-industrial-950/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-industrial-800 border border-zinc-border flex items-center justify-center text-accent-emerald font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">
                {profile?.companyName || user.displayName || user.email?.split('@')[0]}
              </span>
              <span className="text-[10px] text-accent-emerald font-mono uppercase tracking-tighter">
                {profile?.tier ? `${profile.tier} node` : 'Basic Node'}
              </span>
            </div>
          </div>
          <button
            onClick={logOut}
            className="w-full flex items-center justify-center px-4 py-2.5 text-xs font-bold text-zinc-muted hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            TERMINATE SESSION
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--color-industrial-900),_transparent)]">
        <div className="flex-1 overflow-y-auto p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
