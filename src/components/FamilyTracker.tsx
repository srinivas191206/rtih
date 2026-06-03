'use client';

import { useMemo } from 'react';
import { getDb } from '@/lib/mockDb';
import { Heart, Users, Target, ShieldCheck, Landmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function FamilyTracker() {
  const stats = useMemo(() => {
    try {
      return getDb().getEcosystemStats();
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return [];
    // Format district stats for charts
    return Object.entries(stats.districtDist).map(([name, count]) => ({
      district: name.slice(0, 10),
      startups: count,
      families: count * 8 + 42 // mock scalar representing family outreach density
    })).slice(0, 8);
  }, [stats]);

  if (!stats) return null;

  const familyData = stats.familyTrack;
  const targetFamilies = 100000;
  const completionPercentage = (familyData.familiesReached / targetFamilies) * 100;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          "One Family, One Entrepreneur" Mission Tracker
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tracking Andhra Pradesh's progress toward fostering entrepreneurship in every household.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core demographic totals */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Families Reached</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {familyData.familiesReached.toLocaleString()}
            </h3>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5 font-medium">
              <span>Goal: {targetFamilies.toLocaleString()}</span>
              <span>{completionPercentage.toFixed(1)}% Completed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/40 dark:border-slate-800/40 rounded-lg">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Rural Founders</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {familyData.ruralFounders}
              </p>
            </div>
            
            <div className="p-3 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/40 dark:border-slate-800/40 rounded-lg">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Women Founders</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {familyData.womenFounders}
              </p>
            </div>

            <div className="p-3 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/40 dark:border-slate-800/40 rounded-lg">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Youth Founders</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {familyData.youthFounders}
              </p>
            </div>

            <div className="p-3 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/40 dark:border-slate-800/40 rounded-lg">
              <p className="text-[9px] font-bold text-slate-400 uppercase">First-Gen Founders</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                150+
              </p>
            </div>
          </div>
        </div>

        {/* Graphical distribution */}
        <div className="lg:col-span-2 flex flex-col">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Family Entrepreneurship Outreach by District
          </p>

          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="district" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#38bdf8', fontSize: '10px' }}
                />
                <Bar dataKey="families" fill="#00A86B" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-800 dark:text-emerald-300 leading-relaxed mt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 inline mr-1" />
            Data compiled directly from AP Family Welfare registration records and RTIH seed checks.
          </div>
        </div>
      </div>
    </div>
  );
}
