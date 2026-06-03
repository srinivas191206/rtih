'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { 
  getDb, 
  isExecutiveModeActive, 
  isDemoModeActive, 
  getActiveUser,
  Hackathon,
  Mentor,
  StartupApplication,
  IncubationCenter,
  Department,
  Program,
  Startup
} from '@/lib/mockDb';
import { predictStartupRisk } from '@/lib/engines';
import InnovationGraph from '@/components/InnovationGraph';
import PipelineFunnel from '@/components/PipelineFunnel';
import { 
  ShieldAlert, 
  TrendingUp, 
  Award, 
  Coins, 
  HelpCircle, 
  Landmark, 
  Trophy, 
  Users, 
  Star, 
  BarChart3, 
  ShieldCheck, 
  Bot,
  Plus,
  Calendar,
  FileText,
  Activity,
  CheckCircle2,
  MapPin,
  Building2,
  ChevronRight,
  Search,
  ListTodo,
  Check,
  XCircle,
  Eye,
  Layers,
  PlusSquare,
  Trash2,
  Link
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';

export default function AdminCommandCenter() {
  const router = useRouter();
  const [db, setDb] = useState(() => getDb());
  const [execActive, setExecActive] = useState(false);
  const [demoActive, setDemoActive] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'analytics' | 'leaderboard' | 'hackathons' | 'compliance' | 'applications' | 'departments' | 'configurator'>('analytics');

  // Tab grouping helpers
  const getPrimaryTab = (subTab: string) => {
    if (['analytics', 'leaderboard'].includes(subTab)) return 'analytics_leaderboard';
    if (['applications', 'compliance'].includes(subTab)) return 'vetting_compliance';
    if (subTab === 'hackathons') return 'hackathons';
    if (['departments', 'configurator'].includes(subTab)) return 'departments';
    return 'analytics_leaderboard';
  };

  const activePrimaryTab = getPrimaryTab(activeTab);

  const PRIMARY_TABS = [
    { id: 'analytics_leaderboard', label: 'Analytics & Rankings', icon: BarChart3, defaultSub: 'analytics' },
    { id: 'vetting_compliance', label: 'Vetting & Compliance', icon: ShieldCheck, defaultSub: 'applications' },
    { id: 'hackathons', label: 'Hackathons Hub', icon: Trophy, defaultSub: 'hackathons' },
    { id: 'departments', label: 'Departments & Programs', icon: Landmark, defaultSub: 'departments' }
  ] as const;

  // Hackathon Creator Form State
  const [wizHackTitle, setWizHackTitle] = useState('');
  const [wizHackTagline, setWizHackTagline] = useState('');
  const [wizHackTracks, setWizHackTracks] = useState('');
  const [wizHackStartDate, setWizHackStartDate] = useState('2026-06-15');
  const [wizHackEndDate, setWizHackEndDate] = useState('2026-07-15');
  const [wizSelectedJudges, setWizSelectedJudges] = useState<string[]>([]);

  // Search filter for Compliance reports
  const [complianceSearch, setComplianceSearch] = useState('');
  const [complianceRiskFilter, setComplianceRiskFilter] = useState('All');

  // Applications tab state
  const [appStatusFilter, setAppStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [appSearch, setAppSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<StartupApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Departments tab state
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptFocus, setNewDeptFocus] = useState('');
  const [showAddDept, setShowAddDept] = useState(false);

  const [newProgName, setNewProgName] = useState('');
  const [newProgDesc, setNewProgDesc] = useState('');
  const [newProgDept, setNewProgDept] = useState('');
  const [newProgStages, setNewProgStages] = useState<string[]>([]);
  const [newProgDuration, setNewProgDuration] = useState(6);
  const [showAddProg, setShowAddProg] = useState(false);

  // Health Weights State
  const [weights, setWeights] = useState(() => db.getHealthWeights());

  // Login check
  useEffect(() => {
    const user = getActiveUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, []);

  // Sync state changes from toggles
  const syncStates = () => {
    const freshDb = getDb();
    setDb(freshDb);
    setExecActive(isExecutiveModeActive());
    setDemoActive(isDemoModeActive());
    setWeights(freshDb.getHealthWeights());
  };

  useEffect(() => {
    syncStates();
    window.addEventListener('rtih_mode_change', syncStates);
    return () => {
      window.removeEventListener('rtih_mode_change', syncStates);
    };
  }, []);

  // Aggregate stats dynamically
  const stats = useMemo(() => {
    return db.getEcosystemStats();
  }, [db]);

  // Compute Unicorn Candidates
  const unicornStartups = useMemo(() => {
    return db.getStartups()
      .filter(s => s.unicornScore > 70)
      .sort((a, b) => b.unicornScore - a.unicornScore)
      .slice(0, 5);
  }, [db]);

  // Compute Soonicorn Candidates
  const soonicornStartups = useMemo(() => {
    return db.getStartups()
      .filter(s => s.soonicornScore > 75 && s.unicornScore <= 70)
      .sort((a, b) => b.soonicornScore - a.soonicornScore)
      .slice(0, 5);
  }, [db]);

  // Seed projections
  const projectionData = [
    { year: '2024', startups: 120, jobs: 1800, funding: 2.4 },
    { year: '2025', startups: 310, jobs: 4900, funding: 6.8 },
    { year: '2026', startups: demoActive ? 14850 : 550, jobs: stats.totalJobs, funding: demoActive ? 85.0 : 18.5 },
    { year: '2027', startups: 1800, jobs: 32000, funding: 45.0 },
    { year: '2028', startups: 8500, jobs: 68000, funding: 110.0 },
    { year: '2029', startups: 20000, jobs: 100000, funding: 250.0 }
  ];

  // Universities ranked
  const universitiesList = useMemo(() => {
    return [...db.getUniversities()].sort((a, b) => b.innovationScore - a.innovationScore);
  }, [db]);

  // Hackathons Hub data
  const hackathonsList = useMemo(() => {
    return db.getHackathons();
  }, [db]);

  // Mentors list for judge selection
  const mentorsList = useMemo(() => {
    return db.getMentors();
  }, [db]);

  // Filtered applications
  const filteredApps = useMemo(() => {
    const list = db.getApplications();
    return list.filter(app => {
      const matchesStatus = appStatusFilter === 'All' || app.status === appStatusFilter;
      const matchesSearch = appSearch === '' || 
        app.startupName.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.founderName.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.sector.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.district.toLowerCase().includes(appSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [db, appStatusFilter, appSearch]);

  // Filtered startups for compliance audits
  const complianceStartups = useMemo(() => {
    const list = db.getStartups();
    return list.map(s => {
      const riskReport = predictStartupRisk(s);
      return { startup: s, riskReport };
    }).filter(item => {
      const matchesSearch = complianceSearch === '' || 
        item.startup.name.toLowerCase().includes(complianceSearch.toLowerCase()) ||
        item.startup.sector.toLowerCase().includes(complianceSearch.toLowerCase()) ||
        item.startup.district.toLowerCase().includes(complianceSearch.toLowerCase());
      
      const matchesRisk = complianceRiskFilter === 'All' || item.riskReport.overallRisk === complianceRiskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [db, complianceSearch, complianceRiskFilter]);

  // Hackathon creator action
  const handleCreateHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizHackTitle || !wizHackStartDate || !wizHackEndDate) {
      alert('Please fill in required fields.');
      return;
    }
    const newHack: Hackathon = {
      id: `hack-${Date.now()}`,
      title: wizHackTitle,
      tagline: wizHackTagline,
      tracks: wizHackTracks.split(',').map(t => t.trim()).filter(Boolean),
      startDate: wizHackStartDate,
      endDate: wizHackEndDate,
      judges: wizSelectedJudges,
      status: 'Active'
    };
    db.addHackathon(newHack);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setWizHackTitle('');
    setWizHackTagline('');
    setWizHackTracks('');
    setWizSelectedJudges([]);
    alert('Hackathon created and published to all startup portals!');
  };

  const toggleSelectJudge = (mentorId: string) => {
    setWizSelectedJudges(prev => 
      prev.includes(mentorId) ? prev.filter(id => id !== mentorId) : [...prev, mentorId]
    );
  };

  // Application process actions
  const handleApproveApplication = (appId: string) => {
    if (!selectedCenterId) {
      alert('Please select an incubation center to assign.');
      return;
    }
    db.approveApplication(appId, selectedCenterId);
    setSelectedApp(null);
    setSelectedCenterId('');
    alert('Application approved! Startup has been admitted to the selected hub.');
  };

  const handleRejectApplication = (appId: string) => {
    if (!rejectionReason) {
      alert('Please provide a reason for rejection.');
      return;
    }
    db.rejectApplication(appId, rejectionReason);
    setSelectedApp(null);
    setRejectionReason('');
    setShowRejectForm(false);
    alert('Application rejected. Founder has been notified with the specified reasons.');
  };

  // Add department
  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptFocus) {
      alert('Please provide name and focus areas.');
      return;
    }
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: newDeptName,
      focusArea: newDeptFocus,
      description: newDeptDesc,
      createdAt: new Date().toISOString()
    };
    db.addDepartment(newDept);
    setNewDeptName('');
    setNewDeptFocus('');
    setNewDeptDesc('');
    setShowAddDept(false);
    alert('New Government Department added to command system!');
  };

  // Add program
  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName || !newProgDept) {
      alert('Please provide name and parent department.');
      return;
    }
    const newProg: Program = {
      id: `prog-${Date.now()}`,
      departmentId: newProgDept,
      name: newProgName,
      description: newProgDesc,
      eligibleStages: newProgStages,
      durationMonths: newProgDuration,
      mentorCount: 0,
      linkedStartupIds: [],
      createdAt: new Date().toISOString()
    };
    db.addProgram(newProg);
    setNewProgName('');
    setNewProgDesc('');
    setNewProgDept('');
    setNewProgStages([]);
    setNewProgDuration(6);
    setShowAddProg(false);
    alert('New Accelerator Program activated for ecological cohorts!');
  };

  // Health weight slider handles
  const handleWeightChange = (key: string, value: number) => {
    setWeights((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const sumOfWeights = useMemo(() => {
    return (
      (weights.progress || 0) + 
      (weights.product || 0) + 
      (weights.team || 0) + 
      (weights.market || 0) + 
      (weights.financial || 0) + 
      (weights.funding || 0) + 
      (weights.mentor || 0) + 
      (weights.documentation || 0) + 
      (weights.risk || 0)
    );
  }, [weights]);

  const isSumValid = sumOfWeights === 100;

  const handleSaveWeights = () => {
    if (!isSumValid) {
      alert('The weights sum must equal exactly 100% before saving.');
      return;
    }
    db.updateHealthWeights(weights);
    confetti({
      particleCount: 80,
      spread: 60,
      colors: ['#10b981', '#3b82f6']
    });
    alert('Venture Health configurations updated successfully! Recalculated health indices statewide.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Banner Title */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                Andhra Pradesh Innovation Command Center
              </h1>
              <p className="text-xs text-slate-550">
                Official executive dashboard for RTIH ecosystem deployment, policy tracking, and prediction models.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-250">
            AP State Admin Active Console
          </span>
        </section>

        {/* AI Executive Briefing Panel (Visible only when Executive Mode is active) */}
        {execActive && (
          <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-800">
                AI State Executive Briefing: Ecosystem Health
              </h3>
            </div>
            <div className="text-xs text-slate-650 leading-relaxed grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10">
                <span className="font-bold text-slate-855">State Scale Ratios:</span>
                <p className="mt-1">Active registered startups sitting at {stats.totalStartups.toLocaleString()} ({(stats.totalStartups/stats.targetStartups*100).toFixed(0)}% of 2029 goals). Jobs created sitting at {stats.totalJobs.toLocaleString()}.</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10">
                <span className="font-bold text-slate-855">Scale Targets Discovery:</span>
                <p className="mt-1">Unicorn potential engine flags {stats.unicorns} candidates with more than 80% growth velocity. Soonicorn targets show {stats.soonicorns} companies.</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10">
                <span className="font-bold text-slate-855">Ecosystem Risk Audit:</span>
                <p className="mt-1">Ecosystem risk indicators sit at Low. We identified runway constraints in AgriTech segments; Seed disbursements linked.</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10">
                <span className="font-bold text-slate-855">CM Policy Recommendations:</span>
                <p className="mt-1">Recommend expanding matching seed fund pools for women-led startups by 15% to accelerate regional district metrics.</p>
              </div>
            </div>
          </section>
        )}

        {/* Two-column layout: Left Sidebar Navigation & Right Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 select-none sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Admin Modules
            </p>
            <div className="flex flex-col gap-1">
              {PRIMARY_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activePrimaryTab === tab.id;
                
                // badge counts
                let count = 0;
                if (tab.id === 'vetting_compliance') {
                  count = db.getApplications().filter(a => a.status === 'Pending').length;
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.defaultSub as any);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all text-left w-full cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm font-black' 
                        : 'bg-transparent border-transparent text-slate-550 hover:bg-slate-100 hover:text-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {count > 0 && (
                      <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-[9px] font-black">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Main Content Panel */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Horizontal Sub-Navigation */}
            <div className="flex gap-2 border-b border-slate-200 pb-3 mb-2 overflow-x-auto whitespace-nowrap">
              {activePrimaryTab === 'analytics_leaderboard' && (
                <>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeTab === 'analytics'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Ecosystem Analytics
                  </button>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeTab === 'leaderboard'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    University Leaderboards
                  </button>
                </>
              )}

              {activePrimaryTab === 'vetting_compliance' && (
                <>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeTab === 'applications'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Startup Applications Queue
                  </button>
                  <button
                    onClick={() => setActiveTab('compliance')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeTab === 'compliance'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Compliance & Audits
                  </button>
                </>
              )}

              {activePrimaryTab === 'departments' && (
                <>
                  <button
                    onClick={() => setActiveTab('departments')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeTab === 'departments'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Departments & Programs
                  </button>
                  <button
                    onClick={() => setActiveTab('configurator')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeTab === 'configurator'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Venture Health Configurator
                  </button>
                </>
              )}
            </div>

            {/* Subtab Content: Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {/* Live Metrics Scorecards */}
                <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Live Startup Count</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      {stats.totalStartups.toLocaleString()}
                    </h3>
                    <p className="text-[8px] text-slate-400 mt-1 leading-none">Goal by 2029: 20,000</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Jobs Created</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      {stats.totalJobs.toLocaleString()}
                    </h3>
                    <p className="text-[8px] text-slate-400 mt-1 leading-none">Goal by 2029: 100,000</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Soonicorn Pipeline</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      {stats.soonicorns}
                    </h3>
                    <p className="text-[8px] text-slate-400 mt-1 leading-none">Goal by 2029: 20+</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Unicorn Track</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      {stats.unicorns}
                    </h3>
                    <p className="text-[8px] text-slate-400 mt-1 leading-none">Goal by 2029: 10+</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center col-span-2 lg:col-span-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">State Seed Disbursed</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">
                      ₹8.42 Cr
                    </h3>
                    <p className="text-[8px] text-slate-400 mt-1 leading-none">0% Interest Equity Grants</p>
                  </div>
                </section>

                {/* Embedded Visual Twin Graph (React Flow) */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-500" />
                      Statewide Digital Twin Topology
                    </h2>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Interactive simulation model</span>
                  </div>
                  <InnovationGraph />
                </section>

                {/* Embedded Pipeline Funnel */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-500" />
                      Incubation Stage Pipeline Funnel
                    </h2>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Ecosystem movement analytics</span>
                  </div>
                  <PipelineFunnel />
                </section>

                {/* Unicorn / Soonicorn Discovery Engine & Projections */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Unicorn Discovery Engine */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-850 mb-1 flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-emerald-500" />
                        Unicorn Potential Discovery
                      </h3>
                      <p className="text-[10px] text-slate-400 mb-4 leading-normal">
                        Ecosystem startups showing highest growth velocity and Unicorn potential scores.
                      </p>

                      <div className="space-y-3">
                        {unicornStartups.map((startup) => (
                          <div
                            key={startup.id}
                            className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex justify-between gap-4"
                          >
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">
                                {startup.name}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{startup.sector} • {startup.district}</p>
                            </div>

                            <div className="text-right shrink-0 flex flex-col justify-center">
                              <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-center min-w-[54px]">
                                <p className="text-[10px] font-bold text-emerald-600 leading-none">
                                  {startup.unicornScore}%
                                </p>
                                <p className="text-[7px] text-slate-400 uppercase mt-0.5 leading-none">Score</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-4 text-[9px] text-slate-400">
                      Score factors include compound revenue velocity and customer net promoter logs.
                    </div>
                  </div>

                  {/* Soonicorn Discovery Engine */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-850 mb-1 flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-emerald-500" />
                        Soonicorn Potential Discovery
                      </h3>
                      <p className="text-[10px] text-slate-400 mb-4 leading-normal">
                        Mid-tier startups scaling to series-A parameters. High priority funding targets.
                      </p>

                      <div className="space-y-3">
                        {soonicornStartups.map((startup) => (
                          <div
                            key={startup.id}
                            className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex justify-between gap-4"
                          >
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">
                                {startup.name}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{startup.sector} • {startup.district}</p>
                            </div>

                            <div className="text-right shrink-0 flex flex-col justify-center">
                              <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded text-center min-w-[54px]">
                                <p className="text-[10px] font-bold text-blue-600 leading-none">
                                  {startup.soonicornScore}%
                                </p>
                                <p className="text-[7px] text-slate-400 uppercase mt-0.5 leading-none">Score</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-4 text-[9px] text-slate-400">
                      Evaluates total addressable market (TAM) sizing logs and MVP feedback parameters.
                    </div>
                  </div>

                  {/* Economic Projections Chart */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-850 mb-4 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        2029 Economic Projections
                      </h3>
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={projectionData}>
                            <XAxis dataKey="year" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px' }}
                              labelStyle={{ color: '#fff', fontSize: '10px' }}
                            />
                            <Area type="monotone" dataKey="funding" stroke="#00A86B" fillOpacity={0.1} fill="#00A86B" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Goal Target: <strong>20k Companies by 2029</strong></span>
                      <span>Projected Grants: <strong>₹250Cr</strong></span>
                    </div>
                  </div>
                </section>

                {/* Policy Impact audits */}
                <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Active Policy Impact Audits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
                    <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <p className="font-bold text-slate-900">Domestic Patent Filings</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">AP IT Policy Subsidies</p>
                      <p className="text-lg font-black text-emerald-600 mt-2">124 Patents</p>
                      <p className="text-[9px] text-slate-400 mt-1">100% filing fee reimbursement completed.</p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <p className="font-bold text-slate-900">Women Entrepreneur Quota</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Standup AP Mandates</p>
                      <p className="text-lg font-black text-blue-600 mt-2">28.2% Active</p>
                      <p className="text-[9px] text-slate-400 mt-1">Target quota: 30% female equity threshold.</p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <p className="font-bold text-slate-900">Rythu Linkage Integrations</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Dept of Agriculture pilots</p>
                      <p className="text-lg font-black text-purple-600 mt-2">45 Pilots</p>
                      <p className="text-[9px] text-slate-400 mt-1">AgriTech startups linked to RBK centers.</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Subtab Content: Leaderboard */}
            {activeTab === 'leaderboard' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                    University Innovation Cell Rankings
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Statewide academic cells ranked by student startup creation, incubation volume, and cell health maturity.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase text-slate-450 tracking-wider">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">University</th>
                        <th className="py-3 px-4">District</th>
                        <th className="py-3 px-4">Innovation Cell</th>
                        <th className="py-3 px-4 text-center">Startups</th>
                        <th className="py-3 px-4 text-center">Student Founders</th>
                        <th className="py-3 px-4 text-right">Maturity Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {universitiesList.map((univ, index) => {
                        const rank = index + 1;
                        let rankStyle = "text-slate-500";
                        if (rank === 1) rankStyle = "text-amber-500 font-bold bg-amber-50 rounded-full px-2 py-0.5";
                        else if (rank === 2) rankStyle = "text-slate-400 font-bold bg-slate-50 rounded-full px-2 py-0.5";
                        else if (rank === 3) rankStyle = "text-amber-700 font-bold bg-amber-50/50 rounded-full px-2 py-0.5";

                        return (
                          <tr key={univ.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-bold">
                              <span className={rankStyle}>#{rank}</span>
                            </td>
                            <td className="py-4 px-4 font-semibold text-slate-900">{univ.name}</td>
                            <td className="py-4 px-4 text-slate-500">{univ.district}</td>
                            <td className="py-4 px-4 font-medium text-slate-600">{univ.innovationCell}</td>
                            <td className="py-4 px-4 text-center font-bold text-slate-700">{univ.startupsCount}</td>
                            <td className="py-4 px-4 text-center font-semibold text-slate-500">{univ.foundersCount}</td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                  <div 
                                    className={`h-full rounded-full ${
                                      univ.innovationScore >= 75 ? 'bg-emerald-500' : univ.innovationScore >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${univ.innovationScore}%` }}
                                  />
                                </div>
                                <span className={`font-bold rounded-lg px-2 py-0.5 ${
                                  univ.innovationScore >= 75 ? 'bg-emerald-50 text-emerald-700' : univ.innovationScore >= 50 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {univ.innovationScore}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Subtab Content: Hackathons */}
            {activeTab === 'hackathons' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Hackathon Creator form */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <PlusSquare className="w-5 h-5 text-emerald-500" />
                      Design New Ecosystem Ideathon
                    </h3>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      Schedule smart hackathons to filter student innovation pipelines.
                    </p>
                  </div>

                  <form onSubmit={handleCreateHackathon} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Ideathon Title *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. AP AgriTech Smart Farming 2026"
                        value={wizHackTitle}
                        onChange={(e) => setWizHackTitle(e.target.value)}
                        className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Slogan / Tagline</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Innovating the field, empowering the farmer"
                        value={wizHackTagline}
                        onChange={(e) => setWizHackTagline(e.target.value)}
                        className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Focus Sectors / Tracks (Comma-separated) *</label>
                      <input 
                        type="text" 
                        placeholder="AgriTech, IoT, Clean Energy"
                        value={wizHackTracks}
                        onChange={(e) => setWizHackTracks(e.target.value)}
                        className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Start Date *</label>
                        <input 
                          type="date" 
                          required
                          value={wizHackStartDate}
                          onChange={(e) => setWizHackStartDate(e.target.value)}
                          className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">End Date *</label>
                        <input 
                          type="date" 
                          required
                          value={wizHackEndDate}
                          onChange={(e) => setWizHackEndDate(e.target.value)}
                          className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                        />
                      </div>
                    </div>

                    {/* Judges selector */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 block">Select Panel Judges (Mentors)</label>
                      <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto p-2 bg-slate-50 space-y-1">
                        {mentorsList.map(mentor => {
                          const isSelected = wizSelectedJudges.includes(mentor.id);
                          return (
                            <button
                              key={mentor.id}
                              type="button"
                              onClick={() => toggleSelectJudge(mentor.id)}
                              className="w-full text-left flex items-center justify-between p-1.5 rounded hover:bg-slate-200/50 text-[11px] font-semibold text-slate-700 cursor-pointer"
                            >
                              <span>{mentor.name} ({mentor.expertise[0]})</span>
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Open Hackathon to Startups
                    </button>
                  </form>
                </div>

                {/* Existing Hackathons */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Trophy className="w-5 h-5 text-purple-650" />
                      Ecosystem Hackathons Registry
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      List of all registered programs running across Andhra Pradesh spokes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {hackathonsList.map(hack => {
                      const registrations = db.getRegistrations();
                      const regCount = registrations.filter(r => r.hackathonId === hack.id).length;
                      
                      const submissions = db.getSubmissions();
                      const subCount = submissions.filter(s => s.hackathonId === hack.id).length;

                      return (
                        <div key={hack.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">{hack.title}</h4>
                              <p className="text-[10px] text-slate-450 italic mt-0.5">&ldquo;{hack.tagline}&rdquo;</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              hack.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {hack.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                            <div className="bg-white p-2 rounded-lg border border-slate-200/50">
                              <span className="text-slate-400 block uppercase font-bold text-[8px]">Start Date</span>
                              <span className="font-semibold text-slate-700">{hack.startDate}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200/50">
                              <span className="text-slate-400 block uppercase font-bold text-[8px]">End Date</span>
                              <span className="font-semibold text-slate-700">{hack.endDate}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200/50">
                              <span className="text-slate-400 block uppercase font-bold text-[8px]">Registrations</span>
                              <span className="font-bold text-slate-900 text-xs">{regCount} Startups</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200/50">
                              <span className="text-slate-400 block uppercase font-bold text-[8px]">Submissions</span>
                              <span className="font-bold text-slate-900 text-xs">{subCount} Projects</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {hack.tracks.map((track, i) => (
                              <span key={i} className="bg-slate-200/60 text-slate-650 px-2 py-0.5 rounded text-[9px] font-bold">
                                {track}
                              </span>
                            ))}
                          </div>

                          <div className="border-t border-slate-200/60 pt-2 flex items-center justify-between text-[9px] text-slate-400">
                            <span>Judges Assigned: <strong>{hack.judges.length}</strong></span>
                            <span>Official Committee Sandbox Vetted</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Subtab Content: Startup Applications Queue */}
            {activeTab === 'applications' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      <ListTodo className="w-5 h-5 text-emerald-500" />
                      Incubation Admission Applications Queue
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Review, verify, and route applicant startups into regional AP Outposts and accelerator hubs.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(['Pending', 'Approved', 'Rejected', 'All'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setAppStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black uppercase cursor-pointer ${
                          appStatusFilter === status
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter and Search Box */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search application queue by founder, startup title, sector, district..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="w-full border border-slate-250 rounded-lg pl-9 pr-4 py-2 bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Table of applications */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase text-slate-450 tracking-wider">
                        <th className="py-3 px-4">Startup</th>
                        <th className="py-3 px-4">Founder</th>
                        <th className="py-3 px-4">Sector</th>
                        <th className="py-3 px-4">District</th>
                        <th className="py-3 px-4">Submitted At</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApps.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 px-4 text-center text-slate-400 italic">No applications found in this queue state.</td>
                        </tr>
                      ) : (
                        filteredApps.map(app => (
                          <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-900">{app.startupName}</td>
                            <td className="py-4 px-4 font-medium text-slate-600">{app.founderName}</td>
                            <td className="py-4 px-4">
                              <span className="bg-slate-200/50 text-slate-650 px-2 py-0.5 rounded font-semibold text-[10px]">
                                {app.sector}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-500">{app.district}</td>
                            <td className="py-4 px-4 text-slate-400">{new Date(app.submittedAt).toLocaleDateString()}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                app.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-[10px] flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> View & Process
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Subtab Content: Compliance & Auditing */}
            {activeTab === 'compliance' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Statewide Compliance & Risk Audit Dashboard
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Continuous monitoring of startup financial health, team stability, co-founder alignment, and documentation checklists.
                  </p>
                </div>

                {/* Filter and Search Box */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search startups by name, sector, district..."
                      value={complianceSearch}
                      onChange={(e) => setComplianceSearch(e.target.value)}
                      className="w-full border border-slate-250 rounded-lg pl-9 pr-4 py-2 bg-white text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(['All', 'High', 'Medium', 'Low'] as const).map(risk => (
                      <button
                        key={risk}
                        onClick={() => setComplianceRiskFilter(risk)}
                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black uppercase cursor-pointer ${
                          complianceRiskFilter === risk
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {risk} Risk
                      </button>
                    ))}
                  </div>
                </div>

                {/* List of compliance targets */}
                <div className="space-y-4">
                  {complianceStartups.length === 0 ? (
                    <p className="text-center py-8 text-slate-400 italic text-xs">No startups match the compliance parameters.</p>
                  ) : (
                    complianceStartups.map(({ startup, riskReport }) => (
                      <div key={startup.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <img src={startup.logo} alt="logo" className="w-9 h-9 rounded-lg border border-slate-200 bg-white" />
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">{startup.name}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">{startup.sector} • {startup.district} • Phase: <span className="uppercase font-bold text-slate-550">{startup.stage}</span></p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-center px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                              <span className="text-[8px] font-black text-slate-400 block uppercase">Health Score</span>
                              <span className={`text-xs font-black ${
                                startup.healthScore >= 75 ? 'text-emerald-600' : startup.healthScore >= 60 ? 'text-blue-600' : 'text-red-500'
                              }`}>{startup.healthScore}%</span>
                            </div>

                            <div className={`text-center px-3 py-1 border rounded-lg ${riskReport.color}`}>
                              <span className="text-[8px] font-black block uppercase opacity-75">Risk Classification</span>
                              <span className="text-xs font-black">{riskReport.overallRisk}</span>
                            </div>
                          </div>
                        </div>

                        {/* Detailed indicators list */}
                        <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-3 text-[11px] space-y-2">
                          <span className="text-[8.5px] font-black text-slate-400 block uppercase tracking-wider">Active Risk Telemetry Indicators</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {riskReport.indicators.map((ind, i) => (
                              <div key={i} className="space-y-0.5 bg-white p-2.5 rounded border border-slate-200/50">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-800">{ind.title}</span>
                                  <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase ${
                                    ind.risk === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    ind.risk === 'Medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                    'bg-emerald-50 text-emerald-700 border border-emerald-250'
                                  }`}>{ind.risk}</span>
                                </div>
                                <p className="text-[10px] text-slate-450 leading-relaxed font-medium">{ind.detail}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommended action list */}
                        {riskReport.recommendations.length > 0 && (
                          <div className="flex items-start gap-2 text-[10.5px] text-red-800 bg-red-50/50 border border-red-100 rounded-lg p-2.5">
                            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Required Administrative Intervention Plan:</span>
                              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                {riskReport.recommendations.map((rec, i) => (
                                  <li key={i} className="font-medium">{rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Subtab Content: Departments & Programs */}
            {activeTab === 'departments' && (
              <div className="space-y-8">
                {/* Admin forms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Department Form */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-5 h-5 text-emerald-500" />
                          Add Government Department
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Create a sector-linked administrative department.</p>
                      </div>
                      <button 
                        onClick={() => setShowAddDept(!showAddDept)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold cursor-pointer"
                      >
                        {showAddDept ? 'Hide Form' : 'Show Form'}
                      </button>
                    </div>

                    {showAddDept && (
                      <form onSubmit={handleAddDepartment} className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-650">Department Name *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Dept of Biotechnology & Life Sciences"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                            className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-655">Focus Area Sectors *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Healthcare, Biotech"
                            value={newDeptFocus}
                            onChange={(e) => setNewDeptFocus(e.target.value)}
                            className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-655">Focus Description</label>
                          <textarea 
                            rows={3}
                            placeholder="State focus and funding capabilities details."
                            value={newDeptDesc}
                            onChange={(e) => setNewDeptDesc(e.target.value)}
                            className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                          />
                        </div>
                        <button 
                          type="submit"
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Register Department
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Program Form */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Layers className="w-5 h-5 text-emerald-500" />
                          Launch Accelerator Program
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Activate a structured program linked to a department.</p>
                      </div>
                      <button 
                        onClick={() => setShowAddProg(!showAddProg)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold cursor-pointer"
                      >
                        {showAddProg ? 'Hide Form' : 'Show Form'}
                      </button>
                    </div>

                    {showAddProg && (
                      <form onSubmit={handleAddProgram} className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-655">Program Name *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Bio-Design Scale Program"
                            value={newProgName}
                            onChange={(e) => setNewProgName(e.target.value)}
                            className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-655">Linked Department *</label>
                          <select 
                            required
                            value={newProgDept}
                            onChange={(e) => setNewProgDept(e.target.value)}
                            className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                          >
                            <option value="">Select Department...</option>
                            {db.getDepartments().map(dept => (
                              <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-655">Duration (Months) *</label>
                            <input 
                              type="number" 
                              required
                              min={1}
                              max={36}
                              value={newProgDuration}
                              onChange={(e) => setNewProgDuration(parseInt(e.target.value))}
                              className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-slate-655">Eligible stages (check all)</label>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {['idea', 'validation', 'prototype', 'mvp', 'users', 'revenue', 'funding', 'scale'].map(st => {
                                const isChecked = newProgStages.includes(st);
                                return (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => {
                                      setNewProgStages(prev => prev.includes(st) ? prev.filter(x => x !== st) : [...prev, st]);
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold cursor-pointer border ${
                                      isChecked ? 'bg-slate-700 text-white border-slate-700' : 'bg-white border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-655">Description</label>
                          <textarea 
                            rows={3}
                            placeholder="Write programmatic benefits and resources detailed outline."
                            value={newProgDesc}
                            onChange={(e) => setNewProgDesc(e.target.value)}
                            className="w-full border border-slate-250 rounded-lg p-2 bg-white"
                          />
                        </div>
                        <button 
                          type="submit"
                          className="w-full py-2 bg-emerald-50 hover:bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Launch Program
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Departments list */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      <Landmark className="w-5 h-5 text-emerald-500" />
                      Active Government Departments Registry
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Ecosystem-linked sectors and accelerator programs operated by the AP Government.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {db.getDepartments().map(dept => {
                      const deptProgs = db.getProgramsByDept(dept.id);
                      return (
                        <div key={dept.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-all space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">Focus: <span className="font-bold text-slate-600">{dept.focusArea}</span></p>
                            </div>
                            <span className="text-[9.5px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                              Registered: {new Date(dept.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-xs text-slate-550 leading-relaxed font-medium">{dept.description}</p>

                          <div className="space-y-2.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Programs Under Department ({deptProgs.length})</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {deptProgs.map(prog => (
                                <div key={prog.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 hover:bg-slate-100/60 transition-colors">
                                  <div className="flex justify-between items-start gap-3">
                                    <h5 className="font-bold text-slate-800 text-[11.5px]">{prog.name}</h5>
                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded shrink-0">{prog.durationMonths} Months</span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-450 leading-normal font-medium">{prog.description}</p>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9px] font-semibold text-slate-400 pt-1.5 border-t border-slate-200/60">
                                    <span className="text-slate-600 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">🚀 {prog.linkedStartupIds?.length || 0} Cohort Startups</span>
                                    <span>•</span>
                                    <span className="uppercase">Stages: {prog.eligibleStages.join(', ')}</span>
                                  </div>
                                </div>
                              ))}
                              {deptProgs.length === 0 && (
                                <p className="text-[10px] text-slate-400 italic">No programs currently configured under this department.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Subtab Content: Venture Health Weights Configurator */}
            {activeTab === 'configurator' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      <Activity className="w-5 h-5 text-emerald-500" />
                      Venture Health Metric Weightings Configurator
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Adjust weights dynamically for the 9 core indicators of Venture Health. Modifications recalculate ecosystem health scores statewide.
                    </p>
                  </div>

                  {/* Validation Banner */}
                  <div className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-4 font-semibold ${
                    isSumValid 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{isSumValid ? '✅' : '⚠️'}</span>
                      <div>
                        <strong className="block text-[12.5px] font-black">{isSumValid ? 'Weights Sum is Valid' : 'Invalid Weights Sum'}</strong>
                        <p className="font-semibold text-slate-500 text-[10.5px] mt-0.5">
                          {isSumValid 
                            ? 'The indicators sum to exactly 100%. Saving changes will propagate score changes to all startups.' 
                            : `The indicators sum to ${sumOfWeights}%. They must sum to exactly 100% in order to save configuration.`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <button
                      disabled={!isSumValid}
                      onClick={handleSaveWeights}
                      className={`px-4 py-2 font-bold rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer ${
                        isSumValid 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed border-none'
                      }`}
                    >
                      Save Configuration
                    </button>
                  </div>

                  {/* Sliders Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs font-semibold text-slate-650">
                    {/* Slider 1: progress */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11.5px] font-black text-slate-800">Business Progress (GPS)</label>
                        <span className="bg-slate-200/60 px-2 py-0.5 rounded font-black text-slate-700">{weights.progress || 0}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={weights.progress || 0}
                        onChange={(e) => handleWeightChange('progress', parseInt(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium block leading-normal">Evaluates startup progression status through YC-grade stage checklists.</span>
                    </div>

                    {/* Slider 2: product */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11.5px] font-black text-slate-800">Product Development</label>
                        <span className="bg-slate-200/60 px-2 py-0.5 rounded font-black text-slate-700">{weights.product || 0}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={weights.product || 0}
                        onChange={(e) => handleWeightChange('product', parseInt(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium block leading-normal">Measures prototype deployment, technical milestones, and roadmap completion.</span>
                    </div>

                    {/* Slider 3: team */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11.5px] font-black text-slate-800">Team Strength</label>
                        <span className="bg-slate-200/60 px-2 py-0.5 rounded font-black text-slate-700">{weights.team || 0}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={weights.team || 0}
                        onChange={(e) => handleWeightChange('team', parseInt(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium block leading-normal">Checks recruitment activity, co-founder balance, and total jobs created.</span>
                    </div>

                    {/* Slider 4: market */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11.5px] font-black text-slate-800">Market Validation</label>
                        <span className="bg-slate-200/60 px-2 py-0.5 rounded font-black text-slate-700">{weights.market || 0}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={weights.market || 0}
                        onChange={(e) => handleWeightChange('market', parseInt(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium block leading-normal">Aggregates user surveys, customer acquisition counts, and NPS validation logs.</span>
                    </div>

                    {/* Slider 5: financial */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11.5px] font-black text-slate-800">Financial Readiness</label>
                        <span className="bg-slate-200/60 px-2 py-0.5 rounded font-black text-slate-700">{weights.financial || 0}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={weights.financial || 0}
                        onChange={(e) => handleWeightChange('financial', parseInt(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium block leading-normal">Audits active cash flow, monthly recurring revenue, and unit economics margins.</span>
                    </div>

                    {/* Slider 6: funding */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11.5px] font-black text-slate-800">Funding Readiness</label>
                        <span className="bg-slate-200/60 px-2 py-0.5 rounded font-black text-slate-700">{weights.funding || 0}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={weights.funding || 0}
                        onChange={(e) => handleWeightChange('funding', parseInt(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium block leading-normal">Weights external capital raised and eligibility matching for AP grants.</span>
                    </div>

                    {/* Slider 7: mentor */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11.5px] font-black text-slate-800">Mentor Engagement</label>
                        <span className="bg-slate-200/60 px-2 py-0.5 rounded font-black text-slate-700">{weights.mentor || 0}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={weights.mentor || 0}
                        onChange={(e) => handleWeightChange('mentor', parseInt(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium block leading-normal">Measures mentor review session frequencies, task completions, and review rates.</span>
                    </div>

                    {/* Slider 8: documentation */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11.5px] font-black text-slate-800">Documentation Completions</label>
                        <span className="bg-slate-200/60 px-2 py-0.5 rounded font-black text-slate-700">{weights.documentation || 0}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={weights.documentation || 0}
                        onChange={(e) => handleWeightChange('documentation', parseInt(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium block leading-normal">Evaluates presence of pitch deck, company incorporation, and financial reports.</span>
                    </div>

                    {/* Slider 9: risk */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11.5px] font-black text-slate-800">Risk Mitigation Score</label>
                        <span className="bg-slate-200/60 px-2 py-0.5 rounded font-black text-slate-700">{weights.risk || 0}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={weights.risk || 0}
                        onChange={(e) => handleWeightChange('risk', parseInt(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium block leading-normal">Negative penalty metrics linked to critical alerts and high attrition profiles.</span>
                    </div>
                  </div>
                </div>

                {/* Program stats section */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-5 h-5 text-emerald-500" />
                      Ecosystem Programs Average Performance
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Aggregated startup health performance metrics grouped by accelerator program.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {db.getPrograms().map(prog => {
                      const linkedStartups = db.getStartups().filter(s => prog.linkedStartupIds.includes(s.id));
                      const averageHealth = linkedStartups.length 
                        ? Math.round(linkedStartups.reduce((sum, s) => sum + s.healthScore, 0) / linkedStartups.length) 
                        : 0;

                      return (
                        <div key={prog.id} className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">{prog.name}</h4>
                              <p className="text-[9.5px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Linked startups: {prog.linkedStartupIds.length}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                              averageHealth >= 75 ? 'bg-emerald-50 text-emerald-700' :
                              averageHealth >= 60 ? 'bg-blue-50 text-blue-700' :
                              'bg-red-50 text-red-700'
                            }`}>{averageHealth}% Avg Health</span>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  averageHealth >= 75 ? 'bg-emerald-500' :
                                  averageHealth >= 60 ? 'bg-blue-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${averageHealth}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                              <span>0%</span>
                              <span>Target Threshold: 60%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Modal Dialog for Application Vetting */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Startup Incubation Admission Desk</span>
                <h3 className="text-base font-black text-slate-900">Process Admission: {selectedApp.startupName}</h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedApp(null);
                  setShowRejectForm(false);
                  setRejectionReason('');
                  setSelectedCenterId('');
                }} 
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-700 text-xs font-semibold">
              {/* Left Column: Founder Details */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase text-slate-400 font-bold border-b border-slate-100 pb-1.5 tracking-wider">Founder Profile Info</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Founder Name</span>
                    <span className="text-slate-900 text-xs">{selectedApp.founderName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Email Address</span>
                    <span className="text-slate-900 text-xs">{selectedApp.email}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                    <span className="text-slate-900 text-xs">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Origin District</span>
                    <span className="text-slate-900 text-xs">{selectedApp.district}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Founder Academic Background & Education</span>
                  <p className="text-slate-700 font-medium text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 mt-1">
                    {selectedApp.education} <br />
                    <span className="text-[10px] text-slate-500 font-normal">{selectedApp.background}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Active Team Size</span>
                    <span className="text-slate-900 text-xs">{selectedApp.teamSize} Members</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Co-Founders Registry</span>
                    <span className="text-slate-900 text-xs">{selectedApp.coFounders || 'Solo Founder'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Project Pitch */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase text-slate-400 font-bold border-b border-slate-100 pb-1.5 tracking-wider">Startup Concept & Pitch</h4>
                
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Startup Title & Slogan</span>
                  <span className="text-slate-900 text-xs font-black block mt-0.5">{selectedApp.startupName}</span>
                  <p className="text-[11px] text-slate-500 italic mt-0.5 font-medium">&ldquo;{selectedApp.tagline}&rdquo;</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Target Sector</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px] inline-block mt-0.5">{selectedApp.sector}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Current Maturity Stage</span>
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px] inline-block mt-0.5 uppercase">{selectedApp.stage}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Core Problem Statement</span>
                    <p className="text-slate-700 font-medium text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 mt-1">{selectedApp.problemStatement}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Proposed Solution Architecture</span>
                    <p className="text-slate-700 font-medium text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 mt-1">{selectedApp.solution}</p>
                  </div>
                </div>

                {/* Document attachments */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Applicant Document Attachments</span>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {selectedApp.pitchDeckUrl && (
                      <a 
                        href={selectedApp.pitchDeckUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg font-bold"
                      >
                        <FileText className="w-3.5 h-3.5" /> Pitch Deck
                      </a>
                    )}
                    {selectedApp.businessPlanUrl && (
                      <a 
                        href={selectedApp.businessPlanUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg font-bold"
                      >
                        <FileText className="w-3.5 h-3.5" /> Business Plan
                      </a>
                    )}
                    {selectedApp.prototypeUrl && (
                      <a 
                        href={selectedApp.prototypeUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg font-bold"
                      >
                        <Link className="w-3.5 h-3.5" /> Prototype Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col gap-4">
              {selectedApp.status === 'Pending' ? (
                <>
                  {!showRejectForm ? (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      {/* Hub approval section */}
                      <div className="flex items-center gap-3 w-full sm:w-auto text-xs font-semibold">
                        <label className="text-slate-600 whitespace-nowrap">Route to Hub: *</label>
                        <select
                          value={selectedCenterId}
                          onChange={(e) => setSelectedCenterId(e.target.value)}
                          className="border border-slate-350 rounded-lg p-2 bg-white text-xs max-w-xs"
                        >
                          <option value="">Select Incubation Center...</option>
                          {db.getIncubationCenters().map(center => (
                            <option key={center.id} value={center.id}>{center.name} ({center.location})</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleApproveApplication(selectedApp.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          Approve Admission
                        </button>
                      </div>

                      {/* Reject button trigger */}
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-lg text-xs cursor-pointer w-full sm:w-auto text-center"
                      >
                        Reject Application
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-red-800">Specify Rejection Reason / Improvement Feedback *</label>
                        <textarea
                          rows={2}
                          placeholder="Provide detailed improvement guidelines for the applicant to resubmit."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full border border-red-200 rounded-lg p-2 bg-white text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectionReason('');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectApplication(selectedApp.id)}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-750 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>
                    Status: <span className={`uppercase ${
                      selectedApp.status === 'Approved' ? 'text-emerald-700 font-black' : 'text-red-700 font-black'
                    }`}>{selectedApp.status}</span>
                  </span>
                  {selectedApp.status === 'Approved' && selectedApp.assignedCenterId && (
                    <span>Assigned Hub: <strong className="text-slate-800">{db.getIncubationCenter(selectedApp.assignedCenterId)?.name}</strong></span>
                  )}
                  {selectedApp.status === 'Rejected' && selectedApp.rejectionReason && (
                    <span className="italic font-medium text-slate-450">Feedback: &ldquo;{selectedApp.rejectionReason}&rdquo;</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gov footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-450 mt-10">
        <p className="font-medium text-slate-650 text-center">
          Andhra Pradesh Innovation Command Center • RTIH
        </p>
        <p className="mt-2 text-[10px] text-center">
          Secure executive telemetry access. Compiled in accordance with AP Startup Policy guidelines.
        </p>
      </footer>
    </div>
  );
}
