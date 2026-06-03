'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Shield, Sparkles, User, Briefcase, Award, Network, ToggleLeft, ToggleRight, Landmark, LogOut, UserCheck } from 'lucide-react';
import { getDb, isDemoModeActive, setDemoModeActive, isExecutiveModeActive, setExecutiveModeActive, getActiveUser, setActiveUser, ActiveUser } from '@/lib/mockDb';

const ROLES = [
  { name: 'Public Landing Page', path: '/', icon: Network, color: 'text-blue-500', minRole: 'public' },
  { name: 'Founder Command Center', path: '/founder', icon: Award, color: 'text-emerald-500', minRole: 'founder' },
  { name: 'Mentor Command Center', path: '/mentor', icon: Sparkles, color: 'text-purple-500', minRole: 'mentor' },
  { name: 'Program Manager Center', path: '/manager', icon: Briefcase, color: 'text-orange-500', minRole: 'manager' },
  { name: 'AP Admin Command Center', path: '/admin', icon: Shield, color: 'text-red-500', minRole: 'admin' }
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [execActive, setExecActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<ActiveUser | null>(null);
  const [stats, setStats] = useState({ totalStartups: 550, totalJobs: 13800 });

  // Sync states and listen for dynamic updates
  useEffect(() => {
    setExecActive(isExecutiveModeActive());
    setCurrentUser(getActiveUser());

    const updateStats = () => {
      try {
        const dbStats = getDb().getEcosystemStats();
        setStats({
          totalStartups: dbStats.totalStartups,
          totalJobs: dbStats.totalJobs
        });
      } catch (e) {
        console.error(e);
      }
    };

    updateStats();

    const handleModeChange = () => {
      setExecActive(isExecutiveModeActive());
      updateStats();
    };

    const handleUserChange = () => {
      setCurrentUser(getActiveUser());
    };

    window.addEventListener('rtih_mode_change', handleModeChange);
    window.addEventListener('rtih_user_change', handleUserChange);
    
    return () => {
      window.removeEventListener('rtih_mode_change', handleModeChange);
      window.removeEventListener('rtih_user_change', handleUserChange);
    };
  }, [pathname]);

  const currentRole = ROLES.find(r => r.path === pathname) || ROLES[0];

  const toggleExec = () => {
    const nextVal = !execActive;
    setExecutiveModeActive(nextVal);
    setExecActive(nextVal);
    router.refresh();
  };


  const handleLogout = () => {
    setActiveUser(null);
    router.push('/login');
  };

  // Determine allowed roles for role-switching dropdown
  const allowedRoles = ROLES.filter(role => {
    if (!currentUser) return role.minRole === 'public';
    // Admin and Manager can access everything
    if (currentUser.role === 'admin' || currentUser.role === 'manager') return true;
    // Founder can access landing page and founder
    if (currentUser.role === 'founder') return role.minRole === 'public' || role.minRole === 'founder';
    // Mentor can access landing page and mentor
    if (currentUser.role === 'mentor') return role.minRole === 'public' || role.minRole === 'mentor';
    return role.minRole === 'public';
  });

  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
              AP
            </div>
            <div>
              <Link href="/" className="flex items-baseline gap-2">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  RTIH InnovationOS
                </span>
                <span className="hidden md:inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wider">
                  Gov-Suite
                </span>
              </Link>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Ratan Tata Innovation Hub • Govt. of Andhra Pradesh
              </p>
            </div>
          </div>

          {/* Quick Ecosystem Metrics Display */}
          <div className="hidden lg:flex items-center gap-6 border-l border-r border-slate-200 px-6 py-1 mx-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500">Live Startups:</span>
              <span className="font-bold text-slate-900">{stats.totalStartups.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Jobs Created:</span>
              <span className="font-bold text-slate-900">{stats.totalJobs.toLocaleString()}</span>
            </div>
          </div>

          {/* Interactive Mode Controls & Role Switcher */}
          <div className="flex items-center gap-3">


            {/* Executive Mode Toggle */}
            <button
              onClick={toggleExec}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                execActive
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/35'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
              title="Toggle AI executive summaries for Chief Minister / Admin level briefs."
            >
              <Landmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exec Briefing</span>
              {execActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
            </button>

            {/* Active User session / login indicators */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Switcher Console (Restricted to roles) */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200"
                  >
                    <currentRole.icon className={`w-4 h-4 ${currentRole.color}`} />
                    <span className="hidden sm:inline">{currentRole.name}</span>
                    <span className="text-slate-450 text-[10px] ml-1">▼</span>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl z-20 py-1.5 focus:outline-none">
                        <div className="px-3 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Switch console
                          </p>
                          {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                            <span className="text-[8px] font-black text-red-500 bg-red-100 px-1 py-0.2 rounded uppercase">
                              Admin Override
                            </span>
                          )}
                        </div>
                        {allowedRoles.map((role) => {
                          const Icon = role.icon;
                          const isActive = pathname === role.path;
                          return (
                            <button
                              key={role.path}
                              onClick={() => {
                                setDropdownOpen(false);
                                router.push(role.path);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-slate-100 ${
                                isActive
                                  ? 'bg-slate-50 text-slate-900 font-semibold'
                                  : 'text-slate-600'
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${role.color}`} />
                              <span>{role.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Card & Logout */}
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1 py-0.2 rounded self-end leading-none mt-0.5 uppercase tracking-wide">
                      {currentUser.companyName || currentUser.role}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors"
                    title="Log out from active session."
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/10 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>Ecosystem Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
