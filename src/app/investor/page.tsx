'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { 
  getDb, 
  Startup, 
  Investor, 
  Document, 
  getActiveUser, 
  DISTRICTS, 
  SECTORS 
} from '@/lib/mockDb';
import { 
  calculateVentureHealth, 
  predictStartupRisk, 
  matchGovernmentSchemes, 
  calculateInnovationScore 
} from '@/lib/engines';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Briefcase, 
  Bot, 
  FileText, 
  Send, 
  ArrowUpRight, 
  ShieldAlert, 
  Sparkles, 
  Calendar, 
  Mail, 
  ChevronRight, 
  Award, 
  HelpCircle,
  Building,
  Activity,
  Layers,
  MapPin,
  Clock,
  Heart,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { showToast } from '@/lib/toast';

// Helper functions for rendering Markdown in chatbot messages
const parseInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx} className="italic text-slate-800">{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={lineIdx} className="h-2" />;
    }

    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace('### ', '');
      return (
        <h4 key={lineIdx} className="text-xs font-black text-slate-900 mt-2.5 mb-1.5 flex items-center gap-1">
          {parseInlineMarkdown(headingText)}
        </h4>
      );
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const bulletText = trimmed.substring(2);
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 pl-2 my-0.5 text-xs text-slate-700 leading-relaxed">
          <span className="text-emerald-500 font-bold text-sm leading-none">•</span>
          <span className="flex-1">{parseInlineMarkdown(bulletText)}</span>
        </div>
      );
    }

    const matchNumbered = trimmed.match(/^(\d+)\.\s(.*)/);
    if (matchNumbered) {
      const num = matchNumbered[1];
      const itemText = matchNumbered[2];
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 pl-2 my-0.5 text-xs text-slate-700 leading-relaxed">
          <span className="text-emerald-600 font-bold leading-none">{num}.</span>
          <span className="flex-1">{parseInlineMarkdown(itemText)}</span>
        </div>
      );
    }

    return (
      <p key={lineIdx} className="text-xs text-slate-700 my-1 leading-relaxed">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
};

