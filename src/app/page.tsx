'use client';

import Navigation from '@/components/Navigation';
import InnovationMap from '@/components/InnovationMap';
import FamilyTracker from '@/components/FamilyTracker';
import OutpostCenter from '@/components/OutpostCenter';
import AdminCommandCenter from './admin/page';
import FounderDashboard from './founder/page';
import ProgramManagerDashboard from './manager/page';
import MentorDashboard from './mentor/page';
import { useState, useEffect } from 'react';
import { getDb, isDemoModeActive, getActiveUser, setActiveUser } from '@/lib/mockDb';
import { ArrowRight, Trophy, Landmark, Users, TrendingUp, Cpu, Globe, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalStartups: 14850,
    totalJobs: 122400,
    soonicorns: 21,
    unicorns: 11,
    activeOutposts: 4
  });

  useEffect(() => {
    setCurrentUser(getActiveUser());

    const updateStats = () => {
      try {
        const dbStats = getDb().getEcosystemStats();
        setStats({
          totalStartups: dbStats.totalStartups,
          totalJobs: dbStats.totalJobs,
          soonicorns: dbStats.soonicorns,
          unicorns: dbStats.unicorns,
          activeOutposts: dbStats.activeOutposts
        });
      } catch (e) {
        console.error(e);
      }
    };

    updateStats();

    const handleUserChange = () => {
      setCurrentUser(getActiveUser());
    };

    window.addEventListener('rtih_mode_change', updateStats);
    window.addEventListener('rtih_user_change', handleUserChange);
    return () => {
      window.removeEventListener('rtih_mode_change', updateStats);
      window.removeEventListener('rtih_user_change', handleUserChange);
    };
  }, []);

  const HERO_STATS = [
    { label: 'Soonicorn Pipeline', count: `${stats.soonicorns}+`, icon: TrendingUp, desc: 'High-growth scale targets (Goal: 20+ by 2029)' },
    { label: 'Unicorn Track', count: `${stats.unicorns}+`, icon: Trophy, desc: 'Global startup powerhouses (Goal: 10+ by 2029)' },
    { label: 'Centers of Excellence', count: `${stats.activeOutposts} CoEs`, icon: Landmark, desc: 'Active regional outposts' }
  ];

  const CHALLENGES = [
    {
      title: 'Smart AgriTech Crop Monitoring',
      dept: 'Department of Agriculture, AP',
      grant: '₹10,00,000 Grant Pool',
      deadline: 'June 30, 2026',
      desc: 'Build edge-computed IoT crop inspection algorithms linked directly to Rythu Bharosa Kendras (RBKs).'
    },
    {
      title: 'Clean Energy Micro-Grid Optimization',
      dept: 'AP Transco / Power Corporation',
      grant: '₹15,00,000 Grant Pool',
      deadline: 'July 15, 2026',
      desc: 'Develop decentralised load balancing models for solar-linked rural micro-grids in Rayalaseema.'
    },
    {
      title: 'Emerging Biotech Healthcare Diagnostics',
      dept: 'AP Health & Family Welfare',
      grant: '₹12,50,000 Grant Pool',
      deadline: 'August 01, 2026',
      desc: 'Create low-cost rapid screening models for rural primary health clinics using AI diagnostics.'
    }
  ];

  const STORIES = [
    {
      title: 'Kalyan AgriSystems scales drone deployment',
      district: 'Anantapur District',
      summary: 'Secured ₹10 Lakhs seed funding under the RTIH Agri-Linkage Grant to scale diagnostic IoT systems.'
    },
    {
      title: 'Vizaq NeuroTech signs clinical pilot PoC',
      district: 'Visakhapatnam District',
      summary: 'Deploying deep-learning neural diagnostic devices across 15 government medical outposts.'
    }
  ];

  return (
    <div className={`flex flex-col min-h-screen relative overflow-x-hidden ${!currentUser ? "bg-[url('/home.jpg')] bg-cover bg-center bg-no-repeat bg-fixed" : "bg-slate-50"}`}>
      {/* Dark overlay for readability over the whole website background */}
      {!currentUser && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] z-0 pointer-events-none"></div>
      )}
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {currentUser ? (
            <div className="space-y-8 bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">
                  Live Console Active ({currentUser.role.toUpperCase()})
                </span>
                <button
                  onClick={() => {
                    setActiveUser(null);
                    setCurrentUser(null);
                    window.dispatchEvent(new Event('rtih_user_change'));
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Sign Out / Exit Dashboard
                </button>
              </div>
              {currentUser.role === 'admin' && <AdminCommandCenter embedded={true} />}
              {currentUser.role === 'founder' && <FounderDashboard embedded={true} />}
              {currentUser.role === 'manager' && <ProgramManagerDashboard embedded={true} />}
              {currentUser.role === 'mentor' && <MentorDashboard embedded={true} />}
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <section className="relative py-12 px-6 sm:px-12 text-center text-white">
                <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    AP Startup Policy 2021-2026 Active Portal
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                    Transforming Andhra Pradesh into a <br className="hidden md:inline" />
                    <span className="text-emerald-400">
                      Global Startup Powerhouse
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm md:text-base text-slate-200 max-w-2xl mx-auto font-semibold leading-relaxed drop-shadow-sm">
                    Welcome to RTIH InnovationOS. Empowering Innovation. Enabling Growth. The central operating system linking AP founders, universities, outposts, and global capital networks.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Link 
                      href="/login" 
                      className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all border border-emerald-400/40"
                    >
                      Access Portal (Sign In) <ArrowRight className="w-4 h-4 text-emerald-100" />
                    </Link>
                    <Link
                      href="/register"
                      className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-white/25 transition-all backdrop-blur-sm"
                    >
                      Apply for Incubation
                    </Link>
                    <Link
                      href="/apply"
                      className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-white/25 transition-all backdrop-blur-sm"
                    >
                      Find Jobs
                    </Link>
                  </div>
                </div>
              </section>

              {/* Hero Goal Metrics Scorecard */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
                {HERO_STATS.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div 
                      key={stat.label} 
                      className="p-4 text-center text-white group hover:scale-[1.03] transition-all duration-300"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 mx-auto text-emerald-400 border border-emerald-500/20 shadow-inner group-hover:bg-emerald-500/20 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white mt-3">
                        {stat.count}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-350 mt-1 uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-1 hidden sm:block leading-tight">
                        {stat.desc}
                      </p>
                    </div>
                  );
                })}
              </section>

              {/* Hub & Spoke Regional Map Section */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-emerald-400" />
                      RTIH Hub & Spoke Infrastructure Map
                    </h2>
                    <p className="text-xs text-slate-305">
                      Amaravati (Central Hub) linking five Regional Innovation Centers to distribute resources statewide.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest bg-white/10 border border-white/15 px-2 py-0.5 rounded">
                    Statewide Network
                  </span>
                </div>
                <InnovationMap />
              </section>

              {/* Outposts & Mission Trackers */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FamilyTracker />
                <OutpostCenter />
              </section>

              {/* Success Stories & Innovation Challenges */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Innovation Challenges */}
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4.5 h-4.5 text-emerald-400" />
                    Active Innovation Challenges
                  </h2>
                  <div className="space-y-4">
                    {CHALLENGES.map((challenge) => (
                      <div 
                        key={challenge.title}
                        className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-colors flex justify-between gap-4 shadow-lg text-white"
                      >
                        <div className="text-xs">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>{challenge.dept}</span>
                            <span className="text-emerald-400 bg-emerald-500/20 px-1 py-0.5 rounded border border-emerald-500/30">
                              {challenge.grant}
                            </span>
                          </div>
                          <h3 className="font-bold text-white mt-1.5 mb-1">
                            {challenge.title}
                          </h3>
                          <p className="text-slate-300 leading-normal text-[11px]">
                            {challenge.desc}
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col justify-between items-end text-[10px]">
                          <span className="text-slate-400 font-semibold">{challenge.deadline}</span>
                          <Link href="/register" className="text-emerald-400 font-bold hover:underline">
                            Apply →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Success Stories */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target className="w-4.5 h-4.5 text-emerald-400" />
                    Success Stories
                  </h2>
                  <div className="space-y-4">
                    {STORIES.map((story) => (
                      <div 
                        key={story.title}
                        className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg text-xs flex flex-col justify-between text-white"
                      >
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{story.district}</span>
                          <h3 className="font-bold text-white mt-1 mb-2 leading-tight">
                            {story.title}
                          </h3>
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            {story.summary}
                          </p>
                        </div>
                        <div className="border-t border-white/10 pt-2.5 mt-3 text-right">
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                            RTIH Case Study
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

            </>
          )}
        </main>
      </div>

      {/* Government Footer */}
      {!currentUser && (
        <footer className="border-t border-white/10 bg-slate-950/40 backdrop-blur-md py-8 text-center text-xs text-slate-305 relative z-10">
          <p className="font-medium text-white">
            Ratan Tata Innovation Hub (RTIH) • Government of Andhra Pradesh
          </p>
          <div className="flex items-center justify-center gap-6 mt-3 text-[11px]">
            <a href="/register" className="hover:text-emerald-400 font-semibold transition-colors text-slate-200">Apply for Incubation</a>
            <a href="/apply" className="hover:text-emerald-400 font-semibold transition-colors text-slate-200">Find Jobs</a>
            <a href="/alumni" className="hover:text-emerald-400 font-semibold transition-colors text-slate-200">Alumni Network</a>
            <a href="/login" className="hover:text-emerald-400 font-semibold transition-colors text-slate-200">Sign In</a>
          </div>
          <p className="mt-3 text-[10px] text-slate-400">
            Digital Operating System designed for Startup Policy implementation. All rights reserved © 2026.
          </p>
        </footer>
      )}
    </div>
  );
}
