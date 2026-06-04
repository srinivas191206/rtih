'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Shield, Sparkles, User, Briefcase, Award, Network, ToggleLeft, ToggleRight, Landmark, LogOut, UserCheck, Bell, Menu, X } from 'lucide-react';
import { getDb, isDemoModeActive, setDemoModeActive, isExecutiveModeActive, setExecutiveModeActive, getActiveUser, setActiveUser, ActiveUser } from '@/lib/mockDb';

const ROLES = [
  { name: 'Public Landing Page', path: '/', icon: Network, color: 'text-blue-500', minRole: 'public' },
  { name: 'Founder Command Center', path: '/founder', icon: Award, color: 'text-emerald-500', minRole: 'founder' },
  { name: 'Mentor Command Center', path: '/mentor', icon: Sparkles, color: 'text-purple-500', minRole: 'mentor' },
  { name: 'Program Manager Center', path: '/manager', icon: Briefcase, color: 'text-orange-500', minRole: 'manager' },
  { name: 'AP Admin Command Center', path: '/admin', icon: Shield, color: 'text-red-500', minRole: 'admin' }
];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [execActive, setExecActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<ActiveUser | null>(null);
  const [stats, setStats] = useState({ totalStartups: 14850, totalJobs: 122400 });
  
  // Notification and Toast State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

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

    const updateNotifications = () => {
      try {
        const user = getActiveUser();
        if (user) {
          const list = getDb().getNotifications(user.email);
          setNotifications(list);
        } else {
          setNotifications([]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    updateStats();
    updateNotifications();

    const handleModeChange = () => {
      setExecActive(isExecutiveModeActive());
      updateStats();
      updateNotifications();
    };

    const handleUserChange = () => {
      setCurrentUser(getActiveUser());
      updateNotifications();
    };

    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'error' | 'info' }>;
      if (!customEvent.detail) return;
      const { message, type } = customEvent.detail;
      const id = `${Date.now()}-${Math.random()}`;
      
      setToasts(prev => [...prev, { id, message, type }]);

      // Auto-remove toast after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };

    window.addEventListener('rtih_mode_change', handleModeChange);
    window.addEventListener('rtih_user_change', handleUserChange);
    window.addEventListener('rtih_toast', handleToastEvent);
    
    return () => {
      window.removeEventListener('rtih_mode_change', handleModeChange);
      window.removeEventListener('rtih_user_change', handleUserChange);
      window.removeEventListener('rtih_toast', handleToastEvent);
    };
  }, [pathname]);

  // Resolve current active path for console branding
  let resolvedPath = pathname;
  if (pathname === '/' && currentUser) {
    if (currentUser.role === 'admin') resolvedPath = '/admin';
    else if (currentUser.role === 'founder') resolvedPath = '/founder';
    else if (currentUser.role === 'mentor') resolvedPath = '/mentor';
    else if (currentUser.role === 'manager') resolvedPath = '/manager';
  }
  const currentRole = ROLES.find(r => r.path === resolvedPath) || ROLES[0];
  const isPublicHome = !currentUser && pathname === '/';

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

  const handleNotifClick = (notif: any) => {
    try {
      getDb().markNotificationRead(notif.id);
      window.dispatchEvent(new Event('rtih_mode_change'));
      setNotifDropdownOpen(false);
      if (notif.linkTo) {
        router.push(notif.linkTo);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = () => {
    try {
      if (currentUser) {
        getDb().markAllNotificationsRead(currentUser.email);
        window.dispatchEvent(new Event('rtih_mode_change'));
      }
      setNotifDropdownOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Determine allowed roles for role-switching dropdown
  const allowedRoles = ROLES.filter(role => {
    // If logged in, we do not want "Public Landing Page" (path: '/') in the switcher dropdown or list of allowed roles.
    if (role.path === '/') return false;
    
    if (!currentUser) return false;
    // Admin and Manager can access everything
    if (currentUser.role === 'admin' || currentUser.role === 'manager') return true;
    // Founder can access founder
    if (currentUser.role === 'founder') return role.minRole === 'founder';
    // Mentor can access mentor
    if (currentUser.role === 'mentor') return role.minRole === 'mentor';
    return false;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className={`sticky top-0 z-[1000] w-full border-b transition-colors ${
      isPublicHome 
        ? 'border-white/10 bg-slate-950/60 backdrop-blur-md text-white' 
        : 'border-slate-200 bg-white/95 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#0B1F3A] text-white font-black text-sm shadow-md border border-white/10 shrink-0">
              AP
            </div>
            <div className="flex flex-col text-left">
              <Link href="/" className="flex items-baseline gap-1.5 leading-none">
                <span className={`font-black text-sm tracking-tight ${
                  isPublicHome ? 'text-white' : 'text-[#0B1F3A]'
                }`}>
                  RTIH InnovationOS
                </span>
                <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded tracking-wider leading-none shrink-0 ${
                  isPublicHome ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-[#12B981]'
                }`}>
                  Gov-Suite
                </span>
              </Link>
              <p className={`text-[8.5px] font-semibold tracking-tight mt-0.5 leading-none ${
                isPublicHome ? 'text-slate-350' : 'text-slate-500'
              }`}>
                Ratan Tata Innovation Hub • Government of Andhra Pradesh
              </p>
            </div>
          </div>

          {/* Main Navigation Links (Middle Section) - Equal height SaaS toolbar */}
          <div className="hidden lg:flex items-center gap-2 mx-4">
            {pathname === '/' && (
              <>
                <Link
                  href="/register"
                  className={`h-8 px-3.5 flex items-center justify-center text-[10.5px] font-black rounded-md transition-all shadow-sm cursor-pointer ${
                    (pathname as string) === '/register'
                      ? 'bg-[#12B981] text-white border border-[#12B981]'
                      : isPublicHome
                        ? 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10'
                        : 'bg-[#12B981] hover:bg-[#12B981]/90 text-white border border-[#12B981]'
                  }`}
                >
                  Apply for Incubation
                </Link>
                <Link
                  href="/apply"
                  className={`h-8 px-3.5 flex items-center justify-center text-[10.5px] font-bold rounded-md transition-all shadow-sm border cursor-pointer ${
                    (pathname as string) === '/apply'
                      ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                      : isPublicHome
                        ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        : 'bg-white border-[#E5E7EB] text-[#0B1F3A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  Jobs
                </Link>
                <Link
                  href="/alumni"
                  className={`h-8 px-3.5 flex items-center justify-center text-[10.5px] font-bold rounded-md transition-all shadow-sm border cursor-pointer ${
                    (pathname as string) === '/alumni'
                      ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                      : isPublicHome
                        ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        : 'bg-white border-[#E5E7EB] text-[#0B1F3A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  Alumni Network
                </Link>
              </>
            )}

            {/* Executive Mode Toggle (Unified height) */}
            <button
              onClick={toggleExec}
              className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md border text-[9.5px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm ${
                execActive
                  ? 'bg-emerald-50 text-emerald-700 border-[#12B981]'
                  : isPublicHome
                    ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    : 'bg-white border-[#E5E7EB] text-[#0B1F3A] hover:bg-[#F8FAFC]'
              }`}
              title="Toggle AI executive summaries for Chief Minister / Admin level briefs."
            >
              <Landmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Executive Briefing</span>
              {execActive ? <ToggleRight className="w-4 h-4 text-[#12B981]" /> : <ToggleLeft className="w-4 h-4 text-slate-450" />}
            </button>
          </div>

          {/* Interactive Mode Controls & Role Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Show Exec Briefing on Mobile / Dashboard too as smaller icon button if not on home page */}
            {pathname !== '/' && (
              <button
                onClick={toggleExec}
                className={`flex lg:hidden items-center justify-center w-8 h-8 rounded-md border transition-all duration-200 cursor-pointer shadow-sm ${
                  execActive
                    ? 'bg-emerald-50 text-emerald-700 border-[#12B981]'
                    : 'bg-white border-[#E5E7EB] text-[#0B1F3A] hover:bg-slate-50'
                }`}
                title="Toggle Executive Briefing"
              >
                <Landmark className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Active User session indicators */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Switcher Console Dropdown (Unified height) */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setDropdownOpen(!dropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-1.5 h-8 px-2.5 text-[10.5px] font-bold rounded-md bg-white border border-[#E5E7EB] hover:bg-slate-50 text-[#0B1F3A] transition-colors shadow-sm cursor-pointer"
                  >
                    <currentRole.icon className={`w-3.5 h-3.5 ${currentRole.color}`} />
                    <span className="hidden sm:inline">{currentRole.name}</span>
                    <span className="text-slate-400 text-[8px] ml-0.5">▼</span>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-1.5 w-60 rounded-lg border border-slate-200 bg-white shadow-xl z-20 py-1 focus:outline-none animate-slide-in">
                        <div className="px-3 py-1 border-b border-slate-100 mb-1 flex items-center justify-between">
                          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Switch console
                          </p>
                          {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                            <span className="text-[7.5px] font-black text-red-500 bg-red-50 px-1 py-0.2 rounded uppercase">
                              Admin Override
                            </span>
                          )}
                        </div>
                        {allowedRoles.filter(role => role.path !== '/').map((role) => {
                          const Icon = role.icon;
                          const isActive = pathname === role.path;
                          return (
                            <button
                              key={role.path}
                              onClick={() => {
                                setDropdownOpen(false);
                                router.push(role.path);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-xs font-semibold transition-colors hover:bg-slate-50 ${
                                isActive
                                  ? 'bg-[#F8FAFC] text-[#0B1F3A] font-extrabold'
                                  : 'text-slate-600'
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 ${role.color}`} />
                              <span>{role.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Notification Bell Dropdown (Unified height) */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setDropdownOpen(false);
                    }}
                    className={`relative w-8 h-8 flex items-center justify-center rounded-md border transition-colors cursor-pointer shadow-sm ${
                      notifDropdownOpen 
                        ? 'bg-slate-50 border-[#0b1f3a]/30 text-[#0b1f3a]' 
                        : 'bg-white border-[#E5E7EB] text-slate-550 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                    title="Notifications"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white ring-1 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setNotifDropdownOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-1.5 w-76 rounded-lg border border-slate-200 bg-white shadow-xl z-20 py-1 focus:outline-none animate-slide-in">
                        <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                          <h3 className="text-[10px] font-extrabold text-[#0B1F3A] uppercase tracking-wider">
                            Notifications
                          </h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-[9px] font-extrabold text-[#12B981] hover:text-[#12B981]/90 transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((n) => (
                              <button
                                key={n.id}
                                onClick={() => handleNotifClick(n)}
                                className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors flex gap-2 items-start ${
                                  !n.isRead ? 'bg-[#12B981]/5' : ''
                                }`}
                              >
                                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                  !n.isRead ? 'bg-[#12B981]' : 'bg-slate-300'
                                }`}></span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[11px] ${!n.isRead ? 'font-extrabold text-slate-900' : 'text-slate-650'}`}>
                                    {n.title}
                                  </p>
                                  <p className="text-[9.5px] text-slate-500 mt-0.5 line-clamp-2">
                                    {n.message}
                                  </p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-6 text-center text-[10px] text-slate-400 italic">
                              No notifications yet
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Card & Logout (Unified height, 50% width reduction, Compact component) */}
                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                  <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-md px-2 py-0.5 h-8 max-w-[130px] sm:max-w-[170px]">
                    <div className="w-5.5 h-5.5 rounded-full bg-[#0B1F3A] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                      {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-[9.5px] font-black text-[#0B1F3A] truncate leading-none">
                        {currentUser.name}
                      </span>
                      <span className="text-[8.5px] text-[#12B981] font-extrabold mt-0.5 leading-none truncate uppercase tracking-wider">
                        {currentUser.companyName || currentUser.role}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm cursor-pointer"
                    title="Log out from active session."
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Toggle Mobile Menu"
                  >
                    {mobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`flex items-center gap-1.5 h-8 px-3.5 rounded-md text-[10.5px] font-extrabold shadow-sm transition-all cursor-pointer ${
                    pathname === '/login'
                      ? 'bg-[#0B1F3A] text-white border border-[#0B1F3A]'
                      : 'bg-[#12B981] hover:bg-[#12B981]/90 text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Toggle Mobile Menu"
                >
                  {mobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3.5 space-y-2.5 animate-slide-in">
          {pathname === '/' && (
            <>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-emerald-250 bg-emerald-50/15 text-emerald-700 text-xs font-bold transition-colors"
              >
                <span>🚀 Apply for Incubation</span>
                <span className="text-[10px]">→</span>
              </Link>
              <Link
                href="/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-150 bg-slate-50/50 text-slate-700 text-xs font-bold transition-colors"
              >
                <span>💼 Find Jobs</span>
                <span className="text-[10px]">→</span>
              </Link>
              <Link
                href="/alumni"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-150 bg-slate-50/50 text-slate-700 text-xs font-bold transition-colors"
              >
                <span>🎓 Alumni Network</span>
                <span className="text-[10px]">→</span>
              </Link>
            </>
          )}
          {!currentUser && (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              <span>🔑 Sign In</span>
              <span className="text-[10px]">→</span>
            </Link>
          )}
        </div>
      )}

      {/* Global Floating Toasts Stack */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border shadow-xl transition-all duration-300 animate-slide-in ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-250 text-emerald-900'
                : t.type === 'error'
                ? 'bg-red-50 border-red-250 text-red-900'
                : 'bg-blue-50 border-blue-250 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-550 text-white text-[10px] font-bold">✓</div>
              )}
              {t.type === 'error' && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-550 text-white text-[10px] font-bold">✕</div>
              )}
              {t.type === 'info' && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-550 text-white text-[10px] font-bold">ℹ</div>
              )}
              <p className="text-xs font-semibold">{t.message}</p>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs pr-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </header>
  );
}