export default function InvestorDashboard({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'directory' | 'watchlist' | 'analytics' | 'copilot'>('directory');
  
  // Database State
  const [startups, setStartups] = useState<Startup[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [minHealth, setMinHealth] = useState(0);
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Selected Startup for Modal
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  // AI Assistant State
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: "Hello! I am your **RTIH Investor Assistant**. I can help you analyze the AP startup ecosystem, screen high-health ventures, verify matching government grant qualifications, and identify soonicorns. What are you looking to discover today?"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize and check active user
  useEffect(() => {
    const user = getActiveUser();
    if (!user || user.role !== 'investor') {
      if (!embedded) {
        router.push('/login');
        return;
      }
    }
    setCurrentUser(user);

    const db = getDb();
    setStartups(db.getStartups());
    
    // Load watchlist
    if (user) {
      const wl = db.getWatchlists().find(w => w.investorId === user.id);
      if (wl) {
        setWatchlist(wl.startupIds);
      } else {
        setWatchlist([]);
      }
    }
  }, [embedded, router]);

  // Handle Watchlist Toggles
  const toggleWatchlist = (startupId: string) => {
    if (!currentUser) return;
    const db = getDb();
    const isWatchlisted = watchlist.includes(startupId);
    const action = isWatchlisted ? 'remove' : 'add';
    
    db.updateWatchlist(currentUser.id, startupId, action);
    
    // Reload watchlist state
    const wl = db.getWatchlists().find(w => w.investorId === currentUser.id);
    if (wl) {
      setWatchlist(wl.startupIds);
    }

    if (action === 'add') {
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
      showToast('Added to your watchlist!', 'success');
    } else {
      showToast('Removed from watchlist.', 'info');
    }
  };

  // Filtered Startups
  const filteredStartups = useMemo(() => {
    return startups.filter(startup => {
      const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            startup.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            startup.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSector = !selectedSector || startup.sector === selectedSector;
      const matchesStage = !selectedStage || startup.stage.toLowerCase() === selectedStage.toLowerCase();
      const matchesDistrict = !selectedDistrict || startup.district === selectedDistrict;
      const matchesHealth = startup.healthScore >= minHealth;
      const matchesVerified = !showOnlyVerified || startup.healthScore >= 75;

      return matchesSearch && matchesSector && matchesStage && matchesDistrict && matchesHealth && matchesVerified;
    });
  }, [startups, searchTerm, selectedSector, selectedStage, selectedDistrict, minHealth, showOnlyVerified]);

  // Stats
  const stats = useMemo(() => {
    const totalCount = startups.length;
    const watchlistCount = watchlist.length;
    const avgHealth = Math.round(startups.reduce((acc, s) => acc + s.healthScore, 0) / (totalCount || 1));
    const soonicorns = startups.filter(s => s.healthScore >= 80).length;
    return { totalCount, watchlistCount, avgHealth, soonicorns };
  }, [startups, watchlist]);

  // Express Investment Interest
  const handleExpressInterest = (startup: Startup) => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
    showToast(`Interest request submitted for ${startup.name}! The founders and RTIH manager have been notified.`, 'success');
    if (!watchlist.includes(startup.id)) {
      toggleWatchlist(startup.id);
    }
  };

  // Schedule Meeting Submission
  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartup) return;
    showToast(`Meeting scheduled with ${selectedStartup.name} founders for ${meetingDate} at ${meetingTime}!`, 'success');
    setMeetingModalOpen(false);
    setMeetingDate('');
    setMeetingTime('');
    setMeetingNotes('');
  };

  // Recharts Analytics
  const sectorData = useMemo(() => {
    const data: Record<string, number> = {};
    startups.forEach(s => {
      data[s.sector] = (data[s.sector] || 0) + 1;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [startups]);

  const stageData = useMemo(() => {
    const data: Record<string, number> = {};
    startups.forEach(s => {
      data[s.stage.toUpperCase()] = (data[s.stage.toUpperCase()] || 0) + 1;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [startups]);

  const healthData = useMemo(() => {
    return [
      { name: 'Critical (<50)', value: startups.filter(s => s.healthScore < 50).length },
      { name: 'Stable (50-74)', value: startups.filter(s => s.healthScore >= 50 && s.healthScore < 75).length },
      { name: 'Healthy (75-89)', value: startups.filter(s => s.healthScore >= 75 && s.healthScore < 90).length },
      { name: 'Excellent (90+)', value: startups.filter(s => s.healthScore >= 90).length }
    ];
  }, [startups]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // AI Chat Submission
  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptText = customPrompt || chatInput;
    if (!promptText.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: promptText }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          role: 'Investor',
          startupContext: {
            watchlistCount: watchlist.length,
            averageHealth: stats.avgHealth,
            soonicorns: stats.soonicorns
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.text, provider: data.provider }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Sorry, I encountered an issue connecting to the RTIH AI nodes. Please retry your request." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Network connectivity failed. Verify your server dev state." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {!embedded && <Navigation />}

      <div className={`${embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'} space-y-6`}>
        {/* Profile / Stats Header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Welcome back, {currentUser?.name || 'Suresh Naidu'}
            </h1>
            <p className="text-xs text-slate-450 uppercase tracking-widest font-bold">
              {currentUser?.firmName || 'Amaravati Ventures'} • Managing Partner
            </p>
          </div>
          
          {/* Header KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Startups</span>
              <strong className="text-lg text-slate-900">{stats.totalCount}</strong>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Watchlist</span>
              <strong className="text-lg text-emerald-600">{stats.watchlistCount}</strong>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Avg Health</span>
              <strong className="text-lg text-blue-600">{stats.avgHealth}%</strong>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Soonicorns</span>
              <strong className="text-lg text-purple-600">{stats.soonicorns}</strong>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm border">
          <button 
            onClick={() => setActiveTab('directory')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'directory' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            Startup Directory
          </button>
          <button 
            onClick={() => setActiveTab('watchlist')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'watchlist' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-4 h-4" />
            My Watchlist
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'analytics' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            Ecosystem Analytics
          </button>
          <button 
            onClick={() => setActiveTab('copilot')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'copilot' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Investment Co-Pilot
          </button>
        </div>

        {/* TAB 1: STARTUP DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            {/* Filters panel */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search by name, tags, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 cursor-pointer"
                  >
                    <Filter className="w-4 h-4" /> Filters {showFilters ? <ChevronDown className="w-3 h-3 rotate-180 transition-transform" /> : <ChevronDown className="w-3 h-3 transition-transform" />}
                  </button>
                  <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={showOnlyVerified} 
                      onChange={(e) => setShowOnlyVerified(e.target.checked)}
                      className="accent-emerald-500" 
                    />
                    High Health (&gt;75)
                  </label>
                </div>
              </div>

              {/* Advanced Filters Drawer */}
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sector</label>
                    <select 
                      value={selectedSector} 
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">All Sectors</option>
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">GPS Stage</label>
                    <select 
                      value={selectedStage} 
                      onChange={(e) => setSelectedStage(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">All Stages</option>
                      <option value="Idea">Idea Stage</option>
                      <option value="Validation">Validation Stage</option>
                      <option value="Prototype">Prototype Stage</option>
                      <option value="MVP">MVP Launch</option>
                      <option value="Users">User Traction</option>
                      <option value="Revenue">Revenue Generation</option>
                      <option value="Funding">Seed Funding</option>
                      <option value="Scale">Global Scaling</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">AP District</label>
                    <select 
                      value={selectedDistrict} 
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">All Districts</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Health Score</label>
                      <span className="text-[10px] font-bold text-emerald-600">{minHealth}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={minHealth}
                      onChange={(e) => setMinHealth(Number(e.target.value))}
                      className="w-full accent-emerald-500 mt-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Startups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStartups.map(startup => {
                const isWatchlisted = watchlist.includes(startup.id);
                return (
                  <div 
                    key={startup.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all relative flex flex-col justify-between"
                  >
                    {/* Top Row */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${
                          startup.healthScore >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          startup.healthScore >= 50 ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {startup.stage}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Watchlist Star */}
                          <button 
                            onClick={() => toggleWatchlist(startup.id)}
                            className={`p-1.5 rounded-xl border cursor-pointer hover:bg-slate-50 transition-colors ${
                              isWatchlisted ? 'bg-amber-50 text-amber-500 border-amber-250' : 'bg-white text-slate-400 border-slate-200'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-amber-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div>
                        <h3 
                          onClick={() => setSelectedStartup(startup)}
                          className="font-black text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer text-base"
                        >
                          {startup.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-0.5">{startup.sector} • {startup.district}</p>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{startup.tagline}</p>
                      
                      {/* Metric widgets */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                        <div className="text-center">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Health Index</span>
                          <strong className={`text-xs ${
                            startup.healthScore >= 75 ? 'text-emerald-600' :
                            startup.healthScore >= 50 ? 'text-blue-600' :
                            'text-red-500'
                          }`}>{startup.healthScore}%</strong>
                        </div>
                        <div className="text-center">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Runway</span>
                          <strong className="text-xs text-slate-700">{startup.liveMetrics?.runwayMonths || '12'} Mo</strong>
                        </div>
                        <div className="text-center">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Revenue (Mo)</span>
                          <strong className="text-xs text-slate-700">₹{(startup.monthlyRevenue / 1000).toFixed(0)}k</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex gap-2 pt-4 mt-4 border-t border-slate-100">
                      <button 
                        onClick={() => setSelectedStartup(startup)}
                        className="flex-1 py-2 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        Venture Profile
                      </button>
                      <button 
                        onClick={() => handleExpressInterest(startup)}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        Invest Interest
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredStartups.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                <p className="text-sm text-slate-500">No startups match your current search parameters. Try widening filters.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WATCHLIST */}
        {activeTab === 'watchlist' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Watchlisted Seed Ventures ({watchlist.length})
            </h2>

            {watchlist.length > 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Startup</th>
                      <th className="px-6 py-4 text-center">Venture Health</th>
                      <th className="px-6 py-4 text-center">GPS Stage</th>
                      <th className="px-6 py-4 text-right">ARR (INR)</th>
                      <th className="px-6 py-4 text-center">Active Users</th>
                      <th className="px-6 py-4 text-center">Jobs Created</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {startups.filter(s => watchlist.includes(s.id)).map(startup => (
                      <tr key={startup.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <strong 
                              onClick={() => setSelectedStartup(startup)}
                              className="font-bold text-slate-800 hover:text-emerald-600 transition-colors cursor-pointer"
                            >
                              {startup.name}
                            </strong>
                            <p className="text-[10px] text-slate-450">{startup.sector} • {startup.district}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-lg font-bold border ${
                            startup.healthScore >= 75 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-blue-50 border-blue-100 text-blue-700'
                          }`}>
                            {startup.healthScore}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center uppercase tracking-wider font-bold text-[10px] text-slate-500">
                          {startup.stage}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">
                          ₹{(startup.monthlyRevenue * 12).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold">
                          {startup.activeUsers.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {startup.jobsCreated} jobs
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setSelectedStartup(startup); setMeetingModalOpen(true); }}
                              className="p-1.5 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-xl cursor-pointer"
                              title="Schedule Call"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleExpressInterest(startup)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-white transition-colors cursor-pointer"
                            >
                              Co-Invest
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <Star className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-500">You haven't watchlisted any startups yet. Click the stars on the directory cards to bookmark ventures.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ECOSYSTEM ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sector Density */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sector Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GPS Stage distribution */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">GPS Stage Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Health Categorization */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Health Index Breakdown</h3>
              <div className="h-64 flex justify-between items-center">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {healthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {healthData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="text-slate-500 font-medium">{item.name}:</span>
                      <strong className="text-slate-800 font-bold">{item.value} startups</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ecosystem KPI Summary */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AP Ecosystem Command Data</h3>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-100">
                  <span className="text-slate-500">AP IT Policy (2021-2026) Co-Invest Target</span>
                  <strong className="text-slate-800">500,000,000 INR</strong>
                </div>
                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-100">
                  <span className="text-slate-500">Soonicorn Cohort Capacity</span>
                  <strong className="text-slate-800">20 Active Slots</strong>
                </div>
                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-100">
                  <span className="text-slate-500">Total Capital Linkages Initiated</span>
                  <strong className="text-emerald-600">3,40,00,000 INR</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Regional Outreach Nodes</span>
                  <strong className="text-slate-800">6 Central Hub Hubs</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI INVESTMENT CO-PILOT */}
        {activeTab === 'copilot' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Prompts Panel */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-500" />
                Screener Queries
              </h3>
              <p className="text-xs text-slate-500 leading-normal">
                Click any of these predefined thesis screens to query the active state incubator database:
              </p>
              
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={() => handleSendMessage(undefined, "Which AgriTech startups have the highest health score in Visakhapatnam?")}
                  className="text-left px-3 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-[11px] font-bold text-slate-600 transition-colors border border-slate-100 cursor-pointer"
                >
                  🌾 Highest health AgriTech in Visakhapatnam
                </button>
                <button 
                  onClick={() => handleSendMessage(undefined, "Show validation-stage MedTech startups with low risk profile")}
                  className="text-left px-3 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-[11px] font-bold text-slate-600 transition-colors border border-slate-100 cursor-pointer"
                >
                  🧬 Low-risk validation-stage MedTech
                </button>
                <button 
                  onClick={() => handleSendMessage(undefined, "Summarize the AP Startup Policy matching grants matching criteria")}
                  className="text-left px-3 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-[11px] font-bold text-slate-600 transition-colors border border-slate-100 cursor-pointer"
                >
                  💰 Matching grants policy summaries
                </button>
              </div>
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-[480px] flex flex-col justify-between">
              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                      m.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-emerald-600'
                    }`}>
                      {m.role === 'user' ? 'U' : 'AI'}
                    </div>
                    <div className={`p-4 rounded-3xl border text-xs leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-emerald-500 text-white border-emerald-600 rounded-tr-none' 
                        : 'bg-slate-50 text-slate-800 border-slate-150 rounded-tl-none'
                    }`}>
                      {m.role === 'user' ? m.content : renderMarkdown(m.content)}
                      {m.provider && (
                        <div className="text-[8px] font-black text-slate-400 mt-2 text-right uppercase tracking-wider">
                          Provided by {m.provider}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full shrink-0 bg-slate-100 text-emerald-600 flex items-center justify-center text-xs font-bold animate-pulse">AI</div>
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-3xl rounded-tl-none text-xs text-slate-400">
                      Typing thesis report audit...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-slate-100 mt-4">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about soonicorn predictions, sector trends, or runway risk audits..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl bg-slate-50/50"
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim()}
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STARTUP DETAILS MODAL */}
        {selectedStartup && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50 sticky top-0 z-10">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-slate-900">{selectedStartup.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold border bg-emerald-50 border-emerald-100 text-emerald-700 uppercase tracking-widest">
                      {selectedStartup.stage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{selectedStartup.tagline}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{selectedStartup.sector} • {selectedStartup.district} District</p>
                </div>
                <button 
                  onClick={() => setSelectedStartup(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                
                {/* 1. Health Index vs Innovation Score KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-emerald-50/50 border border-emerald-150 p-4 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-emerald-700 block uppercase tracking-wider">Venture Health Score</span>
                    <strong className="text-2xl text-emerald-600 block mt-1">{selectedStartup.healthScore}%</strong>
                    <span className="text-[9px] text-emerald-500 font-bold mt-1 block">Category: {selectedStartup.healthScore >= 75 ? 'Healthy' : 'Stable'}</span>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-150 p-4 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-blue-700 block uppercase tracking-wider">Innovation Score</span>
                    <strong className="text-2xl text-blue-600 block mt-1">
                      {calculateInnovationScore(selectedStartup, 2, true, 0.8)}%
                    </strong>
                    <span className="text-[9px] text-blue-500 font-bold mt-1 block">GPS Verified standing</span>
                  </div>

                  <div className="bg-purple-50/50 border border-purple-150 p-4 rounded-2xl text-center animate-pulse-subtle">
                    <span className="text-[10px] font-bold text-purple-700 block uppercase tracking-wider">Soonicorn Compatibility</span>
                    <strong className="text-2xl text-purple-600 block mt-1">{selectedStartup.healthScore + 5}%</strong>
                    <span className="text-[9px] text-purple-500 font-bold mt-1 block">Priority Cohort Rating</span>
                  </div>
                </div>

                {/* 2. Core Financial telemetry */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Financial Telemetry</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Monthly Revenue</span>
                      <strong className="text-sm text-slate-800">₹{selectedStartup.monthlyRevenue.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Funding Raised</span>
                      <strong className="text-sm text-slate-800">₹{selectedStartup.totalFunding.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Monthly Burn</span>
                      <strong className="text-sm text-slate-800">₹{(selectedStartup.monthlyRevenue * 0.4).toLocaleString()}</strong>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Active Runway</span>
                      <strong className="text-sm text-emerald-600">{selectedStartup.liveMetrics?.runwayMonths || '12'} Months</strong>
                    </div>
                  </div>
                </div>

                {/* 3. Venture health breakdown sliders */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Venture Health breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {calculateVentureHealth(selectedStartup).breakdown.map((item, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold">{item.name}</span>
                          <strong className="text-slate-700 font-black">{item.score}%</strong>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${item.score}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Risk audit */}
                <div className="p-4 border border-red-100 bg-red-50/20 rounded-2xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <h4 className="font-bold text-red-700">Venture Risk Assessment</h4>
                    <p className="text-slate-600 leading-normal">
                      Overall Risk: <strong className="text-red-600">{predictStartupRisk(selectedStartup).overallRisk}</strong>. 
                      {predictStartupRisk(selectedStartup).indicators[0]?.detail || 'Runway dependent on milestone speed.'}
                    </p>
                  </div>
                </div>

                {/* 5. Policy grant incentives */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Matching Government Grants (AP Startup Policy)</h3>
                  <div className="space-y-2">
                    {matchGovernmentSchemes(selectedStartup).slice(0, 2).map((scheme, idx) => (
                      <div key={idx} className="p-3 border border-slate-150 rounded-xl bg-slate-50/25 flex justify-between gap-4">
                        <div className="text-xs space-y-1">
                          <strong className="text-slate-800 block">{scheme.name}</strong>
                          <span className="text-[10px] text-slate-450 block uppercase font-bold">{scheme.department}</span>
                          <p className="text-slate-500 leading-normal mt-1">{scheme.benefits}</p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col justify-center">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Match Rating</span>
                          <strong className="text-sm text-emerald-600">{scheme.matchingScore}%</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Documents Vault */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Documents Vault</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 border border-slate-100 hover:border-emerald-500 rounded-xl flex items-center justify-between bg-slate-50/50 hover:bg-white transition-all">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-700">Investor Pitch Deck v2</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer">Download</span>
                    </div>

                    <div className="p-3 border border-slate-100 hover:border-emerald-500 rounded-xl flex items-center justify-between bg-slate-50/50 hover:bg-white transition-all">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-700">Financial Forecast Projections</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer">Download</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 bg-slate-50">
                <button 
                  onClick={() => toggleWatchlist(selectedStartup.id)}
                  className={`px-5 py-2.5 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    watchlist.includes(selectedStartup.id) ? 'bg-amber-50 border-amber-250 text-amber-600' : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100'
                  }`}
                >
                  {watchlist.includes(selectedStartup.id) ? '★ Bookmarked' : '☆ Watchlist'}
                </button>
                <button 
                  onClick={() => setMeetingModalOpen(true)}
                  className="px-5 py-2.5 border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 text-slate-650 hover:text-emerald-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Schedule Deep-Dive
                </button>
                <button 
                  onClick={() => handleExpressInterest(selectedStartup)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Express Co-Invest Interest
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MEETING SCHEDULER MODAL */}
        {meetingModalOpen && selectedStartup && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[1px] z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">Schedule Meeting: {selectedStartup.name}</h3>
                <button 
                  onClick={() => setMeetingModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleScheduleMeeting} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                    <input 
                      type="date" 
                      required 
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</label>
                    <input 
                      type="time" 
                      required 
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meeting Agenda / Notes</label>
                  <textarea 
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    placeholder="Describe specific items you wish to discuss (e.g. Unit economics review, technology demo)..."
                    className="w-full p-3 h-24 resize-none border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirm & Schedule Meeting
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
