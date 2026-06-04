'use client';

import { useState, useMemo, useEffect } from 'react';
import { getDb } from '@/lib/mockDb';
import { Search, Briefcase, Clock, MapPin, ChevronRight, CheckCircle2, X } from 'lucide-react';

export default function ApplyPage() {
  const [db] = useState(() => getDb());
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

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Full Time' | 'Internship' | 'Part Time'>('All');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ candidateName: '', email: '', skills: '', resumeUrl: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allJobs = useMemo(() => {
    return db.getJobPostings()
      .filter(j => j.isActive)
      .map(j => {
        const startup = db.getStartup(j.startupId);
        return { ...j, startupName: startup?.name || 'RTIH Startup', sector: startup?.sector || '', district: startup?.district || '' };
      });
  }, [db, renderTrigger]);

  const filtered = useMemo(() => allJobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.startupName.toLowerCase().includes(search.toLowerCase()) || j.skills.join(' ').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || j.type === typeFilter;
    return matchSearch && matchType;
  }), [allJobs, search, typeFilter]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.candidateName.trim()) e.candidateName = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.skills.trim()) e.skills = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApply = () => {
    if (!validate()) return;
    db.addJobApplication(selectedJob.id, {
      id: `jobapp-${Date.now()}`,
      candidateName: form.candidateName,
      email: form.email,
      skills: form.skills,
      resumeUrl: form.resumeUrl,
      appliedAt: new Date().toISOString(),
      status: 'Applied',
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-md">AP</div>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-none">RTIH Recruitment Portal</h1>
              <p className="text-[10px] text-slate-400">Opportunities from Andhra Pradesh&apos;s top incubated startups</p>
            </div>
          </div>
          <a href="/login" className="text-xs font-bold text-emerald-600 hover:underline">Back to Login →</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, company, or skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>
          <div className="flex gap-2">
            {(['All', 'Full Time', 'Internship', 'Part Time'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  typeFilter === t ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-xs text-slate-500">
          <span className="font-semibold">{filtered.length} openings available</span>
          <span>from {new Set(filtered.map(j => j.startupId)).size} startups</span>
        </div>

        {/* Job Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-semibold">
            No openings match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(job => (
              <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer" onClick={() => { setSelectedJob(job); setShowForm(false); setSubmitted(false); setForm({ candidateName: '', email: '', skills: '', resumeUrl: '' }); }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm leading-snug">{job.title}</h3>
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">{job.startupName}</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                    job.type === 'Internship' ? 'bg-blue-100 text-blue-700' : job.type === 'Part Time' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>{job.type}</span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{job.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {job.skills.slice(0, 3).map((s: string) => (
                    <span key={s} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{s}</span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.district || 'Andhra Pradesh'}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Apply by {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="mt-2 text-[10px] font-bold text-slate-400">Stipend/CTC: {job.stipend}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">{selectedJob.title}</h2>
                <p className="text-sm text-emerald-600 font-bold mt-0.5">{selectedJob.startupName} · {selectedJob.type}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 rounded-lg p-3"><p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Stipend/CTC</p><p className="font-bold text-slate-800 mt-1">{selectedJob.stipend}</p></div>
                <div className="bg-slate-50 rounded-lg p-3"><p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Deadline</p><p className="font-bold text-slate-800 mt-1">{new Date(selectedJob.deadline).toLocaleDateString('en-IN')}</p></div>
                <div className="bg-slate-50 rounded-lg p-3"><p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Location</p><p className="font-bold text-slate-800 mt-1">{selectedJob.district || 'AP'}</p></div>
                <div className="bg-slate-50 rounded-lg p-3"><p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Applications</p><p className="font-bold text-slate-800 mt-1">{selectedJob.applications?.length || 0} received</p></div>
              </div>

              <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">About the Role</p><p className="text-xs text-slate-600 leading-relaxed">{selectedJob.description}</p></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skills Required</p>
                <div className="flex flex-wrap gap-1">
                  {selectedJob.skills.map((s: string) => <span key={s} className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full">{s}</span>)}
                </div>
              </div>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-emerald-800">Application submitted!</p>
                  <p className="text-xs text-emerald-600 mt-1">{selectedJob.startupName} will review and contact you at {form.email}</p>
                </div>
              ) : showForm ? (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <h3 className="font-black text-slate-900 text-sm">Your Application</h3>
                  {[
                    { key: 'candidateName', label: 'Full Name *', type: 'text', placeholder: 'Your full name' },
                    { key: 'email', label: 'Email Address *', type: 'email', placeholder: 'your@email.com' },
                    { key: 'skills', label: 'Your Skills / Summary *', type: 'textarea', placeholder: 'List your key skills and a brief intro...' },
                    { key: 'resumeUrl', label: 'Resume URL (Google Drive/Dropbox)', type: 'text', placeholder: 'https://...' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{f.label}</label>
                      {f.type === 'textarea' ? (
                        <textarea className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-emerald-500 h-20 resize-none ${errors[f.key] ? 'border-red-300' : 'border-slate-200'}`} value={(form as any)[f.key]} onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: '' })); }} placeholder={f.placeholder} />
                      ) : (
                        <input type={f.type} className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-emerald-500 ${errors[f.key] ? 'border-red-300' : 'border-slate-200'}`} value={(form as any)[f.key]} onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: '' })); }} placeholder={f.placeholder} />
                      )}
                      {errors[f.key] && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors[f.key]}</p>}
                    </div>
                  ))}
                  <button onClick={handleApply} className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                    <Briefcase className="w-4 h-4" /> Submit Application
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                  Apply Now <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
