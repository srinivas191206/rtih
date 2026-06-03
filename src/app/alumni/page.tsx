'use client';

import { useState, useMemo } from 'react';
import { getDb, AlumniStartup, SECTORS, DISTRICTS } from '@/lib/mockDb';
import { Trophy, TrendingUp, MapPin, Calendar, Users, ArrowRight, Search, Star } from 'lucide-react';
import Navigation from '@/components/Navigation';

const STAGE_LABELS: Record<string, string> = {
  idea: 'Idea', validation: 'Validation', prototype: 'Prototype',
  mvp: 'MVP', users: 'Users', revenue: 'Revenue', funding: 'Funding', scale: 'Scale'
};

const STAGE_COLORS: Record<string, string> = {
  idea: 'bg-slate-100 text-slate-600',
  validation: 'bg-blue-100 text-blue-700',
  prototype: 'bg-purple-100 text-purple-700',
  mvp: 'bg-yellow-100 text-yellow-700',
  users: 'bg-orange-100 text-orange-700',
  revenue: 'bg-emerald-100 text-emerald-700',
  funding: 'bg-teal-100 text-teal-700',
  scale: 'bg-green-100 text-green-700',
};

export default function AlumniPage() {
  const [db] = useState(() => getDb());
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');

  const alumni: AlumniStartup[] = useMemo(() => db.getAlumniStartups(), [db]);

  const filtered = useMemo(() => {
    return alumni.filter(a => {
      const matchSearch = !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.founderName.toLowerCase().includes(search.toLowerCase()) ||
        a.achievement.toLowerCase().includes(search.toLowerCase());
      const matchSector = sectorFilter === 'All' || a.sector === sectorFilter;
      const matchDistrict = districtFilter === 'All' || a.district === districtFilter;
      return matchSearch && matchSector && matchDistrict;
    });
  }, [alumni, search, sectorFilter, districtFilter]);

  const uniqueSectors = Array.from(new Set(alumni.map(a => a.sector)));

  // Aggregate stats
  const totalMonths = alumni.reduce((sum, a) => sum + a.journeyMonths, 0);
  const avgMonths = alumni.length > 0 ? Math.round(totalMonths / alumni.length) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Hero Header */}
        <section className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-10 w-32 h-32 rounded-full border-2 border-white" />
            <div className="absolute bottom-4 right-32 w-16 h-16 rounded-full border border-white" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/70">RTIH Success Stories</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              Graduated Alumni Network
            </h1>
            <p className="text-sm text-white/80 mt-2 max-w-xl">
              Startups that successfully completed the RTIH incubation program, raised capital, and are now driving economic growth across Andhra Pradesh.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: 'Graduated Startups', value: alumni.length.toString() },
                { label: 'Avg. Incubation Time', value: `${avgMonths} months` },
                { label: 'Active Post-Graduation', value: `${alumni.filter(a => a.currentStatus.startsWith('Active')).length}` },
              ].map(s => (
                <div key={s.label} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-[10px] text-white/70 mt-0.5 font-semibold uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by startup name, founder, achievement..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>
          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-500 text-slate-700"
          >
            <option value="All">All Sectors</option>
            {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-500 text-slate-700"
          >
            <option value="All">All Districts</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <p className="text-xs text-slate-500 font-semibold">
          Showing {filtered.length} of {alumni.length} graduated startups
        </p>

        {/* Alumni Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-semibold">
            No alumni records match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(alum => (
              <div key={alum.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all group">
                {/* Card Top Band */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-b border-slate-100 px-6 py-4 flex items-start justify-between">
                  <div>
                    <h2 className="font-black text-slate-900 text-base leading-tight group-hover:text-emerald-700 transition-colors">
                      {alum.name}
                    </h2>
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">{alum.sector}</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${STAGE_COLORS[alum.finalStage] || 'bg-slate-100 text-slate-600'}`}>
                    {STAGE_LABELS[alum.finalStage] || alum.finalStage} Stage
                  </span>
                </div>

                <div className="px-6 py-4 space-y-4">
                  {/* Achievement */}
                  <div className="flex items-start gap-2">
                    <Star className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-700 leading-relaxed">{alum.achievement}</p>
                  </div>

                  {/* Current Status */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Current Status</p>
                    <p className="text-xs text-emerald-800 mt-0.5 font-semibold">{alum.currentStatus}</p>
                  </div>

                  {/* Metadata row */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-500">
                        <Users className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Founder</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-800 mt-0.5">{alum.founderName}</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <div className="flex items-center justify-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Duration</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-800 mt-0.5">{alum.journeyMonths}m</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-500">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">District</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-800 mt-0.5">{alum.district}</p>
                    </div>
                  </div>

                  {/* Graduated date */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Graduated</span>
                    <span className="font-bold text-slate-600">
                      {new Date(alum.graduatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Footer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
          <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Want to join the next cohort?</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Apply to the RTIH incubation program and get mentorship, funding access, and market linkages from the government of Andhra Pradesh.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
          >
            Apply for Incubation <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>Ratan Tata Innovation Hub (RTIH) • Government of Andhra Pradesh • Alumni Network</p>
      </footer>
    </div>
  );
}
