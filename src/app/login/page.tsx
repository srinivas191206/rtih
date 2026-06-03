'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getDb, setActiveUser, getActiveUser } from '@/lib/mockDb';
import { 
  Lock, 
  Mail, 
  Download, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Building, 
  UserCheck, 
  FileSpreadsheet, 
  Eye, 
  EyeOff,
  CornerDownLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'founders' | 'mentors' | 'admin'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side only queries
  useEffect(() => {
    setIsClient(true);
    // If already logged in, redirect to respective dashboard
    const user = getActiveUser();
    if (user) {
      redirectUser(user.role);
    }
  }, []);

  // Fetch all credentials from mockDb
  const credentialsList = useMemo(() => {
    if (!isClient) return [];
    try {
      const db = getDb();
      const founders = db.getFounders();
      const startups = db.getStartups();
      const mentors = db.getMentors();

      const list: any[] = [
        {
          role: 'admin',
          name: 'Sri L. Premchandra Reddy, IAS',
          org: 'RTIH Governing Board',
          email: 'admin@rtih.ap.gov.in',
          pass: 'rtih2026'
        },
        {
          role: 'manager',
          name: 'K. Lakshmi Narayana',
          org: 'RTIH Spoke Operations',
          email: 'manager@rtih.ap.gov.in',
          pass: 'rtih2026'
        }
      ];

      // Add first 15 founders
      founders.slice(0, 15).forEach(f => {
        const startup = startups.find(s => s.id === f.startupId);
        list.push({
          role: 'founder',
          name: f.name,
          org: startup ? startup.name : 'Stealth Startup',
          email: f.email,
          pass: 'rtih2026',
          startupId: f.startupId
        });
      });

      // Add first 10 mentors
      mentors.slice(0, 10).forEach(m => {
        list.push({
          role: 'mentor',
          name: m.name,
          org: m.expertise.slice(0, 2).join(', '),
          email: m.email,
          pass: 'rtih2026'
        });
      });

      return list;
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [isClient]);

  // Filtered credentials list
  const filteredCredentials = useMemo(() => {
    return credentialsList.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.org.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeTab === 'all') return matchesSearch;
      if (activeTab === 'founders') return matchesSearch && item.role === 'founder';
      if (activeTab === 'mentors') return matchesSearch && item.role === 'mentor';
      if (activeTab === 'admin') return matchesSearch && (item.role === 'admin' || item.role === 'manager');
      return matchesSearch;
    });
  }, [credentialsList, activeTab, searchTerm]);

  const redirectUser = (role: string) => {
    if (role === 'admin') router.push('/admin');
    else if (role === 'manager') router.push('/manager');
    else if (role === 'mentor') router.push('/mentor');
    else if (role === 'founder') router.push('/founder');
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

    // Try finding matching admin/manager
    if (email === 'admin@rtih.ap.gov.in') {
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

    if (email === 'manager@rtih.ap.gov.in') {
      setActiveUser({
        id: 'manager-1',
        email: 'manager@rtih.ap.gov.in',
        name: 'K. Lakshmi Narayana',
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

    setError('Account not found in RTIH Seeding Directory.');
  };

  const autofillAndLogin = (item: any) => {
    setEmail(item.email);
    setPassword(item.pass);
    setError('');
    
    // Simulate login button click
    const db = getDb();
    if (item.role === 'admin' || item.role === 'manager') {
      setActiveUser({
        id: item.role === 'admin' ? 'admin-1' : 'manager-1',
        email: item.email,
        name: item.name,
        role: item.role
      });
    } else if (item.role === 'founder') {
      const founder = db.getFounder(item.email); // or lookup by email
      const fObj = db.getFounders().find(f => f.email === item.email);
      const startup = fObj ? db.getStartup(fObj.startupId || '') : null;
      setActiveUser({
        id: fObj ? fObj.id : 'founder-1',
        email: item.email,
        name: item.name,
        role: 'founder',
        startupId: item.startupId,
        companyName: startup ? startup.name : null
      });
    } else {
      const mObj = db.getMentors().find(m => m.email === item.email);
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

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Role,Name,Organization/Startup,Email,Password\n';
    
    credentialsList.forEach(item => {
      const row = `"${item.role}","${item.name}","${item.org}","${item.email}","${item.pass}"`;
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'rtih_ecosystem_credentials.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 text-white font-extrabold text-2xl shadow-lg shadow-emerald-500/20">
          AP
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
          RTIH InnovationOS
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Ratan Tata Innovation Hub • Govt. of Andhra Pradesh
        </p>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-8">
        
        {/* Form panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CornerDownLeft className="w-5 h-5 text-emerald-500" />
              Ecosystem Portal Login
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              Enter your credentials to enter your role dashboard.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Ecosystem Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
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
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Ecosystem Access Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              Sign In to Command Center
            </button>
          </form>

          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] text-slate-500 leading-normal flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700">Enterprise Notice: </span>
              Verified credentials directory loaded. Authentication password defaults to <code className="bg-emerald-500/10 text-emerald-700 px-1 rounded font-bold">rtih2026</code>.
            </div>
          </div>
        </div>

        {/* Excel Spreadsheet Credentials View */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                Ecosystem Credentials Directory (Excel Layout)
              </h3>
              <p className="text-xs text-slate-450 mt-1">
                Directory of all seeded startups, mentors, and administrators. Click any row to instantly log in!
              </p>
            </div>
            
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors shrink-0"
              title="Download all mock data credentials as a CSV file to open in Excel."
            >
              <Download className="w-4 h-4" />
              Download Directory (.CSV)
            </button>
          </div>

          {/* Directory Tabs and Search */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            {/* Tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 w-full sm:w-auto">
              {(['all', 'founders', 'mentors', 'admin'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-md transition-colors ${
                    activeTab === tab 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-450 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company or email..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
              />
            </div>
          </div>

          {/* Spreadsheet table wrapper */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner max-h-[360px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="px-4 py-2.5 border-r border-slate-200">Role</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Name</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Organization / Focus</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Email Address</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Password</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCredentials.length > 0 ? (
                  filteredCredentials.map((item, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-4 py-2 border-r border-slate-100">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-extrabold uppercase ${
                          item.role === 'founder' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : item.role === 'mentor' 
                              ? 'bg-purple-100 text-purple-800' 
                              : item.role === 'manager'
                                ? 'bg-orange-100 text-orange-850'
                                : 'bg-red-100 text-red-800'
                        }`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-semibold text-slate-800 border-r border-slate-100">
                        {item.name}
                      </td>
                      <td className="px-4 py-2 text-slate-500 border-r border-slate-100 font-medium">
                        {item.org}
                      </td>
                      <td className="px-4 py-2 text-slate-650 border-r border-slate-100 font-mono text-[10px]">
                        {item.email}
                      </td>
                      <td className="px-4 py-2 text-slate-400 border-r border-slate-100 font-mono text-[10px]">
                        {item.pass}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => autofillAndLogin(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-500 hover:text-white border border-slate-200 hover:border-emerald-500 rounded text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 mx-auto transition-all shadow-sm group-hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Autofill & Login</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                      No credentials found matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Gov Footer */}
      <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-6">
        <p className="font-semibold text-slate-500">Ratan Tata Innovation Hub (RTIH) • Government of Andhra Pradesh</p>
        <p className="mt-1">Official InnovationOS Gateway. Secure access granted only to verified Andhra Pradesh startup ecosystem stakeholders. All rights reserved.</p>
      </div>
    </div>
  );
}
