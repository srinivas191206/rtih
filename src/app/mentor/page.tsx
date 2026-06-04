'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { 
  getDb, 
  Mentor, 
  Startup, 
  MentorSession, 
  isExecutiveModeActive, 
  getActiveUser,
  Hackathon,
  HackathonRegistration,
  HackathonSubmission,
  Message
} from '@/lib/mockDb';
import { calculateVentureHealth } from '@/lib/engines';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  Clock, 
  Compass, 
  Target, 
  MessageSquare, 
  Plus, 
  CheckSquare, 
  BarChart3, 
  HelpCircle, 
  Send,
  Trophy,
  Users,
  Star,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { showToast } from '@/lib/toast';

// Helper functions for rendering Markdown in chatbot messages
const parseInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx} className="italic text-slate-800">{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={lineIdx} className="h-2" />;
    }

    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace('### ', '');
      return (
        <h4 key={lineIdx} className="text-xs font-black text-slate-900 mt-2.5 mb-1.5 flex items-center gap-1">
          {parseInlineMarkdown(headingText)}
        </h4>
      );
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const bulletText = trimmed.substring(2);
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 pl-2 my-0.5 text-xs text-slate-700 leading-relaxed">
          <span className="text-emerald-500 font-bold text-sm leading-none">•</span>
          <span className="flex-1">{parseInlineMarkdown(bulletText)}</span>
        </div>
      );
    }

    const matchNumbered = trimmed.match(/^(\d+)\.\s(.*)/);
    if (matchNumbered) {
      const num = matchNumbered[1];
      const itemText = matchNumbered[2];
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 pl-2 my-0.5 text-xs text-slate-700 leading-relaxed">
          <span className="text-emerald-600 font-bold leading-none">{num}.</span>
          <span className="flex-1">{parseInlineMarkdown(itemText)}</span>
        </div>
      );
    }

    return (
      <p key={lineIdx} className="text-xs text-slate-700 my-1 leading-relaxed">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
};

