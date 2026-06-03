'use client';

import dynamic from 'next/dynamic';

const DynamicMap = dynamic(
  () => import('./InnovationMapInner'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Loading AP Innovation Map...
          </p>
        </div>
      </div>
    )
  }
);

export default function InnovationMap() {
  return <DynamicMap />;
}
