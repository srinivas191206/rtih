'use client';

import Navigation from '@/components/Navigation';
import InnovationMap from '@/components/InnovationMap';
import FamilyTracker from '@/components/FamilyTracker';
import OutpostCenter from '@/components/OutpostCenter';
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
    { label: 'Startups Registered', count: stats.totalStartups.toLocaleString(), icon: Cpu, desc: 'Progressing towards 20k goal' },
    { label: 'Jobs Created', count: stats.totalJobs.toLocaleString(), icon: Users, desc: 'Across all AP districts' },
    { label: 'Soonicorn Pipeline', count: `${stats.soonicorns}+`, icon: TrendingUp, desc: 'High-growth scale targets' },
    { label: 'Unicorn Track', count: `${stats.unicorns}+`, icon: Trophy, desc: 'Global startup powerhouses' },
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
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            AP Startup Policy 2021-2026 Active Portal
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Transforming Andhra Pradesh into a <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Global Startup Powerhouse
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Welcome to RTIH InnovationOS. Empowering Innovation. Enabling Growth. The central operating system linking AP founders, universities, outposts, and global capital networks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {currentUser ? (
              <>
                <Link 
                  href={
                    currentUser.role === 'admin' 
                      ? '/admin' 
                      : currentUser.role === 'manager' 
                        ? '/manager' 
                        : currentUser.role === 'mentor' 
                          ? '/mentor' 
                          : '/founder'
                  } 
                  className="px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/15 transition-all"
                >
                  Enter Your Command Center ({currentUser.role.toUpperCase()}) <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    setActiveUser(null);
                    setCurrentUser(null);
                    router.push('/login');
                  }}
                  className="px-5 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/15 transition-all"
                >
                  Access Ecosystem Portal (Sign In) <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-3 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-sm font-semibold flex items-center gap-2 transition-all"
                >
                  Apply to RTIH Incubation
                </Link>
                <Link
                  href="/apply"
                  className="px-5 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center gap-2 transition-all"
                >
                  Find Jobs at Startups
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Hero Goal Metrics Scorecard */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {HERO_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center hover:border-slate-350 dark:hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 mx-auto text-emerald-500 border border-slate-100 dark:border-slate-700 shadow-inner">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-3">
                  {stat.count}
                </h3>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                RTIH Hub & Spoke Infrastructure Map
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Amaravati (Central Hub) linking five Regional Innovation Centers to distribute resources statewide.
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
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
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4.5 h-4.5 text-emerald-500" />
              Active Innovation Challenges
            </h2>
            <div className="space-y-4">
              {CHALLENGES.map((challenge) => (
                <div 
                  key={challenge.title}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-slate-350 dark:hover:border-slate-700 transition-colors flex justify-between gap-4 shadow-sm"
                >
                  <div className="text-xs">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>{challenge.dept}</span>
                      <span className="text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                        {challenge.grant}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mt-1.5 mb-1">
                      {challenge.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-normal text-[11px]">
                      {challenge.desc}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col justify-between items-end text-[10px]">
                    <span className="text-slate-400 font-semibold">{challenge.deadline}</span>
                    <Link href="/register" className="text-emerald-500 font-bold hover:underline">
                      Apply →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4.5 h-4.5 text-emerald-500" />
              Success Stories
            </h2>
            <div className="space-y-4">
              {STORIES.map((story) => (
                <div 
                  key={story.title}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm text-xs flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{story.district}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white mt-1 mb-2 leading-tight">
                      {story.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                      {story.summary}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 mt-3 text-right">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                      RTIH Case Study
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners Showcase */}
        <section className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Partner Ecosystem & Knowledge Network
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-center opacity-65 dark:opacity-50">
            <span className="font-extrabold text-sm text-slate-500 tracking-wider">TATA GROUP</span>
            <span className="font-extrabold text-sm text-slate-500 tracking-wider">IIT TIRUPATI</span>
            <span className="font-extrabold text-sm text-slate-500 tracking-wider">SRM UNIV AP</span>
            <span className="font-extrabold text-sm text-slate-500 tracking-wider">AP STATE INN SOC</span>
            <span className="font-extrabold text-sm text-slate-500 tracking-wider">Y COMBINATOR</span>
            <span className="font-extrabold text-sm text-slate-500 tracking-wider">T-HUB ADVISORS</span>
          </div>
        </section>
      </main>

      {/* Government Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-center text-xs text-slate-400">
        <p className="font-medium text-slate-600 dark:text-slate-300">
          Ratan Tata Innovation Hub (RTIH) • Government of Andhra Pradesh
        </p>
        <div className="flex items-center justify-center gap-6 mt-3 text-[11px]">
          <a href="/register" className="hover:text-emerald-600 font-semibold transition-colors">Apply for Incubation</a>
          <a href="/apply" className="hover:text-emerald-600 font-semibold transition-colors">Find Jobs</a>
          <a href="/alumni" className="hover:text-emerald-600 font-semibold transition-colors">Alumni Network</a>
          <a href="/login" className="hover:text-emerald-600 font-semibold transition-colors">Sign In</a>
        </div>
        <p className="mt-3 text-[10px]">
          Digital Operating System designed for Startup Policy implementation. All rights reserved © 2026.
        </p>
      </footer>
    </div>
  );
}
