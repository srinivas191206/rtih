'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { getDb, Startup, StartupStage, isExecutiveModeActive, isDemoModeActive, getActiveUser, setActiveUser } from '@/lib/mockDb';
import { calculateVentureHealth, matchGovernmentSchemes, predictStartupRisk, GPS_STAGES } from '@/lib/engines';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Target, 
  Activity, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Circle, 
  Award, 
  AlertTriangle, 
  Coins, 
  Sparkle,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Network,
  ClipboardList,
  CheckSquare,
  Lock,
  Download,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Mock Courses for LMM matching LMM Problem Statement
const LMM_COURSES = [
  {
    stage: 'idea',
    title: 'Customer Discovery & Problem Validation',
    desc: 'Master the art of interviewing potential customers without introducing bias.',
    duration: '2.5 hrs',
    lessons: 6,
    skills: ['Market Research', 'Customer Discovery']
  },
  {
    stage: 'idea',
    title: 'Problem-Solution Fit Frameworks',
    desc: 'Map customer pain points directly to your core technology value proposition.',
    duration: '1.8 hrs',
    lessons: 4,
    skills: ['Value Prop Design', 'Product Scoping']
  },
  {
    stage: 'validation',
    title: 'Rapid Prototyping & No-Code Scoping',
    desc: 'Build functional validation tests without writing production-grade code.',
    duration: '3.2 hrs',
    lessons: 8,
    skills: ['Prototyping', 'Validation Testing']
  },
  {
    stage: 'prototype',
    title: 'Agile Product Architecture for AP Scale',
    desc: 'Structure your technology stack for performance and modular scalability.',
    duration: '4.0 hrs',
    lessons: 10,
    skills: ['Tech Architecture', 'Agile Delivery']
  },
  {
    stage: 'mvp',
    title: 'Unit Economics & Pricing Strategies',
    desc: 'Calculate LTV, CAC, payback periods, and build custom pricing matrices.',
    duration: '2.8 hrs',
    lessons: 5,
    skills: ['Financial Modeling', 'Unit Economics']
  },
  {
    stage: 'users',
    title: 'Retention Metrics & Cohort Analytics',
    desc: 'Analyze user cohort retention grids and optimize activation funnels.',
    duration: '3.5 hrs',
    lessons: 7,
    skills: ['Cohort Retention', 'Product Analytics']
  },
  {
    stage: 'revenue',
    title: 'B2B Sales Playbooks & Corporate Pitching',
    desc: 'Close corporate pilots and structure proof-of-concept (PoC) agreements.',
    duration: '4.5 hrs',
    lessons: 9,
    skills: ['B2B Sales', 'Enterprise GTM']
  },
  {
    stage: 'funding',
    title: 'Cap Table Mechanics & Venture Capital Term Sheets',
    desc: 'Deconstruct valuation, dilution, liquidation preferences, and investor terms.',
    duration: '3.8 hrs',
    lessons: 8,
    skills: ['Cap Table Modeling', 'Fundraising Strategy']
  }
];