export default function MentorDashboard({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [selectedMentorId, setSelectedMentorId] = useState<string>('mentor-1');
  const [db, setDb] = useState(() => getDb());
  const [execActive, setExecActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [renderTrigger, setRenderTrigger] = useState(0);

  // Tab state
  const [activeTab, setActiveTab] = useState<'portfolio' | 'goals' | 'tasks' | 'communications' | 'sessions' | 'promotions' | 'judging' | 'copilot'>('portfolio');

  // Chat / Communications state
  const [activeChatStartupId, setActiveChatStartupId] = useState<string | null>(null);
  const [chatMessageContent, setChatMessageContent] = useState('');

  // Tab grouping helpers
  const getPrimaryTab = (subTab: 'portfolio' | 'goals' | 'tasks' | 'communications' | 'sessions' | 'promotions' | 'judging' | 'copilot') => {
    if (['portfolio', 'goals', 'tasks', 'communications'].includes(subTab)) return 'portfolio_tasks';
    if (['sessions', 'promotions'].includes(subTab)) return 'sessions_promotions';
    if (subTab === 'judging') return 'judging';
    if (subTab === 'copilot') return 'copilot';
    return 'portfolio_tasks';
  };

  const activePrimaryTab = getPrimaryTab(activeTab);

  const PRIMARY_TABS = [
    { id: 'portfolio_tasks', label: 'Venture & Tasks', icon: ClipboardList, defaultSub: 'portfolio' },
    { id: 'sessions_promotions', label: 'Sessions & Promotions', icon: Clock, defaultSub: 'sessions' },
    { id: 'judging', label: 'SmartState Judging', icon: Trophy, defaultSub: 'judging' },
    { id: 'copilot', label: 'AI Mentor Coach', icon: Bot, defaultSub: 'copilot' }
  ] as const;

  // Hackathon Judging State
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('hack-1');
  const [scoringSubmissionId, setScoringSubmissionId] = useState<string | null>(null);
  const [scoreInnovation, setScoreInnovation] = useState<number>(80);
  const [scoreFeasibility, setScoreFeasibility] = useState<number>(80);
  const [scoreImpact, setScoreImpact] = useState<number>(80);
  const [scoreExecution, setScoreExecution] = useState<number>(80);
  const [judgeFeedbackText, setJudgeFeedbackText] = useState<string>('');

  // AI Copilot State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Progress Audit Form State
  const [evaluationFeedback, setEvaluationFeedback] = useState('');
  const [evaluationStartupId, setEvaluationStartupId] = useState('');
  const [evaluationRating, setEvaluationRating] = useState('80');

  // Audit Health & Assessment Modal State
  const [auditingStartupId, setAuditingStartupId] = useState<string | null>(null);
  const [mentorRating, setMentorRating] = useState<number>(5);
  const [mentorFeedbackText, setMentorFeedbackText] = useState<string>('');
  
  // Risk Flag Form State
  const [riskType, setRiskType] = useState<string>('Inactivity');
  const [riskSeverity, setRiskSeverity] = useState<'Low' | 'Medium' | 'High'>('High');
  const [riskDescription, setRiskDescription] = useState<string>('');

  const [isAiLive, setIsAiLive] = useState(false);
  const [aiProvider, setAiProvider] = useState('Checking...');

  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditingStartupId || !mentorFeedbackText.trim()) {
      showToast('Please fill out all assessment details.', 'error');
      return;
    }
    db.addMentorAssessment(auditingStartupId, {
      id: `ass-${Date.now()}`,
      mentorId: mentor.id,
      mentorName: mentor.name,
      rating: mentorRating,
      feedback: mentorFeedbackText,
      createdAt: new Date().toISOString()
    });
    setMentorFeedbackText('');
    setMentorRating(5);
    syncStates();
    showToast('Mentor assessment submitted successfully!', 'success');
  };

  const handleFlagRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditingStartupId || !riskDescription.trim()) {
      showToast('Please provide a description of the risk.', 'error');
      return;
    }
    db.addRiskFlag(auditingStartupId, {
      id: `risk-${Date.now()}`,
      type: riskType,
      severity: riskSeverity,
      description: riskDescription,
      resolved: false,
      createdAt: new Date().toISOString()
    });
    
    // Auto-create notification for Managers
    const startupObj = db.getStartup(auditingStartupId);
    const center = db.getIncubationCenters().find(c => c.domains.includes(startupObj?.sector || '')) || db.getIncubationCenters()[0];
    if (center && startupObj) {
      db.addNotification({
        id: `notif-${Date.now()}-risk-mgr`,
        userId: center.managerId,
        type: 'review_pending',
        title: `Critical Risk Flagged: ${startupObj.name}`,
        message: `Mentor ${mentor.name} has flagged ${riskType} risk (${riskSeverity} Severity) for ${startupObj.name}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/manager'
      });
    }

    setRiskDescription('');
    setRiskType('Inactivity');
    setRiskSeverity('High');
    syncStates();
    showToast('Venture risk flagged and dispatched to Spoke Manager successfully!', 'success');
  };

  // Task Management tab state
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskStartupId, setTaskStartupId] = useState('');

  // Session Logger tab state
  const [showLogSession, setShowLogSession] = useState(false);
  const [sessionStartupId, setSessionStartupId] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  const [sessionActionItemsInput, setSessionActionItemsInput] = useState('');

  // Stage Recommendations tab state
  const [showRecommendStage, setShowRecommendStage] = useState(false);
  const [recStartupId, setRecStartupId] = useState('');
  const [recProposedStage, setRecProposedStage] = useState<string>('validation');
  const [recNotes, setRecNotes] = useState('');
  
  // Milestone Verification / Revision State
  const [revisionMilestone, setRevisionMilestone] = useState<{ startupId: string; milestoneId: string; title: string } | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');

  // Goals & Action Items State
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalStartupId, setGoalStartupId] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  const [showAddAction, setShowAddAction] = useState(false);
  const [actionStartupId, setActionStartupId] = useState('');
  const [actionTitle, setActionTitle] = useState('');
  const [actionDeadline, setActionDeadline] = useState('');
  const [actionOwnerId, setActionOwnerId] = useState(''); // e.g., 'founder-email' or 'mentor-id'

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalStartupId || !goalTitle || !goalTargetDate) {
      showToast('Please fill out all required goal fields.', 'error');
      return;
    }
    db.addMentorshipGoal({
      id: `goal-${Date.now()}`,
      mentorId: mentor.id,
      startupId: goalStartupId,
      title: goalTitle,
      description: goalDesc,
      targetDate: goalTargetDate,
      status: 'Pending'
    });
    setGoalTitle('');
    setGoalDesc('');
    setGoalTargetDate('');
    setShowAddGoal(false);
    syncStates();
    showToast('Mentorship goal created successfully.', 'success');
  };

  const handleCreateActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionStartupId || !actionTitle || !actionDeadline || !actionOwnerId) {
      showToast('Please fill out all required action item fields.', 'error');
      return;
    }
    db.addActionItem({
      id: `action-${Date.now()}`,
      mentorId: mentor.id,
      startupId: actionStartupId,
      ownerId: actionOwnerId,
      title: actionTitle,
      deadline: actionDeadline,
      status: 'Pending'
    });
    setActionTitle('');
    setActionDeadline('');
    setShowAddAction(false);
    syncStates();
    showToast('Action item assigned successfully.', 'success');
  };

  
  const syncStates = () => {
    setDb(getDb());
    setExecActive(isExecutiveModeActive());
    setRenderTrigger(prev => prev + 1);
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
  }, [db, selectedMentorId, renderTrigger]);

  const portfolioStartups = useMemo(() => {
    if (!mentor) return [];
    return mentor.portfolioStartups.map(id => db.getStartup(id)).filter(Boolean) as Startup[];
  }, [db, mentor, renderTrigger]);

  const sessions = useMemo(() => {
    if (!mentor) return [];
    return db.getSessions().filter(s => s.mentorId === mentor.id);
  }, [db, mentor, renderTrigger]);

  const mentorshipGoals = useMemo(() => {
    if (!mentor) return [];
    return db.getMentorshipGoals().filter(g => g.mentorId === mentor.id);
  }, [db, mentor, renderTrigger]);

  const actionItems = useMemo(() => {
    if (!mentor) return [];
    return db.getActionItems().filter(a => a.mentorId === mentor.id);
  }, [db, mentor, renderTrigger]);

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
  }, [db, mentor, renderTrigger]);

  const submittedMilestones = useMemo(() => {
    if (!portfolioStartups) return [];
    const list: { startup: Startup; milestone: any }[] = [];
    portfolioStartups.forEach(startup => {
      if (startup.milestones) {
        startup.milestones.forEach(m => {
          if (m.status === 'Submitted') {
            list.push({ startup, milestone: m });
          }
        });
      }
    });
    return list;
  }, [portfolioStartups]);

  // Hackathons & Registrations List for Judging
  const activeHackathon = useMemo(() => {
    return db.getHackathon(selectedHackathonId);
  }, [db, selectedHackathonId, renderTrigger]);

  const hackathonRegistrations = useMemo(() => {
    return db.getRegistrations().filter(r => r.hackathonId === selectedHackathonId);
  }, [db, selectedHackathonId, renderTrigger]);

  const hackathonSubmissions = useMemo(() => {
    return db.getSubmissions().filter(s => s.hackathonId === selectedHackathonId);
  }, [db, selectedHackathonId, renderTrigger]);

  const handleCompleteSession = (sessionId: string) => {
    showToast('Session status marked as Completed. AI meeting summary logged.', 'success');
    confetti({
      particleCount: 40,
      colors: ['#a855f7']
    });
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluationStartupId || !evaluationFeedback) return;

    showToast('Founder progress audit logged successfully.', 'success');
    setEvaluationFeedback('');
    setEvaluationStartupId('');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatStartupId || !chatMessageContent.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      startupId: activeChatStartupId,
      senderId: mentor.email,
      senderName: `${mentor.name} (Mentor)`,
      senderRole: 'mentor',
      content: chatMessageContent,
      sentAt: new Date().toISOString(),
      isRead: false
    };

    db.addMessage(newMessage);
    setChatMessageContent('');
    
    // Notify the startup founder
    const startupObj = db.getStartup(activeChatStartupId);
    const founderObj = db.getFounders().find(f => f.startupId === activeChatStartupId);
    if (founderObj) {
      db.addNotification({
        id: `notif-${Date.now()}-msg-founder`,
        userId: founderObj.email,
        type: 'message_received',
        title: 'New Message from Mentor',
        message: `Mentor ${mentor.name} has sent a message to your thread.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/founder'
      });
    }

    // Notify manager
    const center = db.getIncubationCenters().find(c => c.domains.includes(startupObj?.sector || '')) || db.getIncubationCenters()[0];
    if (center) {
      db.addNotification({
        id: `notif-${Date.now()}-msg-mgr`,
        userId: center.managerId,
        type: 'message_received',
        title: 'New Message from Mentor',
        message: `Mentor ${mentor.name} has messaged ${startupObj?.name || 'startup'}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/manager'
      });
    }

    window.dispatchEvent(new Event('rtih_mode_change'));
    syncStates();
  };

  // Hackathon Scoring Submission
  const handleScoreSubmission = (e: React.FormEvent, submissionId: string) => {
    e.preventDefault();
    if (!judgeFeedbackText.trim()) {
      showToast('Please enter judge comments.', 'error');
      return;
    }

    const scorePayload = {
      judgeId: mentor.id,
      innovation: scoreInnovation,
      feasibility: scoreFeasibility,
      impact: scoreImpact,
      execution: scoreExecution,
      comment: judgeFeedbackText
    };

    db.submitJudgeScore(submissionId, scorePayload);
    setScoringSubmissionId(null);
    setJudgeFeedbackText('');
    syncStates();
    confetti({
      particleCount: 100,
      spread: 70,
      colors: ['#a855f7', '#10b981']
    });
    showToast('Hackathon project deliverables score successfully registered!', 'success');
  };

  const handleSelectScoring = (sub: HackathonSubmission) => {
    setScoringSubmissionId(sub.id);
    const existingScore = sub.scores.find(s => s.judgeId === mentor.id);
    if (existingScore) {
      setScoreInnovation(existingScore.innovation);
      setScoreFeasibility(existingScore.feasibility);
      setScoreImpact(existingScore.impact);
      setScoreExecution(existingScore.execution);
      setJudgeFeedbackText(existingScore.comment || '');
    } else {
      setScoreInnovation(80);
      setScoreFeasibility(80);
      setScoreImpact(80);
      setScoreExecution(80);
      setJudgeFeedbackText('');
    }
  };

  const handleRequestRevision = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!revisionMilestone || !revisionFeedback.trim()) return;
    const { startupId, milestoneId, title } = revisionMilestone;
    
    db.updateMilestone(startupId, milestoneId, 'Pending', undefined, undefined, revisionFeedback);
    
    // Founder notification
    const startup = db.getStartup(startupId);
    const founderIds = startup?.founders || [];
    const founder = founderIds.length > 0 ? db.getFounder(founderIds[0]) : null;
    if (founder) {
      db.addNotification({
        id: `notif-${Date.now()}-milestone-rev`,
        userId: founder.email,
        type: 'review_pending',
        title: 'Milestone Revision Requested',
        message: `Revision requested for milestone "${title}". Reason: ${revisionFeedback}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/founder'
      });
    }
    
    setRevisionMilestone(null);
    setRevisionFeedback('');
    syncStates();
    showToast('Revision request submitted to the founder.', 'info');
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 20000);

      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          startupContext: {
            portfolioSize: portfolioStartups.length,
            mentorName: mentor?.name,
            expertise: mentor?.expertise,
            portfolio: portfolioStartups.map(s => ({
              id: s.id,
              name: s.name,
              stage: s.stage,
              sector: s.sector,
              healthScore: s.healthScore,
              district: s.district
            }))
          },
          role: 'Mentor'
        }),
        signal: controller.signal
      });
      clearTimeout(fetchTimeout);

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { sender: 'ai', text: data.text }]);
        if (data.provider) {
          setIsAiLive(data.isLive);
          setAiProvider(data.provider);
        }
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error: any) {
      const isTimeout = error?.name === 'AbortError';
      console.error('[RTIH AI] Mentor chat error:', error);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: isTimeout
            ? '⏱️ The AI took too long to respond. Please try again.'
            : '⚠️ Could not reach the AI gateway. Please check your connection and try again.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div className={embedded ? "w-full text-slate-800" : "flex flex-col min-h-screen bg-slate-50"}>
      {!embedded && <Navigation />}

      <main className={embedded ? "w-full py-4 space-y-8" : "flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8"}>
        
        {/* Header selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Compass className="w-6 h-6 text-purple-500" />
              Mentor Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Audit startup portfolios, evaluate OKR progress, track meeting schedules, and leverage AI transcripts.
            </p>
          </div>

          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') ? (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-505">Active Mentor Profile:</label>
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="text-xs font-semibold rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 focus:outline-none cursor-pointer text-slate-800"
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
              <Bot className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-purple-800">
                AI Executive briefing: Mentor Advisor Overview
              </h3>
            </div>
            <div className="text-xs text-slate-650 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-3 rounded-lg border border-purple-500/10 shadow-sm">
                <span className="font-bold text-slate-800">Portfolio Health Audit:</span>
                <p className="mt-1">Average portfolio health sits at **74%**. Startup GPS stage validations are proceeding on track.</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-500/10 shadow-sm">
                <span className="font-bold text-slate-800">Pending Actions:</span>
                <p className="mt-1">You have **{sessions.filter(s => s.status === 'Scheduled').length}** scheduled sessions remaining. Review compliance items.</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-500/10 shadow-sm">
                <span className="font-bold text-slate-800">State Recommendations:</span>
                <p className="mt-1">Engage with university outposts to screen candidate resumes for hiring milestones.</p>
              </div>
            </div>
          </section>
        )}

        {/* Mentor profile metrics */}
        {mentor && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 border-r border-slate-100 pr-4">
              <img src={mentor.avatar} alt={mentor.name} className="w-12 h-12 rounded-full border border-slate-200 bg-slate-100" />
              <div>
                <h2 className="font-bold text-xs text-slate-900 leading-tight">{mentor.name}</h2>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">{mentor.email}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {mentor.expertise.map(exp => (
                    <span key={exp} className="px-1.5 py-0.2 bg-purple-50 text-[8px] font-bold text-purple-700 rounded border border-purple-100 uppercase">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center self-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Impact Rating</p>
              <p className="text-xl font-black text-slate-900 mt-1">{mentor.impactScore}/100</p>
            </div>

            <div className="text-center self-center border-l border-r border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Reputation Index</p>
              <p className="text-xl font-black text-slate-900 mt-1">{mentor.reputationScore}/100</p>
            </div>

            <div className="text-center self-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Sessions Completed</p>
              <p className="text-xl font-black text-slate-900 mt-1">{mentor.sessionsCompleted} Meetings</p>
            </div>
          </section>
        )}

        {/* Two-column layout: Left Sidebar Navigation & Right Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 select-none sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Mentor Modules
            </p>
            <div className="flex flex-col gap-1">
              {PRIMARY_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activePrimaryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.defaultSub)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all text-left w-full cursor-pointer ${
                      isActive 
                        ? 'bg-purple-50 border-purple-200 text-purple-750 shadow-sm font-black' 
                        : 'bg-transparent border-transparent text-slate-550 hover:bg-slate-50 hover:text-slate-750'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Main Content Panel */}
          <div className="lg:col-span-9 space-y-6">
            {/* Horizontal Sub-Navigation */}
            {activePrimaryTab !== 'judging' && activePrimaryTab !== 'copilot' && (
              <div className="flex gap-2 border-b border-slate-200 pb-3 mb-2 overflow-x-auto whitespace-nowrap">
                {activePrimaryTab === 'portfolio_tasks' && (
                  <>
                    <button
                      onClick={() => setActiveTab('portfolio')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'portfolio'
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Venture Portfolio
                    </button>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'tasks'
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Task Manager
                    </button>
                    <button
                      onClick={() => setActiveTab('goals')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'goals'
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Goals & Actions
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('communications');
                        if (portfolioStartups.length > 0 && !activeChatStartupId) {
                          setActiveChatStartupId(portfolioStartups[0].id);
                        }
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'communications'
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Communications Chat
                    </button>
                  </>
                )}
                {activePrimaryTab === 'sessions_promotions' && (
                  <>
                    <button
                      onClick={() => setActiveTab('sessions')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'sessions'
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Session Logger
                    </button>
                    <button
                      onClick={() => setActiveTab('promotions')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === 'promotions'
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/10'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Stage Recommendations
                    </button>
                  </>
                )}
              </div>
            )}

        {/* Tab 1: Venture Portfolio */}
        {activeTab === 'portfolio' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Meeting schedules and portfolios */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
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
                            className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs flex justify-between gap-4 shadow-sm"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 leading-tight">
                                  {startupObj?.name || 'Startup'}
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  {new Date(session.scheduledAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                                AI Summary: {session.aiSummary}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {session.actionItems.map((item, idx) => (
                                  <span key={idx} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[8px] text-slate-500">
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
                                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-650 text-[8px] font-bold uppercase">
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 text-xs text-slate-400 font-bold bg-slate-50 border border-slate-150 rounded-xl">
                        No sessions scheduled.
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400">
                  Meetings are synchronized directly with RTIH calendar nodes.
                </div>
              </div>

              {/* Portfolio comparisons */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    Portfolio Health Comparisons
                  </h3>
                  <div className="h-[220px] w-full">
                    {chartData.length > 0 ? (
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
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50 rounded-xl">
                        Portfolio empty
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                  Health indices computed dynamically by Venture Health Engine.
                </div>
              </div>
            </section>

            {/* Venture Portfolio Directory */}
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Your Incubation Portfolio
                </h3>
                <p className="text-xs text-slate-500">
                  Select a startup to audit health metrics, submit assessments, and flag risks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {portfolioStartups.map((startup) => {
                  const category = startup.healthCategory || 'Stable';
                  return (
                    <div 
                      key={startup.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            startup.healthScore < 50
                              ? 'text-red-750 bg-red-50/50 border-red-200'
                              : startup.healthScore < 60
                              ? 'text-amber-750 bg-amber-50/50 border-amber-200'
                              : startup.healthScore < 75
                              ? 'text-blue-750 bg-blue-50/50 border-blue-200'
                              : 'text-emerald-700 bg-emerald-50/50 border-emerald-200'
                          }`}>
                            {category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                            {startup.stage}
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-sm text-slate-900 mt-3 leading-none">
                          {startup.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-tight">{startup.district} District</p>
                        <p className="text-xs text-slate-500 mt-3 leading-normal line-clamp-2">
                          {startup.tagline}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400 font-bold">Health: <strong className="text-slate-700">{startup.healthScore}%</strong></span>
                        <button 
                          onClick={() => setAuditingStartupId(startup.id)}
                          className="px-3 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 transition-colors cursor-pointer"
                        >
                          Audit & Assess →
                        </button>
                      </div>
                    </div>
                  );
                })}
                {portfolioStartups.length === 0 && (
                  <div className="col-span-full text-center py-10 text-xs text-slate-400 font-bold bg-slate-50 border border-slate-150 rounded-xl">
                    No startups assigned to your portfolio yet.
                  </div>
                )}
              </div>
            </section>

            {/* Recommended Startups */}
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Ecosystem Matching Recommendations
                </h3>
                <p className="text-xs text-slate-500">
                  Startups matching your expertise sector ({mentor.expertise.join(', ')}).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedStartups.map((startup) => (
                  <div 
                    key={startup.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-500 uppercase">
                        {startup.sector}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-2 leading-none">
                        {startup.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">{startup.district} District</p>
                      <p className="text-xs text-slate-500 mt-3 leading-normal line-clamp-2">
                        {startup.tagline}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-bold">Health: <strong className="text-slate-700">{startup.healthScore}%</strong></span>
                      <button 
                        onClick={() => showToast(`Portfolio request sent for ${startup.name}.`, 'info')}
                        className="text-purple-500 font-bold hover:underline"
                      >
                        Request portfolio link →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Tab: Task Manager */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-purple-500" /> Milestone Task Board
                  </h2>
                  <p className="text-xs text-slate-500">Create, monitor, and verify operational tasks assigned to your portfolio startups.</p>
                </div>
                <button
                  onClick={() => {
                    if (portfolioStartups.length === 0) { showToast('You have no startups in your portfolio.', 'error'); return; }
                    setTaskStartupId(portfolioStartups[0].id);
                    setShowAddTask(true);
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-650 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Task
                </button>
              </div>

              {/* Add Task Modal */}
              {showAddTask && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
                    <h3 className="text-sm font-black text-slate-900">Assign New Task</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-505 block mb-1">Select Startup</label>
                        <select 
                          value={taskStartupId} 
                          onChange={(e) => setTaskStartupId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs"
                        >
                          {portfolioStartups.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-505 block mb-1">Task Title</label>
                        <input 
                          type="text" 
                          value={taskTitle} 
                          onChange={(e) => setTaskTitle(e.target.value)} 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800" 
                          placeholder="e.g. Build financial projection spreadsheet" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-505 block mb-1">Description</label>
                        <textarea 
                          value={taskDesc} 
                          onChange={(e) => setTaskDesc(e.target.value)} 
                          rows={3} 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none text-slate-800" 
                          placeholder="Provide specific instructions, deliverables, and guidance..." 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-505 block mb-1">Due Date</label>
                        <input 
                          type="date" 
                          value={taskDueDate} 
                          onChange={(e) => setTaskDueDate(e.target.value)} 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-805" 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 text-xs">
                      <button
                        onClick={() => {
                          if (!taskTitle.trim() || !taskDesc.trim() || !taskDueDate || !taskStartupId) { showToast('Please fill in all fields.', 'error'); return; }
                          db.addTask({
                            id: `task-${Date.now()}`,
                            startupId: taskStartupId,
                            mentorId: selectedMentorId,
                            title: taskTitle,
                            description: taskDesc,
                            dueDate: taskDueDate,
                            status: 'Assigned',
                            createdAt: new Date().toISOString()
                          });
                          setDb(getDb());
                          setShowAddTask(false);
                          setTaskTitle('');
                          setTaskDesc('');
                          setTaskDueDate('');
                          showToast('Task assigned successfully!', 'success');
                        }}
                        className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
                      >
                        Create Task
                      </button>
                      <button onClick={() => setShowAddTask(false)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-2.5">Startup</th>
                      <th className="px-4 py-2.5">Task Details</th>
                      <th className="px-4 py-2.5">Due Date</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {db.getTasks().filter(t => t.mentorId === selectedMentorId).length > 0 ? (
                      db.getTasks().filter(t => t.mentorId === selectedMentorId).map(task => {
                        const startup = db.getStartup(task.startupId);
                        return (
                          <tr key={task.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-slate-800">{startup ? startup.name : 'Unknown Startup'}</td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-slate-700 block">{task.title}</span>
                              <span className="text-[10px] text-slate-400 leading-relaxed block max-w-sm mt-0.5">{task.description}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 font-medium">{task.dueDate}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                task.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                                task.status === 'Submitted' ? 'bg-blue-105 text-blue-800 animate-pulse' :
                                task.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>{task.status}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {task.status === 'Submitted' ? (
                                <div className="space-y-1">
                                  <button
                                    onClick={() => {
                                      db.updateTask(task.id, { status: 'Verified', completedAt: new Date().toISOString() });
                                      
                                      // Founder notification
                                      const founderIds = startup?.founders || [];
                                      const founder = founderIds.length > 0 ? db.getFounder(founderIds[0]) : null;
                                      if (founder) {
                                        db.addNotification({
                                          id: `notif-${Date.now()}-task`,
                                          userId: founder.email,
                                          type: 'task_verified',
                                          title: 'Task Evidence Verified',
                                          message: `Your mentor verified completion of task: "${task.title}". Keep up the strong work!`,
                                          isRead: false,
                                          createdAt: new Date().toISOString(),
                                          linkTo: '/founder'
                                        });
                                      }
                                      
                                      setDb(getDb());
                                      confetti({ particleCount: 60, spread: 40 });
                                    }}
                                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-bold transition-all text-[10px] w-full"
                                  >
                                    Verify Evidence
                                  </button>
                                  {task.evidenceUrl && (
                                    <a href={task.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-purple-650 hover:underline block font-semibold">
                                      View Document
                                    </a>
                                  )}
                                </div>
                              ) : task.status === 'Verified' ? (
                                <span className="text-[10px] text-slate-400 font-semibold">✓ Complete</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Awaiting submission</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-10 font-bold text-slate-450">
                          No tasks have been assigned yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Goals & Actions */}
        {activeTab === 'goals' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mentorship Goals */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-500" /> Mentorship Goals
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Track long-term strategic objectives for your portfolio.</p>
                  </div>
                  <button onClick={() => setShowAddGoal(true)} className="px-3 py-1.5 bg-purple-500 text-white font-bold rounded-lg text-xs hover:bg-purple-600 transition-colors flex items-center gap-1">
                    <Plus className="w-3 h-3" /> New Goal
                  </button>
                </div>
                
                <div className="space-y-3">
                  {mentorshipGoals.length > 0 ? mentorshipGoals.map(goal => (
                    <div key={goal.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-slate-800">{goal.title}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                          goal.status === 'Achieved' ? 'bg-emerald-100 text-emerald-700' :
                          goal.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          goal.status === 'Missed' ? 'bg-red-100 text-red-700' :
                          'bg-slate-200 text-slate-600'
                        }`}>{goal.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{goal.description}</p>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-150 text-[10px] text-slate-450 font-semibold">
                        <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        <span>Startup: {db.getStartup(goal.startupId)?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-xs text-slate-450 bg-slate-50 border border-slate-150 rounded-xl">No mentorship goals active.</div>
                  )}
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-500" /> Action Items
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Short-term assigned tasks for founders and mentors.</p>
                  </div>
                  <button onClick={() => setShowAddAction(true)} className="px-3 py-1.5 bg-purple-500 text-white font-bold rounded-lg text-xs hover:bg-purple-600 transition-colors flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Assign Action
                  </button>
                </div>
                
                <div className="space-y-3">
                  {actionItems.length > 0 ? actionItems.map(action => (
                    <div key={action.id} className="p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-sm flex-shrink-0 w-4 h-4 border ${action.status === 'Completed' ? 'bg-purple-500 border-purple-500' : 'border-slate-300'}`}>
                          {action.status === 'Completed' && <Check className="w-3.5 h-3.5 text-white m-auto" />}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-xs font-bold ${action.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{action.title}</h4>
                          <div className="flex gap-3 mt-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                            <span>Due: {new Date(action.deadline).toLocaleDateString()}</span>
                            <span className="text-purple-600">Assignee: {action.ownerId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-xs text-slate-450 bg-slate-50 border border-slate-150 rounded-xl">No pending action items.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal: Add Goal */}
            {showAddGoal && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                  <h3 className="text-sm font-black text-slate-900">Create Mentorship Goal</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-505 block mb-1">Select Startup</label>
                      <select value={goalStartupId} onChange={(e) => setGoalStartupId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                        <option value="">-- Choose Startup --</option>
                        {portfolioStartups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-505 block mb-1">Goal Title</label>
                      <input type="text" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="e.g. Close Seed Round" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-505 block mb-1">Description</label>
                      <textarea value={goalDesc} onChange={(e) => setGoalDesc(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none" placeholder="Target metrics and definition of done..." />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-505 block mb-1">Target Date</label>
                      <input type="date" value={goalTargetDate} onChange={(e) => setGoalTargetDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 text-xs">
                    <button onClick={handleCreateGoal} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex-1">Save Goal</button>
                    <button onClick={() => setShowAddGoal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex-1">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Add Action Item */}
            {showAddAction && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                  <h3 className="text-sm font-black text-slate-900">Assign Action Item</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-505 block mb-1">Select Startup</label>
                      <select value={actionStartupId} onChange={(e) => setActionStartupId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                        <option value="">-- Choose Startup --</option>
                        {portfolioStartups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-505 block mb-1">Assignee</label>
                      <input type="text" value={actionOwnerId} onChange={(e) => setActionOwnerId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="e.g. Founder Email or Mentor ID" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-505 block mb-1">Task Title</label>
                      <input type="text" value={actionTitle} onChange={(e) => setActionTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="e.g. Send updated pitch deck" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-505 block mb-1">Deadline</label>
                      <input type="date" value={actionDeadline} onChange={(e) => setActionDeadline(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 text-xs">
                    <button onClick={handleCreateActionItem} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex-1">Assign Item</button>
                    <button onClick={() => setShowAddAction(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex-1">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Communications Chat */}
        {activeTab === 'communications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-5 h-5 text-purple-500" /> Communications Chat
              </h2>
              <p className="text-xs text-slate-500 mb-6">Direct secure channel matching founders, mentors, and program managers under the AP Startup framework.</p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-slate-800">
                
                {/* Startup Conversations List */}
                <div className="md:col-span-4 border border-slate-200 rounded-xl p-3 bg-white space-y-2 select-none">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 block mb-1">Portfolio Contacts</span>
                  {portfolioStartups.map(s => {
                    const isSelected = activeChatStartupId === s.id;
                    return (
                      <div 
                        key={s.id}
                        onClick={() => setActiveChatStartupId(s.id)}
                        className={`p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-purple-50 border-purple-200 text-purple-800' 
                            : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {s.name}
                        <span className="text-[9px] text-slate-400 block font-normal">{s.sector}</span>
                      </div>
                    );
                  })}
                  {portfolioStartups.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-400 italic">No startups assigned.</div>
                  )}
                </div>

                {/* Active Conversation Dialog */}
                <div className="md:col-span-8 border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between min-h-[350px]">
                  {activeChatStartupId ? (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="pb-3 border-b border-slate-100 flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-black text-slate-900 text-sm">
                              {db.getStartup(activeChatStartupId)?.name} Chat
                            </h3>
                            <p className="text-[9px] text-slate-400">Secure channel logged by RTIH audits.</p>
                          </div>
                        </div>

                        {/* Messages area */}
                        <div className="space-y-3 max-h-[220px] overflow-y-auto mb-4 p-2 bg-slate-50/50 rounded-lg">
                          {db.getMessages(activeChatStartupId).length > 0 ? (
                            db.getMessages(activeChatStartupId)
                              .map(m => {
                                const isSelf = m.senderId === mentor?.email;
                                return (
                                  <div key={m.id} className={`flex items-start gap-2.5 max-w-[85%] ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}>
                                    <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                                      isSelf 
                                        ? 'bg-purple-500 text-white font-medium rounded-tr-none'
                                        : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none shadow-sm'
                                    }`}>
                                      <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider mb-0.5">
                                        {m.senderName} ({m.senderRole})
                                      </span>
                                      {m.content}
                                      <span className={`text-[7.5px] block text-right mt-1 ${isSelf ? 'text-purple-100' : 'text-slate-405'}`}>
                                        {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                          ) : (
                            <p className="text-center py-10 font-bold text-slate-400 italic">Send the first message to initiate conversation.</p>
                          )}
                        </div>
                      </div>

                      <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-3 border-t border-slate-100">
                        <input
                          type="text"
                          value={chatMessageContent}
                          onChange={(e) => setChatMessageContent(e.target.value)}
                          placeholder="Type your official message here..."
                          className="flex-1 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none text-slate-800"
                          required
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-purple-500 hover:bg-purple-650 text-white text-xs font-semibold rounded flex items-center justify-center shrink-0"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-slate-400 font-bold">
                      <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                      Select a startup contact from the left pane to view conversation logs.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Session Logger */}
        {activeTab === 'sessions' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" /> Consultations Logger
                  </h2>
                  <p className="text-xs text-slate-500">Schedule meetings, input consultation summaries, and record action points for founders.</p>
                </div>
                <button
                  onClick={() => {
                    if (portfolioStartups.length === 0) { showToast('You have no startups in your portfolio.', 'error'); return; }
                    setSessionStartupId(portfolioStartups[0].id);
                    setShowLogSession(true);
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-655 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Session
                </button>
              </div>

              {/* Log Session Modal */}
              {showLogSession && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
                    <h3 className="text-sm font-black text-slate-900">Log Consultation Session</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-505 block mb-1">Startup</label>
                        <select 
                          value={sessionStartupId} 
                          onChange={(e) => setSessionStartupId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs"
                        >
                          {portfolioStartups.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-505 block mb-1">Session Date</label>
                        <input 
                          type="date" 
                          value={sessionDate} 
                          onChange={(e) => setSessionDate(e.target.value)} 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-805" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-505 block mb-1">Session Notes / AI Summary</label>
                        <textarea 
                          value={sessionSummary} 
                          onChange={(e) => setSessionSummary(e.target.value)} 
                          rows={3} 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none text-slate-800" 
                          placeholder="Provide details on topic discussed, strategic recommendations, or challenges noted..." 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-505 block mb-1">Action Items <span className="text-slate-400">(comma-separated)</span></label>
                        <input 
                          type="text" 
                          value={sessionActionItemsInput} 
                          onChange={(e) => setSessionActionItemsInput(e.target.value)} 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800" 
                          placeholder="e.g. Conduct user surveys, Refine landing page copy, Deploy V2 sensor" 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 text-xs">
                      <button
                        onClick={() => {
                          if (!sessionDate || !sessionSummary.trim() || !sessionStartupId) { showToast('Please fill in required fields.', 'error'); return; }
                          const actions = sessionActionItemsInput.split(',').map(x => x.trim()).filter(Boolean);
                          db.addSession({
                            id: `session-${Date.now()}`,
                            startupId: sessionStartupId,
                            mentorId: selectedMentorId,
                            scheduledAt: sessionDate + 'T10:00:00Z',
                            status: 'Completed',
                            notes: sessionSummary,
                            aiSummary: sessionSummary,
                            actionItems: actions.length > 0 ? actions : ['Review next milestone progress.']
                          });
                          
                          // Founder notification
                          const startup = db.getStartup(sessionStartupId);
                          const founderIds = startup?.founders || [];
                          const founder = founderIds.length > 0 ? db.getFounder(founderIds[0]) : null;
                          if (founder && startup) {
                            db.addNotification({
                              id: `notif-${Date.now()}-sess`,
                              userId: founder.email,
                              type: 'message_received',
                              title: 'Mentor Consultation Logged',
                              message: `Your mentor logged a consultation session for ${startup.name}. AI notes and action items are available.`,
                              isRead: false,
                              createdAt: new Date().toISOString(),
                              linkTo: '/founder'
                            });
                          }

                          setDb(getDb());
                          setShowLogSession(false);
                          setSessionSummary('');
                          setSessionActionItemsInput('');
                          setSessionDate('');
                          confetti({ particleCount: 50 });
                          showToast('Consultation session logged successfully!', 'success');
                        }}
                        className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
                      >
                        Log Completed Session
                      </button>
                      <button type="button" onClick={() => setShowLogSession(false)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Consultation History */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consultations History ({sessions.length})</p>
                {sessions.length > 0 ? (
                  sessions.map((session) => {
                    const startupObj = db.getStartup(session.startupId);
                    return (
                      <div key={session.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                          <div>
                            <strong className="text-slate-805 text-sm">{startupObj?.name || 'Cohort Venture'}</strong>
                            <span className="text-[10px] text-slate-400 ml-2">{new Date(session.scheduledAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            session.status === 'Completed' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-purple-50 border border-purple-250 text-purple-800'
                          }`}>{session.status}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium"><span className="text-slate-400 font-semibold">Consultation Summary:</span> {session.aiSummary}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {session.actionItems.map((item, idx) => (
                            <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-500">
                              ✓ {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-10 text-xs font-bold text-slate-400 italic">No consultations logged in history.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Stage Recommendations */}
        {activeTab === 'promotions' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Milestone Verifications Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Milestone Verification Requests
                </h2>
                <p className="text-xs text-slate-500">Audit and verify evidence submitted by founders before unlocking next-stage OKRs.</p>
              </div>

              {submittedMilestones.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {submittedMilestones.map(({ startup, milestone }) => (
                    <div 
                      key={milestone.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-3 text-slate-900">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="px-2 py-0.5 bg-purple-100 border border-purple-200 text-purple-800 text-[9px] font-black rounded uppercase tracking-wide">
                              {startup.name}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-950 mt-1">
                              {milestone.title}
                            </h4>
                          </div>
                          <span className="px-2 py-0.5 bg-yellow-105 border border-yellow-250 text-yellow-800 text-[9px] font-bold rounded uppercase shrink-0">
                            Awaiting Audit
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 leading-normal">
                          {milestone.description}
                        </p>

                        <div className="p-3 bg-white rounded-lg border border-slate-150 text-xs space-y-2">
                          <div>
                            <span className="font-bold text-slate-700 block">Founder Notes:</span>
                            <p className="text-slate-600 mt-0.5 leading-normal italic">
                              "{milestone.notes || 'No description provided.'}"
                            </p>
                          </div>
                          {milestone.evidenceUrl && (
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="font-bold text-slate-700">Verification Link:</span>
                              <a 
                                href={milestone.evidenceUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                              >
                                View Evidence <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 text-xs border-t border-slate-200/50">
                        <button
                          onClick={() => {
                            db.updateMilestone(startup.id, milestone.id, 'Completed');
                            
                            // Founder notification
                            const founderIds = startup.founders || [];
                            const founder = founderIds.length > 0 ? db.getFounder(founderIds[0]) : null;
                            if (founder) {
                              db.addNotification({
                                id: `notif-${Date.now()}-milestone-app`,
                                userId: founder.email,
                                type: 'milestone_approved',
                                title: 'Milestone Approved',
                                message: `Milestone "${milestone.title}" has been verified and approved by your mentor.`,
                                isRead: false,
                                createdAt: new Date().toISOString(),
                                linkTo: '/founder'
                              });
                            }
                            
                            syncStates();
                            confetti({
                              particleCount: 80,
                              spread: 50,
                              colors: ['#10b981', '#a855f7']
                            });
                          }}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Verify
                        </button>
                        <button
                          onClick={() => {
                            setRevisionMilestone({
                              startupId: startup.id,
                              milestoneId: milestone.id,
                              title: milestone.title
                            });
                          }}
                          className="px-3 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Request Revision
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-450 font-bold text-xs bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                  <ShieldCheck className="w-8 h-8 mx-auto text-slate-350" />
                  <p>All startup milestones verified</p>
                  <p className="text-[10px] text-slate-400 font-medium">No pending evidence audits from your portfolio.</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-purple-500" /> GPS Stage Recommendations
                  </h2>
                  <p className="text-xs text-slate-500">Propose cohort startups for stage promotions based on operational achievements, validation metrics, and checklist items.</p>
                </div>
                <button
                  onClick={() => {
                    if (portfolioStartups.length === 0) { showToast('You have no startups in your portfolio.', 'error'); return; }
                    setRecStartupId(portfolioStartups[0].id);
                    setRecProposedStage(portfolioStartups[0].stage);
                    setShowRecommendStage(true);
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-650 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Submit Recommendation
                </button>
              </div>

              {/* Submit Recommendation Modal */}
              {showRecommendStage && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
                    <h3 className="text-sm font-black text-slate-900">Propose GPS Stage Promotion</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-505 block mb-1">Venture</label>
                        <select 
                          value={recStartupId} 
                          onChange={(e) => {
                            setRecStartupId(e.target.value);
                            const startup = db.getStartup(e.target.value);
                            if (startup) setRecProposedStage(startup.stage);
                          }}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs"
                        >
                          {portfolioStartups.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.stage.toUpperCase()})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-505 block mb-1">Proposed GPS Stage</label>
                        <select 
                          value={recProposedStage} 
                          onChange={(e) => setRecProposedStage(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs"
                        >
                          {['idea', 'validation', 'prototype', 'mvp', 'users', 'revenue', 'funding', 'scale'].map(s => (
                            <option key={s} value={s}>{s.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-505 block mb-1">Notes / Evidence Rationale</label>
                        <textarea 
                          value={recNotes} 
                          onChange={(e) => setRecNotes(e.target.value)} 
                          rows={3} 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none text-slate-800" 
                          placeholder="Summarize why the startup is qualified. Highlight client validation, prototype evidence, or traction metrics..." 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 text-xs">
                      <button
                        onClick={() => {
                          if (!recNotes.trim() || !recStartupId || !recProposedStage) { showToast('Please fill in required fields.', 'error'); return; }
                          const startup = db.getStartup(recStartupId);
                          if (!startup) return;
                          
                          db.addStageRecommendation({
                            id: `rec-${Date.now()}`,
                            startupId: recStartupId,
                            mentorId: selectedMentorId,
                            currentStage: startup.stage,
                            proposedStage: recProposedStage,
                            notes: recNotes,
                            evidenceUrls: [],
                            healthScore: startup.healthScore,
                            milestoneCompletion: 80, // Default mock value
                            status: 'Pending',
                            submittedAt: new Date().toISOString()
                          });
                          
                          // Manager Notification
                          db.addNotification({
                            id: `notif-${Date.now()}-rec-m`,
                            userId: 'manager@rtih.ap.gov.in',
                            type: 'review_pending',
                            title: 'Stage Promotion Pending Review',
                            message: `Mentor ${mentor.name} has recommended ${startup.name} for promotion to ${recProposedStage.toUpperCase()}. Review now.`,
                            isRead: false,
                            createdAt: new Date().toISOString(),
                            linkTo: '/manager'
                          });

                          setDb(getDb());
                          setShowRecommendStage(false);
                          setRecNotes('');
                          confetti({ particleCount: 50 });
                          showToast('Stage promotion recommendation submitted successfully!', 'success');
                        }}
                        className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
                      >
                        Submit Recommendation
                      </button>
                      <button type="button" onClick={() => setShowRecommendStage(false)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendation Logs */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Promotion Recommendations Logs</p>
                {db.getStageRecommendations().filter(r => r.mentorId === selectedMentorId).length > 0 ? (
                  db.getStageRecommendations()
                    .filter(r => r.mentorId === selectedMentorId)
                    .map((rec) => {
                      const startupObj = db.getStartup(rec.startupId);
                      return (
                        <div key={rec.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                            <div>
                              <strong className="text-slate-805 text-sm">{startupObj?.name || 'Cohort Venture'}</strong>
                              <span className="text-[10px] text-slate-400 ml-2">Proposed: <strong className="uppercase text-purple-700">{rec.proposedStage}</strong></span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                              rec.status === 'Approved' ? 'bg-emerald-50 border border-emerald-250 text-emerald-800' :
                              rec.status === 'Rejected' ? 'bg-red-50 border border-red-200 text-red-800' :
                              'bg-yellow-50 border border-yellow-250 text-yellow-800'
                            }`}>{rec.status}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed"><span className="text-slate-400 font-semibold">Notes:</span> {rec.notes}</p>
                          {rec.managerFeedback && (
                            <div className="p-2 bg-white rounded border border-slate-150 text-[11px] text-slate-500 leading-snug">
                              <strong>Manager Feedback:</strong> {rec.managerFeedback}
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <p className="text-center py-10 text-xs font-bold text-slate-400 italic">No stage promotions recommendations logged.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SmartState Judging Hub */}
        {activeTab === 'judging' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hackathon select bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-650" />
                <span className="text-xs font-bold text-slate-800">Select Competitive Hackathon:</span>
              </div>
              <select
                value={selectedHackathonId}
                onChange={(e) => {
                  setSelectedHackathonId(e.target.value);
                  setScoringSubmissionId(null);
                }}
                className="text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 focus:outline-none cursor-pointer text-slate-800"
              >
                {db.getHackathons().map(hack => (
                  <option key={hack.id} value={hack.id}>{hack.title}</option>
                ))}
              </select>
            </div>

            {/* Judging Panels Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Registered Teams & Submissions list */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Registered Startups checklist */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Users className="w-4 h-4 text-purple-500" />
                    Registrations List ({hackathonRegistrations.length} Startups)
                  </h3>
                  
                  <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                    {hackathonRegistrations.length > 0 ? (
                      hackathonRegistrations.map(reg => {
                        const start = db.getStartup(reg.startupId);
                        const subProject = hackathonSubmissions.find(s => s.startupId === reg.startupId);
                        
                        return (
                          <div key={reg.id} className="py-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-slate-800">{start?.name}</p>
                              <p className="text-[9.5px] text-slate-400 font-bold uppercase">{start?.sector} • {start?.district}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide ${
                              subProject ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {subProject ? 'Deliverables In' : 'Pending Upload'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-450 py-6 text-center">No startups registered yet.</p>
                    )}
                  </div>
                </div>

                {/* Deliverables Submissions List */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <ClipboardList className="w-4 h-4 text-purple-500" />
                    Submitted Deliverables ({hackathonSubmissions.length} Projects)
                  </h3>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {hackathonSubmissions.length > 0 ? (
                      hackathonSubmissions.map(sub => {
                        const start = db.getStartup(sub.startupId);
                        const hasMyScore = sub.scores.find(sc => sc.judgeId === mentor.id);

                        return (
                          <div 
                            key={sub.id} 
                            onClick={() => handleSelectScoring(sub)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                              scoringSubmissionId === sub.id
                                ? 'border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/10'
                                : 'border-slate-200 hover:border-slate-350 bg-slate-50/50'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs font-extrabold text-slate-900">{start?.name}</h4>
                                {hasMyScore ? (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-black rounded uppercase tracking-wide flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5 text-emerald-600" /> Graded ({sub.finalScore})
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[8px] font-black rounded uppercase tracking-wide animate-pulse">
                                    Awaiting Score
                                  </span>
                                )}
                              </div>

                              <p className="text-[10px] text-slate-655 font-bold uppercase">
                                Title: <span className="text-slate-800 italic font-semibold">"{sub.projectTitle}"</span>
                              </p>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                                {sub.description}
                              </p>
                            </div>

                            <div className="flex justify-between items-center text-[9px] text-slate-450 border-t border-slate-100 pt-2">
                              <span>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                              <span className="text-purple-600 font-bold hover:underline flex items-center gap-0.5">
                                Audit & Score Deliverables <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-450 py-6 text-center">No projects submitted yet.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Scoring Form */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1">
                  <Star className="w-4 h-4 text-purple-500" />
                  Jury Evaluation Console
                </h3>

                {scoringSubmissionId ? (
                  (() => {
                    const activeSub = db.getSubmissions().find(s => s.id === scoringSubmissionId);
                    const startupObj = db.getStartup(activeSub?.startupId || '');
                    
                    return (
                      <form onSubmit={(e) => handleScoreSubmission(e, scoringSubmissionId)} className="space-y-4 text-xs">
                        <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg leading-normal">
                          <p className="font-extrabold text-slate-800 text-xs">Venture: {startupObj?.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">
                            Project: "{activeSub?.projectTitle}"
                          </p>
                          <a 
                            href={activeSub?.demoUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[9.5px] text-blue-600 font-bold hover:underline mt-1 block flex items-center gap-0.5"
                          >
                            Browse Repository Deliverables <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* Sliders */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between font-bold text-slate-655 text-[10px] uppercase mb-1">
                              <span>1. Tech Innovation</span>
                              <span className="text-purple-600 font-extrabold">{scoreInnovation}/100</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={scoreInnovation} 
                              onChange={(e) => setScoreInnovation(parseInt(e.target.value))}
                              className="w-full accent-purple-500" 
                            />
                          </div>

                          <div>
                            <div className="flex justify-between font-bold text-slate-655 text-[10px] uppercase mb-1">
                              <span>2. Execution & MVP Quality</span>
                              <span className="text-purple-600 font-extrabold">{scoreExecution}/100</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={scoreExecution} 
                              onChange={(e) => setScoreExecution(parseInt(e.target.value))}
                              className="w-full accent-purple-500" 
                            />
                          </div>

                          <div>
                            <div className="flex justify-between font-bold text-slate-655 text-[10px] uppercase mb-1">
                              <span>3. Feasibility & Scalability</span>
                              <span className="text-purple-600 font-extrabold">{scoreFeasibility}/100</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={scoreFeasibility} 
                              onChange={(e) => setScoreFeasibility(parseInt(e.target.value))}
                              className="w-full accent-purple-500" 
                            />
                          </div>

                          <div>
                            <div className="flex justify-between font-bold text-slate-655 text-[10px] uppercase mb-1">
                              <span>4. AP Ecosystem Impact</span>
                              <span className="text-purple-600 font-extrabold">{scoreImpact}/100</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={scoreImpact} 
                              onChange={(e) => setScoreImpact(parseInt(e.target.value))}
                              className="w-full accent-purple-500" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Judge Audit Comments</label>
                          <textarea
                            rows={3}
                            placeholder="Enter detailed evaluation and advice for state command center milestones..."
                            value={judgeFeedbackText}
                            onChange={(e) => setJudgeFeedbackText(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 focus:outline-none resize-none"
                            required
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setScoringSubmissionId(null)}
                            className="w-1/3 py-2 border border-slate-200 font-bold rounded text-slate-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="w-2/3 py-2 bg-purple-500 hover:bg-purple-650 text-white font-bold rounded shadow-sm"
                          >
                            Submit Score Audit
                          </button>
                        </div>
                      </form>
                    );
                  })()
                ) : (
                  <div className="py-12 text-center text-slate-400 font-bold text-xs bg-slate-50 border border-slate-150 rounded-xl">
                    Select a submitted project card on the left to begin audit scoring.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: AI Copilot & Evaluation Section */}
        {activeTab === 'copilot' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
            {/* AI Mentor Copilot */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between h-[400px]">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-purple-500" />
                    AI Mentor Copilot
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold self-start sm:self-auto ${
                    isAiLive 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${isAiLive ? 'bg-purple-500' : 'bg-amber-500 animate-pulse'}`}></span>
                    {isAiLive ? `Live AI (${aiProvider})` : 'Local Sandbox Mode'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-3 leading-normal">
                  Ask strategy checks, meeting logs evaluation, or search for potential startups to mentor.
                </p>

                {/* Chat screen */}
                <div className="h-[210px] overflow-y-auto border border-slate-100 bg-slate-50/50 rounded-lg p-3 space-y-3">
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
                          : 'bg-white border border-slate-200/50 text-slate-800 rounded-tl-none shadow-sm'
                      }`}>
                        {chat.sender === 'user' ? chat.text : renderMarkdown(chat.text)}
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
              <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-slate-100 pt-3 mt-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask: Analyze high-risk milestones in my portfolio"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800"
                />
                <button
                  type="submit"
                  disabled={isTyping}
                  className="px-3 py-2 rounded-lg bg-purple-500 hover:bg-purple-650 text-white text-xs font-semibold flex items-center justify-center shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Founder Evaluation Engine */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-805 mb-1">
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
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-slate-800 focus:outline-none cursor-pointer"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-slate-800 focus:outline-none resize-none"
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

              <div className="border-t border-slate-100 pt-3 mt-4 text-[9px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />
                Audits are pushed directly to the Program Manager dashboard.
              </div>
            </div>
          </section>
        )}

          </div>
        </div>
      </main>

      {/* Request Revision Modal */}
      {revisionMilestone && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900">
          <div className="bg-white rounded-2xl border border-slate-250 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <h3 className="text-sm font-black text-slate-900">Request Milestone Revision</h3>
            <form onSubmit={handleRequestRevision} className="space-y-4">
              <p className="text-xs text-slate-555 leading-normal">
                Provide detailed feedback for <strong className="text-slate-800">"{revisionMilestone.title}"</strong>. The milestone status will reset to Pending, and the founder will receive a notification to resubmit with corrected evidence.
              </p>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Feedback / Revision Instructions</label>
                <textarea 
                  value={revisionFeedback} 
                  onChange={(e) => setRevisionFeedback(e.target.value)} 
                  rows={4} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-805 text-xs focus:outline-none resize-none" 
                  placeholder="Explain what was missing or what specific changes are needed..." 
                  required
                />
              </div>
              <div className="flex gap-2 pt-2 text-xs">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Send Feedback
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setRevisionMilestone(null);
                    setRevisionFeedback('');
                  }} 
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium cursor-pointer text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Modal */}
      {auditingStartupId && (() => {
        const auditingStartup = db.getStartup(auditingStartupId);
        if (!auditingStartup) return null;
        const startupDocs = db.getDocuments(auditingStartup.id) || [];
        const startupHistory = auditingStartup.healthHistory || [];

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in select-none">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col justify-between text-slate-900">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-slate-150 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                    <span>Audit Console: {auditingStartup.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase">
                      {auditingStartup.stage}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">
                    {auditingStartup.sector} • {auditingStartup.district} District
                  </p>
                </div>
                <button
                  onClick={() => setAuditingStartupId(null)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-750 transition-colors cursor-pointer text-xs font-bold border border-slate-200 px-2.5"
                >
                  Close Audit
                </button>
              </div>

              {/* Modal Content Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Diagnostics (Line Chart, Gauge, Documents) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Gauge & Line Chart Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* SVG Radial Gauge */}
                    <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-4 flex flex-col items-center justify-center min-h-[180px] text-center">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Overall Health</span>
                      <div className="relative flex items-center justify-center my-3">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="38" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                          <circle
                            cx="48"
                            cy="48"
                            r="38"
                            stroke={
                              auditingStartup.healthScore < 50
                                ? '#ef4444'
                                : auditingStartup.healthScore < 60
                                ? '#f59e0b'
                                : auditingStartup.healthScore < 75
                                ? '#3b82f6'
                                : '#10b981'
                            }
                            strokeWidth="6"
                            strokeDasharray={2 * Math.PI * 38}
                            strokeDashoffset={2 * Math.PI * 38 * (1 - (auditingStartup.healthScore || 0) / 100)}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <span className="absolute text-xl font-extrabold text-slate-800">{auditingStartup.healthScore}</span>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        auditingStartup.healthScore < 50
                          ? 'text-red-700 bg-red-50 border border-red-200'
                          : auditingStartup.healthScore < 60
                          ? 'text-amber-700 bg-amber-50 border border-amber-200'
                          : auditingStartup.healthScore < 75
                          ? 'text-blue-700 bg-blue-50 border border-blue-200'
                          : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      }`}>
                        {auditingStartup.healthCategory || 'Stable'}
                      </span>
                    </div>

                    {/* Trend Line Chart */}
                    <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-4 flex flex-col justify-between min-h-[180px]">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-2">History Trend</span>
                      <div className="h-[120px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={startupHistory}>
                            <XAxis dataKey="date" hide />
                            <YAxis domain={[0, 100]} hide />
                            <Tooltip contentStyle={{ fontSize: '9px', borderRadius: '4px' }} />
                            <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Health Breakdown progress bars */}
                  <div className="bg-white border border-slate-150 rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">Dynamic Dimensions</h4>
                    {[
                      { name: 'Progress of Milestones', score: auditingStartup.healthBreakdown.progress ?? 50 },
                      { name: 'Product / Tech Roadmap', score: auditingStartup.healthBreakdown.product ?? 50 },
                      { name: 'Team Alignment', score: auditingStartup.healthBreakdown.team ?? 50 },
                      { name: 'Market Potential & Users', score: auditingStartup.healthBreakdown.market ?? 50 },
                      { name: 'Financial & Runway', score: auditingStartup.healthBreakdown.financial ?? 50 },
                      { name: 'Funding Readiness', score: auditingStartup.healthBreakdown.funding ?? 50 },
                      { name: 'Mentorship Engagement', score: auditingStartup.healthBreakdown.mentor ?? 50 },
                      { name: 'Documentation Completeness', score: auditingStartup.healthBreakdown.documentation ?? 50 },
                      { name: 'Risk Mitigation Level', score: auditingStartup.healthBreakdown.risk ?? 50 }
                    ].map((dim, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 text-[10px]">
                        <span className="font-bold text-slate-600 w-2/5">{dim.name}</span>
                        <div className="w-1/2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${dim.score}%` }} />
                        </div>
                        <span className="font-bold text-slate-800 w-1/10 text-right">{dim.score}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Uploaded Documents List */}
                  <div className="bg-white border border-slate-150 rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Uploaded Documents Vault</h4>
                    <div className="space-y-2">
                      {startupDocs.length > 0 ? (
                        startupDocs.map((doc) => (
                          <div key={doc.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-150">
                            <div>
                              <p className="font-bold text-slate-700 leading-tight">{doc.name}</p>
                              <p className="text-[9px] text-slate-400">{doc.type} • Uploaded by {doc.uploadedBy}</p>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-purple-600 bg-white hover:bg-slate-50 border border-slate-250 px-2.5 py-1 rounded cursor-pointer"
                            >
                              Open File
                            </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 italic text-center py-2">No documents uploaded to this startup's vault yet.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column: Assessment Forms */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* STAR RATING Mentor Assessment Form */}
                  <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-purple-500 fill-purple-100" />
                      Submit Mentor Assessment
                    </h4>
                    
                    <form onSubmit={handleSubmitAssessment} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Qualitative Rating</label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setMentorRating(star)}
                              className="focus:outline-none cursor-pointer"
                            >
                              <Star className={`w-6 h-6 transition-colors ${
                                star <= mentorRating ? 'text-amber-500 fill-amber-400' : 'text-slate-200'
                              }`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-450 uppercase">Mentor Review & Feedback</label>
                        <textarea
                          rows={3}
                          value={mentorFeedbackText}
                          onChange={(e) => setMentorFeedbackText(e.target.value)}
                          placeholder="Provide qualitative feedback regarding this venture's execution, roadmap, or gaps..."
                          className="w-full text-xs p-2.5 border border-slate-250 rounded-lg focus:border-purple-400 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Submit Assessment
                      </button>
                    </form>

                    {/* Previous assessments list */}
                    {auditingStartup.mentorAssessments && auditingStartup.mentorAssessments.length > 0 && (
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assessment Logs</h5>
                        <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1">
                          {auditingStartup.mentorAssessments.map((ass: any) => (
                            <div key={ass.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px]">
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-slate-700">{ass.mentorName}</span>
                                <span className="text-amber-550">{"★".repeat(ass.rating)}</span>
                              </div>
                              <p className="text-slate-500 mt-1 leading-normal italic">"{ass.feedback}"</p>
                              <span className="text-[8px] text-slate-400 block mt-1">{new Date(ass.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RISK FLAGGING FORM */}
                  <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-500" />
                      Flag Startup Risk
                    </h4>
                    
                    <form onSubmit={handleFlagRisk} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-450 uppercase">Risk Category</label>
                          <select
                            value={riskType}
                            onChange={(e) => setRiskType(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-slate-250 rounded-lg focus:outline-none"
                          >
                            <option value="Inactivity">Inactivity</option>
                            <option value="Financial Runway">Financial Runway</option>
                            <option value="Co-founder Conflict">Co-founder Conflict</option>
                            <option value="Technical Execution">Technical Execution</option>
                            <option value="Other">Other Category</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-450 uppercase">Risk Severity</label>
                          <select
                            value={riskSeverity}
                            onChange={(e) => setRiskSeverity(e.target.value as any)}
                            className="w-full text-xs p-2 bg-white border border-slate-250 rounded-lg focus:outline-none"
                          >
                            <option value="Low">Low Severity</option>
                            <option value="Medium">Medium Severity</option>
                            <option value="High">High Severity</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-455 uppercase">Risk Description</label>
                        <textarea
                          rows={2}
                          value={riskDescription}
                          onChange={(e) => setRiskDescription(e.target.value)}
                          placeholder="Explain what risk has occurred (e.g. founder hasn't responded to emails or lacks development velocity)..."
                          className="w-full text-xs p-2.5 border border-slate-250 rounded-lg focus:border-purple-400 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Submit Risk Flag
                      </button>
                    </form>

                    {/* Previous risk flags list */}
                    {auditingStartup.riskFlags && auditingStartup.riskFlags.length > 0 && (
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Risk Flags</h5>
                        <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1">
                          {auditingStartup.riskFlags.map((flag: any) => (
                            <div key={flag.id} className="p-2.5 bg-rose-50/50 border border-rose-150 rounded-lg text-[10px]">
                              <div className="flex justify-between items-center font-bold text-rose-800">
                                <span>{flag.type} ({flag.severity} Severity)</span>
                                <span>{flag.resolved ? 'Resolved' : 'Active'}</span>
                              </div>
                              <p className="text-slate-600 mt-1 leading-normal font-medium">{flag.description}</p>
                              <span className="text-[8px] text-slate-400 block mt-1">{new Date(flag.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
