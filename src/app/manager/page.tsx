'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { 
  getDb, 
  Startup, 
  Mentor, 
  Notification, 
  Message, 
  StageRecommendation, 
  StartupStage,
  SECTORS, 
  DISTRICTS, 
  isExecutiveModeActive, 
  getActiveUser 
} from '@/lib/mockDb';
import { calculateVentureHealth, predictStartupRisk } from '@/lib/engines';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { 
  ShieldCheck, Sparkles, Bot, AlertOctagon, TrendingUp, Users, Calendar, 
  Coins, Send, Filter, Compass, ClipboardList, CheckCircle2, XCircle, 
  Eye, Building, Layers, Check, MessageSquare, Bell, UserPlus, Star, Search,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PIE_COLORS = ['#10b981', '#059669', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16'];

const AI_MENTOR_RECOMMENDATIONS: Record<string, { name: string; score: number; reason: string; focus: string }[]> = {
  'Agri': [
    { name: 'Dr. Venkatesh Koppula', score: 94, reason: 'AgriTech + IoT field deployment expert. Developed AP dryland irrigation models.', focus: 'IoT hardware integration & field trials validation.' },
    { name: 'Prof. Ramesh Koppula', score: 85, reason: 'AI systems expert. Can guide crop disease prediction models.', focus: 'ML classification algorithm tuning & validation.' }
  ],
  'Food': [
    { name: 'Dr. Venkatesh Koppula', score: 88, reason: 'Agri & Food Processing specialist. Guided food safety sensor certifications.', focus: 'Cold chain IoT sensors calibration.' }
  ],
  'Blue': [
    { name: 'Prof. Ramesh Koppula', score: 91, reason: 'Coastal AP resource mapping background. Marine data science specialist.', focus: 'Satellite data telemetry integration.' },
    { name: 'Dr. Venkatesh Koppula', score: 79, reason: 'IoT systems designer. Has experience in water quality sensor networks.', focus: 'Hardware waterproofing and power optimization.' }
  ],
  'Marine': [
    { name: 'Prof. Ramesh Koppula', score: 92, reason: 'Coastal telemetry and oceanography research lead.', focus: 'Sonar telemetry and mesh networking.' }
  ],
  'Aquaculture': [
    { name: 'Dr. Venkatesh Koppula', score: 87, reason: 'Shrimp farming telemetry advisor. Deployed 20+ sensors in Nellore.', focus: 'Salinity sensor calibration and hardware waterproofing.' }
  ],
  'Health': [
    { name: 'Prof. Ramesh Koppula', score: 93, reason: 'MBBS + Bio-informatics background. AI screening systems innovator.', focus: 'Clinical accuracy validation & regulatory HIPAA sandbox.' },
    { name: 'Dr. Venkatesh Koppula', score: 72, reason: 'General sensor hardware experience. Helpful for medical devices.', focus: 'FDA labeling and hardware prototyping.' }
  ],
  'Medtech': [
    { name: 'Prof. Ramesh Koppula', score: 95, reason: 'Medical diagnostic systems advisor. Managed clinical trials in Vizag.', focus: 'ISO 13485 compliance & medical hardware design.' }
  ],
  'Biotech': [
    { name: 'Prof. Ramesh Koppula', score: 89, reason: 'Biomedical engineering expert. Focuses on botanical extraction scaling.', focus: 'Regulatory vetting and clinical trial pipeline design.' }
  ],
  'Fintech': [
    { name: 'Prof. Ramesh Koppula', score: 91, reason: 'Fintech compliance and digital payment systems advisor.', focus: 'RBI regulatory sandbox compliance.' }
  ],
  'Automotive': [
    { name: 'Dr. Venkatesh Koppula', score: 93, reason: 'Electric vehicles drivetrain design expert and battery systems veteran.', focus: 'BMS (Battery Management Systems) hardware validation.' }
  ],
  'Battery': [
    { name: 'Dr. Venkatesh Koppula', score: 94, reason: 'Advanced cell manufacturing researcher. Expert on thermal runaway.', focus: 'Battery cooling and cell pack architecture review.' }
  ],
  'Electronics': [
    { name: 'Dr. Venkatesh Koppula', score: 91, reason: 'Embedded PCB design and automated assembly expert.', focus: 'Gerber file reviews and electromagnetic shielding.' }
  ],
  'Space': [
    { name: 'Prof. Ramesh Koppula', score: 90, reason: 'Satellite telemetry and orbital sensor arrays advisor.', focus: 'Radiation hardening and low-power telemetry design.' }
  ]
};

type ManagerTab = 'analytics' | 'portfolio' | 'health' | 'mentors' | 'promotions' | 'notifications' | 'communications' | 'advisor';

export default function ProgramManagerDashboard() {
  const router = useRouter();
  const [db, setDb] = useState(() => getDb());
  const [execActive, setExecActive] = useState(false);
  const [activeTab, setActiveTab] = useState<ManagerTab>('analytics');

  // Tab grouping helpers
  const getPrimaryTab = (subTab: ManagerTab): string => {
    if (['analytics', 'portfolio', 'health'].includes(subTab)) return 'analytics_portfolio';
    if (['mentors', 'promotions'].includes(subTab)) return 'mentorship_vetting';
    if (['communications', 'notifications'].includes(subTab)) return 'communications_inbox';
    if (subTab === 'advisor') return 'ai_advisor';
    return 'analytics_portfolio';
  };

  const activePrimaryTab = getPrimaryTab(activeTab);

  const PRIMARY_TABS = [
    { id: 'analytics_portfolio', label: 'Analytics & Portfolio', icon: ClipboardList, defaultSub: 'analytics' },
    { id: 'mentorship_vetting', label: 'Mentorship & Vetting', icon: UserPlus, defaultSub: 'mentors' },
    { id: 'communications_inbox', label: 'Inbox & Communications', icon: MessageSquare, defaultSub: 'communications' },
    { id: 'ai_advisor', label: 'AI Advisor Chat', icon: Bot, defaultSub: 'advisor' }
  ] as const;


  // Search & Filter States
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [portfolioSearch, setPortfolioSearch] = useState('');

  // Selected startup details modal
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);

  // Mentor Assignment states
  const [assigningStartup, setAssigningStartup] = useState<Startup | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState('');

  // Stage Promotion Review states
  const [selectedRecommendation, setSelectedRecommendation] = useState<StageRecommendation | null>(null);
  const [managerFeedback, setManagerFeedback] = useState('');
  const [isRejectingRec, setIsRejectingRec] = useState(false);

  // Communications states
  const [activeChatStartupId, setActiveChatStartupId] = useState('');
  const [chatMessageContent, setChatMessageContent] = useState('');

  // AI Advisor states
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAiLive, setIsAiLive] = useState(false);
  const [aiProvider, setAiProvider] = useState('Checking...');

  // Health & Intervention States
  const [selectedHealthStartup, setSelectedHealthStartup] = useState<Startup | null>(null);
  const [interventionTitle, setInterventionTitle] = useState('');
  const [interventionDesc, setInterventionDesc] = useState('');
  const [interventionMentorId, setInterventionMentorId] = useState('');
  const [interventionDate, setInterventionDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]); // default 2 days out
  const [healthFilter, setHealthFilter] = useState<'all' | 'at-risk'>('all');
  const [healthSearch, setHealthSearch] = useState('');

  // Sync state changes from toggles
  const syncStates = () => {
    setDb(getDb());
    setExecActive(isExecutiveModeActive());
  };

  // Login check
  useEffect(() => {
    const user = getActiveUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'manager' && user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (user.role === 'manager' && user.district) {
      setSelectedDistrict(user.district);
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
    setChatHistory([
      { 
        sender: 'ai', 
        text: 'Welcome to your RTIH Copilot, manager. Ask me: "Which startups need intervention?", "Review the stage promotion requests", or "Show underperforming segments".' 
      }
    ]);

    window.addEventListener('rtih_mode_change', syncStates);
    return () => {
      window.removeEventListener('rtih_mode_change', syncStates);
    };
  }, []);

  const stats = useMemo(() => {
    return db.getEcosystemStats();
  }, [db]);

  const cohortStartups = useMemo(() => {
    let list = db.getStartups();
    if (selectedSector !== 'All') list = list.filter(s => s.sector === selectedSector);
    if (selectedDistrict !== 'All') list = list.filter(s => s.district === selectedDistrict);
    if (selectedStage !== 'All') list = list.filter(s => s.stage === selectedStage);
    if (portfolioSearch.trim()) {
      list = list.filter(s => 
        s.name.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
        s.district.toLowerCase().includes(portfolioSearch.toLowerCase())
      );
    }
    return list;
  }, [db, selectedSector, selectedDistrict, selectedStage, portfolioSearch]);

  const highRiskStartups = useMemo(() => {
    return db.getStartups()
      .map(s => ({ startup: s, report: predictStartupRisk(s) }))
      .filter(item => item.report.overallRisk === 'High')
      .slice(0, 5);
  }, [db]);

  const sectorPieData = useMemo(() => {
    const data: Record<string, number> = {};
    db.getStartups().forEach(s => {
      data[s.sector] = (data[s.sector] || 0) + 1;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value })).slice(0, 6);
  }, [db]);

  const districtBarData = useMemo(() => {
    const data: Record<string, number> = {};
    db.getStartups().forEach(s => {
      data[s.district] = (data[s.district] || 0) + 1;
    });
    return Object.entries(data).map(([name, count]) => ({
      name: name.slice(0, 10),
      count
    })).slice(0, 8);
  }, [db]);

  const activeManagerEmail = useMemo(() => {
    const user = getActiveUser();
    return user?.email || 'manager@rtih.ap.gov.in';
  }, []);

  const pendingRecommendations = useMemo(() => {
    return db.getStageRecommendations().filter(rec => rec.status === 'Pending');
  }, [db]);

  // Handler for stage promotion approval
  const handleApprovePromotion = (rec: StageRecommendation) => {
    // 1. Update startup's stage in DB
    db.updateStartup(rec.startupId, { stage: rec.proposedStage as StartupStage });
    // 2. Update recommendation status
    db.updateStageRecommendation(rec.id, { status: 'Approved', managerFeedback: managerFeedback || 'Approved' });
    // 3. Create notifications for mentor and founder
    const startup = db.getStartup(rec.startupId);
    const founderIds = startup?.founders || [];
    const founder = founderIds.length > 0 ? db.getFounder(founderIds[0]) : null;

    if (startup) {
      db.addNotification({
        id: `notif-${Date.now()}-p1`,
        userId: rec.mentorId,
        type: 'stage_promoted',
        title: 'Stage Promotion Approved',
        message: `Your stage promotion request for ${startup.name} from ${rec.currentStage} to ${rec.proposedStage} has been approved.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/mentor'
      });

      if (founder) {
        db.addNotification({
          id: `notif-${Date.now()}-p2`,
          userId: founder.email,
          type: 'stage_promoted',
          title: 'Startup Stage Promoted',
          message: `Congratulations! Your startup ${startup.name} has been promoted to stage: ${rec.proposedStage.toUpperCase()} by the incubation committee.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          linkTo: '/founder'
        });
      }
    }

    setDb(getDb());
    setSelectedRecommendation(null);
    setManagerFeedback('');
    setIsRejectingRec(false);
    confetti({ particleCount: 100, spread: 80 });
  };

  const handleRejectPromotion = (rec: StageRecommendation) => {
    if (!managerFeedback.trim()) {
      alert('Please provide rejection feedback.');
      return;
    }
    db.updateStageRecommendation(rec.id, { status: 'Rejected', managerFeedback });
    const startup = db.getStartup(rec.startupId);
    
    if (startup) {
      db.addNotification({
        id: `notif-${Date.now()}-p3`,
        userId: rec.mentorId,
        type: 'stage_promoted',
        title: 'Stage Promotion Request Returned',
        message: `Your stage promotion request for ${startup.name} was returned. Feedback: ${managerFeedback}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/mentor'
      });
    }

    setDb(getDb());
    setSelectedRecommendation(null);
    setManagerFeedback('');
    setIsRejectingRec(false);
  };

  // Handler for mentor assignment
  const handleAssignMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningStartup || !selectedMentorId) return;

    db.assignMentor(assigningStartup.id, selectedMentorId);
    setDb(getDb());
    setAssigningStartup(null);
    setSelectedMentorId('');
    confetti({ particleCount: 50, spread: 50 });
  };

  // Handlers for Intervention
  const handleScheduleIntervention = (startupName: string) => {
    alert(`Intervention scheduled. RTIH EIR and technical advisors linked to ${startupName}. Email notification sent to founders.`);
    confetti({
      particleCount: 50,
      colors: ['#ef4444', '#f97316']
    });
  };

  // Chat message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatStartupId || !chatMessageContent.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      startupId: activeChatStartupId,
      senderId: activeManagerEmail,
      senderName: 'K. Lakshmi Narayana (Manager)',
      senderRole: 'manager',
      content: chatMessageContent,
      sentAt: new Date().toISOString(),
      isRead: false
    };

    db.addMessage(newMessage);
    setDb(getDb());
    setChatMessageContent('');
  };

  // Chat with AI Copilot
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
          startupContext: { highRiskCount: highRiskStartups.length, totalStartups: stats.totalStartups },
          role: 'Program Manager'
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

  // AI Matches helper
  const getAiMentors = (sector: string) => {
    const matched = Object.keys(AI_MENTOR_RECOMMENDATIONS).find(k => sector.includes(k.split(' ')[0]));
    return matched ? AI_MENTOR_RECOMMENDATIONS[matched] : [
      { name: 'Prof. Ramesh Koppula', score: 82, reason: 'Broad Deep Tech experience & AP university linkage advisor.', focus: 'General validation checks.' },
      { name: 'Dr. Venkatesh Koppula', score: 80, reason: 'Product design, field telemetry & pilot deployment consultant.', focus: 'General systems architectural mapping.' }
    ];
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner console */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                Ecosystem Management Center
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Analyze regional startup cohorts, monitor mentor utilization ratios, review risk reports, and assign resources.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-105 px-3 py-1.5 rounded-lg border border-slate-200">
            RTIH Manager Active Console
          </span>
        </section>

        {/* Executive briefing from AI */}
        {execActive && (
          <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-800">
                AI Program Adviser Telemetry: Ecosystem Diagnostics
              </h3>
            </div>
            <div className="text-xs text-slate-650 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10 shadow-sm">
                <span className="font-bold text-slate-800">Ecosystem Metric Summary:</span>
                <p className="mt-1">Active sector cohort contains **{cohortStartups.length}** companies. Average health indicators sits at **78%**.</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10 shadow-sm">
                <span className="font-bold text-slate-800">Resource Allocations:</span>
                <p className="mt-1">Mentor mapping registers **{pendingRecommendations.length}** pending stage promotions. Check details immediately.</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10 shadow-sm">
                <span className="font-bold text-slate-800">Critical Risks:</span>
                <p className="mt-1">Ecosystem risk indicators flag **{highRiskStartups.length}** startups needing intervention. Runway checks linked.</p>
              </div>
            </div>
          </section>
        )}

        {/* Live Metrics Scorecards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Ecosystem Health</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">78/100</h3>
            <p className="text-[8px] text-emerald-600 mt-1 leading-none">✓ Growth speed stable</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Active Mentors</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{db.getMentors().length} EIRs</h3>
            <p className="text-[8px] text-slate-400 mt-1 leading-none">AP Incubation pool</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mentor Utilization</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">68.4%</h3>
            <p className="text-[8px] text-slate-405 mt-1 leading-none">Goal by 2029: 80%+</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">My Cohort size</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{db.getStartups().length} Startups</h3>
            <p className="text-[8px] text-slate-400 mt-1 leading-none">Incubated under RTIH</p>
          </div>
        </section>

        {/* Sidebar + Content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                   {/* Sidebar */}
          <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 select-none sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Manager Modules</p>
            <div className="flex flex-col gap-1">
              {PRIMARY_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activePrimaryTab === tab.id;
                
                // Add unread badge count for mentorship/vetting promotions
                let count = 0;
                if (tab.id === 'mentorship_vetting') {
                  count = pendingRecommendations.length;
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.defaultSub as any)}
                    className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all text-left w-full cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm font-black' 
                        : 'bg-transparent border-transparent text-slate-550 hover:bg-slate-50 hover:text-slate-750'
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

          {/* Main content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Horizontal Sub-Navigation */}
            {activePrimaryTab !== 'ai_advisor' && (
              <div className="flex gap-2 border-b border-slate-200 pb-3 mb-2 overflow-x-auto whitespace-nowrap">
                {activePrimaryTab === 'analytics_portfolio' && (
                  <>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'analytics'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Ecosystem Analytics
                    </button>
                    <button
                      onClick={() => setActiveTab('portfolio')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'portfolio'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Startup Portfolio
                    </button>
                    <button
                      onClick={() => setActiveTab('health')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'health'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Venture Health & Interventions
                    </button>
                  </>
                )}
                {activePrimaryTab === 'mentorship_vetting' && (
                  <>
                    <button
                      onClick={() => setActiveTab('mentors')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'mentors'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Mentor Assignment
                    </button>
                    <button
                      onClick={() => setActiveTab('promotions')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'promotions'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Stage Promotions {pendingRecommendations.length > 0 && `(${pendingRecommendations.length})`}
                    </button>
                  </>
                )}
                {activePrimaryTab === 'communications_inbox' && (
                  <>
                    <button
                      onClick={() => setActiveTab('communications')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'communications'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Communication Hub
                    </button>
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'notifications'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Notifications
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Tab: Ecosystem Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Startup Distribution by Sector
                    </h3>
                    <div className="flex items-center justify-center h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sectorPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {sectorPieData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px' }}
                            itemStyle={{ color: '#fff', fontSize: '10px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="flex flex-col gap-1.5 text-[9px] font-semibold text-slate-500 pr-4 shrink-0">
                        {sectorPieData.map((entry, idx) => (
                          <div key={entry.name} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                            <span>{entry.name}: {entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-500" />
                      Incubated Startups by AP District
                    </h3>
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={districtBarData}>
                          <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px' }}
                            labelStyle={{ color: '#fff', fontSize: '10px' }}
                          />
                          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </section>

                <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <AlertOctagon className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                    Startup Risk Intervention Radar
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-4 leading-normal">
                    Ecosystem startups flagged with high runway risks, low team scores, or execution deficits.
                  </p>

                  <div className="space-y-3">
                    {highRiskStartups.map((item) => (
                      <div
                        key={item.startup.id}
                        className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs flex justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 leading-tight">{item.startup.name}</span>
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-red-700 bg-red-100 border border-red-200 px-1.5 rounded">{item.startup.sector}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                            Trigger: {item.report.indicators[0]?.detail || 'Deficits in operational milestones.'}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center">
                          <button
                            onClick={() => handleScheduleIntervention(item.startup.name)}
                            className="px-3 py-1.5 rounded bg-red-650 hover:bg-red-700 text-white text-[10px] font-bold transition-colors"
                          >
                            Intervene
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* Tab: Startup Portfolio */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Incubated Startups Directory</h2>
                      <p className="text-xs text-slate-500">Search and filter active startups linked under your incubator branch portfolio.</p>
                    </div>

                    <div className="relative w-full md:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search startup or district..."
                        value={portfolioSearch}
                        onChange={(e) => setPortfolioSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-slate-800 bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* Filter Badges */}
                  <div className="flex flex-wrap gap-3 items-center text-xs text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Sector:</span>
                      <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className="bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none">
                        <option value="All">All Sectors</option>
                        {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">District:</span>
                      <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none">
                        <option value="All">All Districts</option>
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Incubation Stage:</span>
                      <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)} className="bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none">
                        <option value="All">All Stages</option>
                        {['idea', 'validation', 'prototype', 'mvp', 'users', 'revenue', 'funding', 'scale'].map(st => (
                          <option key={st} value={st}>{st.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cohortStartups.length > 0 ? (
                      cohortStartups.map(startup => {
                        const health = calculateVentureHealth(startup);
                        const mentorObj = db.getMentors().find(m => m.portfolioStartups?.includes(startup.id));
                        return (
                          <div 
                            key={startup.id} 
                            onClick={() => setSelectedStartup(startup)}
                            className="border border-slate-200 rounded-xl p-4 bg-white hover:border-emerald-350 hover:shadow-md transition-all cursor-pointer relative"
                          >
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <div>
                                <h3 className="font-black text-slate-900 text-sm leading-snug">{startup.name}</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">{startup.sector} · {startup.district}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[9px] font-black text-emerald-700 uppercase">{startup.stage}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-normal line-clamp-2 mb-4">{startup.tagline}</p>
                            
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                              <span>Health Score: <strong className={health.overallScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}>{health.overallScore}%</strong></span>
                              <span>Mentor: <strong>{mentorObj ? mentorObj.name : 'None assigned'}</strong></span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="col-span-2 text-center py-10 font-bold text-slate-400">No startups match active filters.</p>
                    )}
                  </div>
                </div>

                {/* Startup Detail Drawer Modal */}
                {selectedStartup && (
                  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img src={selectedStartup.logo} alt="Logo" className="w-10 h-10 rounded-lg border border-slate-200 bg-white" />
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Incubated Startup Profile</span>
                            <h3 className="text-base font-black text-slate-900">{selectedStartup.name}</h3>
                          </div>
                        </div>
                        <button onClick={() => setSelectedStartup(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed italic border-l-2 border-emerald-500 pl-3">
                          &ldquo;{selectedStartup.tagline}&rdquo;
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Monthly Revenue</span>
                            <strong className="text-sm text-slate-900 mt-0.5 block">₹{selectedStartup.monthlyRevenue.toLocaleString()}</strong>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Total Funding</span>
                            <strong className="text-sm text-slate-900 mt-0.5 block">₹{selectedStartup.totalFunding.toLocaleString()}</strong>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Jobs Created</span>
                            <strong className="text-sm text-slate-900 mt-0.5 block">{selectedStartup.jobsCreated} jobs</strong>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Venture Health</span>
                            <strong className="text-sm text-emerald-600 mt-0.5 block">{calculateVentureHealth(selectedStartup).overallScore}%</strong>
                          </div>
                        </div>

                        {/* Health breakdown */}
                        <div>
                          <p className="font-bold text-slate-900 mb-3">Venture Health Dimension Metrics</p>
                          <div className="space-y-3">
                            {Object.entries(selectedStartup.healthBreakdown).map(([dimension, val]) => (
                              <div key={dimension} className="space-y-1">
                                <div className="flex justify-between font-semibold text-slate-500 text-[10px] uppercase">
                                  <span>{dimension}</span>
                                  <span>{val}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${val}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Milestones */}
                        <div>
                          <p className="font-bold text-slate-900 mb-3">Incubation Program Milestones</p>
                          <div className="space-y-2">
                            {selectedStartup.milestones.map(m => (
                              <div key={m.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-slate-805">{m.title}</h4>
                                  <p className="text-[10.5px] text-slate-450 mt-0.5">{m.description} · Target: {m.targetDate}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  m.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}>
                                  {m.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cohort information */}
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2">
                          <p className="font-bold text-slate-800">Operational Incubation Data</p>
                          <p><span className="text-slate-450">Ecosystem Risk Level:</span> <strong className="text-orange-500">{predictStartupRisk(selectedStartup).overallRisk}</strong></p>
                          <p><span className="text-slate-455">University Linkage ID:</span> {selectedStartup.universityId || 'State Direct Entry'}</p>
                          <p><span className="text-slate-455">District Incubation Center:</span> {selectedStartup.district} Regional Hub</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Venture Health Dashboard */}
            {activeTab === 'health' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Aggregate Metrics Scorecards */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Health Score</span>
                        <h4 className="text-xl font-black text-slate-900 mt-0.5">
                          {Math.round(db.getStartups().reduce((acc, s) => acc + calculateVentureHealth(s).overallScore, 0) / (db.getStartups().length || 1))}%
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                        <AlertOctagon className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critical & At-Risk</span>
                        <h4 className="text-xl font-black text-red-600 mt-0.5">
                          {db.getStartups().filter(s => calculateVentureHealth(s).overallScore < 60).length} Ventures
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Healthy (Score &ge; 80)</span>
                        <h4 className="text-xl font-black text-emerald-600 mt-0.5">
                          {db.getStartups().filter(s => calculateVentureHealth(s).overallScore >= 80).length} Ventures
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Interventions</span>
                        <h4 className="text-xl font-black text-slate-900 mt-0.5">
                          {db.getStartups().filter(s => s.interventionLogs?.some(l => l.status === 'Active')).length} Startups
                        </h4>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Health Rankings & Leaderboard */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Ecosystem Startup Health Rankings</h2>
                      <p className="text-xs text-slate-500">Real-time health telemetry leaderboard. Monitor growth deficits and active flags.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                      {/* Search */}
                      <div className="relative flex-1 md:w-56 md:flex-none">
                        <Search className="w-4.5 h-4.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search rankings..."
                          value={healthSearch}
                          onChange={(e) => setHealthSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-slate-800 bg-slate-50"
                        />
                      </div>
                      
                      {/* Filter Toggles */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        <button
                          onClick={() => setHealthFilter('all')}
                          className={`px-3 py-1 transition-all rounded ${
                            healthFilter === 'all' ? 'bg-white text-slate-905 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          All Startups
                        </button>
                        <button
                          onClick={() => setHealthFilter('at-risk')}
                          className={`px-3 py-1 transition-all rounded ${
                            healthFilter === 'at-risk' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          At-Risk (&lt;60)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-4 py-2.5 text-center w-12">Rank</th>
                          <th className="px-4 py-2.5">Startup</th>
                          <th className="px-4 py-2.5">Mentor</th>
                          <th className="px-4 py-2.5">Health Score</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...db.getStartups()]
                          .map(s => ({ startup: s, health: calculateVentureHealth(s) }))
                          .filter(item => {
                            const matchesSearch = item.startup.name.toLowerCase().includes(healthSearch.toLowerCase()) ||
                              item.startup.sector.toLowerCase().includes(healthSearch.toLowerCase()) ||
                              item.startup.district.toLowerCase().includes(healthSearch.toLowerCase());
                            const matchesFilter = healthFilter === 'all' || item.health.overallScore < 60;
                            return matchesSearch && matchesFilter;
                          })
                          .sort((a, b) => b.health.overallScore - a.health.overallScore)
                          .map((item, idx) => {
                            const mentor = db.getMentors().find(m => m.portfolioStartups?.includes(item.startup.id));
                            const hasActiveIntervention = item.startup.interventionLogs?.some(l => l.status === 'Active');
                            return (
                              <tr key={item.startup.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                <td className="px-4 py-3">
                                  <span className="font-semibold text-slate-800 block">{item.startup.name}</span>
                                  <span className="text-[9.5px] text-slate-400">{item.startup.sector} · {item.startup.district}</span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 font-medium">
                                  {mentor ? mentor.name : <span className="text-red-500 font-semibold">None assigned</span>}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-700 w-8">{item.health.overallScore}%</span>
                                    <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                                      <div 
                                        className={`h-full rounded-full ${
                                          item.health.overallScore >= 80 ? 'bg-emerald-500' : item.health.overallScore >= 60 ? 'bg-amber-500' : 'bg-red-550'
                                        }`} 
                                        style={{ width: `${item.health.overallScore}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {item.health.overallScore < 60 ? (
                                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-red-105 text-red-800 border border-red-200">
                                      Critical Risk
                                    </span>
                                  ) : hasActiveIntervention ? (
                                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                                      Intervention Live
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-250">
                                      Healthy
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => {
                                      setSelectedHealthStartup(item.startup);
                                      setInterventionTitle('');
                                      setInterventionDesc('');
                                      setInterventionMentorId(mentor?.id || '');
                                    }}
                                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-bold transition-all inline-flex items-center gap-1.5"
                                  >
                                    <Activity className="w-3.5 h-3.5" /> Manage Health
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Health & Intervention Modal drawer */}
                {selectedHealthStartup && (() => {
                  const health = calculateVentureHealth(selectedHealthStartup);
                  const activeInterventions = selectedHealthStartup.interventionLogs?.filter(l => l.status === 'Active') || [];
                  const resolvedInterventions = selectedHealthStartup.interventionLogs?.filter(l => l.status === 'Resolved') || [];
                  
                  return (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <img src={selectedHealthStartup.logo} alt="Logo" className="w-10 h-10 rounded-lg border border-slate-200 bg-white" />
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Startup Health Audit & Intervention Console</span>
                              <h3 className="text-base font-black text-slate-900">{selectedHealthStartup.name}</h3>
                            </div>
                          </div>
                          <button 
                            onClick={() => setSelectedHealthStartup(null)} 
                            className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
                          {/* Score Gauge & Trend */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                            {/* Dial */}
                            <div className="md:col-span-4 flex flex-col items-center justify-center border-r border-slate-100 pr-4 text-center">
                              <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* SVG Arc */}
                                <svg className="absolute w-full h-full -rotate-90">
                                  <circle cx="64" cy="64" r="54" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                                  <circle 
                                    cx="64" 
                                    cy="64" 
                                    r="54" 
                                    stroke={health.overallScore >= 80 ? '#10b981' : health.overallScore >= 60 ? '#f59e0b' : '#ef4444'} 
                                    strokeWidth="10" 
                                    fill="transparent"
                                    strokeDasharray="339.29"
                                    strokeDashoffset={339.29 - (339.29 * health.overallScore) / 100}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="text-center z-10">
                                  <span className="text-2xl font-black text-slate-900">{health.overallScore}%</span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase block mt-0.5 tracking-wider">Health Index</span>
                                </div>
                              </div>
                              <span className={`mt-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                health.overallScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : health.overallScore >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {health.overallScore >= 80 ? 'Excellent' : health.overallScore >= 60 ? 'Stable' : 'Critical Deficits'}
                              </span>
                            </div>

                            {/* Dimension breakdown list */}
                            <div className="md:col-span-8 space-y-2">
                              <p className="font-bold text-slate-900 text-xs mb-3 uppercase tracking-wider text-slate-400">Dimension Breakdowns</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                                {health.breakdown.map((item) => (
                                  <div key={item.name} className="space-y-1">
                                    <div className="flex justify-between font-bold text-[9px] text-slate-500 uppercase">
                                      <span>{item.name}</span>
                                      <span>{item.score}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${
                                          item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                        }`} 
                                        style={{ width: `${item.score}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Historical trend */}
                          {selectedHealthStartup.healthHistory && selectedHealthStartup.healthHistory.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                              <p className="font-bold text-slate-905">Historical Health Snapshot</p>
                              <div className="flex gap-2 items-end h-16 bg-slate-50 border border-slate-100 rounded-xl p-3 select-none">
                                {selectedHealthStartup.healthHistory.map((hist, idx) => (
                                  <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end">
                                    <div 
                                      className={`w-full rounded-t-sm ${
                                        hist.score >= 80 ? 'bg-emerald-400' : hist.score >= 60 ? 'bg-amber-400' : 'bg-red-400'
                                      }`} 
                                      style={{ height: `${hist.score}%` }}
                                    ></div>
                                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap z-30">
                                      {hist.date}: {hist.score}%
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Alerts and Risk Flags */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div>
                              <p className="font-bold text-slate-900 mb-2">Active Flags & Assessments</p>
                              {selectedHealthStartup.riskFlags && selectedHealthStartup.riskFlags.length > 0 ? (
                                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                                  {selectedHealthStartup.riskFlags.map((flag, idx) => (
                                    <div key={idx} className={`p-2 rounded-lg border text-[10px] leading-relaxed ${
                                      flag.severity === 'High' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                                    }`}>
                                      <span className="font-black uppercase tracking-wider block text-[8px] text-slate-400">Flagged by Mentor</span>
                                      <strong>{flag.type}:</strong> {flag.description}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-400 italic">No risk flags registered.</p>
                              )}
                            </div>

                            <div>
                              <p className="font-bold text-slate-900 mb-2">Health Alerts Queue</p>
                              {selectedHealthStartup.healthAlerts && selectedHealthStartup.healthAlerts.length > 0 ? (
                                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                                  {selectedHealthStartup.healthAlerts.map((alert, idx) => (
                                    <div key={idx} className={`p-2 rounded-lg border text-[10px] leading-relaxed ${
                                      alert.resolved ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-red-50 border-red-200 text-red-800 font-medium'
                                    }`}>
                                      <div className="flex justify-between items-center mb-0.5">
                                        <span className="font-extrabold uppercase text-[7px] text-slate-400">Alert</span>
                                        {alert.resolved && <span className="text-[7.5px] uppercase font-black text-emerald-600">Resolved</span>}
                                      </div>
                                      <strong>{alert.title}:</strong> {alert.message}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-400 italic">No health alerts triggered.</p>
                              )}
                            </div>
                          </div>

                          {/* Intervention scheduling and logs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                            {/* Logs list */}
                            <div className="space-y-3">
                              <p className="font-bold text-slate-905">Intervention History Logs</p>
                              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                                {activeInterventions.map((log) => (
                                  <div key={log.id} className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                                    <div className="flex justify-between items-start">
                                      <strong className="text-slate-900 font-extrabold text-[11px] block">{log.title}</strong>
                                      <span className="px-2 py-0.2 bg-red-500 text-white rounded text-[8px] font-black uppercase">Active</span>
                                    </div>
                                    <p className="text-[10px] text-slate-655 leading-normal">{log.description}</p>
                                    <button
                                      onClick={() => {
                                        db.resolveInterventionLog(selectedHealthStartup.id, log.id);
                                        setDb(getDb());
                                        setSelectedHealthStartup(db.getStartup(selectedHealthStartup.id) || null);
                                        alert('Intervention resolved successfully.');
                                      }}
                                      className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded transition-colors"
                                    >
                                      Mark Resolved
                                    </button>
                                  </div>
                                ))}
                                
                                {resolvedInterventions.map((log) => (
                                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                                    <div className="flex justify-between items-start">
                                      <strong className="text-slate-600 font-bold block">{log.title}</strong>
                                      <span className="px-2 py-0.2 bg-slate-200 text-slate-500 rounded text-[8px] font-black uppercase">Resolved</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-normal">{log.description}</p>
                                  </div>
                                ))}

                                {activeInterventions.length === 0 && resolvedInterventions.length === 0 && (
                                  <p className="text-slate-400 italic text-center py-6 font-semibold">No interventions registered.</p>
                                )}
                              </div>
                            </div>

                            {/* Schedule Intervention Form */}
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5">
                              <div>
                                <h4 className="font-extrabold text-slate-800">Launch Growth Intervention Plan</h4>
                                <p className="text-[9.5px] text-slate-400 mt-0.5">Link a certified EIR to design a custom corrective action blueprint.</p>
                              </div>

                              <div className="space-y-3 text-xs">
                                <div>
                                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Intervention Focus / Title</label>
                                  <input 
                                    type="text" 
                                    value={interventionTitle}
                                    onChange={(e) => setInterventionTitle(e.target.value)}
                                    placeholder="e.g. Technical Spec & Product Validation Review"
                                    className="w-full px-3 py-1.5 border border-slate-205 rounded bg-white text-slate-850"
                                  />
                                </div>

                                <div>
                                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Action Items / Description</label>
                                  <textarea 
                                    value={interventionDesc}
                                    onChange={(e) => setInterventionDesc(e.target.value)}
                                    rows={2.5}
                                    placeholder="e.g. Conduct 2 hours product review, define missing Spec parameters and upload demo video."
                                    className="w-full p-2 border border-slate-205 rounded bg-white text-slate-850 resize-none"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Select EIR Advisor</label>
                                    <select
                                      value={interventionMentorId}
                                      onChange={(e) => setInterventionMentorId(e.target.value)}
                                      className="w-full px-2 py-1.5 border border-slate-205 rounded bg-white text-slate-800"
                                    >
                                      <option value="">Select EIR...</option>
                                      {db.getMentors().map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Schedule Date</label>
                                    <input 
                                      type="date" 
                                      value={interventionDate}
                                      onChange={(e) => setInterventionDate(e.target.value)}
                                      className="w-full px-2 py-1 border border-slate-205 rounded bg-white text-slate-800"
                                    />
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!interventionTitle.trim() || !interventionDesc.trim() || !interventionMentorId) {
                                      alert('Please fill out all intervention details.');
                                      return;
                                    }
                                    db.addInterventionLog(selectedHealthStartup.id, interventionTitle, interventionDesc);
                                    
                                    db.addSession({
                                      id: `session-${Date.now()}`,
                                      mentorId: interventionMentorId,
                                      startupId: selectedHealthStartup.id,
                                      scheduledAt: new Date(interventionDate).toISOString(),
                                      status: 'Scheduled',
                                      notes: `Formal Intervention Review: ${interventionTitle}. Notes: ${interventionDesc}`,
                                      aiSummary: '',
                                      actionItems: [interventionDesc]
                                    });

                                    const startup = db.getStartup(selectedHealthStartup.id);
                                    const founderIds = startup?.founders || [];
                                    const founder = founderIds.length > 0 ? db.getFounder(founderIds[0]) : null;
                                    if (founder && startup) {
                                      db.addNotification({
                                        id: `notif-${Date.now()}-i1`,
                                        userId: founder.email,
                                        type: 'review_pending',
                                        title: 'Intervention Plan Scheduled',
                                        message: `An intervention session has been scheduled for your startup by the manager: "${interventionTitle}".`,
                                        isRead: false,
                                        createdAt: new Date().toISOString(),
                                        linkTo: '/founder'
                                      });
                                    }

                                    const mentor = db.getMentor(interventionMentorId);
                                    if (mentor && startup) {
                                      db.addNotification({
                                        id: `notif-${Date.now()}-i2`,
                                        userId: mentor.email,
                                        type: 'mentor_assigned',
                                        title: 'Intervention Review Scheduled',
                                        message: `You have been assigned to lead an intervention review session for ${startup.name}.`,
                                        isRead: false,
                                        createdAt: new Date().toISOString(),
                                        linkTo: '/mentor'
                                      });
                                    }

                                    setDb(getDb());
                                    setSelectedHealthStartup(db.getStartup(selectedHealthStartup.id) || null);
                                    setInterventionTitle('');
                                    setInterventionDesc('');
                                    alert('Intervention successfully scheduled and logged! Notifications sent to Founder and Mentor.');
                                    confetti({ particleCount: 60, spread: 60, colors: ['#f97316', '#ef4444'] });
                                  }}
                                  className="w-full py-2.5 bg-red-600 hover:bg-red-750 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 animate-pulse"
                                >
                                  <ShieldCheck className="w-4 h-4" /> Deploy Intervention
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tab: Mentor Assignment */}
            {activeTab === 'mentors' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 mb-2">Mentor-Founder Mapping</h2>
                  <p className="text-xs text-slate-500 mb-6">Link domain expert mentors to incubated startups based on AI compatibility score alignments.</p>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-4 py-2.5">Startup</th>
                          <th className="px-4 py-2.5">Sector</th>
                          <th className="px-4 py-2.5">Incubation Stage</th>
                          <th className="px-4 py-2.5">Current Mentor</th>
                          <th className="px-4 py-2.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {db.getStartups().map(startup => {
                          const mentor = db.getMentors().find(m => m.portfolioStartups?.includes(startup.id));
                          return (
                            <tr key={startup.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-semibold text-slate-800">{startup.name}</td>
                              <td className="px-4 py-3 text-slate-500">{startup.sector}</td>
                              <td className="px-4 py-3">
                                <span className="uppercase text-[9px] font-bold bg-slate-100 border px-1.5 py-0.5 rounded text-slate-600">{startup.stage}</span>
                              </td>
                              <td className="px-4 py-3 text-slate-600 font-medium">
                                {mentor ? mentor.name : <span className="text-red-500 font-semibold">No Mentor Assigned</span>}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  onClick={() => {
                                    setAssigningStartup(startup);
                                    setSelectedMentorId(mentor?.id || '');
                                  }}
                                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-bold transition-all"
                                >
                                  {mentor ? 'Change Mentor' : 'Assign Mentor'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mentor Assignment Modal */}
                {assigningStartup && (
                  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 duration-150 space-y-6">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Incubator Allocation Module</span>
                        <h3 className="text-base font-black text-slate-900">Map Mentor to: {assigningStartup.name}</h3>
                        <p className="text-[11px] text-slate-450 mt-1">Startup sector is {assigningStartup.sector}. Review AI matching scores below.</p>
                      </div>

                      {/* AI Mentor Recommendations */}
                      <div className="space-y-3">
                        <span className="text-[9.5px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Matches for {assigningStartup.sector}
                        </span>
                        
                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                          {getAiMentors(assigningStartup.sector).map((rec, idx) => (
                            <div key={idx} className="p-3 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border border-emerald-100 rounded-xl text-xs flex justify-between gap-4">
                              <div className="space-y-1">
                                <strong className="text-slate-900 block">{rec.name}</strong>
                                <p className="text-[10px] text-slate-600 leading-normal"><span className="text-slate-400">Match Reason:</span> {rec.reason}</p>
                                <p className="text-[9px] text-emerald-700 leading-none font-bold"><span className="text-slate-400">Suggested Focus:</span> {rec.focus}</p>
                              </div>
                              <div className="shrink-0 flex flex-col justify-center">
                                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded text-center block leading-none">
                                  {rec.score}%
                                </span>
                                <span className="text-[7.5px] uppercase font-bold text-slate-400 text-center mt-1 block">Score</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Selector and assign action */}
                      <form onSubmit={handleAssignMentor} className="space-y-4 pt-4 border-t border-slate-100">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Select Mentor</label>
                          <select 
                            value={selectedMentorId} 
                            onChange={(e) => setSelectedMentorId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-205 rounded-lg text-xs text-slate-800 bg-white"
                            required
                          >
                            <option value="">Select a mentor from the AP database...</option>
                            {db.getMentors().map(mentor => (
                              <option key={mentor.id} value={mentor.id}>
                                {mentor.name} (Expertise: {mentor.expertise.join(', ')})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-2 text-xs">
                          <button type="submit" className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                            <Check className="w-4 h-4" /> Confirm Assignment
                          </button>
                          <button type="button" onClick={() => setAssigningStartup(null)} className="px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Stage Promotion Review */}
            {activeTab === 'promotions' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Stage Promotion Requests
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">Review recommendations submitted by lead mentors to promote startups through the AP GPS framework.</p>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-4 py-2.5">Startup</th>
                          <th className="px-4 py-2.5">Mentor</th>
                          <th className="px-4 py-2.5">Current Stage</th>
                          <th className="px-4 py-2.5">Proposed Stage</th>
                          <th className="px-4 py-2.5">Health / Milestone</th>
                          <th className="px-4 py-2.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {db.getStageRecommendations()
                          .filter(r => r.status === 'Pending')
                          .length > 0 ? (
                          db.getStageRecommendations()
                            .filter(r => r.status === 'Pending')
                            .map(rec => {
                              const startup = db.getStartup(rec.startupId);
                              const mentor = db.getMentor(rec.mentorId);
                              return (
                                <tr key={rec.id} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 font-semibold text-slate-800">{startup ? startup.name : 'Unknown Startup'}</td>
                                  <td className="px-4 py-3 text-slate-500 font-medium">{mentor ? mentor.name : 'Unknown Mentor'}</td>
                                  <td className="px-4 py-3 uppercase text-slate-450 font-bold">{rec.currentStage}</td>
                                  <td className="px-4 py-3 uppercase text-emerald-700 font-bold">{rec.proposedStage}</td>
                                  <td className="px-4 py-3 font-medium text-slate-600">
                                    Health: {rec.healthScore}% · Comp: {rec.milestoneCompletion}%
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button 
                                      onClick={() => {
                                        setSelectedRecommendation(rec);
                                        setManagerFeedback('');
                                        setIsRejectingRec(false);
                                      }}
                                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-bold transition-all inline-flex items-center gap-1"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> Evaluate
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-10 font-bold text-slate-450">
                              No pending stage promotion recommendations in the queue.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Promotion Evaluation Modal */}
                {selectedRecommendation && (
                  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 duration-150 space-y-5">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Incubation Board Evaluation</span>
                        <h3 className="text-base font-black text-slate-900">
                          Evaluate Stage Promotion: {db.getStartup(selectedRecommendation.startupId)?.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1">Recommended by Mentor: {db.getMentor(selectedRecommendation.mentorId)?.name}</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <p><span className="text-slate-400 block font-semibold text-[9px] uppercase">Current Stage</span> <strong className="uppercase text-slate-700 text-sm">{selectedRecommendation.currentStage}</strong></p>
                          <p><span className="text-slate-400 block font-semibold text-[9px] uppercase">Proposed Stage</span> <strong className="uppercase text-emerald-700 text-sm">{selectedRecommendation.proposedStage}</strong></p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                          <p><span className="text-slate-400 block font-semibold text-[9px] uppercase">Ecosystem Health score</span> <strong>{selectedRecommendation.healthScore}%</strong></p>
                          <p><span className="text-slate-400 block font-semibold text-[9px] uppercase">Milestone Completion</span> <strong>{selectedRecommendation.milestoneCompletion}%</strong></p>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-slate-400 block font-semibold text-[9px] uppercase">Mentor Recommendation Notes</span>
                          <p className="text-slate-650 leading-relaxed mt-1">{selectedRecommendation.notes}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {!isRejectingRec ? (
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-1">Approval Notes <span className="text-slate-400">(optional)</span></label>
                              <input 
                                type="text" 
                                value={managerFeedback} 
                                onChange={(e) => setManagerFeedback(e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" 
                                placeholder="Add comments for the incubation records..." 
                              />
                            </div>
                            <div className="flex gap-2 text-xs">
                              <button 
                                onClick={() => handleApprovePromotion(selectedRecommendation)}
                                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Check className="w-4 h-4" /> Approve Promotion
                              </button>
                              <button 
                                onClick={() => setIsRejectingRec(true)}
                                className="px-4 py-2.5 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Return to Mentor
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-3">
                            <p className="font-bold text-red-800">Return Request Feedback</p>
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-1">Feedback / Action Items Needed</label>
                              <textarea
                                value={managerFeedback}
                                onChange={(e) => setManagerFeedback(e.target.value)}
                                rows={3}
                                className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800"
                                placeholder="Explain what additional validation or milestone completion is required before promotion..."
                                required
                              />
                            </div>
                            <div className="flex gap-2 text-xs">
                              <button
                                onClick={() => handleRejectPromotion(selectedRecommendation)}
                                className="flex-1 py-2 bg-red-650 hover:bg-red-750 text-white font-bold rounded-lg transition-colors"
                              >
                                Confirm Return
                              </button>
                              <button
                                onClick={() => setIsRejectingRec(false)}
                                className="px-4 py-2 border border-slate-200 text-slate-650 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-1.5">
                    <Bell className="w-5 h-5 text-emerald-500" /> Notifications Hub
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">Recent telemetry notifications for incubation events, milestone reviews, and state alignments.</p>

                  <div className="space-y-3">
                    {db.getAllNotifications()
                      .filter(n => n.userId === activeManagerEmail || n.userId === 'manager@rtih.ap.gov.in')
                      .length > 0 ? (
                      db.getAllNotifications()
                        .filter(n => n.userId === activeManagerEmail || n.userId === 'manager@rtih.ap.gov.in')
                        .map(n => (
                          <div key={n.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs flex gap-3.5 items-start">
                            <span className="text-xl">🔔</span>
                            <div className="space-y-1">
                              <strong className="text-slate-905 block font-bold">{n.title}</strong>
                              <p className="text-slate-600 leading-normal">{n.message}</p>
                              <span className="text-[9.5px] text-slate-400 block">{new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-center py-10 font-bold text-slate-400 italic">No notifications in your timeline.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Communication Hub */}
            {activeTab === 'communications' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-5 h-5 text-emerald-500" /> Communication Hub
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">Direct secure channel matching founders, mentors, and program managers under the AP Startup framework.</p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Startup Conversations List */}
                    <div className="md:col-span-4 border border-slate-200 rounded-xl p-3 bg-white space-y-2 select-none">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 block mb-1">Cohorts Contacts</span>
                      {db.getStartups().map(s => {
                        const isSelected = activeChatStartupId === s.id;
                        return (
                          <div 
                            key={s.id}
                            onClick={() => setActiveChatStartupId(s.id)}
                            className={`p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {s.name}
                            <span className="text-[9px] text-slate-400 block font-normal">{s.sector}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Conversation Dialog */}
                    <div className="md:col-span-8 border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between min-h-[350px]">
                      {activeChatStartupId ? (
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="pb-3 border-b border-slate-100 flex justify-between items-center mb-4">
                              <div>
                                <h3 className="font-black text-slate-905 text-sm">
                                  {db.getStartup(activeChatStartupId)?.name} Chat
                                </h3>
                                <p className="text-[9px] text-slate-400">Secure channel logged by RTIH audits.</p>
                              </div>
                            </div>

                            {/* Messages area */}
                            <div className="space-y-3 max-h-[220px] overflow-y-auto mb-4 p-2 bg-slate-50/50 rounded-lg">
                              {db.getMessages(activeChatStartupId).length > 0 ? (
                                db.getMessages(activeChatStartupId)
                                  .map(m => {
                                    const isSelf = m.senderId === activeManagerEmail;
                                    return (
                                      <div key={m.id} className={`flex items-start gap-2.5 max-w-[85%] ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}>
                                        <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                                          isSelf 
                                            ? 'bg-emerald-500 text-white font-medium rounded-tr-none'
                                            : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none shadow-sm'
                                        }`}>
                                          <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider mb-0.5">
                                            {m.senderName} ({m.senderRole})
                                          </span>
                                          {m.content}
                                          <span className={`text-[7.5px] block text-right mt-1 ${isSelf ? 'text-emerald-100' : 'text-slate-400'}`}>
                                            {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                              ) : (
                                <p className="text-center py-10 font-bold text-slate-400 italic">Send the first message to initiate conversation.</p>
                              )}
                            </div>
                          </div>

                          <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-slate-100">
                            <input
                              type="text"
                              value={chatMessageContent}
                              onChange={(e) => setChatMessageContent(e.target.value)}
                              placeholder="Type your official message here..."
                              className="flex-1 bg-slate-50 border border-slate-205 rounded px-2.5 py-1.5 text-xs focus:outline-none text-slate-800"
                              required
                            />
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-650 text-white text-xs font-semibold rounded flex items-center justify-center shrink-0"
                            >
                              Send
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-slate-400 font-bold">
                          <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                          Select a startup contact from the left pane to view conversation logs.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: AI Advisor Chat */}
            {activeTab === 'advisor' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-[520px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                          <Bot className="w-5 h-5 text-emerald-500 animate-pulse" /> AI Program Advisor
                        </h2>
                        <p className="text-xs text-slate-500">Query cohort trends, risk triggers, performance, or EIR utilization rates.</p>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                        isAiLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAiLive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                        {isAiLive ? `Live AI Model (${aiProvider})` : 'Sandbox Fallback'}
                      </span>
                    </div>

                    {/* Pre-fill Chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[
                        'Which startups need intervention?',
                        'Review stage promotion requests',
                        'Show cohort performance metrics',
                        'Identify underutilized mentors'
                      ].map(chip => (
                        <button
                          key={chip}
                          onClick={() => setChatInput(chip)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full text-[10.5px] font-semibold text-slate-600 transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {/* Chat Messages */}
                    <div className="h-[270px] overflow-y-auto border border-slate-150 bg-slate-50/50 rounded-xl p-4 space-y-4">
                      {chatHistory.map((chat, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-start gap-2.5 max-w-[85%] ${
                            chat.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                          }`}
                        >
                          <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                            chat.sender === 'user'
                              ? 'bg-emerald-500 text-white font-medium rounded-tr-none shadow-sm'
                              : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none shadow-sm'
                          }`}>
                            {chat.text}
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex items-center gap-2 text-xs text-slate-455 animate-pulse">
                          <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                          Analyzing regional cohort telemetry...
                        </div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-slate-100 pt-4 mt-4">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the AI Advisor: e.g. Which startups are flagged as high risk?"
                      className="flex-1 bg-slate-50 border border-slate-205 rounded px-3 py-2 text-xs focus:outline-none text-slate-800"
                    />
                    <button
                      type="submit"
                      disabled={isTyping}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-250 bg-white py-8 text-center text-xs text-slate-400 mt-10">
        <p className="font-medium text-slate-600 text-center">
          Andhra Pradesh Innovation Command Center • Program Manager Console
        </p>
        <p className="mt-2 text-[10px] text-center">
          Authorized manager operations active. Telemetry compiled under AP Innovation Society guidelines.
        </p>
      </footer>
    </div>
  );
}
