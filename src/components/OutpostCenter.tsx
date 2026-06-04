'use client';

import { useMemo, useState, useEffect } from 'react';
import { getDb } from '@/lib/mockDb';
import { GraduationCap, ShieldAlert } from 'lucide-react';

const getUniversityDistrictDisplay = (name: string, district: string) => {
  if (name === 'NIT Andhra Pradesh') return 'West Godavari District (Tadepalligudem)';
  if (name === 'SRM AP University') return 'Palnadu District (Neerukonda)';
  if (name === 'VIT AP University') return 'Guntur District (Amaravati)';
  if (name === 'KL University') return 'Guntur District (Vaddeswaram)';
  if (name === 'Adikavi Nannaya University') return 'East Godavari District (Rajamahendravaram)';
  if (name === 'JNTU Kakinada') return 'Kakinada District';
  if (name === 'Andhra University') return 'Visakhapatnam District';
  if (name === 'Acharya Nagarjuna University') return 'Guntur District';
  if (name === 'Sri Venkateswara University') return 'Tirupati District';
  if (name === 'GITAM University') return 'Visakhapatnam District';
  if (name === 'RGUKT Nuzvid') return 'Eluru District';
  if (name === 'RGUKT RK Valley') return 'YSR Kadapa District';
  if (name === 'IIIT Sri City') return 'Tirupati District';
  return `${district} District`;
};

export default function OutpostCenter() {
  const [renderTrigger, setRenderTrigger] = useState(0);

  useEffect(() => {
    const handleSync = () => {
      setRenderTrigger(prev => prev + 1);
    };
    window.addEventListener('rtih_mode_change', handleSync);
    return () => {
      window.removeEventListener('rtih_mode_change', handleSync);
    };
  }, []);

  const data = useMemo(() => {
    try {
      const db = getDb();
      return {
        universities: db.getUniversities().sort((a, b) => b.innovationScore - a.innovationScore).slice(0, 6),
        outposts: db.getOutposts().sort((a, b) => a.rank - b.rank)
      };
    } catch (e) {
      console.error(e);
      return { universities: [], outposts: [] };
    }
  }, [renderTrigger]);

  return (
    <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-xl p-5 shadow-lg text-white">
      <div className="border-b border-white/10 pb-4 mb-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          RTIH Regional Outposts & University Cells
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Monitor performance metrics, founder pipelines, and program engagements across AP academic institutions.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Outposts Performance Grid */}
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Regional Innovation Centers Performance
          </h3>
          <div className="flex-1 flex flex-col gap-3">
            {data.outposts.map((outpost) => (
              <div
                key={outpost.id}
                className="relative p-4 bg-white/5 border border-white/10 rounded-xl grid grid-cols-12 gap-4 items-center min-h-[76px] hover:border-emerald-500/30 transition-colors text-xs text-white"
              >
                {/* Left Column: Name & Lead */}
                <div className="col-span-6 pr-10">
                  <h4 className="font-bold text-xs text-white leading-tight">
                    {outpost.name} Regional Center
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-normal leading-none">
                    Lead: {outpost.leadName}
                  </p>
                </div>
                
                {/* Middle Column: Metrics */}
                <div className="col-span-3 text-left">
                  <p className="text-[11px] font-bold text-white leading-none">
                    {outpost.incubatedCount} Startups
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal mt-1 leading-none">
                    {outpost.programsCount} Programs
                  </p>
                </div>
                
                {/* Right Column: Performance Badge */}
                <div className="col-span-3 flex justify-end">
                  <div className="w-[68px] py-1.5 bg-purple-500/10 border border-purple-500/25 rounded text-center shrink-0">
                    <p className="text-[11px] font-black text-purple-400 leading-none">
                      {outpost.mentorEngagement}%
                    </p>
                    <p className="text-[7px] text-slate-400 uppercase mt-1 leading-none">Score</p>
                  </div>
                </div>
                
                {/* Rank Badge */}
                <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/10 text-slate-200 leading-none">
                  Rank #{outpost.rank}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* University Innovation Rankings */}
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            University Innovation Cell Rankings
          </h3>
          <div className="flex-1 flex flex-col gap-3">
            {data.universities.map((uni, idx) => (
              <div
                key={uni.id}
                className="relative p-4 bg-white/5 border border-white/10 rounded-xl grid grid-cols-12 gap-4 items-center min-h-[76px] hover:border-emerald-500/30 transition-colors text-xs text-white"
              >
                {/* Left Column: Name & District */}
                <div className="col-span-6 pr-10">
                  <h4 className="font-bold text-xs text-white leading-tight">
                    {uni.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-normal leading-none truncate">
                    {getUniversityDistrictDisplay(uni.name, uni.district)}
                  </p>
                </div>
                
                {/* Middle Column: Metrics */}
                <div className="col-span-3 text-left">
                  <p className="text-[11px] font-bold text-white leading-none">
                    {uni.startupsCount} Startups
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal mt-1 leading-none">
                    {uni.foundersCount} Founders
                  </p>
                </div>
                
                {/* Right Column: Index Badge */}
                <div className="col-span-3 flex justify-end">
                  <div className="w-[68px] py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded text-center shrink-0">
                    <p className="text-[11px] font-black text-emerald-400 leading-none">
                      {uni.innovationScore}
                    </p>
                    <p className="text-[7px] text-slate-400 uppercase mt-1 leading-none">Index</p>
                  </div>
                </div>
                
                {/* Rank Badge */}
                <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/10 text-slate-200 leading-none">
                  Rank #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 p-3.5 bg-yellow-500/10 border border-yellow-500/25 rounded-lg text-[10px] text-yellow-200 leading-relaxed flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-yellow-500 shrink-0" />
        <span>University cell scores are computed based on operational incubation audits and student startup density.</span>
      </div>
    </div>
  );
}
