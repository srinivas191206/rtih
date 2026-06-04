'use client';

import { useState, useMemo, useEffect } from 'react';
import { getDb, StartupStage, Startup } from '@/lib/mockDb';
import { Filter, Users, TrendingUp, Sparkles, FolderKanban } from 'lucide-react';

const STAGE_CONFIG: { stage: StartupStage; label: string; color: string; desc: string }[] = [
  { stage: 'idea', label: 'Idea Stage', color: 'bg-slate-400 dark:bg-slate-700', desc: 'Concept definition' },
  { stage: 'validation', label: 'Validation', color: 'bg-blue-400 dark:bg-blue-600', desc: 'Problem-solution fit' },
  { stage: 'prototype', label: 'Prototype', color: 'bg-indigo-400 dark:bg-indigo-600', desc: 'Working wireframe/MVP' },
  { stage: 'mvp', label: 'MVP Launch', color: 'bg-purple-400 dark:bg-purple-600', desc: 'Deployed pilot release' },
  { stage: 'users', label: 'User Traction', color: 'bg-pink-400 dark:bg-pink-600', desc: 'Growing active users' },
  { stage: 'revenue', label: 'Revenue Gen', color: 'bg-amber-400 dark:bg-amber-600', desc: 'Consistent cash flow' },
  { stage: 'funding', label: 'Seed Funding', color: 'bg-teal-400 dark:bg-teal-600', desc: 'External VC/Grant support' },
  { stage: 'scale', label: 'Global Scale', color: 'bg-emerald-400 dark:bg-emerald-600', desc: 'Expanding markets' }
];

export default function PipelineFunnel() {
  const [selectedStage, setSelectedStage] = useState<StartupStage>('mvp');
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

  // Compute funnel aggregates dynamically from the mock database
  const funnelData = useMemo(() => {
    try {
      const db = getDb();
      const startups = db.getStartups();
      
      const counts: Record<StartupStage, number> = {
        idea: 0,
        validation: 0,
        prototype: 0,
        mvp: 0,
        users: 0,
        revenue: 0,
        funding: 0,
        scale: 0
      };

      startups.forEach(s => {
        counts[s.stage] = (counts[s.stage] || 0) + 1;
      });

      return counts;
    } catch (e) {
      console.error(e);
      return {} as Record<StartupStage, number>;
    }
  }, [renderTrigger]);

  const totalStartups = useMemo(() => {
    return Object.values(funnelData).reduce((sum, count) => sum + count, 0);
  }, [funnelData]);

  // Startups at selected stage
  const selectedStartups = useMemo(() => {
    try {
      return getDb().getStartups().filter(s => s.stage === selectedStage);
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [selectedStage, renderTrigger]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-emerald-500" />
          Ecosystem Startup Pipeline Funnel
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Visualize startup lifecycle progression across the 8 standard stages. Click a stage to inspect startups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Funnel Layout */}
        <div className="lg:col-span-2 flex flex-col justify-center space-y-2">
          {STAGE_CONFIG.map((cfg, idx) => {
            const count = funnelData[cfg.stage] || 0;
            const percentage = totalStartups > 0 ? (count / totalStartups) * 100 : 0;
            const widthPct = 100 - idx * 7; // tapering widths to form a funnel
            const isSelected = selectedStage === cfg.stage;

            return (
              <button
                key={cfg.stage}
                onClick={() => setSelectedStage(cfg.stage)}
                className={`w-full group text-left transition-all duration-200 focus:outline-none ${
                  isSelected ? 'scale-[1.01]' : 'opacity-85 hover:opacity-100'
                }`}
                style={{ maxWidth: `${widthPct}%`, margin: '0 auto' }}
              >
                <div className={`relative flex items-center justify-between px-4 py-2.5 rounded-lg border text-xs font-semibold ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-300 hover:border-slate-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${cfg.color}`}></span>
                    <div>
                      <p className="font-bold leading-none">{cfg.label}</p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">{cfg.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-sm">{count} Companies</p>
                      <p className="text-[9px] text-slate-400">{percentage.toFixed(1)}%</p>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/20 px-1.5 py-0.5 rounded tracking-wide">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="flex flex-col bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl p-4 h-[400px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Stage Auditing</span>
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {selectedStage.toUpperCase()}
            </span>
          </div>

          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            {STAGE_CONFIG.find(c => c.stage === selectedStage)?.label}
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
            Below are startups currently classified in this cohort. High priority targets are flagged for advisory reviews.
          </p>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {selectedStartups.length > 0 ? (
              selectedStartups.map((startup: Startup) => (
                <div
                  key={startup.id}
                  className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg hover:border-slate-200 shadow-sm text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white leading-tight">
                      {startup.name}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{startup.sector} • {startup.district}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      <span className="text-slate-400 font-medium">Health:</span>
                      <span className={
                        startup.healthScore > 75 
                          ? 'text-emerald-500' 
                          : startup.healthScore > 55 
                            ? 'text-yellow-500' 
                            : 'text-red-500'
                      }>
                        {startup.healthScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <p className="text-xs font-semibold">No companies in this stage</p>
                <p className="text-[10px] mt-1">Ecosystem seeding completed.</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Total in Stage:
            </span>
            <span className="font-bold text-slate-900 dark:text-white">{selectedStartups.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
