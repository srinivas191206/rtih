'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDb, SECTORS, DISTRICTS } from '@/lib/mockDb';
import { ChevronRight, ChevronLeft, CheckCircle2, Building, User, Lightbulb, Users, FileText, Send } from 'lucide-react';

const STAGES = ['Idea', 'Validation', 'Prototype', 'MVP', 'Revenue', 'Scale'];

const STEPS = [
  { id: 1, title: 'Founder Info', icon: User },
  { id: 2, title: 'Startup Details', icon: Building },
  { id: 3, title: 'Problem & Solution', icon: Lightbulb },
  { id: 4, title: 'Team & Docs', icon: Users },
  { id: 5, title: 'Review & Submit', icon: FileText },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [appId, setAppId] = useState('');

  const [form, setForm] = useState({
    founderName: '',
    email: '',
    phone: '',
    district: '',
    background: '',
    education: '',
    startupName: '',
    tagline: '',
    sector: '',
    stage: 'Idea',
    problemStatement: '',
    solution: '',
    teamSize: 1,
    coFounders: '',
    pitchDeckUrl: '',
    prototypeUrl: '',
    businessPlanUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.founderName.trim()) e.founderName = 'Required';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
      if (!form.phone.trim()) e.phone = 'Required';
      if (!form.district) e.district = 'Required';
      if (!form.background.trim()) e.background = 'Required';
    }
    if (step === 2) {
      if (!form.startupName.trim()) e.startupName = 'Required';
      if (!form.tagline.trim()) e.tagline = 'Required';
      if (!form.sector) e.sector = 'Required';
    }
    if (step === 3) {
      if (!form.problemStatement.trim()) e.problemStatement = 'Required (min 50 chars)';
      if (form.problemStatement.trim().length < 50) e.problemStatement = 'Please describe in at least 50 characters';
      if (!form.solution.trim()) e.solution = 'Required (min 50 chars)';
      if (form.solution.trim().length < 50) e.solution = 'Please describe in at least 50 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = () => {
    const db = getDb();
    const id = `app-${Date.now()}`;
    db.submitApplication({
      id,
      founderName: form.founderName,
      email: form.email,
      phone: form.phone,
      district: form.district,
      background: form.background,
      education: form.education,
      startupName: form.startupName,
      tagline: form.tagline,
      sector: form.sector,
      stage: form.stage,
      problemStatement: form.problemStatement,
      solution: form.solution,
      teamSize: Number(form.teamSize),
      coFounders: form.coFounders,
      pitchDeckUrl: form.pitchDeckUrl,
      prototypeUrl: form.prototypeUrl,
      businessPlanUrl: form.businessPlanUrl,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
    });
    setAppId(id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-10 text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Application Submitted!</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your startup application for <strong>{form.startupName}</strong> has been received by RTIH.
            Our team will review it and notify you at <strong>{form.email}</strong> within 5 business days.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Reference ID</p>
            <p className="text-xs font-mono text-slate-700 mt-1">{appId}</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-emerald-500/20">AP</div>
          <h1 className="text-2xl font-black text-slate-900 mt-4">Apply for RTIH Incubation</h1>
          <p className="text-xs text-slate-500 mt-1">Ratan Tata Innovation Hub • Government of Andhra Pradesh</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 -z-10" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all duration-500 -z-10"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map(s => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  done ? 'bg-emerald-500 border-emerald-500' : active ? 'bg-white border-emerald-500' : 'bg-white border-slate-200'
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Icon className={`w-4 h-4 ${active ? 'text-emerald-500' : 'text-slate-400'}`} />}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${active ? 'text-emerald-600' : 'text-slate-400'}`}>{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 space-y-5">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">
            Step {step}: {STEPS[step - 1].title}
          </h2>

          {/* Step 1: Founder Info */}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Full Name *" error={errors.founderName}>
                <input className={input(errors.founderName)} value={form.founderName} onChange={e => update('founderName', e.target.value)} placeholder="e.g. Srinivas Reddy" />
              </Field>
              <Field label="Email Address *" error={errors.email}>
                <input className={input(errors.email)} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="founder@startup.in" />
              </Field>
              <Field label="Mobile Number *" error={errors.phone}>
                <input className={input(errors.phone)} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 9876543210" />
              </Field>
              <Field label="District *" error={errors.district}>
                <select className={input(errors.district)} value={form.district} onChange={e => update('district', e.target.value)}>
                  <option value="">Select district</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Professional Background *" error={errors.background}>
                <textarea className={input(errors.background) + ' h-20 resize-none'} value={form.background} onChange={e => update('background', e.target.value)} placeholder="Briefly describe your professional background" />
              </Field>
              <Field label="Education Qualification">
                <input className={input('')} value={form.education} onChange={e => update('education', e.target.value)} placeholder="e.g. B.Tech, IIT Tirupati" />
              </Field>
            </div>
          )}

          {/* Step 2: Startup Details */}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Startup Name *" error={errors.startupName}>
                <input className={input(errors.startupName)} value={form.startupName} onChange={e => update('startupName', e.target.value)} placeholder="e.g. AgriVision AI" />
              </Field>
              <Field label="Tagline *" error={errors.tagline}>
                <input className={input(errors.tagline)} value={form.tagline} onChange={e => update('tagline', e.target.value)} placeholder="One line that describes your startup" />
              </Field>
              <Field label="Sector / Domain *" error={errors.sector}>
                <select className={input(errors.sector)} value={form.sector} onChange={e => update('sector', e.target.value)}>
                  <option value="">Select sector</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Current Stage *">
                <div className="grid grid-cols-3 gap-2">
                  {STAGES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update('stage', s)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        form.stage === s ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* Step 3: Problem & Solution */}
          {step === 3 && (
            <div className="space-y-4">
              <Field label="Problem Statement * (min 50 characters)" error={errors.problemStatement}>
                <textarea
                  className={input(errors.problemStatement) + ' h-32 resize-none'}
                  value={form.problemStatement}
                  onChange={e => update('problemStatement', e.target.value)}
                  placeholder="Describe the problem you are solving in detail..."
                />
                <p className="text-[10px] text-slate-400 mt-1">{form.problemStatement.length} characters</p>
              </Field>
              <Field label="Your Solution * (min 50 characters)" error={errors.solution}>
                <textarea
                  className={input(errors.solution) + ' h-32 resize-none'}
                  value={form.solution}
                  onChange={e => update('solution', e.target.value)}
                  placeholder="Describe your proposed solution, technology, and why it's unique..."
                />
                <p className="text-[10px] text-slate-400 mt-1">{form.solution.length} characters</p>
              </Field>
            </div>
          )}

          {/* Step 4: Team & Documents */}
          {step === 4 && (
            <div className="space-y-4">
              <Field label="Team Size *">
                <input type="number" min={1} max={50} className={input('')} value={form.teamSize} onChange={e => update('teamSize', e.target.value)} />
              </Field>
              <Field label="Co-Founders (names & roles)">
                <textarea className={input('') + ' h-20 resize-none'} value={form.coFounders} onChange={e => update('coFounders', e.target.value)} placeholder="e.g. Ravi Kumar – CTO, Priya Sharma – CMO" />
              </Field>
              <Field label="Pitch Deck URL (Google Drive / Dropbox)">
                <input className={input('')} value={form.pitchDeckUrl} onChange={e => update('pitchDeckUrl', e.target.value)} placeholder="https://drive.google.com/..." />
              </Field>
              <Field label="Prototype / Demo URL (optional)">
                <input className={input('')} value={form.prototypeUrl} onChange={e => update('prototypeUrl', e.target.value)} placeholder="https://..." />
              </Field>
              <Field label="Business Plan URL (optional)">
                <input className={input('')} value={form.businessPlanUrl} onChange={e => update('businessPlanUrl', e.target.value)} placeholder="https://..." />
              </Field>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-3 text-xs">
              <ReviewRow label="Founder" value={form.founderName} />
              <ReviewRow label="Email" value={form.email} />
              <ReviewRow label="Phone" value={form.phone} />
              <ReviewRow label="District" value={form.district} />
              <ReviewRow label="Startup Name" value={form.startupName} />
              <ReviewRow label="Sector" value={form.sector} />
              <ReviewRow label="Stage" value={form.stage} />
              <ReviewRow label="Team Size" value={String(form.teamSize)} />
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Problem Statement</p>
                <p className="text-slate-600 leading-relaxed">{form.problemStatement}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Solution</p>
                <p className="text-slate-600 leading-relaxed">{form.solution}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-4">
                <p className="text-xs text-emerald-700 font-semibold">
                  By submitting, you confirm that all information provided is accurate and you agree to RTIH&apos;s incubation terms and conditions.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button onClick={back} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button onClick={() => router.push('/')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            )}
            {step < 5 ? (
              <button onClick={next} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors">
                <Send className="w-4 h-4" /> Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="text-[10px] text-red-500 font-semibold mt-1">{error}</p>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="text-slate-800 text-right">{value || '—'}</span>
    </div>
  );
}

function input(err: string) {
  return `w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-slate-800 bg-slate-50/50 ${err ? 'border-red-300' : 'border-slate-200'}`;
}
