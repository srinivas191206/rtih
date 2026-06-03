'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { getDb, Startup, SECTORS, DISTRICTS, isExecutiveModeActive, getActiveUser } from '@/lib/mockDb';
import { calculateVentureHealth, predictStartupRisk } from '@/lib/engines';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ShieldCheck, Sparkles, Bot, AlertOctagon, TrendingUp, Users, Calendar, Coins, Send, Filter, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

const PIE_COLORS = ['#00A86B', '#008080', '#3A86C8', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16'];

export default function ProgramManagerDashboard() {
  const router = useRouter();
  const [db, setDb] = useState(() => getDb());
  const [execActive, setExecActive] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAiLive, setIsAiLive] = useState(false);
  const [aiProvider, setAiProvider] = useState('Checking...');

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
        text: 'Salutations! I am your RTIH AI Program Advisor. Ask me: "Which startups need intervention?", "Show sector growth velocity", or "Identify underutilized mentors".' 
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

  const filteredStartups = useMemo(() => {
    let list = db.getStartups();
    if (selectedSector !== 'All') {
      list = list.filter(s => s.sector === selectedSector);
    }
    if (selectedDistrict !== 'All') {
      list = list.filter(s => s.district === selectedDistrict);
    }
    return list;
  }, [db, selectedSector, selectedDistrict]);

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

  const handleScheduleIntervention = (startupName: string) => {
    alert(`Intervention scheduled. RTIH EIR and technical advisors linked to ${startupName}. Email notification sent to founders.`);
    confetti({
      particleCount: 50,
      colors: ['#ef4444', '#f97316']
    });
  };

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


  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header console */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-orange-500" />
              Ecosystem Management Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analyze regional startup cohorts, monitor mentor utilization ratios, review risk reports, and chat with your AI Program Advisor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <label className="font-semibold text-slate-500">Sector:</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 focus:outline-none"
              >
                <option value="All">All Sectors</option>
                {SECTORS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <label className="font-semibold text-slate-500">District:</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 focus:outline-none"
              >
                <option value="All">All Districts</option>
                {DISTRICTS.slice(0, 8).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Executive Mode Briefing */}
        {execActive && (
          <section className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">
                AI Executive briefing: Ecosystem Pipeline Diagnostics
              </h3>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-orange-500/10">
                <span className="font-bold text-slate-800 dark:text-slate-200">Ecosystem Metric Summary:</span>
                <p className="mt-1">Active filter matches **{filteredStartups.length}** companies. Average health indicators sits at **78%**.</p>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-orange-500/10">
                <span className="font-bold text-slate-800 dark:text-slate-200">Resource Allocations:</span>
                <p className="mt-1">Mentor utilization sits at **68%**. Recommended matches have been calculated for Climate segments.</p>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-orange-500/10">
                <span className="font-bold text-slate-800 dark:text-slate-200">Critical Risks:</span>
                <p className="mt-1">Ecosystem risk indicators flag **{highRiskStartups.length}** startups needing intervention. Runway checks linked.</p>
              </div>
            </div>
          </section>
        )}

        {/* Metrics widgets */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Ecosystem Health</p>
            <p className="text-xl font-black text-slate-950 dark:text-white mt-1">78/100</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Active Mentors</p>
            <p className="text-xl font-black text-slate-950 dark:text-white mt-1">80 EIRs</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Mentor Utilization</p>
            <p className="text-xl font-black text-slate-950 dark:text-white mt-1">68.4%</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Cohort Size</p>
            <p className="text-xl font-black text-slate-950 dark:text-white mt-1">
              {filteredStartups.length} Startups
            </p>
          </div>
        </section>

        {/* Recharts Analytics */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-500" />
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
              
              <div className="flex flex-col gap-1.5 text-[9px] font-semibold text-slate-500 pr-4">
                {sectorPieData.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                    <span>{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-855 dark:text-slate-200 mb-4 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-500" />
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
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Risk Radar & AI Dialog */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <AlertOctagon className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                Startup Risk Intervention Radar
              </h3>
              <p className="text-[10px] text-slate-400 mb-4 leading-normal">
                Ecosystem startups flagged with high runway risks, low team scores, or execution deficits.
              </p>

              <div className="space-y-3.5">
                {highRiskStartups.map((item) => (
                  <div
                    key={item.startup.id}
                    className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs flex justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white leading-tight">
                          {item.startup.name}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-red-500 bg-red-500/15 px-1 rounded">
                          {item.startup.sector}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        Trigger: {item.report.indicators[0]?.detail || 'Deficits in operational milestones.'}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <button
                        onClick={() => handleScheduleIntervention(item.startup.name)}
                        className="px-2.5 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold"
                      >
                        Intervene
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[9px] text-slate-450 flex items-center justify-between">
              <span>Risk checks updated daily.</span>
              <button className="text-orange-500 hover:underline font-bold">Configure Risk parameters →</button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[380px]">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-orange-500" />
                  AI Program Advisor
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold self-start sm:self-auto ${
                  isAiLive 
                    ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-300' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${isAiLive ? 'bg-orange-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  {isAiLive ? `Live AI (${aiProvider})` : 'Local Sandbox Mode'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mb-4 leading-normal">
                Ask about cohort trends, risk triggers, or EIR match schedules.
              </p>


              <div className="h-[190px] overflow-y-auto border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 rounded-lg p-3 space-y-3">
                {chatHistory.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      chat.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                      chat.sender === 'user'
                        ? 'bg-orange-500 text-white font-medium rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                      {chat.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-455 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    Computing ecosystem intelligence...
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask: Which startups need intervention?"
                className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs focus:outline-none text-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={isTyping}
                className="px-3 py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
