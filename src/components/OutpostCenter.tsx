'use client';

import { useMemo } from 'react';
import { getDb } from '@/lib/mockDb';
import { GraduationCap, Award, Compass, Calendar, Target, ShieldAlert } from 'lucide-react';

export default function OutpostCenter() {
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
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-500" />
          RTIH Regional Outposts & University Cells
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Monitor performance metrics, founder pipelines, and program engagements across AP academic institutions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Outposts Performance Grid */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Regional Innovation Centers Performance
          </h3>
          <div className="space-y-3">
            {data.outposts.map((outpost) => (
              <div
                key={outpost.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{outpost.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Rank #{outpost.rank}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Lead: {outpost.leadName}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-500" />
                      {outpost.incubatedCount}
                    </p>
                    <p className="text-[8px] text-slate-400 uppercase font-medium">Startups</p>
                  </div>

                  <div className="text-center">
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {outpost.programsCount}
                    </p>
                    <p className="text-[8px] text-slate-400 uppercase font-medium">Programs</p>
                  </div>

                  <div className="text-center">
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-purple-500" />
                      {outpost.mentorEngagement}%
                    </p>
                    <p className="text-[8px] text-slate-400 uppercase font-medium">Engagement</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* University Innovation Rankings */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            University Innovation Cell Rankings
          </h3>
          <div className="space-y-3">
            {data.universities.map((uni, idx) => (
              <div
                key={uni.id}
                className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                      {uni.name}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{uni.district} District</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {uni.startupsCount} Startups
                    </p>
                    <p className="text-[9px] text-slate-400">{uni.foundersCount} Founders</p>
                  </div>

                  <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-center min-w-[48px]">
                    <p className="text-[10px] font-bold text-emerald-600 leading-none">
                      {uni.innovationScore}
                    </p>
                    <p className="text-[7px] text-slate-400 uppercase mt-0.5 leading-none">Index</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 p-3.5 bg-yellow-500/5 border border-yellow-500/15 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-yellow-500 shrink-0" />
        <span>University cell scores are computed based on operational incubation audits and student startup density.</span>
      </div>
    </div>
  );
}
