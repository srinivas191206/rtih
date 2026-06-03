'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { getDb, isExecutiveModeActive, isDemoModeActive, getActiveUser } from '@/lib/mockDb';
import InnovationGraph from '@/components/InnovationGraph';
import PipelineFunnel from '@/components/PipelineFunnel';
import { ShieldAlert, TrendingUp, Award, Coins, HelpCircle, Landmark, Trophy, Users, Star, BarChart3, ShieldCheck, Bot } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminCommandCenter() {
  const router = useRouter();
  const [db, setDb] = useState(() => getDb());
  const [execActive, setExecActive] = useState(false);
  const [demoActive, setDemoActive] = useState(false);

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
    setDb(getDb());
    setExecActive(isExecutiveModeActive());
    setDemoActive(isDemoModeActive());
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Banner Title */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Andhra Pradesh Innovation Command Center
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official executive dashboard for RTIH ecosystem deployment, policy tracking, and prediction models.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            AP State Admin Active Console
          </span>
        </section>

        {/* AI Executive Briefing Panel (Visible only when Executive Mode is active) */}
        {execActive && (
          <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                AI State Executive Briefing: Ecosystem Health
              </h3>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900/60 p-3.5 rounded-lg border border-emerald-500/10">
                <span className="font-bold text-slate-800 dark:text-slate-200">State Scale Ratios:</span>
                <p className="mt-1">Active registered startups sitting at {stats.totalStartups.toLocaleString()} ({(stats.totalStartups/stats.targetStartups*100).toFixed(0)}% of 2029 goals). Jobs created sitting at {stats.totalJobs.toLocaleString()}.</p>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-3.5 rounded-lg border border-emerald-500/10">
                <span className="font-bold text-slate-800 dark:text-slate-200">Scale Targets Discovery:</span>
                <p className="mt-1">Unicorn potential engine flags {stats.unicorns} candidates with more than 80% growth velocity. Soonicorn targets show {stats.soonicorns} companies.</p>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-3.5 rounded-lg border border-emerald-500/10">
                <span className="font-bold text-slate-800 dark:text-slate-200">Ecosystem Risk Audit:</span>
                <p className="mt-1">Ecosystem risk indicators sit at Low. We identified runway constraints in AgriTech segments; Seed disbursements linked.</p>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-3.5 rounded-lg border border-emerald-500/10">
                <span className="font-bold text-slate-800 dark:text-slate-200">CM Policy Recommendations:</span>
                <p className="mt-1">Recommend expanding matching seed fund pools for women-led startups by 15% to accelerate regional district metrics.</p>
              </div>
            </div>
          </section>
        )}

        {/* Live Metrics Scorecards */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Live Startup Count</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalStartups.toLocaleString()}
            </h3>
            <p className="text-[8px] text-slate-400 mt-1 leading-none">Goal by 2029: 20,000</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Jobs Created</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalJobs.toLocaleString()}
            </h3>
            <p className="text-[8px] text-slate-400 mt-1 leading-none">Goal by 2029: 100,000</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Soonicorn Pipeline</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.soonicorns}
            </h3>
            <p className="text-[8px] text-slate-400 mt-1 leading-none">Goal by 2029: 20+</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Unicorn Track</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.unicorns}
            </h3>
            <p className="text-[8px] text-slate-400 mt-1 leading-none">Goal by 2029: 10+</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm text-center col-span-2 lg:col-span-1">
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
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
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
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-1 flex items-center gap-1.5">
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
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-xs flex justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white leading-tight">
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

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[9px] text-slate-400">
              Score factors include compound revenue velocity and customer net promoter logs.
            </div>
          </div>

          {/* Soonicorn Discovery Engine */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-1 flex items-center gap-1.5">
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
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-xs flex justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white leading-tight">
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

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[9px] text-slate-400">
              Evaluates total addressable market (TAM) sizing logs and MVP feedback parameters.
            </div>
          </div>

          {/* Economic Projections Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-4 flex items-center gap-1.5">
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

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-[10px] text-slate-400">
              <span>Goal Target: <strong>20k Companies by 2029</strong></span>
              <span>Projected Grants: <strong>₹250Cr</strong></span>
            </div>
          </div>
        </section>

        {/* Policy Impact audits */}
        <section className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-5">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
            Active Policy Impact Audits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
              <p className="font-bold text-slate-900 dark:text-white">Domestic Patent Filings</p>
              <p className="text-[10px] text-slate-400 mt-0.5">AP IT Policy Subsidies</p>
              <p className="text-lg font-black text-emerald-600 mt-2">124 Patents</p>
              <p className="text-[9px] text-slate-400 mt-1">100% filing fee reimbursement completed.</p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
              <p className="font-bold text-slate-900 dark:text-white">Women Entrepreneur Quota</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Standup AP Mandates</p>
              <p className="text-lg font-black text-blue-600 mt-2">28.2% Active</p>
              <p className="text-[9px] text-slate-400 mt-1">Target quota: 30% female equity threshold.</p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
              <p className="font-bold text-slate-900 dark:text-white">Rythu Linkage Integrations</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Dept of Agriculture pilots</p>
              <p className="text-lg font-black text-purple-600 mt-2">45 Pilots</p>
              <p className="text-[9px] text-slate-400 mt-1">AgriTech startups linked to RBK centers.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Gov footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-center text-xs text-slate-400">
        <p className="font-medium text-slate-600 dark:text-slate-350 text-center">
          Andhra Pradesh Innovation Command Center • RTIH
        </p>
        <p className="mt-2 text-[10px] text-center">
          Secure executive telemetry access. Compiled in accordance with AP Startup Policy guidelines.
        </p>
      </footer>
    </div>
  );
}