export default function FounderDashboard() {
  const router = useRouter();
  const [selectedStartupId, setSelectedStartupId] = useState<string>('startup-1');
  const [db, setDb] = useState(() => getDb());
  const [execActive, setExecActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Tab states to resolve overlapping issues
  const [activeTab, setActiveTab] = useState<'overview' | 'lmm' | 'copilot' | 'linkages' | 'traction'>('overview');

  // AI Copilot states
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAiLive, setIsAiLive] = useState(false);
  const [aiProvider, setAiProvider] = useState('Checking...');

  // LMM states
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Market Research']);
  const [completedCourses, setCompletedCourses] = useState<string[]>(['Customer Discovery & Problem Validation']);

  // Log states
  const [customerInterviewName, setCustomerInterviewName] = useState('');
  const [customerInterviewNotes, setCustomerInterviewNotes] = useState('');
  const [pitchScore, setPitchScore] = useState<number | null>(null);
  const [pitchFeedback, setPitchFeedback] = useState<string[]>([]);

  // Synchronize database updates, Demo Mode, and Executive Mode changes
  const syncStates = () => {
    const activeDb = getDb();
    setDb(activeDb);
    setExecActive(isExecutiveModeActive());
  };

  // Login check and context lock
  useEffect(() => {
    const user = getActiveUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'founder' && user.role !== 'admin' && user.role !== 'manager') {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    if (user.role === 'founder' && user.startupId) {
      setSelectedStartupId(user.startupId);
    }

    // Fetch AI Status
    fetch('/api/ai/copilot')
      .then(res => res.json())
      .then(data => {
        setIsAiLive(data.isLive);
        setAiProvider(data.provider);
      })
      .catch(err => {
        console.error('Failed to load AI status:', err);
        setIsAiLive(false);
        setAiProvider('Sandbox Fallback');
      });
  }, []);

  useEffect(() => {
    syncStates();
    
    // Set initial custom chat intro based on startup context
    const initialStartup = getDb().getStartup(selectedStartupId) || getDb().getStartups()[0];
    setChatHistory([
      { 
        sender: 'ai', 
        text: `Welcome to the RTIH AI Founder Coach. I have analyzed your venture context for "${initialStartup.name}". Ask me: "What are my next GPS requirements?", "Help me draft seed funding requests", or "Create due-diligence plans".` 
      }
    ]);

    window.addEventListener('rtih_mode_change', syncStates);
    return () => {
      window.removeEventListener('rtih_mode_change', syncStates);
    };
  }, [selectedStartupId]);


  const startup = useMemo(() => {
    return db.getStartup(selectedStartupId) || db.getStartups()[0];
  }, [db, selectedStartupId]);

  const health = useMemo(() => {
    if (!startup) return null;
    return calculateVentureHealth(startup);
  }, [startup]);

  const schemes = useMemo(() => {
    if (!startup) return [];
    return matchGovernmentSchemes(startup);
  }, [startup]);

  const riskReport = useMemo(() => {
    if (!startup) return null;
    return predictStartupRisk(startup);
  }, [startup]);

  // Handle GPS Stage advance
  const handleStageSelect = (stage: StartupStage) => {
    const updated = getDb().updateStartup(startup.id, { stage });
    if (updated) {
      getDb().reseed(isDemoModeActive()); // preserve active mode seed
      syncStates();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 }
      });
    }
  };

  // Toggle OKR
  const handleToggleMilestone = (milestoneId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    getDb().updateMilestone(startup.id, milestoneId, nextStatus);
    getDb().reseed(isDemoModeActive());
    syncStates();
    if (nextStatus === 'Completed') {
      confetti({
        particleCount: 40,
        spread: 30,
        colors: ['#00A86B', '#3A86C8']
      });
    }
  };

  // Toggle Skill
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Complete course module
  const completeCourse = (title: string) => {
    if (!completedCourses.includes(title)) {
      setCompletedCourses(prev => [...prev, title]);
      confetti({
        particleCount: 30,
        colors: ['#00A86B']
      });
    }
  };

  // Calculate diagnostic progress
  const diagnosticScore = useMemo(() => {
    const totalSkills = 8;
    return Math.floor((selectedSkills.length / totalSkills) * 100);
  }, [selectedSkills]);

  // Chat Submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          startupContext: startup,
          role: 'Founder'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { sender: 'ai', text: data.text }]);
        if (data.provider) {
          setIsAiLive(data.isLive);
          setAiProvider(data.provider);
        }
      } else {
        throw new Error('API return code ' + response.status);
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error communicating with the AI gateway.' }]);
    } finally {
      setIsTyping(false);
    }
  };


  // Log Customer Interview
  const handleLogInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInterviewName || !customerInterviewNotes) return;

    alert(`Customer interview with "${customerInterviewName}" logged to research database. Traction and PMF scores recalculated!`);
    setCustomerInterviewName('');
    setCustomerInterviewNotes('');
    
    // Increment traction score
    const updatedTraction = Math.min(100, startup.healthBreakdown.traction + 5);
    getDb().updateStartup(startup.id, {
      healthBreakdown: {
        ...startup.healthBreakdown,
        traction: updatedTraction
      }
    });
    getDb().reseed(isDemoModeActive());
    syncStates();
  };

  // Pitch Deck Reviewer
  const handlePitchReview = (e: any) => {
    e.preventDefault();
    setPitchScore(null);
    setPitchFeedback([]);

    setTimeout(() => {
      setPitchScore(86);
      setPitchFeedback([
        'TAM/SAM/SOM calculations are well-structured and reflect actual AP segments.',
        'Improve competitive grid by highlighting direct linkages to RTIH outposts.',
        'Financial slide requires detailed CAC breakdown and 12-month projections.',
        'Clearly declare compliance certifications for state IT subsidies.'
      ]);
      confetti({
        particleCount: 50,
        colors: ['#00A86B']
      });
    }, 1000);
  };

  const handleCertificateDownload = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    alert(`Certificate generated: "RTIH Capacity Building Validation - ${startup.stage.toUpperCase()} Stage" successfully downloaded.`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Console */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-500" />
              Startup Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Manage your onboarding diagnostics, structured learning paths, milestones, AI coaching, and ecosystem grants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Active Company Context:</span>
                <select
                  value={selectedStartupId}
                  onChange={(e) => setSelectedStartupId(e.target.value)}
                  className="text-xs font-semibold rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 focus:outline-none cursor-pointer"
                >
                  {db.getStartups().map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                <span>Cohort: {startup?.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Executive Briefing Panel (Visible only when Executive Mode is active) */}
        {execActive && (
          <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-800">
                AI Executive Briefing: {startup.name} Status
              </h3>
            </div>
            <div className="text-xs text-slate-650 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10 shadow-sm">
                <span className="font-bold text-slate-800">Ecosystem Highlight:</span>
                <p className="mt-1">Incubated in {startup.district}. GPS stage sits at **{startup.stage.toUpperCase()}**. Compound user velocity shows positive projections.</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10 shadow-sm">
                <span className="font-bold text-slate-800">Mitigation Audit:</span>
                <p className="mt-1">Runway index indicates **{riskReport?.overallRisk} Risk**. Recommending immediate filing of the `{schemes[0]?.name || 'RTIH Seed grant'}` application.</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10 shadow-sm">
                <span className="font-bold text-slate-800">Recommended EIR Steps:</span>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>Advance validation customer count</li>
                  <li>Schedule review with outpatient cells</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Navigation Tabs (Premium Organization to avoid overlapping) */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-sm overflow-x-auto select-none">
          {(
            [
              { id: 'overview', label: 'Venture Dashboard', icon: Activity },
              { id: 'lmm', label: 'Learning & Onboarding (LMM)', icon: BookOpen },
              { id: 'copilot', label: 'AI Startup Coach', icon: Bot },
              { id: 'linkages', label: 'Ecosystem Matching', icon: Network },
              { id: 'traction', label: 'Discovery & Milestones', icon: ClipboardList }
            ] as const
          ).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  isActive 
                    ? 'border-emerald-500 text-emerald-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Content rendering - Each isolated to prevent grid collisions */}
        
        {/* Tab 1: Venture Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* GPS Progression Banner */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <h2 className="text-sm font-bold text-slate-900">Startup GPS Pathway</h2>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                  Current Stage: {startup.stage}
                </span>
              </div>

              {/* Stepped line layout */}
              <div className="relative flex items-center justify-between w-full mt-6 mb-4 px-4 overflow-x-auto py-2">
                <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-slate-200 -translate-y-1/2 -z-0"></div>
                
                {GPS_STAGES.map((gps, idx) => {
                  const isActive = startup.stage === gps.stage;
                  const isPassed = GPS_STAGES.findIndex(g => g.stage === startup.stage) >= idx;

                  return (
                    <button
                      key={gps.stage}
                      onClick={() => handleStageSelect(gps.stage)}
                      className="relative z-10 flex flex-col items-center group focus:outline-none cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20'
                          : isPassed
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                            : 'border-slate-200 bg-white text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`absolute top-9 text-[9px] whitespace-nowrap font-bold tracking-tight opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity mt-0.5 ${
                        isActive ? 'text-emerald-500 font-extrabold' : 'text-slate-400'
                      }`}>
                        {gps.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-slate-50 border border-slate-200/50 rounded-xl text-xs leading-relaxed">
                <span className="font-bold text-slate-800">Active Phase Detail: </span>
                <span className="text-slate-600">
                  {GPS_STAGES.find(g => g.stage === startup.stage)?.description}
                </span>
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <span className="font-bold text-emerald-600 text-[10px] uppercase tracking-wider">Milestones to unlock next phase:</span>
                  {GPS_STAGES.find(g => g.stage === startup.stage)?.nextRequirements.map((req, rIdx) => (
                    <span key={rIdx} className="bg-white border border-slate-200 px-2.5 py-0.5 rounded text-[10px] text-slate-500 font-semibold shadow-sm">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Scorecards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Venture Health Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                    <span>Venture Health Index</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${health?.colorClass}`}>
                      {health?.overallScore}%
                    </span>
                  </h3>

                  <div className="space-y-3.5 mb-6">
                    {health?.breakdown.map((item) => (
                      <div key={item.name} className="text-xs">
                        <div className="flex justify-between text-slate-500 font-medium mb-1">
                          <span>{item.name}</span>
                          <span className="font-bold text-slate-800">{item.score}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                  {health?.description}
                </p>
              </div>

              {/* Traction Trend Chart */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 mb-4">
                    User Traction Trend (Last 6 Months)
                  </h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={startup.tractionHistory}>
                        <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px' }}
                          labelStyle={{ color: '#fff', fontSize: '10px' }}
                        />
                        <Line type="monotone" dataKey="users" stroke="#00A86B" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Total Jobs Created:</span>
                  <span className="text-slate-900 font-extrabold">{startup.jobsCreated} Full-time</span>
                </div>
              </div>

              {/* Score breakdown panels */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Reputation Score</p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {startup.founderReputation}/100
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Unicorn Potential</p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {startup.unicornScore}%
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Invest Readiness</p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {startup.investmentScore}%
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Funding Readiness</p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {startup.fundingReadiness}%
                    </p>
                  </div>
                </div>

                {riskReport && (
                  <div className={`p-4 border rounded-xl flex items-center justify-between shadow-sm ${riskReport.color}`}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold uppercase leading-none">Venture Risk Alert</h4>
                        <p className="text-[10px] opacity-90 mt-1">
                          Calculated runway indicators flag **{riskReport.overallRisk} Risk**.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Learning & Capacity Building (LMM Core) */}
        {activeTab === 'lmm' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Onboarding Diagnostics (LMM Item 1) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                  Intelligent Onboarding Diagnostics
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Verify founder skill competencies to update your personalized learning journey automatically.
                </p>
              </div>

              {/* Progress and checklists */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">Core Skill Coverage</span>
                    <span className="text-emerald-600">{diagnosticScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${diagnosticScore}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Checklist</p>
                  {[
                    'Market Research',
                    'Customer Discovery',
                    'Prototyping',
                    'Tech Architecture',
                    'Agile Delivery',
                    'Financial Modeling',
                    'Unit Economics',
                    'B2B Sales'
                  ].map(skill => {
                    const isChecked = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-150 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors text-left cursor-pointer"
                      >
                        <span>{skill}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Structured Curricula & Certification (LMM Items 2, 5) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Certificate Showcase Card */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide">
                    RTIH Capacity Certification
                  </span>
                  <h3 className="text-lg font-bold leading-tight">
                    APIS Innovation Certification Validation
                  </h3>
                  <p className="text-xs text-white/90 leading-relaxed max-w-xl">
                    Once your startup completes all Milestones matching the **{startup.stage.toUpperCase()}** stage, you are eligible to download the official ecosystem certificate validated by the AP Government Innovation Board.
                  </p>
                </div>

                <button
                  onClick={handleCertificateDownload}
                  className="px-4 py-2.5 bg-white text-emerald-700 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate
                </button>
              </div>

              {/* Course list */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-emerald-500" />
                  Structured Capacity Building Journeys
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {LMM_COURSES.map((course, idx) => {
                    const isCompleted = completedCourses.includes(course.title);
                    const isLocked = course.stage !== 'idea' && course.stage !== startup.stage && course.stage !== 'validation';
                    
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-xs transition-all ${
                          isLocked 
                            ? 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60' 
                            : isCompleted 
                              ? 'bg-emerald-500/5 border-emerald-500/20' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-extrabold uppercase text-slate-450 tracking-wider">
                              Stage: {course.stage}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400">{course.duration}</span>
                          </div>
                          
                          <h4 className="font-bold text-slate-800 leading-snug">{course.title}</h4>
                          <p className="text-[10px] text-slate-500 leading-normal">{course.desc}</p>
                          
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {course.skills.map(skill => (
                              <span key={skill} className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-slate-100 text-slate-500">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-slate-100/80 pt-3 flex items-center justify-between mt-1">
                          {isLocked ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Locked for stage
                            </span>
                          ) : isCompleted ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          ) : (
                            <button
                              onClick={() => completeCourse(course.title)}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-500 hover:text-white border border-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                            >
                              Launch Module
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: AI Startup Coach workspace */}
        {activeTab === 'copilot' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[520px]">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Bot className="w-5 h-5 text-emerald-500" />
                  AI Startup Copilot & Coach (LMM Extension C)
                </h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                  isAiLive 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAiLive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  {isAiLive ? `Live AI (${aiProvider})` : 'Local Sandbox Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-normal">
                Query strategy parameters, learning curriculum references, state policy guides, or draft seed funding submissions.
              </p>


              {/* Chat window */}
              <div className="h-[320px] overflow-y-auto border border-slate-100 bg-slate-50/50 rounded-xl p-4 space-y-4">
                {chatHistory.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      chat.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`p-3 rounded-xl text-xs leading-relaxed shadow-sm ${
                      chat.sender === 'user'
                        ? 'bg-emerald-500 text-white font-medium rounded-tr-none'
                        : 'bg-white border border-slate-200/50 text-slate-800 rounded-tl-none'
                    }`}>
                      {chat.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 animate-pulse font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Coach is compiling strategy recommendations...
                  </div>
                )}
              </div>
            </div>

            {/* Input form */}
            <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-slate-100 pt-4 mt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask: What learning modules fit my validation milestone?"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none text-slate-800"
              />
              <button
                type="submit"
                disabled={isTyping}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Ecosystem linkages */}
        {activeTab === 'linkages' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Government matching */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="w-4.5 h-4.5 text-emerald-500" />
                  Government Policy & Seed Fund Matching
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Automatic qualification index matching active AP Startup Policy benefits against your profile.
                </p>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                {schemes.slice(0, 3).map((sch) => (
                  <div
                    key={sch.id}
                    className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl text-xs flex justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 leading-tight">
                          {sch.name}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 bg-slate-200/60 px-1 py-0.2 rounded">
                          {sch.department}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        Benefits: {sch.benefits}
                      </p>
                      <p className="text-[9px] text-slate-400 leading-relaxed">
                        Eligibility: {sch.eligibility}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex flex-col justify-center">
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center min-w-[58px] shadow-sm">
                        <p className="text-xs font-bold text-emerald-600 leading-none">
                          {sch.matchingScore}%
                        </p>
                        <p className="text-[7px] text-slate-400 uppercase mt-0.5 leading-none">Match</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitch Deck Auditor */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkle className="w-4.5 h-4.5 text-emerald-500" />
                  Pitch Deck Reviewer
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Upload pitch documentation to review investment readiness.
                </p>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                <button
                  onClick={handlePitchReview}
                  className="w-full py-3.5 border border-dashed border-slate-350 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-500 hover:text-emerald-600 bg-slate-50/50 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  Simulate Pitch Audit Scan
                </button>

                {pitchScore && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Audit score:</span>
                      <span className="font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border border-emerald-500/20">
                        {pitchScore}% Ready
                      </span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1.5 text-[10px] text-slate-650 leading-relaxed">
                      {pitchFeedback.map((fb, fIdx) => (
                        <li key={fIdx}>{fb}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Discovery Log & Milestones */}
        {activeTab === 'traction' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Milestones Checklist */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Milestones & OKR Tracker</h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Toggle objective logs to recalculate your Venture Health and Investment Readiness scores.
                </p>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                {startup.milestones.map((milestone) => {
                  const isCompleted = milestone.status === 'Completed';
                  return (
                    <button
                      key={milestone.id}
                      onClick={() => handleToggleMilestone(milestone.id, milestone.status)}
                      className="w-full text-left flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/50 rounded-xl hover:border-slate-300 hover:bg-slate-100/50 transition-all cursor-pointer shadow-sm"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4.5 h-4.5 text-slate-350 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-xs font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {milestone.title}
                        </p>
                        <p className="text-[9px] text-slate-405 mt-1 leading-normal">{milestone.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer discovery log */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Customer Discovery Tracker</h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Log segments and interviews to update PMF indices.
                </p>
              </div>

              <form onSubmit={handleLogInterview} className="space-y-3 border-t border-slate-100 pt-4">
                <input
                  type="text"
                  value={customerInterviewName}
                  onChange={(e) => setCustomerInterviewName(e.target.value)}
                  placeholder="Interviewee Name / Target Segment"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                />
                <textarea
                  value={customerInterviewNotes}
                  onChange={(e) => setCustomerInterviewNotes(e.target.value)}
                  placeholder="Insights, key feedback, and pain points..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  Log Interview Record
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
