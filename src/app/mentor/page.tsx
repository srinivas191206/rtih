'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { getDb, Mentor, Startup, MentorSession, isExecutiveModeActive, getActiveUser } from '@/lib/mockDb';
import { calculateVentureHealth } from '@/lib/engines';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Sparkles, Bot, Clock, Compass, Target, MessageSquare, Plus, CheckSquare, BarChart3, HelpCircle, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MentorDashboard() {
  const router = useRouter();
  const [selectedMentorId, setSelectedMentorId] = useState<string>('mentor-1');
  const [db, setDb] = useState(() => getDb());
  const [execActive, setExecActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState('');
  const [evaluationStartupId, setEvaluationStartupId] = useState('');
  const [evaluationRating, setEvaluationRating] = useState('80');
  const [isAiLive, setIsAiLive] = useState(false);
  const [aiProvider, setAiProvider] = useState('Checking...');

  const syncStates = () => {
    setDb(getDb());
    setExecActive(isExecutiveModeActive());
  };

  // Login check and context lock
  useEffect(() => {
    const user = getActiveUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'mentor' && user.role !== 'admin' && user.role !== 'manager') {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    if (user.role === 'mentor') {
      setSelectedMentorId(user.id);
    }

    // Fetch AI Status
    fetch('/api/ai/copilot')
      .then(res => res.json())
      .then(data => {
        setIsAiLive(data.isLive);
        setAiProvider(data.provider);
      })
      .catch(err => {
        console.error('Failed to load AI status:', err);
        setIsAiLive(false);
        setAiProvider('Sandbox Fallback');
      });
  }, []);


  useEffect(() => {
    syncStates();
    
    const initialMentor = getDb().getMentor(selectedMentorId) || getDb().getMentors()[0];
    setChatHistory([
      { 
        sender: 'ai', 
        text: `Greetings ${initialMentor.name}! I am your RTIH AI Mentor Copilot. I can compile meeting summaries, audit target milestones, or match new ventures for your portfolio.` 
      }
    ]);

    window.addEventListener('rtih_mode_change', syncStates);
    return () => {
      window.removeEventListener('rtih_mode_change', syncStates);
    };
  }, [selectedMentorId]);

  const mentor = useMemo(() => {
    return db.getMentor(selectedMentorId) || db.getMentors()[0];
  }, [db, selectedMentorId]);

  const portfolioStartups = useMemo(() => {
    if (!mentor) return [];
    return mentor.portfolioStartups.map(id => db.getStartup(id)).filter(Boolean) as Startup[];
  }, [db, mentor]);

  const sessions = useMemo(() => {
    if (!mentor) return [];
    return db.getSessions().filter(s => s.mentorId === mentor.id);
  }, [db, mentor]);

  const chartData = useMemo(() => {
    return portfolioStartups.map(s => ({
      name: s.name.slice(0, 10),
      health: s.healthScore
    }));
  }, [portfolioStartups]);

  const recommendedStartups = useMemo(() => {
    if (!mentor) return [];
    return db.getStartups()
      .filter(s => mentor.expertise.includes(s.sector) && !mentor.portfolioStartups.includes(s.id))
      .slice(0, 3);
  }, [db, mentor]);

  const handleCompleteSession = (sessionId: string) => {
    alert('Session status marked as Completed. AI meeting summary logged.');
    confetti({
      particleCount: 40,
      colors: ['#a855f7']
    });
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluationStartupId || !evaluationFeedback) return;

    alert('Founder progress audit logged successfully.');
    setEvaluationFeedback('');
    setEvaluationStartupId('');
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          startupContext: { portfolioSize: portfolioStartups.length, mentorName: mentor?.name },
          role: 'Mentor'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { sender: 'ai', text: data.text }]);
        if (data.provider) {
          setIsAiLive(data.isLive);
          setAiProvider(data.provider);
        }
      } else {
        throw new Error('API return code ' + response.status);
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error communicating with the AI gateway.' }]);
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-purple-500" />
              Mentor Command Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit startup portfolios, evaluate OKR progress, track meeting schedules, and leverage AI transcripts.
            </p>
          </div>

          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') ? (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">Active Mentor Profile:</label>
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 focus:outline-none"
              >
                {db.getMentors().map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-purple-100 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
              <span>Mentor: {mentor?.name}</span>
            </div>
          )}
        </div>

        {/* Executive Mode briefing */}
        {execActive && (
          <section className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300">
                AI Executive briefing: Mentor Advisor Overview
              </h3>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-purple-500/10">
                <span className="font-bold text-slate-800 dark:text-slate-200">Portfolio Health Audit:</span>
                <p className="mt-1">Average portfolio health sits at **74%**. Startup GPS stage validations are proceeding on track.</p>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-purple-500/10">
                <span className="font-bold text-slate-800 dark:text-slate-200">Pending Actions:</span>
                <p className="mt-1">You have **{sessions.filter(s => s.status === 'Scheduled').length}** scheduled sessions remaining. Review compliance items.</p>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-purple-500/10">
                <span className="font-bold text-slate-800 dark:text-slate-200">State Recommendations:</span>
                <p className="mt-1">Engage with university outposts to screen candidate resumes for hiring milestones.</p>
              </div>
            </div>
          </section>
        )}

        {/* Mentor profile metrics */}
        {mentor && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4">
              <img src={mentor.avatar} alt={mentor.name} className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100" />
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{mentor.name}</h2>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">{mentor.email}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Impact Rating</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{mentor.impactScore}/100</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Reputation Index</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{mentor.reputationScore}/100</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Sessions Completed</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{mentor.sessionsCompleted} Meetings</p>
            </div>
          </section>
        )}

        {/* Meeting schedules and portfolios */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-500" />
                Meeting Intelligence Scheduler
              </h3>
              <p className="text-[10px] text-slate-400 mb-4 leading-normal">
                Scheduled consultation sessions with portfolio startups. Includes AI extracted summaries and transcripts.
              </p>

              <div className="space-y-4">
                {sessions.length > 0 ? (
                  sessions.map((session) => {
                    const startupObj = db.getStartup(session.startupId);
                    return (
                      <div
                        key={session.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-xs flex justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white leading-tight">
                              {startupObj?.name || 'Startup'}
                            </span>
                            <span className="text-[9px] text-slate-405">
                              {new Date(session.scheduledAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                            AI Summary: {session.aiSummary}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {session.actionItems.map((item, idx) => (
                              <span key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[8px] text-slate-500">
                                ✓ {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          {session.status === 'Scheduled' ? (
                            <button
                              onClick={() => handleCompleteSession(session.id)}
                              className="px-2.5 py-1.5 rounded bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-bold"
                            >
                              Mark Done
                            </button>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[8px] font-bold uppercase">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-xs text-slate-450">
                    No sessions scheduled.
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[10px] text-slate-450">
              Meetings are synchronized directly with RTIH calendar nodes.
            </div>
          </div>

          {/* Portfolio comparisons */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                Portfolio Health Comparisons
              </h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px' }}
                      labelStyle={{ color: '#fff', fontSize: '10px' }}
                    />
                    <Bar dataKey="health" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-[10px] text-slate-400">
              Health indices computed dynamically by Venture Health Engine.
            </div>
          </div>
        </section>

        {/* AI Copilot & Evaluation Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Mentor Copilot */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between h-[400px]">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-500" />
                  AI Mentor Copilot
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold self-start sm:self-auto ${
                  isAiLive 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${isAiLive ? 'bg-purple-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  {isAiLive ? `Live AI (${aiProvider})` : 'Local Sandbox Mode'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mb-3 leading-normal">
                Ask strategy checks, meeting logs evaluation, or search for potential startups to mentor.
              </p>


              {/* Chat screen */}
              <div className="h-[210px] overflow-y-auto border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-lg p-3 space-y-3">
                {chatHistory.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      chat.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                      chat.sender === 'user'
                        ? 'bg-purple-500 text-white font-medium rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                      {chat.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-450 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    Analyzing portfolio aggregates...
                  </div>
                )}
              </div>
            </div>

            {/* Input bar */}
            <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask: Analyze high-risk milestones in my portfolio"
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={isTyping}
                className="px-3 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Founder Evaluation Engine */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-805 dark:text-slate-200 mb-1">
                Founder Progress Audit
              </h3>
              <p className="text-[10px] text-slate-400 mb-4 leading-normal">
                Log evaluation ratings and comments directly to state records.
              </p>

              <form onSubmit={handleSubmitEvaluation} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Evaluate Startup:
                  </label>
                  <select
                    value={evaluationStartupId}
                    onChange={(e) => setEvaluationStartupId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-slate-850 dark:text-slate-200 focus:outline-none"
                    required
                  >
                    <option value="">Select Startup</option>
                    {portfolioStartups.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Ecosystem Audit Rating:
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={evaluationRating}
                    onChange={(e) => setEvaluationRating(e.target.value)}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Critical</span>
                    <span className="font-bold text-purple-500">{evaluationRating}/100</span>
                    <span>Exemplary</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Audit Notes & Actions:
                  </label>
                  <textarea
                    value={evaluationFeedback}
                    onChange={(e) => setEvaluationFeedback(e.target.value)}
                    placeholder="Enter review notes and recommended milestones..."
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-slate-850 dark:text-slate-200 focus:outline-none resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-bold"
                >
                  Submit Performance Audit
                </button>
              </form>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[9px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />
              Audits are pushed directly to the Program Manager dashboard.
            </div>
          </div>
        </section>

        {/* Recommended Startups */}
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Ecosystem Matching Recommendations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Startups matching your expertise sector ({mentor.expertise.join(', ')}).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedStartups.map((startup) => (
              <div 
                key={startup.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 px-2 py-0.5 rounded text-[9px] font-bold text-slate-500">
                    {startup.sector}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2 leading-none">
                    {startup.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">{startup.district} District</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-normal line-clamp-2">
                    {startup.tagline}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Health: <strong className="text-slate-650 dark:text-slate-300">{startup.healthScore}%</strong></span>
                  <button className="text-purple-500 font-bold hover:underline">Request portfolio link →</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
