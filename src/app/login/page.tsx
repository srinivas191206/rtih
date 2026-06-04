'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDb, setActiveUser, getActiveUser } from '@/lib/mockDb';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  EyeOff,
  ChevronRight,
  X,
  Award,
  Sparkles,
  Building,
  User,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Ensure client-side only queries
  useEffect(() => {
    setIsClient(true);
    const user = getActiveUser();
    if (user) {
      redirectUser(user.role);
    }
  }, []);

  const redirectUser = (role: string) => {
    router.push('/');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== 'rtih2026') {
      setError('Invalid password. Default demo password is "rtih2026".');
      return;
    }

    // Try finding matching admin
    if (email.toLowerCase() === 'admin@rtih.ap.gov.in') {
      setActiveUser({
        id: 'admin-1',
        email: 'admin@rtih.ap.gov.in',
        name: 'Sri L. Premchandra Reddy, IAS',
        role: 'admin'
      });
      triggerSuccessConfetti();
      redirectUser('admin');
      return;
    }

    // Try finding matching manager dynamically (accept manager@ or manager.*@)
    if (email.toLowerCase() === 'manager@rtih.ap.gov.in' || (email.toLowerCase().startsWith('manager.') && email.toLowerCase().endsWith('@rtih.ap.gov.in'))) {
      const db = getDb();
      let matchedEmail = email.toLowerCase();
      // Handle legacy/short manager@ email to K. Lakshmi Narayana (Rajamahendravaram)
      if (matchedEmail === 'manager@rtih.ap.gov.in') {
        matchedEmail = 'manager.rajamahendravaram@rtih.ap.gov.in';
      }
      const center = db.getIncubationCenters().find(c => c.managerId.toLowerCase() === matchedEmail);
      const managerName = center ? center.managerName : 'K. Lakshmi Narayana';
      
      setActiveUser({
        id: center ? `manager-${center.id}` : 'manager-1',
        email: matchedEmail,
        name: managerName,
        role: 'manager'
      });
      triggerSuccessConfetti();
      redirectUser('manager');
      return;
    }

    // Find founder
    const db = getDb();
    const founder = db.getFounders().find(f => f.email.toLowerCase() === email.toLowerCase());
    if (founder) {
      const startup = db.getStartup(founder.startupId || '');
      setActiveUser({
        id: founder.id,
        email: founder.email,
        name: founder.name,
        role: 'founder',
        startupId: founder.startupId,
        companyName: startup ? startup.name : null
      });
      triggerSuccessConfetti();
      redirectUser('founder');
      return;
    }

    // Find mentor
    const mentor = db.getMentors().find(m => m.email.toLowerCase() === email.toLowerCase());
    if (mentor) {
      setActiveUser({
        id: mentor.id,
        email: mentor.email,
        name: mentor.name,
        role: 'mentor'
      });
      triggerSuccessConfetti();
      redirectUser('mentor');
      return;
    }

    // Find investor
    const investor = db.getInvestors().find(i => i.email.toLowerCase() === email.toLowerCase());
    if (investor) {
      setActiveUser({
        id: investor.id,
        email: investor.email,
        name: investor.name,
        role: 'investor'
      });
      triggerSuccessConfetti();
      redirectUser('investor');
      return;
    }

    setError('Account not found in RTIH Seeding Directory.');
  };

  const autofillAndLogin = (item: any) => {
    setEmail(item.email);
    setPassword(item.pass);
    setError('');
    
    const db = getDb();
    if (item.role === 'admin' || item.role === 'manager') {
      const center = item.role === 'manager' ? db.getIncubationCenters().find(c => c.managerId.toLowerCase() === item.email.toLowerCase()) : null;
      setActiveUser({
        id: item.role === 'admin' ? 'admin-1' : (center ? `manager-${center.id}` : 'manager-1'),
        email: item.email,
        name: item.name,
        role: item.role
      });
    } else if (item.role === 'founder') {
      const fObj = db.getFounders().find(f => f.email.toLowerCase() === item.email.toLowerCase());
      const startup = fObj ? db.getStartup(fObj.startupId || '') : null;
      setActiveUser({
        id: fObj ? fObj.id : 'founder-1',
        email: item.email,
        name: item.name,
        role: 'founder',
        startupId: item.startupId,
        companyName: startup ? startup.name : null
      });
    } else if (item.role === 'investor') {
      const iObj = db.getInvestors().find(i => i.email.toLowerCase() === item.email.toLowerCase());
      setActiveUser({
        id: iObj ? iObj.id : 'investor-1',
        email: item.email,
        name: item.name,
        role: 'investor'
      });
    } else {
      const mObj = db.getMentors().find(m => m.email.toLowerCase() === item.email.toLowerCase());
      setActiveUser({
        id: mObj ? mObj.id : 'mentor-1',
        email: item.email,
        name: item.name,
        role: 'mentor'
      });
    }
    
    triggerSuccessConfetti();
    redirectUser(item.role);
  };

  const triggerSuccessConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.7 }
    });
  };

  const demoAccounts = [
    {
      group: 'Operations & Policy Command (Admin & Managers)',
      items: [
        {
          role: 'admin',
          name: 'Sri L. Premchandra Reddy, IAS',
          org: 'RTIH Governing Board (Admin)',
          email: 'admin@rtih.ap.gov.in',
          pass: 'rtih2026',
          description: 'Access full AP state telemetry, economic projection metrics, and approve applications.'
        },
        {
          role: 'manager',
          name: 'Sri L. Premchandra Reddy, IAS',
          org: 'Amaravati Central Hub Manager',
          email: 'manager.amaravati@rtih.ap.gov.in',
          pass: 'rtih2026',
          description: 'Climate Tech, Blockchain, AVGC & XR, Health Care, Urban Systems, Supply Chain.'
        },
        {
          role: 'manager',
          name: 'Dr. Srinivas Prasad',
          org: 'Visakhapatnam Hub Manager',
          email: 'manager.vizag@rtih.ap.gov.in',
          pass: 'rtih2026',
          description: 'Medtech, Fintech, Biotech, Blue economy, Smart Infra.'
        },
        {
          role: 'manager',
          name: 'K. Lakshmi Narayana',
          org: 'Rajamahendravaram Hub Manager',
          email: 'manager.rajamahendravaram@rtih.ap.gov.in',
          pass: 'rtih2026',
          description: 'Food Processing, Marine Tech, Aquaculture, Energy Transition.'
        },
        {
          role: 'manager',
          name: 'G. Rama Chandra Murthy',
          org: 'Vijayawada Hub Manager',
          email: 'manager.vijayawada@rtih.ap.gov.in',
          pass: 'rtih2026',
          description: 'Industrial IoT, Agri Technology, Auto-Body Building/Light Engineering, Construction Technology.'
        },
        {
          role: 'manager',
          name: 'B. R. K. Prasad',
          org: 'Ananthapuramu Hub Manager',
          email: 'manager.ananthapuramu@rtih.ap.gov.in',
          pass: 'rtih2026',
          description: 'Automotive & EV sys, Hybrid RE, Agri & Food Processing, Logistics-Warehousing, Defence & Aerospace.'
        },
        {
          role: 'manager',
          name: 'Prof. S. R. Venkat Raman',
          org: 'Tirupati Hub Manager',
          email: 'manager.tirupati@rtih.ap.gov.in',
          pass: 'rtih2026',
          description: 'Battery & Adv. Manufacturing, Electronics Cluster, Horti Tech & Diary, Space Tech.'
        }
      ]
    },
    {
      group: 'Startup Founders (Stage-wise Groups)',
      items: [
        {
          role: 'founder',
          level: 'Advanced Startup',
          stage: 'Idea Stage',
          name: 'Dr. Srinivas Koppula',
          org: 'Rayalaseema Health Diagnostics',
          email: 'srinivas.koppula@rtihfounder.in',
          pass: 'rtih2026',
          startupId: 'startup-3',
          description: 'Newly incubated. Focused on diagnostic telemetry, early market research, and mentor alignment.'
        },
        {
          role: 'founder',
          level: 'Medium Level Startup',
          stage: 'Validation & Prototype',
          name: 'Kalyani Devineni',
          org: 'Godavari Aquatech Labs',
          email: 'kalyani.d@rtihfounder.in',
          pass: 'rtih2026',
          startupId: 'startup-2',
          description: 'Mid-stage. Completing field prototype deployment, masterclass lessons, and grant requests.'
        },
        {
          role: 'founder',
          level: 'Beginner Startup',
          stage: 'Scale & Revenue',
          name: 'Hari Prasad Ananth',
          org: 'Kalyan AgriSystems',
          email: 'hari.prasad@rtihfounder.in',
          pass: 'rtih2026',
          startupId: 'startup-1',
          description: 'High-growth. Managing jobs board, tracking ARR curves, and applying for Series-A linkages.'
        }
      ]
    },
    {
      group: 'Ecosystem Mentors (Regional Hub Specialists)',
      items: [
        {
          role: 'mentor',
          name: 'Dr. A. Srinivas Rao',
          org: 'Visakhapatnam Hub - Medtech & Blue economy',
          email: 'vizag.mentor1@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Specialist in clinical trials, medical device regulation, and oceanography tech.'
        },
        {
          role: 'mentor',
          name: 'Prof. G. Veerraju',
          org: 'Visakhapatnam Hub - Biotech & Fintech',
          email: 'vizag.mentor2@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Specialist in genetics bio-safety, molecular analysis, and algorithmic stock platforms.'
        },
        {
          role: 'mentor',
          name: 'Dr. M. Sridhar',
          org: 'Vijayawada Hub - Industrial IoT & Construction',
          email: 'vijayawada.mentor1@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Focuses on building information modeling, sensor communication protocols, and edge compute.'
        },
        {
          role: 'mentor',
          name: 'Smt. K. Rama Devi',
          org: 'Vijayawada Hub - AgriTech & Auto-Body Eng',
          email: 'vijayawada.mentor2@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Advises on precision farming, tractor hydraulics, light metal casting, and rural supply chain.'
        },
        {
          role: 'mentor',
          name: 'Sri P. Venkateswara Rao',
          org: 'Rajamahendravaram Hub - Food & Energy Transition',
          email: 'rajamundry.mentor1@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Specialist in thermal food preservation, hydrogen combustion, and biogas cogeneration.'
        },
        {
          role: 'mentor',
          name: 'Dr. N. Mangadevi',
          org: 'Rajamahendravaram Hub - Aquaculture & Marine',
          email: 'rajamundry.mentor2@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Focuses on bio-floc shrimp cultivation, estuary ecology, and telemetry buoy deployment.'
        },
        {
          role: 'mentor',
          name: 'Prof. K. Hemachandra Reddy',
          org: 'Ananthapuramu Hub - EV Systems & Logistics',
          email: 'ananthapuramu.mentor1@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Advises on dual-motor drivetrains, BMS cell balancing, cold chain sorting, and autonomous routing.'
        },
        {
          role: 'mentor',
          name: 'Dr. C. R. Giridhar',
          org: 'Ananthapuramu Hub - Hybrid RE & Food Processing',
          email: 'ananthapuramu.mentor2@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Focuses on solar-wind storage systems, high-efficiency milling, and millet value-added products.'
        },
        {
          role: 'mentor',
          name: 'Sri J. A. Chowdary',
          org: 'Amaravati Central Hub - Climate Tech & Blockchain',
          email: 'amaravati.mentor1@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Guidance on carbon token systems, sharded ledger systems, and industrial energy auditing.'
        },
        {
          role: 'mentor',
          name: 'Dr. T. Lasya',
          org: 'Amaravati Central Hub - AVGC & Healthcare',
          email: 'amaravati.mentor2@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Advises on XR immersive therapies, diagnostic imaging engines, and health telemetry standardizations.'
        },
        {
          role: 'mentor',
          name: 'Prof. S. R. S. Prasanna',
          org: 'Tirupati Hub - Battery Tech & Space Tech',
          email: 'tirupati.mentor1@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Focuses on solid-state battery chemistry, micro-satellite avionics, and carbon fiber hulls.'
        },
        {
          role: 'mentor',
          name: 'Dr. V. R. K. Prasad',
          org: 'Tirupati Hub - Electronics Cluster & Horti Tech',
          email: 'tirupati.mentor2@rtihmentor.in',
          pass: 'rtih2026',
          description: 'Advises on semiconductor design packaging, high-yield floriculture, and automated dairies.'
        }
      ]
    },
    {
      group: 'Ecosystem Investors (Capital Linkage Partners)',
      items: [
        {
          role: 'investor',
          name: 'Suresh Naidu',
          org: 'Amaravati Ventures (Managing Partner)',
          email: 'suresh.naidu@amaravativentures.com',
          pass: 'rtih2026',
          description: 'Investigates early-stage startups for matching state grants and co-investment.'
        },
        {
          role: 'investor',
          name: 'Priya Reddy',
          org: 'Rayalaseema Angels (Principal)',
          email: 'priya.reddy@rayalaseemaangels.com',
          pass: 'rtih2026',
          description: 'Focuses on early-stage MedTech, AgriTech, and clean energy startups in AP.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-end bg-[url('/login.png')] bg-cover bg-center bg-no-repeat overflow-hidden font-sans">
      
      {/* Visual Overlay to darken the background slightly and focus the login card */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] z-0"></div>

      {/* Floating Arrow Mark Trigger Button on the Left Edge */}
      {!drawerOpen && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-emerald-600 hover:bg-emerald-750 text-white rounded-r-2xl py-6 px-3.5 shadow-2xl border-y border-r border-emerald-400/40 flex flex-col items-center gap-3 transition-all duration-300 group cursor-pointer"
          title="Show Auto-Login Credentials Directory"
        >
          <ChevronRight className="w-5 h-5 animate-bounce-horizontal" />
          <span className="text-[10px] font-black uppercase tracking-widest [writing-mode:vertical-lr] select-none text-emerald-100">
            Show Accounts
          </span>
        </button>
      )}

      {/* Slide-in Credentials Directory Sidebar (from Left) */}
      <div
        className={`fixed left-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-50 border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Ecosystem Directory
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5 font-medium">
                Click any interactive box below to log in instantly.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Close Directory"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories List (Grouped boxes) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 bg-[#f8fafc]">
          {demoAccounts.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                {group.group}
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                  {group.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      autofillAndLogin(item);
                      setDrawerOpen(false);
                    }}
                    className="w-full text-left p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
                  >
                    {/* Role highlight bar */}
                    <div className={`absolute left-0 top-0 h-full w-1.5 ${
                      item.role === 'admin' 
                        ? 'bg-red-500' 
                        : item.role === 'manager' 
                          ? 'bg-orange-500' 
                          : item.role === 'mentor' 
                            ? 'bg-purple-500' 
                            : item.role === 'investor'
                              ? 'bg-blue-600'
                              : 'bg-emerald-500'
                    }`}></div>

                    <div className="pl-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                          {item.name}
                        </span>
                        
                        {/* Badge: numbered for founders, role label for others */}
                        {item.role === 'founder' ? (
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                            {idx + 1}
                          </span>
                        ) : (
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            item.role === 'admin' 
                              ? 'bg-red-50 text-red-700' 
                              : item.role === 'manager' 
                                ? 'bg-orange-50 text-orange-700' 
                                : item.role === 'investor'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-purple-55 text-purple-700'
                          }`}>
                            {item.role}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                        {item.role === 'founder' && <Building className="w-3.5 h-3.5 text-slate-400" />}
                        {item.role === 'mentor' && <Sparkles className="w-3.5 h-3.5 text-slate-400" />}
                        {(item.role === 'admin' || item.role === 'manager') && <User className="w-3.5 h-3.5 text-slate-400" />}
                        {item.role === 'investor' && <Landmark className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{item.org}</span>
                      </div>

                      <p className="text-[10px] text-slate-400 font-medium leading-normal pt-1 italic">
                        {item.description}
                      </p>
                      
                      <div className="text-[9px] font-mono text-slate-400 pt-1 flex justify-between">
                        <span>{item.email}</span>
                        <span className="font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to enter →
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background overlay toggle when drawer is open */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
          onClick={() => setDrawerOpen(false)}
        ></div>
      )}

      {/* Login Card (Aligned on the Right) */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6 z-10 mr-0 lg:mr-20 animate-slide-in relative">
        
        {/* Government Branding Header */}
        <div className="flex flex-col items-center border-b border-slate-100 pb-5">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500 text-white font-extrabold text-lg shadow-lg shadow-emerald-500/20">
            AP
          </div>
          <h2 className="mt-3 text-center text-xl font-black tracking-tight text-slate-900 leading-none">
            RTIH InnovationOS
          </h2>
          <p className="mt-1.5 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Ratan Tata Innovation Hub • Govt. of AP
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Ecosystem Portal Login
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-normal font-medium">
            Enter your credentials or click the left drawer arrow to browse the seeded demo accounts.
          </p>
        </div>

        <form className="space-y-4.5" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
              Ecosystem Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-450" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-slate-800 bg-slate-50/50"
                placeholder="name@rtihfounder.in"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
              Ecosystem Access Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-455" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-slate-800 bg-slate-50/50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-650"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors cursor-pointer"
          >
            Sign In to Command Center
          </button>
        </form>

        <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-xl text-[10px] text-slate-500 leading-normal flex items-start gap-2 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-bold text-slate-700">Auto-Login Hint: </span>
            Click the <strong className="text-emerald-600">Show Accounts</strong> chevron drawer floating on the left side of the screen to browse mock accounts.
          </div>
        </div>

        {/* Back to landing link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <button
            onClick={() => router.push('/')}
            className="text-[10px] font-bold text-slate-455 hover:text-slate-750 transition-colors uppercase tracking-wider"
          >
            ← Back to Public Portal
          </button>
        </div>
      </div>
    </div>
  );
}
