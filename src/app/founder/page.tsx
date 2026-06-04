'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { 
  getDb, 
  Startup, 
  StartupStage, 
  isExecutiveModeActive, 
  isDemoModeActive, 
  getActiveUser, 
  Founder,
  Hackathon,
  HackathonRegistration,
  HackathonSubmission,
  Certificate,
  FounderAssessment,
  SECTORS,
  DISTRICTS
} from '@/lib/mockDb';
import { 
  calculateVentureHealth, 
  matchGovernmentSchemes, 
  predictStartupRisk, 
  GPS_STAGES,
  calculateInnovationScore,
  evaluateFounderAssessment
} from '@/lib/engines';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Target, 
  Activity, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Circle, 
  Award, 
  AlertTriangle, 
  Coins, 
  Sparkle,
  BookOpen,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Network,
  ClipboardList,
  CheckSquare,
  Lock,
  Download,
  Check,
  Zap,
  ArrowRight,
  Trophy,
  Users,
  Scroll,
  Compass,
  Search,
  Filter,
  MapPin,
  Calendar,
  FileText,
  ExternalLink,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Mock Courses for LMM matching LMM Problem Statement
const LMM_COURSES = [
  {
    stage: 'idea',
    title: 'Customer Discovery & Problem Validation',
    desc: 'Master the art of interviewing potential customers without introducing bias.',
    duration: '2.5 hrs',
    lessons: 6,
    skills: ['Market Research', 'Customer Discovery']
  },
  {
    stage: 'idea',
    title: 'Problem-Solution Fit Frameworks',
    desc: 'Map customer pain points directly to your core technology value proposition.',
    duration: '1.8 hrs',
    lessons: 4,
    skills: ['Value Prop Design', 'Product Scoping']
  },
  {
    stage: 'validation',
    title: 'Rapid Prototyping & No-Code Scoping',
    desc: 'Build functional validation tests without writing production-grade code.',
    duration: '3.2 hrs',
    lessons: 8,
    skills: ['Prototyping', 'Validation Testing']
  },
  {
    stage: 'prototype',
    title: 'Agile Product Architecture for AP Scale',
    desc: 'Structure your technology stack for performance and modular scalability.',
    duration: '4.0 hrs',
    lessons: 10,
    skills: ['Tech Architecture', 'Agile Delivery']
  },
  {
    stage: 'mvp',
    title: 'Unit Economics & Pricing Strategies',
    desc: 'Calculate LTV, CAC, payback periods, and build custom pricing matrices.',
    duration: '2.8 hrs',
    lessons: 5,
    skills: ['Financial Modeling', 'Unit Economics']
  },
  {
    stage: 'users',
    title: 'Retention Metrics & Cohort Analytics',
    desc: 'Analyze user cohort retention grids and optimize activation funnels.',
    duration: '3.5 hrs',
    lessons: 7,
    skills: ['Cohort Retention', 'Product Analytics']
  },
  {
    stage: 'revenue',
    title: 'B2B Sales Playbooks & Corporate Pitching',
    desc: 'Close corporate pilots and structure proof-of-concept (PoC) agreements.',
    duration: '4.5 hrs',
    lessons: 9,
    skills: ['B2B Sales', 'Enterprise GTM']
  },
  {
    stage: 'funding',
    title: 'Cap Table Mechanics & Venture Capital Term Sheets',
    desc: 'Deconstruct valuation, dilution, liquidation preferences, and investor terms.',
    duration: '3.8 hrs',
    lessons: 8,
    skills: ['Cap Table Modeling', 'Fundraising Strategy']
  }
];

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

export default function FounderDashboard({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [selectedStartupId, setSelectedStartupId] = useState<string>('startup-1');
  const [db, setDb] = useState(() => getDb());
  const [execActive, setExecActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  
  // Tab states to resolve overlapping issues
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'lmm' | 'certificates' | 'hackathons' | 'network' | 'copilot' | 'linkages' | 'traction' | 'organization' | 'tasks' | 'documents' | 'communications' | 'recruitment' | 'metrics' | 'mentors'>('overview');

  // Tab grouping helpers
  const getPrimaryTab = (subTab: string) => {
    if (['overview', 'health', 'traction', 'certificates', 'metrics'].includes(subTab)) return 'executive';
    if (['organization', 'network'].includes(subTab)) return 'profile';
    if (['tasks', 'documents', 'communications', 'mentors'].includes(subTab)) return 'incubation';
    if (['lmm', 'hackathons'].includes(subTab)) return 'academic';
    if (['recruitment', 'linkages', 'copilot'].includes(subTab)) return 'growth';
    return 'executive';
  };

  const activePrimaryTab = getPrimaryTab(activeTab);

  const PRIMARY_TABS = [
    { id: 'executive', label: 'Executive Hub', icon: Activity, defaultSub: 'overview' },
    { id: 'profile', label: 'Profile & Network', icon: Users, defaultSub: 'organization' },
    { id: 'incubation', label: 'Incubation Support', icon: Briefcase, defaultSub: 'tasks' },
    { id: 'academic', label: 'Academics & Hackathons', icon: BookOpen, defaultSub: 'lmm' },
    { id: 'growth', label: 'Growth & Matching', icon: Network, defaultSub: 'recruitment' }
  ] as const;


  // Onboarding Wizard Form states
  const [wizardStep, setWizardStep] = useState(1);
  const [wizIdea, setWizIdea] = useState('');
  const [wizSector, setWizSector] = useState('AI');
  const [wizStage, setWizStage] = useState<StartupStage>('idea');
  const [wizTeamSize, setWizTeamSize] = useState(2);
  const [wizRevenue, setWizRevenue] = useState('none');
  const [wizMvp, setWizMvp] = useState('concept');
  const [wizCustomers, setWizCustomers] = useState('');
  const [wizProblem, setWizProblem] = useState('');
  const [wizExperience, setWizExperience] = useState('');
  const [isRetaking, setIsRetaking] = useState(false);

  // Hackathon Form States
  const [activeHackathonId, setActiveHackathonId] = useState<string | null>(null);
  const [subProjectTitle, setSubProjectTitle] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subDemoUrl, setSubDemoUrl] = useState('');

  // Certificate Modal State
  const [selectedCertificate, setSelectedCertificate] = useState<{ type: string; id: string; issuedAt: string } | null>(null);

  // Network Directory Search & Filters
  const [networkSearch, setNetworkSearch] = useState('');
  const [networkSector, setNetworkSector] = useState('All');
  const [networkDistrict, setNetworkDistrict] = useState('All');
  const [networkSkillFilter, setNetworkSkillFilter] = useState<string | null>(null);
  const [connectedFounders, setConnectedFounders] = useState<string[]>([]);

  // AI Copilot states
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAiLive, setIsAiLive] = useState(false);
  const [aiProvider, setAiProvider] = useState('Checking...');

  // LMM states
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Market Research']);
  const [completedCourses, setCompletedCourses] = useState<string[]>(['Customer Discovery & Problem Validation']);

  // Log states
  const [customerInterviewName, setCustomerInterviewName] = useState('');
  const [customerInterviewNotes, setCustomerInterviewNotes] = useState('');
  const [pitchScore, setPitchScore] = useState<number | null>(null);
  const [pitchFeedback, setPitchFeedback] = useState<string[]>([]);

  // --- NEW WORKFLOW STATES ---
  // Organization Editor States
  const [orgName, setOrgName] = useState('');
  const [orgTagline, setOrgTagline] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [orgSector, setOrgSector] = useState('');
  const [orgDistrict, setOrgDistrict] = useState('');
  const [orgLogo, setOrgLogo] = useState('');
  const [orgJobsCreated, setOrgJobsCreated] = useState(0);
  const [orgMonthlyRevenue, setOrgMonthlyRevenue] = useState(0);
  const [orgTotalFunding, setOrgTotalFunding] = useState(0);
  const [orgActiveUsers, setOrgActiveUsers] = useState(0);

  // Task Tracker States
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');

  // Milestone Evidence States
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [milestoneEvidenceUrl, setMilestoneEvidenceUrl] = useState('');
  const [milestoneEvidenceNote, setMilestoneEvidenceNote] = useState('');

  // Documents Vault States
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'Pitch Deck' | 'Business Plan' | 'Financial Model' | 'Technical Spec' | 'Legal' | 'Other'>('Pitch Deck');
  const [docUrl, setDocUrl] = useState('');
  const [docAccessLevel, setDocAccessLevel] = useState<'All' | 'Mentor+Manager' | 'Manager+Admin'>('All');

  // Communication Thread States
  const [messageText, setMessageText] = useState('');

  // Recruitment/Job States
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState<'Full Time' | 'Internship' | 'Part Time'>('Full Time');
  const [jobDescription, setJobDescription] = useState('');
  const [jobSkills, setJobSkills] = useState('');
  const [jobStipend, setJobStipend] = useState('');
  const [jobDeadline, setJobDeadline] = useState('');

  // Metrics Form States
  const [metricMonth, setMetricMonth] = useState('');
  const [metricRev, setMetricRev] = useState(0);
  const [metricCust, setMetricCust] = useState(0);
  const [metricBurn, setMetricBurn] = useState(0);
  
  // Mentor Match State
  const [requestedMentorId, setRequestedMentorId] = useState<string | null>(null);

  // Synchronize database updates, Demo Mode, and Executive Mode changes
  const syncStates = () => {
    const activeDb = getDb();
    setDb(activeDb);
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
    if (user.role !== 'founder' && user.role !== 'admin' && user.role !== 'manager') {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    if (user.role === 'founder' && user.startupId) {
      setSelectedStartupId(user.startupId);
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
    
    // Set initial custom chat intro based on startup context
    const initialStartup = getDb().getStartup(selectedStartupId) || getDb().getStartups()[0];
    setChatHistory([
      { 
        sender: 'ai', 
        text: `Welcome to the RTIH AI Founder Coach. I have analyzed your venture context for "${initialStartup.name}". Ask me: "What are my next GPS requirements?", "Help me draft seed funding requests", or "Create due-diligence plans".` 
      }
    ]);

    window.addEventListener('rtih_mode_change', syncStates);
    return () => {
      window.removeEventListener('rtih_mode_change', syncStates);
    };
  }, [selectedStartupId]);

  const startup = useMemo(() => {
    return db.getStartup(selectedStartupId) || db.getStartups()[0];
  }, [db, selectedStartupId]);

  const health = useMemo(() => {
    if (!startup) return null;
    return calculateVentureHealth(startup);
  }, [startup]);

  const schemes = useMemo(() => {
    if (!startup) return [];
    return matchGovernmentSchemes(startup);
  }, [startup]);

  const riskReport = useMemo(() => {
    if (!startup) return null;
    return predictStartupRisk(startup);
  }, [startup]);

  // Certifications list
  const activeCertifications = useMemo(() => {
    return db.getCertifications().filter(c => c.startupId === startup.id);
  }, [db, startup.id]);

  const hasHackathonParticipation = useMemo(() => {
    return db.getRegistrations().some(r => r.startupId === startup.id);
  }, [db, startup.id]);

  const lmmCompletionRate = useMemo(() => {
    const stageCourses = LMM_COURSES.filter(c => c.stage === 'idea' || c.stage === 'validation' || c.stage === startup.stage);
    if (stageCourses.length === 0) return 1.0;
    const completedCount = stageCourses.filter(c => completedCourses.includes(c.title)).length;
    return completedCount / stageCourses.length;
  }, [completedCourses, startup.stage]);

  const innovationScore = useMemo(() => {
    if (!startup) return 0;
    return calculateInnovationScore(startup, activeCertifications.length, hasHackathonParticipation, lmmCompletionRate);
  }, [startup, activeCertifications.length, hasHackathonParticipation, lmmCompletionRate]);

  // Sync Org Editor states when startup changes
  useEffect(() => {
    if (startup) {
      setOrgName(startup.name || '');
      setOrgTagline(startup.tagline || '');
      setOrgDescription(startup.description || '');
      setOrgSector(startup.sector || '');
      setOrgDistrict(startup.district || '');
      setOrgLogo(startup.logo || '');
      setOrgJobsCreated(startup.jobsCreated || 0);
      setOrgMonthlyRevenue(startup.monthlyRevenue || 0);
      setOrgTotalFunding(startup.totalFunding || 0);
      setOrgActiveUsers(startup.activeUsers || 0);
    }
  }, [startup]);

  const handleUpdateOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      alert('Organization name cannot be empty.');
      return;
    }
    const dbInstance = getDb();
    const updated = dbInstance.updateStartup(startup.id, {
      name: orgName,
      tagline: orgTagline,
      description: orgDescription,
      sector: orgSector,
      district: orgDistrict,
      logo: orgLogo,
      jobsCreated: orgJobsCreated,
      monthlyRevenue: orgMonthlyRevenue,
      totalFunding: orgTotalFunding,
      activeUsers: orgActiveUsers
    });
    if (updated) {
      window.dispatchEvent(new Event('rtih_mode_change'));
      syncStates();
      alert('Organization profile updated successfully!');
    }
  };

  const handleStartTask = (taskId: string) => {
    const dbInstance = getDb();
    dbInstance.updateTask(taskId, { status: 'In Progress' });
    window.dispatchEvent(new Event('rtih_mode_change'));
    syncStates();
  };

  const handleSubmitTaskEvidence = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceNote.trim()) {
      alert('Please enter an evidence note.');
      return;
    }
    const dbInstance = getDb();
    const currentTask = dbInstance.getTasks().find(t => t.id === taskId);
    if (!currentTask) return;

    dbInstance.updateTask(taskId, {
      status: 'Submitted',
      evidenceUrl,
      evidenceNote,
      completedAt: new Date().toISOString()
    });
    
    // Add notification to mentor
    const mentorObj = dbInstance.getMentors().find(m => m.portfolioStartups?.includes(startup.id));
    if (mentorObj) {
      dbInstance.addNotification({
        id: `notif-${Date.now()}`,
        userId: mentorObj.email,
        type: 'task_verified',
        title: 'Task Evidence Submitted',
        message: `${startup.name} has submitted evidence for "${currentTask.title}". Review required.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/mentor'
      });
    }

    // Reset states
    setSelectedTaskId(null);
    setEvidenceUrl('');
    setEvidenceNote('');
    
    window.dispatchEvent(new Event('rtih_mode_change'));
    syncStates();
    alert('Task evidence submitted successfully for mentor verification!');
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docUrl.trim()) {
      alert('Please fill out all document details.');
      return;
    }
    
    const dbInstance = getDb();
    dbInstance.addDocument({
      id: `doc-${Date.now()}`,
      startupId: startup.id,
      name: docName,
      type: docType,
      url: docUrl,
      uploadedBy: currentUser?.name || 'Founder',
      uploaderRole: 'founder',
      uploadedAt: new Date().toISOString(),
      accessLevel: docAccessLevel
    });

    // Notify mentor and manager
    const center = dbInstance.getIncubationCenters().find(c => c.domains.includes(startup.sector)) || dbInstance.getIncubationCenters()[0];
    const mentorObj = dbInstance.getMentors().find(m => m.portfolioStartups?.includes(startup.id));
    
    if (mentorObj) {
      dbInstance.addNotification({
        id: `notif-${Date.now()}-doc-m`,
        userId: mentorObj.email,
        type: 'review_pending',
        title: 'New Startup Document',
        message: `${startup.name} has uploaded a new ${docType}: ${docName}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/mentor'
      });
    }
    if (center) {
      dbInstance.addNotification({
        id: `notif-${Date.now()}-doc-mgr`,
        userId: center.managerId,
        type: 'review_pending',
        title: 'New Startup Document',
        message: `${startup.name} has uploaded a new ${docType}: ${docName}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/manager'
      });
    }

    setDocName('');
    setDocUrl('');
    setDocType('Pitch Deck');
    setDocAccessLevel('All');

    window.dispatchEvent(new Event('rtih_mode_change'));
    syncStates();
    alert('Document added to vault successfully!');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const dbInstance = getDb();
    dbInstance.addMessage({
      id: `msg-${Date.now()}`,
      startupId: startup.id,
      senderId: currentUser?.email || 'founder@rtih.ap.gov.in',
      senderName: currentUser?.name || 'Founder',
      senderRole: 'founder',
      content: messageText,
      sentAt: new Date().toISOString(),
      isRead: false
    });

    // Notify mentor and manager
    const center = dbInstance.getIncubationCenters().find(c => c.domains.includes(startup.sector)) || dbInstance.getIncubationCenters()[0];
    const mentorObj = dbInstance.getMentors().find(m => m.portfolioStartups?.includes(startup.id));

    if (mentorObj) {
      dbInstance.addNotification({
        id: `notif-${Date.now()}-msg-mentor`,
        userId: mentorObj.email,
        type: 'message_received',
        title: 'New Message from Founder',
        message: `${startup.name} has sent a message.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/mentor'
      });
    }
    if (center) {
      dbInstance.addNotification({
        id: `notif-${Date.now()}-msg-mgr`,
        userId: center.managerId,
        type: 'message_received',
        title: 'New Message from Founder',
        message: `${startup.name} has sent a message.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/manager'
      });
    }

    setMessageText('');
    window.dispatchEvent(new Event('rtih_mode_change'));
    syncStates();
  };

  const handleUpdateLiveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startup) return;
    const dbInstance = getDb();
    
    // Create new snapshot
    const newSnapshot = {
      id: `snap-${Date.now()}`,
      startupId: startup.id,
      month: metricMonth,
      revenue: Number(metricRev),
      customers: Number(metricCust),
      activeUsers: Number(metricCust),
      teamSize: startup.jobsCreated || 2,
      burnRate: Number(metricBurn),
      runwayMonths: metricBurn > 0 ? Math.floor(startup.totalFunding / metricBurn) : 12,
      createdAt: new Date().toISOString()
    };
    
    dbInstance.addMetricSnapshot(startup.id, newSnapshot);
    
    // Update live metrics object
    dbInstance.updateStartupMetrics(startup.id, {
      revenue: Number(metricRev),
      monthlyGrowth: 0,
      activeUsers: Number(metricCust),
      teamSize: startup.jobsCreated || 2,
      burnRate: Number(metricBurn),
      runwayMonths: metricBurn > 0 ? Math.floor(startup.totalFunding / metricBurn) : 12
    });
    
    syncStates();
    setMetricMonth('');
    setMetricRev(0);
    setMetricCust(0);
    setMetricBurn(0);
    
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#10b981', '#34d399', '#ffffff'] });
  };

  const handleRequestMentor = (mentorId: string) => {
    if (!startup || !currentUser) return;
    const dbInstance = getDb();
    
    dbInstance.saveMentorMatch({
      mentorId,
      matchScore: 95,
      industryMatch: true,
      stageMatch: true,
      expertiseAlignment: []
    });
    
    setRequestedMentorId(mentorId);
    
    setTimeout(() => {
      setRequestedMentorId(null);
      alert('Mentor request sent successfully! They will review your profile shortly.');
      syncStates();
    }, 1500);
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim() || !jobSkills.trim() || !jobStipend.trim() || !jobDeadline.trim()) {
      alert('Please fill out all job opening fields.');
      return;
    }

    const skillsArray = jobSkills.split(',').map(s => s.trim()).filter(Boolean);

    const dbInstance = getDb();
    dbInstance.addJobPosting({
      id: `job-${Date.now()}`,
      startupId: startup.id,
      title: jobTitle,
      type: jobType,
      description: jobDescription,
      skills: skillsArray,
      stipend: jobStipend,
      deadline: jobDeadline,
      postedAt: new Date().toISOString(),
      isActive: true,
      applications: []
    });

    setJobTitle('');
    setJobDescription('');
    setJobSkills('');
    setJobStipend('');
    setJobDeadline('');

    window.dispatchEvent(new Event('rtih_mode_change'));
    syncStates();
    alert('Job opening listed on public jobs portal successfully!');
  };

  const handleUpdateApplicationStatus = (jobId: string, appId: string, status: 'Applied' | 'Shortlisted' | 'Rejected') => {
    const dbInstance = getDb();
    dbInstance.updateJobApplication(jobId, appId, status);
    window.dispatchEvent(new Event('rtih_mode_change'));
    syncStates();
  };

  // Dynamic 9-Stage founder journey matching APIS guidelines
  const verticalJourney = useMemo(() => {
    const timeline = [
      {
        id: 'step-1',
        title: 'Student Innovation Cell Onboarding',
        phase: 'Student',
        desc: 'Engaged through university innovation hubs or regional incubation outpost nodes.',
        status: 'Completed',
        badge: 'Onboarded'
      },
      {
        id: 'step-2',
        title: 'Founder Profiling & AI Assessment',
        phase: 'Founder',
        desc: 'Completed detailed maturity analysis to map startup capabilities & match mentors.',
        status: db.getAssessment(startup.id) ? 'Completed' : 'Action Required',
        badge: db.getAssessment(startup.id) ? 'Assessment Logged' : 'Pending Wizard'
      },
      {
        id: 'step-3',
        title: 'Startup Pitch & Entity Registration',
        phase: 'Startup',
        desc: 'Defined legal entities and pitched validated value propositions to AP Innovation Cells.',
        status: ['prototype', 'mvp', 'users', 'revenue', 'funding', 'scale'].includes(startup.stage) ? 'Completed' : 'Active',
        badge: startup.stage.toUpperCase()
      },
      {
        id: 'step-4',
        title: 'LMM Capacity Building & Courses',
        phase: 'Learning',
        desc: 'Engaged with structured learning paths (Customer Discovery, MVP Scoping, Cap Table modeling).',
        status: completedCourses.length >= 2 ? 'Completed' : 'Active',
        badge: `${completedCourses.length} Courses Completed`
      },
      {
        id: 'step-5',
        title: 'Ecosystem Mentor Matching & Sessions',
        phase: 'Mentor Support',
        desc: 'Assigned domain experts and scheduled physical or virtual advisory sessions.',
        status: db.getSessions().some(s => s.startupId === startup.id && s.status === 'Completed') ? 'Completed' : 'Active',
        badge: `${db.getSessions().filter(s => s.startupId === startup.id && s.status === 'Completed').length} Sessions`
      },
      {
        id: 'step-6',
        title: 'SmartState Hackathon Challenge',
        phase: 'Hackathon',
        desc: 'Submitted project prototypes to state-level competitive hackathons for grand awards.',
        status: hasHackathonParticipation ? 'Completed' : 'Action Required',
        badge: hasHackathonParticipation ? 'Registered' : 'Not Registered'
      },
      {
        id: 'step-7',
        title: 'State Board Capacity Certification',
        phase: 'Certification',
        desc: 'Obtained locked/unlocked certifications validating stage transitions.',
        status: activeCertifications.length > 0 ? 'Completed' : 'Active',
        badge: `${activeCertifications.length}/5 Certified`
      },
      {
        id: 'step-8',
        title: 'Investment Readiness Audit',
        phase: 'Investment Readiness',
        desc: 'Passed due-diligence parameters with target score of >75% for angel and VC syncs.',
        status: startup.investmentScore > 75 ? 'Completed' : ['revenue', 'funding', 'scale'].includes(startup.stage) ? 'Active' : 'Locked',
        badge: `${startup.investmentScore}% Score`
      },
      {
        id: 'step-9',
        title: 'State Hub Command Center Spotlight',
        phase: 'Ecosystem Visibility',
        desc: 'Spotlighted to state authorities (CM Briefs) and global venture syndicates.',
        status: startup.stage === 'scale' ? 'Completed' : startup.stage === 'funding' ? 'Active' : 'Locked',
        badge: startup.stage === 'scale' ? 'Spotlighted' : 'Not Ready'
      }
    ];

    return timeline;
  }, [db, startup, completedCourses, activeCertifications, hasHackathonParticipation]);

  // Available Hackathons
  const hackathons = useMemo(() => {
    return db.getHackathons();
  }, [db]);

  // Handle GPS Stage advance
  const handleStageSelect = (stage: StartupStage) => {
    const updated = getDb().updateStartup(startup.id, { stage });
    if (updated) {
      // Award certification automatically based on new stage
      if (stage !== 'idea') {
        getDb().addCertification({
          id: `cert-${startup.id}-stage-${stage}`,
          certificateId: `RTIH-CERT-2026-${1000 + Math.floor(Math.random() * 9000)}`,
          startupId: startup.id,
          type: stage === 'validation' ? 'Idea Validation' : 
                ['mvp', 'users'].includes(stage) ? 'MVP Ready' :
                stage === 'revenue' ? 'Product-Market Fit' :
                stage === 'funding' ? 'Investment Ready' : 'Startup Leadership',
          issuedAt: new Date().toISOString()
        });
      }
      syncStates();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 }
      });
    }
  };

  // Toggle OKR / Submit Milestone Evidence
  const handleToggleMilestone = (milestoneId: string, currentStatus: string) => {
    if (currentStatus === 'Completed') {
      alert('This milestone has been verified by your mentor and cannot be modified.');
      return;
    }
    if (currentStatus === 'Submitted') {
      alert('This milestone is currently under review by your mentor.');
      return;
    }
    
    // Set state to open the submission modal
    setSelectedMilestoneId(milestoneId);
    setMilestoneEvidenceUrl('');
    setMilestoneEvidenceNote('');
  };

  const handleSubmitMilestoneEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneId) return;
    if (!milestoneEvidenceNote.trim()) {
      alert('Please enter an evidence note.');
      return;
    }

    const dbInstance = getDb();
    dbInstance.updateMilestone(
      startup.id,
      selectedMilestoneId,
      'Submitted',
      milestoneEvidenceNote,
      milestoneEvidenceUrl
    );

    // Get milestone title for notification
    const milestoneObj = startup.milestones.find(m => m.id === selectedMilestoneId);
    const title = milestoneObj ? milestoneObj.title : 'Milestone Objective';

    // Add notification to mentor
    const mentorObj = dbInstance.getMentors().find(m => m.portfolioStartups?.includes(startup.id));
    if (mentorObj) {
      dbInstance.addNotification({
        id: `notif-${Date.now()}`,
        userId: mentorObj.email,
        type: 'task_verified',
        title: 'Milestone Verification Required',
        message: `${startup.name} has submitted evidence for milestone "${title}". Review required.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/mentor'
      });
    }

    setSelectedMilestoneId(null);
    setMilestoneEvidenceUrl('');
    setMilestoneEvidenceNote('');
    syncStates();
    alert('Milestone evidence submitted successfully for mentor verification!');
  };

  // Toggle Skill
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Complete course module
  const completeCourse = (title: string) => {
    if (!completedCourses.includes(title)) {
      setCompletedCourses(prev => [...prev, title]);
      
      // Auto-unlock certifications based on course completion or stage
      if (completedCourses.length + 1 >= 4 && !activeCertifications.some(c => c.type === 'MVP Ready')) {
        getDb().addCertification({
          id: `cert-${startup.id}-mvp-ready`,
          certificateId: `RTIH-CERT-2026-${2000 + Math.floor(Math.random() * 8000)}`,
          startupId: startup.id,
          type: 'MVP Ready',
          issuedAt: new Date().toISOString()
        });
      }
      
      confetti({
        particleCount: 30,
        colors: ['#00A86B']
      });
      syncStates();
    }
  };

  // Calculate diagnostic progress
  const diagnosticScore = useMemo(() => {
    const totalSkills = 8;
    return Math.floor((selectedSkills.length / totalSkills) * 100);
  }, [selectedSkills]);

  // Onboarding Wizard Submit
  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizIdea.trim() || !wizProblem.trim() || !wizCustomers.trim() || !wizExperience.trim()) {
      alert('Please fill out all wizard input fields.');
      return;
    }

    const result = evaluateFounderAssessment(
      wizIdea,
      wizSector,
      wizStage,
      wizTeamSize,
      wizRevenue,
      wizMvp,
      wizExperience,
      db.getMentors()
    );

    const assessmentPayload: FounderAssessment = {
      startupId: startup.id,
      startupIdea: wizIdea,
      sector: wizSector,
      stage: wizStage,
      teamSize: wizTeamSize,
      revenueStatus: wizRevenue,
      mvpStatus: wizMvp,
      targetCustomers: wizCustomers,
      problemStatement: wizProblem,
      founderExperience: wizExperience,
      readinessScore: result.readinessScore,
      maturityScore: result.maturityScore,
      learningJourney: result.learningJourney,
      recommendedMentors: result.recommendedMentors,
      recommendedSchemes: ['Ratan Tata Seed Capital Fund', 'AP Standup Women Startup Grant'],
      recommendedMilestones: result.recommendedMilestones,
      completedAt: new Date().toISOString()
    };

    db.addAssessment(assessmentPayload);
    setIsRetaking(false);
    
    // Auto-advance stage if user selected a different one
    if (wizStage !== startup.stage) {
      db.updateStartup(startup.id, { stage: wizStage });
    }

    syncStates();
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // Hackathon actions
  const handleRegisterHackathon = (hackathonId: string) => {
    const reg: HackathonRegistration = {
      id: `reg-${Date.now()}`,
      hackathonId,
      startupId: startup.id,
      teamMembers: startup.founders,
      registeredAt: new Date().toISOString()
    };
    db.registerForHackathon(reg);
    syncStates();
    confetti({
      particleCount: 80,
      colors: ['#10b981', '#3b82f6']
    });
    alert(`Startup team registered successfully for ${db.getHackathon(hackathonId)?.title}!`);
  };

  const handleSubmitHackathonProject = (e: React.FormEvent, hackathonId: string) => {
    e.preventDefault();
    if (!subProjectTitle.trim() || !subDescription.trim() || !subDemoUrl.trim()) {
      alert('Please fill in all submission fields.');
      return;
    }

    const sub: HackathonSubmission = {
      id: `sub-${Date.now()}`,
      hackathonId,
      startupId: startup.id,
      projectTitle: subProjectTitle,
      description: subDescription,
      demoUrl: subDemoUrl,
      submittedAt: new Date().toISOString(),
      scores: [] // Awaiting judging
    };

    db.submitHackathonProject(sub);
    setSubProjectTitle('');
    setSubDescription('');
    setSubDemoUrl('');
    syncStates();
    confetti({
      particleCount: 100,
      spread: 70
    });
    alert('Project deliverables submitted successfully! Awaiting judging evaluation.');
  };

  // Network Connections
  const handleToggleConnection = (founderId: string) => {
    setConnectedFounders(prev => 
      prev.includes(founderId) ? prev.filter(id => id !== founderId) : [...prev, founderId]
    );
    if (!connectedFounders.includes(founderId)) {
      confetti({
        particleCount: 20,
        colors: ['#10b981']
      });
    }
  };

  // Network list search and filters
  const filteredFoundersList = useMemo(() => {
    const list = db.getFounders().filter(f => f.startupId !== startup.id);
    return list.filter(f => {
      const startObj = f.startupId ? db.getStartup(f.startupId) : null;
      const matchesSearch = 
        f.name.toLowerCase().includes(networkSearch.toLowerCase()) ||
        (startObj?.name.toLowerCase() || '').includes(networkSearch.toLowerCase());
      
      const matchesSector = networkSector === 'All' || startObj?.sector === networkSector;
      const matchesDistrict = networkDistrict === 'All' || f.district === networkDistrict;
      
      let matchesSkill = true;
      if (networkSkillFilter) {
        // Mock competencies for matching
        const seedVal = f.name.charCodeAt(0) % 4;
        const mockSkills = [
          ['Market Research', 'Customer Discovery'],
          ['Prototyping', 'Tech Architecture'],
          ['Financial Modeling', 'Unit Economics'],
          ['B2B Sales', 'Enterprise GTM']
        ][seedVal] || [];
        matchesSkill = mockSkills.includes(networkSkillFilter);
      }

      return matchesSearch && matchesSector && matchesDistrict && matchesSkill;
    });
  }, [db, networkSearch, networkSector, networkDistrict, networkSkillFilter, startup.id]);

  // Chat Submission
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
          startupContext: {
            ...startup,
            innovationScore,
            certifications: activeCertifications.map(c => c.type),
            hackathons: db.getRegistrations().filter(r => r.startupId === startup.id).map(r => db.getHackathon(r.hackathonId)?.title),
            assessment: db.getAssessment(startup.id)
          },
          role: 'Founder'
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

  // Log Customer Interview
  const handleLogInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInterviewName || !customerInterviewNotes) return;

    alert(`Customer interview with "${customerInterviewName}" logged to research database. Traction and PMF scores recalculated!`);
    setCustomerInterviewName('');
    setCustomerInterviewNotes('');
    
    // Increment traction score
    const updatedTraction = Math.min(100, startup.healthBreakdown.traction + 5);
    getDb().updateStartup(startup.id, {
      healthBreakdown: {
        ...startup.healthBreakdown,
        traction: updatedTraction
      }
    });
    getDb().reseed(isDemoModeActive());
    syncStates();
  };

  // Pitch Deck Reviewer
  const handlePitchReview = (e: any) => {
    e.preventDefault();
    setPitchScore(null);
    setPitchFeedback([]);

    setTimeout(() => {
      setPitchScore(86);
      setPitchFeedback([
        'TAM/SAM/SOM calculations are well-structured and reflect actual AP segments.',
        'Improve competitive grid by highlighting direct linkages to RTIH outposts.',
        'Financial slide requires detailed CAC breakdown and 12-month projections.',
        'Clearly declare compliance certifications for state IT subsidies.'
      ]);
      confetti({
        particleCount: 50,
        colors: ['#00A86B']
      });
    }, 1000);
  };

  const handleCertificateDownload = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    alert(`Certificate generated successfully downloaded as PDF.`);
  };

  // Get active assessment
  const activeAssessment = db.getAssessment(startup.id);

  // Certifications locked/unlocked details
  const CERTIFICATION_TEMPLATES = [
    {
      type: 'Idea Validation' as const,
      desc: 'Issued to startups that have successfully transitioned from concept to active customer validation.',
      unlocked: startup.stage !== 'idea',
      stageReq: 'validation'
    },
    {
      type: 'MVP Ready' as const,
      desc: 'Validates deployment of a functional Minimum Viable Product to closed user groups.',
      unlocked: ['mvp', 'users', 'revenue', 'funding', 'scale'].includes(startup.stage),
      stageReq: 'mvp'
    },
    {
      type: 'Product-Market Fit' as const,
      desc: 'Certified for startups showing consistent user retention and monthly unit economics validation.',
      unlocked: ['revenue', 'funding', 'scale'].includes(startup.stage),
      stageReq: 'revenue'
    },
    {
      type: 'Investment Ready' as const,
      desc: 'Awarded to founders passing due-diligence parameters with high investor compatibility ratings.',
      unlocked: ['funding', 'scale'].includes(startup.stage) && startup.investmentScore > 75,
      stageReq: 'funding'
    },
    {
      type: 'Startup Leadership' as const,
      desc: 'The highest tier of innovation achievement, signifying state-level scale and workforce creation.',
      unlocked: startup.stage === 'scale',
      stageReq: 'scale'
    }
  ];

  if (!isMounted) return null;

  return (
    <div className={embedded ? "w-full text-slate-800" : "flex flex-col min-h-screen bg-slate-50"}>
      {!embedded && <Navigation />}

      <main className={embedded ? "w-full py-4 space-y-6" : "flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6"}>
        
        {/* Header Console */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-500" />
              Startup Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Manage your onboarding diagnostics, structured learning paths, milestones, AI coaching, and ecosystem grants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Active Company Context:</span>
                <select
                  value={selectedStartupId}
                  onChange={(e) => setSelectedStartupId(e.target.value)}
                  className="text-xs font-semibold rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 focus:outline-none cursor-pointer"
                >
                  {db.getStartups().map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                <span>Cohort: {startup?.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Executive Briefing Panel (Visible only when Executive Mode is active) */}
        {execActive && (
          <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-800">
                AI Executive Briefing: {startup.name} Status
              </h3>
            </div>
            <div className="text-xs text-slate-650 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10 shadow-sm">
                <span className="font-bold text-slate-800">Ecosystem Highlight:</span>
                <p className="mt-1">Incubated in {startup.district}. GPS stage sits at **{startup.stage.toUpperCase()}**. Universal Innovation index is calculated at **{innovationScore}/100**.</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10 shadow-sm">
                <span className="font-bold text-slate-800">Mitigation Audit:</span>
                <p className="mt-1">Runway index indicates **{riskReport?.overallRisk} Risk**. Recommending immediate filing of the `{schemes[0]?.name || 'RTIH Seed grant'}` application.</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-500/10 shadow-sm">
                <span className="font-bold text-slate-800">Recommended EIR Steps:</span>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>Complete active PMF Certification</li>
                  <li>Interface with matched mentors ({activeAssessment?.recommendedMentors?.[0]?.name || 'Dr. Ramesh'})</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Two-column layout: Left Sidebar Navigation & Right Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 select-none sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Command Modules
            </p>
            <div className="flex flex-col gap-1">
              {PRIMARY_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activePrimaryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.defaultSub as any)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all text-left w-full cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm font-black' 
                        : 'bg-transparent border-transparent text-slate-550 hover:bg-slate-50 hover:text-slate-750'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Main Content Panel */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Horizontal Sub-Navigation Bar */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-6 bg-white p-3 rounded-xl border border-slate-250/60 shadow-sm select-none">
              {activePrimaryTab === 'executive' && (
                <>
                  <button onClick={() => setActiveTab('overview')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Venture Dashboard
                  </button>
                  <button onClick={() => setActiveTab('health')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'health' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Venture Health
                  </button>
                  <button onClick={() => setActiveTab('traction')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'traction' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Milestones & Traction
                  </button>
                  <button onClick={() => setActiveTab('certificates')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'certificates' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Milestone Certifications
                  </button>
                  <button onClick={() => setActiveTab('metrics')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'metrics' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Startup Metrics
                  </button>
                </>
              )}
              {activePrimaryTab === 'profile' && (
                <>
                  <button onClick={() => setActiveTab('organization')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'organization' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Organization Profile
                  </button>
                  <button onClick={() => setActiveTab('network')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'network' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Founder Network
                  </button>
                </>
              )}
              {activePrimaryTab === 'incubation' && (
                <>
                  <button onClick={() => setActiveTab('tasks')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'tasks' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Task Tracker
                  </button>
                  <button onClick={() => setActiveTab('documents')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'documents' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Documents Vault
                  </button>
                  <button onClick={() => setActiveTab('communications')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'communications' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Communication Hub
                  </button>
                  <button onClick={() => setActiveTab('mentors')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'mentors' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Mentor Matching
                  </button>
                </>
              )}
              {activePrimaryTab === 'academic' && (
                <>
                  <button onClick={() => setActiveTab('lmm')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'lmm' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Learning (LMM)
                  </button>
                  <button onClick={() => setActiveTab('hackathons')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'hackathons' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    SmartState Hackathons
                  </button>
                </>
              )}
              {activePrimaryTab === 'growth' && (
                <>
                  <button onClick={() => setActiveTab('recruitment')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'recruitment' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Recruitment & Jobs
                  </button>
                  <button onClick={() => setActiveTab('linkages')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'linkages' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Ecosystem Matching
                  </button>
                  <button onClick={() => setActiveTab('copilot')} className={`px-4.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === 'copilot' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    AI Startup Coach
                  </button>
                </>
              )}
            </div>
        
        {/* Tab 1: Venture Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* GPS Progression Banner */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <h2 className="text-sm font-bold text-slate-900">Startup GPS Pathway</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded uppercase">
                    Innovation Score: {innovationScore}/100
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    Current Stage: {startup.stage}
                  </span>
                </div>
              </div>

              {/* Stepped line layout */}
              <div className="mt-6 mb-4 px-2">
                {/* Horizontal steps on large screens */}
                <div className="hidden md:flex items-center justify-between w-full relative py-2">
                  <div className="absolute left-6 right-6 top-6 h-0.5 bg-slate-200 -z-0"></div>
                  
                  {GPS_STAGES.map((gps, idx) => {
                    const isActive = startup.stage === gps.stage;
                    const isPassed = GPS_STAGES.findIndex(g => g.stage === startup.stage) >= idx;

                    return (
                      <button
                        key={gps.stage}
                        onClick={() => handleStageSelect(gps.stage)}
                        className="relative z-10 flex flex-col items-center focus:outline-none cursor-pointer group"
                      >
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isActive
                            ? 'border-emerald-500 bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20'
                            : isPassed
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                              : 'border-slate-200 bg-white text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`text-[9px] font-bold tracking-tight mt-2 text-center max-w-[80px] block ${
                          isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500'
                        }`}>
                          {gps.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Vertical steps on small screens */}
                <div className="flex md:hidden flex-col gap-3">
                  {GPS_STAGES.map((gps, idx) => {
                    const isActive = startup.stage === gps.stage;
                    const isPassed = GPS_STAGES.findIndex(g => g.stage === startup.stage) >= idx;

                    return (
                      <button
                        key={gps.stage}
                        onClick={() => handleStageSelect(gps.stage)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border text-left w-full cursor-pointer transition-all ${
                          isActive 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                            : 'bg-white border-slate-100 text-slate-650'
                        }`}
                      >
                        <div className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center font-bold text-[10px] ${
                          isActive
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isPassed
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <p className="text-xs font-bold leading-none">{gps.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-50 border border-slate-200/50 rounded-xl text-xs leading-relaxed">
                <span className="font-bold text-slate-800">Active Phase Detail: </span>
                <span className="text-slate-600">
                  {GPS_STAGES.find(g => g.stage === startup.stage)?.description}
                </span>
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <span className="font-bold text-emerald-600 text-[10px] uppercase tracking-wider">Milestones to unlock next phase:</span>
                  {GPS_STAGES.find(g => g.stage === startup.stage)?.nextRequirements.map((req, rIdx) => (
                    <span key={rIdx} className="bg-white border border-slate-200 px-2.5 py-0.5 rounded text-[10px] text-slate-500 font-semibold shadow-sm">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Vertical Journey Timeline - Complete Problem Statement Coverage (Founder Journey Timeline) */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  Ecosystem Founder Journey Timeline
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Student → Founder → Startup Lifecycle
                </span>
              </div>

              {/* Vertical steps container */}
              <div className="relative pl-8 space-y-6 mt-4">
                {/* Vertical axis line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200"></div>

                {verticalJourney.map((step) => {
                  const isCompleted = step.status === 'Completed';
                  const isActive = step.status === 'Active' || step.status === 'Action Required';
                  const isLocked = step.status === 'Locked';

                  return (
                    <div key={step.id} className="relative flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all">
                      {/* Step Indicator Pin */}
                      <div className={`absolute -left-[30px] top-6 w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : isActive 
                            ? 'bg-blue-500 border-blue-500 animate-pulse'
                            : 'bg-slate-200 border-slate-200'
                      }`}>
                        {isCompleted && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>

                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-150 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            {step.phase}
                          </span>
                          <h4 className={`text-xs font-bold ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                            {step.title}
                          </h4>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isLocked ? 'text-slate-400/70' : 'text-slate-500'}`}>
                          {step.desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          isCompleted 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : step.status === 'Action Required'
                              ? 'bg-amber-100 text-amber-800 animate-bounce'
                              : isActive
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-400'
                        }`}>
                          {step.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Scorecards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Venture Health Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                    <span>Venture Health Index</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${health?.colorClass}`}>
                      {health?.overallScore}%
                    </span>
                  </h3>

                  <div className="space-y-3.5 mb-6">
                    {health?.breakdown.map((item) => (
                      <div key={item.name} className="text-xs">
                        <div className="flex justify-between text-slate-500 font-medium mb-1">
                          <span>{item.name}</span>
                          <span className="font-bold text-slate-800">{item.score}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                  {health?.description}
                </p>
              </div>

              {/* Traction Trend Chart */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 mb-4">
                    User Traction Trend (Last 6 Months)
                  </h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={startup.tractionHistory}>
                        <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px' }}
                          labelStyle={{ color: '#fff', fontSize: '10px' }}
                        />
                        <Line type="monotone" dataKey="users" stroke="#00A86B" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Total Jobs Created:</span>
                  <span className="text-slate-900 font-extrabold">{startup.jobsCreated} Full-time</span>
                </div>
              </div>

              {/* Score breakdown panels */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Reputation Score</p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {startup.founderReputation}/100
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Unicorn Potential</p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {startup.unicornScore}%
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Invest Readiness</p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {startup.investmentScore}%
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Funding Readiness</p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {startup.fundingReadiness}%
                    </p>
                  </div>
                </div>

                {riskReport && (
                  <div className={`p-4 border rounded-xl flex items-center justify-between shadow-sm ${riskReport.color}`}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold uppercase leading-none">Venture Risk Alert</h4>
                        <p className="text-[10px] opacity-90 mt-1">
                          Calculated runway indicators flag **{riskReport.overallRisk} Risk**.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Venture Health Score & Diagnostics */}
        {activeTab === 'health' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Row: Overall Score Dial & Trend Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* SVG Radial Gauge Dial */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-between min-h-[300px]">
                <div className="text-center w-full">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Venture Health</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Calculated using 9 weighted indicators</p>
                </div>
                
                <div className="relative flex items-center justify-center my-4">
                  {/* Circular Gauge */}
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      stroke="#f1f5f9"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      stroke={
                        (startup.healthScore || 0) < 50
                          ? '#ef4444' // red
                          : (startup.healthScore || 0) < 60
                          ? '#f59e0b' // yellow
                          : (startup.healthScore || 0) < 75
                          ? '#3b82f6' // blue
                          : '#10b981' // emerald
                      }
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 65}
                      strokeDashoffset={2 * Math.PI * 65 * (1 - (startup.healthScore || 0) / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-extrabold text-slate-800 leading-none">{startup.healthScore || 0}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Score</span>
                  </div>
                </div>

                <div className="text-center w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    (startup.healthScore || 0) < 50
                      ? 'text-red-700 bg-red-50 border border-red-200'
                      : (startup.healthScore || 0) < 60
                      ? 'text-amber-700 bg-amber-50 border border-amber-200'
                      : (startup.healthScore || 0) < 75
                      ? 'text-blue-700 bg-blue-50 border border-blue-200'
                      : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  }`}>
                    {startup.healthCategory || 'Stable'}
                  </span>
                </div>
              </div>

              {/* Recharts LineChart Trend */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">6-Month Health History</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Historical health score performance trend</p>
                </div>
                
                <div className="h-[200px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={startup.healthHistory || []}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
                      <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Middle Row: Dimensions Breakdown & AI Health Report */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Breakdown List */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weighted Breakdown</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Individual performance metrics across the 9 dimensions</p>
                </div>
                
                <div className="space-y-3.5 mt-2">
                  {[
                    { name: 'Progress of Milestones (20%)', score: startup.healthBreakdown.progress ?? 50, color: 'bg-emerald-500' },
                    { name: 'Product/Tech Maturity (15%)', score: startup.healthBreakdown.product ?? 50, color: 'bg-teal-500' },
                    { name: 'Team Size & Competency (10%)', score: startup.healthBreakdown.team ?? 50, color: 'bg-cyan-500' },
                    { name: 'Market Potential & Users (15%)', score: startup.healthBreakdown.market ?? 50, color: 'bg-blue-500' },
                    { name: 'Financial Stability & MRR (15%)', score: startup.healthBreakdown.financial ?? 50, color: 'bg-indigo-500' },
                    { name: 'Funding & Projections (10%)', score: startup.healthBreakdown.funding ?? 50, color: 'bg-purple-500' },
                    { name: 'Mentor Engagement (5%)', score: startup.healthBreakdown.mentor ?? 50, color: 'bg-pink-500' },
                    { name: 'Document Vault Checklist (5%)', score: startup.healthBreakdown.documentation ?? 50, color: 'bg-amber-500' },
                    { name: 'Risk Mitigation & Status (5%)', score: startup.healthBreakdown.risk ?? 50, color: 'bg-rose-500' }
                  ].map((dim, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span>{dim.name}</span>
                        <span>{dim.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${dim.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Report Card */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Health Analysis Report</h3>
                  </div>
                  <p className="text-[10px] text-slate-400">Sandbox AI generated diagnostics based on real-time data</p>
                  
                  {startup.aiHealthReports && startup.aiHealthReports[0] ? (
                    <div className="space-y-4 mt-4">
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-150 rounded-xl p-3.5 font-medium italic leading-relaxed">
                        "{startup.aiHealthReports[0].summary}"
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Key Strengths</h4>
                          <ul className="space-y-1.5">
                            {startup.aiHealthReports[0].strengths.map((st: string, idx: number) => (
                              <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5 font-medium">
                                <span className="text-emerald-500 font-bold">✓</span>
                                <span>{st}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-rose-700 uppercase tracking-wide">Attention Areas</h4>
                          <ul className="space-y-1.5">
                            {startup.aiHealthReports[0].weaknesses.map((wk: string, idx: number) => (
                              <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5 font-medium">
                                <span className="text-rose-500 font-bold">!</span>
                                <span>{wk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-6 text-center">No AI report generated yet. Recalculate health to generate.</p>
                  )}
                </div>
                
                {startup.aiHealthReports && startup.aiHealthReports[0] && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 mt-4">
                    <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide mb-1">Recommended Actions</h4>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {startup.aiHealthReports[0].recommendations[0]}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Alerts, Risks & Missing Document Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Alerts & Risks */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Risk Flags & Warnings</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Flags submitted by lead mentors or automated monitors</p>
                </div>

                <div className="space-y-3 mt-2">
                  {(startup.healthScore || 0) < 60 && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-base flex-shrink-0">⚠️</div>
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-bold text-amber-900 leading-tight">Operational Intervention Alert</h4>
                        <p className="text-[10px] text-slate-600 font-medium leading-normal">
                          Venture health is under the critical limit. A Mentor Portfolio Audit has been initialized and scheduled.
                        </p>
                      </div>
                    </div>
                  )}

                  {startup.riskFlags && startup.riskFlags.filter((f: any) => !f.resolved).length > 0 ? (
                    startup.riskFlags.filter((f: any) => !f.resolved).map((flag: any) => (
                      <div key={flag.id} className="bg-red-50/80 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-base flex-shrink-0">🚨</div>
                        <div className="space-y-0.5">
                          <h4 className="text-[11px] font-bold text-red-900 leading-tight">{flag.type} Risk Flagged ({flag.severity} Severity)</h4>
                          <p className="text-[10px] text-slate-600 font-medium leading-normal">{flag.description}</p>
                          <span className="text-[9px] text-slate-400 font-bold block pt-1">
                            Flagged on {new Date(flag.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center text-xs text-slate-400 italic font-medium">
                      No active risk flags or resolve items pending.
                    </div>
                  )}
                </div>
              </div>

              {/* Missing Documents Uploader */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vault Compliance Checklist</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Upload missing documents to increase Funding and Product Health scores</p>
                </div>

                <div className="space-y-3 mt-2">
                  {[
                    { type: 'Pitch Deck', name: 'Investment Pitch Deck' },
                    { type: 'Business Plan', name: 'Operational Business Plan' },
                    { type: 'Financial Model', name: '3-Year Financial projections Model' },
                    { type: 'Technical Spec', name: 'Product Architecture & Technical Spec' }
                  ].map((docItem) => {
                    const isUploaded = (db.getDocuments(startup.id) || []).some(d => d.type === docItem.type);
                    
                    const triggerUpload = () => {
                      db.addDocument({
                        id: `doc-${Date.now()}`,
                        startupId: startup.id,
                        name: `${startup.name} ${docItem.type}.pdf`,
                        type: docItem.type as any,
                        url: `https://drive.google.com/rtih-vault/${startup.id}/${docItem.type.replace(/\s+/g, '-').toLowerCase()}.pdf`,
                        uploadedBy: currentUser?.name || 'Founder',
                        uploaderRole: 'founder',
                        uploadedAt: new Date().toISOString(),
                        accessLevel: 'All'
                      });
                      
                      // Reload state
                      syncStates();
                      alert(`Mock ${docItem.type} uploaded successfully! Score recalculation triggered.`);
                    };

                    return (
                      <div key={docItem.type} className="border border-slate-150 rounded-xl p-3 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                            isUploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isUploaded ? '✓' : '?'}
                          </div>
                          <div>
                            <h4 className="text-[11px] font-bold text-slate-700 leading-tight">{docItem.name}</h4>
                            <p className="text-[9px] text-slate-400">{docItem.type}</p>
                          </div>
                        </div>

                        {isUploaded ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 uppercase">
                            Vaulted
                          </span>
                        ) : (
                          <button
                            onClick={triggerUpload}
                            className="text-[10px] font-bold text-slate-650 bg-white hover:bg-slate-50 border border-slate-350 px-3 py-1 rounded-lg cursor-pointer transition-all shadow-xs"
                          >
                            Upload File
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Learning & Capacity Building (LMM Core) */}
        {activeTab === 'lmm' && (
          <div className="space-y-6">
            
            {/* Onboarding Diagnostics or Wizard report */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Assessment Form/Report */}
              <div className="lg:col-span-6 space-y-6">
                
                {activeAssessment && !isRetaking ? (
                  /* Show Assessment Report */
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                          AI Onboarding Assessment Report
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Completed on {new Date(activeAssessment.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsRetaking(true)}
                        className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded text-slate-700"
                      >
                        Retake Wizard
                      </button>
                    </div>

                    {/* Gauges */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Venture Maturity Index</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">{activeAssessment.maturityScore}%</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ecosystem Readiness Score</p>
                        <p className="text-2xl font-black text-blue-600 mt-1">{activeAssessment.readinessScore}%</p>
                      </div>
                    </div>

                    {/* LMM Journey Milestones */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        AI Recommended Learning Path
                      </p>
                      <div className="space-y-1.5">
                        {activeAssessment.learningJourney.map((path, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-150">
                            <span className="w-5 h-5 bg-emerald-500 text-white font-bold rounded-full flex items-center justify-center text-[10px] shrink-0">
                              {idx + 1}
                            </span>
                            <span>{path}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Mentors with Match Scores */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-t border-slate-100 pt-3">
                        <Users className="w-3.5 h-3.5 text-purple-500" />
                        Intelligent Mentor Recommendations
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        {activeAssessment.recommendedMentors.map((men, mIdx) => (
                          <div key={mIdx} className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl text-xs space-y-2 hover:border-purple-500/30 transition-all">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800">{men.name}</span>
                              <span className="px-2 py-0.5 rounded bg-purple-150 text-[9px] font-black text-purple-800 uppercase tracking-wider">
                                {men.matchScore}% Match
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                              <strong>Alignment Reason:</strong> {men.reason}
                            </p>
                            <p className="text-[10px] text-purple-700 font-bold bg-purple-500/10 px-2.5 py-1 rounded">
                              <strong>Suggested Session Focus:</strong> {men.focus}
                            </p>
                            <button 
                              onClick={() => alert(`Consultation request sent to ${men.name}. A schedule sync invitation will appear in your sessions list.`)}
                              className="w-full text-center py-1 bg-white hover:bg-slate-50 border border-purple-200 text-purple-700 font-bold rounded text-[10px] mt-1 transition-all"
                            >
                              Request Advisory Session
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Show Onboarding Assessment Wizard */
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-emerald-500" />
                        AI Onboarding Assessment Wizard
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Complete this detailed profiling to structure your ecosystem resources.
                      </p>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-150 p-2 rounded-lg text-[10px] font-bold">
                      <span className={wizardStep === 1 ? 'text-emerald-600' : 'text-slate-400'}>1. Concept</span>
                      <span className={wizardStep === 2 ? 'text-emerald-600' : 'text-slate-400'}>2. Stage</span>
                      <span className={wizardStep === 3 ? 'text-emerald-600' : 'text-slate-400'}>3. Team & Submit</span>
                    </div>

                    <form onSubmit={handleWizardSubmit} className="space-y-4 pt-2">
                      {wizardStep === 1 && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Startup Idea & Core Value Prop</label>
                            <textarea
                              value={wizIdea}
                              onChange={(e) => setWizIdea(e.target.value)}
                              placeholder="Briefly pitch your product concept and core value proposition..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800"
                              rows={3}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Critical Problem Statement</label>
                            <textarea
                              value={wizProblem}
                              onChange={(e) => setWizProblem(e.target.value)}
                              placeholder="What exact market pain points are you solving?"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800"
                              rows={2}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Customers</label>
                            <input
                              type="text"
                              value={wizCustomers}
                              onChange={(e) => setWizCustomers(e.target.value)}
                              placeholder="e.g. Rural farmers, retail shops, municipal planners..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800"
                              required
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setWizardStep(2)}
                            className="w-full py-2 bg-emerald-500 text-white font-bold rounded text-xs"
                          >
                            Next Step: Stage & Sector
                          </button>
                        </div>
                      )}

                      {wizardStep === 2 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sector Focus</label>
                              <select
                                value={wizSector}
                                onChange={(e) => setWizSector(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800"
                              >
                                {SECTORS.map(sec => (
                                  <option key={sec} value={sec}>{sec}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Current Stage</label>
                              <select
                                value={wizStage}
                                onChange={(e) => setWizStage(e.target.value as StartupStage)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800"
                              >
                                {GPS_STAGES.map(gps => (
                                  <option key={gps.stage} value={gps.stage}>{gps.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">MVP Status</label>
                              <select
                                value={wizMvp}
                                onChange={(e) => setWizMvp(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800"
                              >
                                <option value="concept">Concept Only</option>
                                <option value="prototype">Working Prototype</option>
                                <option value="mvp">MVP Launched</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Revenue Status</label>
                              <select
                                value={wizRevenue}
                                onChange={(e) => setWizRevenue(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800"
                              >
                                <option value="none">Pre-Revenue</option>
                                <option value="validation">Initial monetization validation</option>
                                <option value="revenue">Consistent Revenue Generation</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setWizardStep(1)}
                              className="w-1/3 py-2 border border-slate-200 font-bold rounded text-xs text-slate-600"
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              onClick={() => setWizardStep(3)}
                              className="w-2/3 py-2 bg-emerald-500 text-white font-bold rounded text-xs"
                            >
                              Next: Team Info
                            </button>
                          </div>
                        </div>
                      )}

                      {wizardStep === 3 && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Co-founders & Team Size</label>
                            <input
                              type="number"
                              min={1}
                              value={wizTeamSize}
                              onChange={(e) => setWizTeamSize(parseInt(e.target.value) || 1)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Founder Background & Bio</label>
                            <textarea
                              value={wizExperience}
                              onChange={(e) => setWizExperience(e.target.value)}
                              placeholder="Mention academic details, past tech or startup experience..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800"
                              rows={3}
                              required
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setWizardStep(2)}
                              className="w-1/3 py-2 border border-slate-200 font-bold rounded text-xs text-slate-600"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              className="w-2/3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              Calculate Maturity & Match Mentors
                            </button>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </div>

              {/* Right Column: Diagnostic Skill Coverage */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Competency check */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-500" />
                      Intelligent Onboarding Diagnostics
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      Verify founder skill competencies to update your personalized learning journey automatically.
                    </p>
                  </div>

                  {/* Progress and checklists */}
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-500">Core Skill Competencies Coverage</span>
                        <span className="text-emerald-600">{diagnosticScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${diagnosticScore}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Checklist</p>
                      {[
                        'Market Research',
                        'Customer Discovery',
                        'Prototyping',
                        'Tech Architecture',
                        'Agile Delivery',
                        'Financial Modeling',
                        'Unit Economics',
                        'B2B Sales'
                      ].map(skill => {
                        const isChecked = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-150 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors text-left cursor-pointer"
                          >
                            <span>{skill}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                            }`}>
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Structured Curricula */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-emerald-500" />
                    Structured Capacity Building Journeys
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {LMM_COURSES.map((course, idx) => {
                      const isCompleted = completedCourses.includes(course.title);
                      const isLocked = course.stage !== 'idea' && course.stage !== startup.stage && course.stage !== 'validation';
                      
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-xs transition-all ${
                            isLocked 
                              ? 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60' 
                              : isCompleted 
                                ? 'bg-emerald-500/5 border-emerald-500/20' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-extrabold uppercase text-slate-450 tracking-wider">
                                Stage: {course.stage}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">{course.duration}</span>
                            </div>
                            
                            <h4 className="font-bold text-slate-800 leading-snug">{course.title}</h4>
                            <p className="text-[10px] text-slate-500 leading-normal">{course.desc}</p>
                            
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {course.skills.map(skill => (
                                <span key={skill} className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-slate-100 text-slate-500">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-slate-100/80 pt-3 flex items-center justify-between mt-1">
                            {isLocked ? (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Locked for stage
                              </span>
                            ) : isCompleted ? (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                              </span>
                            ) : (
                              <button
                                onClick={() => completeCourse(course.title)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-500 hover:text-white border border-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                              >
                                Launch Module
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Tab 3: Certifications Center (milestone certificate popups) */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scroll className="w-5 h-5 text-emerald-500" />
                Ecosystem Certifications Registry
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Monitor and verify startup stage milestones. Unlocked certifications can be viewed and downloaded dynamically.
              </p>
            </div>

            {/* Grid of 5 certificates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CERTIFICATION_TEMPLATES.map((tmpl, idx) => {
                const earnedCert = activeCertifications.find(c => c.type === tmpl.type);
                const isUnlocked = tmpl.unlocked || !!earnedCert;

                return (
                  <div
                    key={idx}
                    className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between relative transition-all ${
                      isUnlocked 
                        ? 'border-emerald-250 ring-1 ring-emerald-500/5 hover:shadow-md' 
                        : 'border-slate-200 opacity-70 bg-slate-50/50'
                    }`}
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-slate-100/10 backdrop-blur-[1px] flex flex-col items-center justify-center text-slate-400 z-10 rounded-xl">
                        <Lock className="w-8 h-8 text-slate-350 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Locked Certificate</span>
                        <span className="text-[8px] text-slate-400 mt-0.5">Unlocks at {tmpl.stageReq.toUpperCase()} Stage</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <Award className={`w-8 h-8 ${isUnlocked ? 'text-amber-500' : 'text-slate-300'}`} />
                        {isUnlocked && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-250 text-[9px] font-black text-emerald-700 uppercase tracking-wide">
                            ISSUED
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{tmpl.type} Milestone Certificate</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">{tmpl.desc}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-5 flex items-center justify-between text-[10px]">
                      {isUnlocked ? (
                        <>
                          <span className="text-slate-400 font-mono">
                            {earnedCert ? earnedCert.certificateId : `RTIH-CERT-2026-${1000 + idx}`}
                          </span>
                          <button
                            onClick={() => setSelectedCertificate({
                              type: tmpl.type,
                              id: earnedCert ? earnedCert.certificateId : `RTIH-CERT-2026-${1000 + idx}`,
                              issuedAt: earnedCert ? earnedCert.issuedAt : new Date().toISOString()
                            })}
                            className="text-emerald-600 font-bold hover:underline"
                          >
                            View Certificate →
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400">Locked Milestone</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: SmartState Hackathons Hub */}
        {activeTab === 'hackathons' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-500" />
                State-Level SmartState Hackathons
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Participate in competitive ideathons, submit project prototypes, and receive verified score audits from regional panel judges.
              </p>
            </div>

            {/* Hackathons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hackathons.map((hack) => {
                const reg = db.getRegistrations().find(r => r.hackathonId === hack.id && r.startupId === startup.id);
                const sub = db.getSubmissions().find(s => s.hackathonId === hack.id && s.startupId === startup.id);

                return (
                  <div key={hack.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-250 text-[9px] font-black uppercase tracking-wider rounded">
                          {hack.status}
                        </span>
                        <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Ends: {hack.endDate}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{hack.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-normal mt-1">{hack.tagline}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tracks</p>
                        <div className="flex flex-wrap gap-1.5">
                          {hack.tracks.map((track, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 bg-slate-50 border border-slate-150 rounded text-[9px] text-slate-600 font-medium">
                              {track}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Registration / Submission states */}
                    <div className="border-t border-slate-100 pt-4 mt-2 space-y-4">
                      {!reg ? (
                        <button
                          onClick={() => handleRegisterHackathon(hack.id)}
                          className="w-full text-center py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs"
                        >
                          Register Startup Team
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-xs font-bold text-emerald-800">
                            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Team Registered</span>
                            <span className="text-[9px] text-emerald-700 bg-white px-2 py-0.5 border border-emerald-200 rounded font-bold">ACTIVE</span>
                          </div>

                          {!sub ? (
                            /* Project submission form */
                            <form onSubmit={(e) => handleSubmitHackathonProject(e, hack.id)} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1.5">Submit Project Deliverables</p>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Project Title</label>
                                <input
                                  type="text"
                                  placeholder="e.g. AgriScan IoT Nodes"
                                  value={subProjectTitle}
                                  onChange={(e) => setSubProjectTitle(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800 focus:outline-none"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Prototype Deliverables Description</label>
                                <textarea
                                  placeholder="Describe the solution architecture and testing logs..."
                                  value={subDescription}
                                  onChange={(e) => setSubDescription(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800 focus:outline-none resize-none"
                                  rows={2}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Demo / Code Sandbox URL</label>
                                <input
                                  type="url"
                                  placeholder="https://github.com/..."
                                  value={subDemoUrl}
                                  onChange={(e) => setSubDemoUrl(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800 focus:outline-none"
                                  required
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full text-center py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded text-xs transition-colors"
                              >
                                Submit Deliverables
                              </button>
                            </form>
                          ) : (
                            /* Submission state */
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs space-y-3">
                              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                                <span className="font-bold text-slate-700">Project: {sub.projectTitle}</span>
                                <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[8px] font-black text-blue-700 uppercase">SUBMITTED</span>
                              </div>
                              
                              <p className="text-[10px] text-slate-550 leading-relaxed">
                                <strong>Description:</strong> {sub.description}
                              </p>
                              
                              <p className="text-[10px] text-blue-600 hover:underline">
                                <strong>Code Repository:</strong> <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 inline-flex">{sub.demoUrl.slice(0, 30)}... <ExternalLink className="w-3 h-3" /></a>
                              </p>

                              {/* JURY GRADES */}
                              {sub.scores && sub.scores.length > 0 ? (
                                <div className="border-t border-slate-200 pt-3 space-y-2.5">
                                  <div className="flex justify-between items-center">
                                    <span className="font-extrabold text-[10px] text-purple-700 uppercase">Jury Evaluation Complete</span>
                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                      Score: {sub.finalScore}/100
                                    </span>
                                  </div>

                                  {/* Score breakdown bars */}
                                  <div className="space-y-1.5">
                                    {[
                                      { name: 'Innovation Score', score: sub.scores[0].innovation },
                                      { name: 'Technical Feasibility', score: sub.scores[0].feasibility },
                                      { name: 'Ecosystem Impact', score: sub.scores[0].impact },
                                      { name: 'Milestone Execution', score: sub.scores[0].execution }
                                    ].map((sc, scIdx) => (
                                      <div key={scIdx}>
                                        <div className="flex justify-between text-[9px] text-slate-500 font-semibold mb-0.5">
                                          <span>{sc.name}</span>
                                          <span className="font-bold text-slate-800">{sc.score}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${sc.score}%` }}></div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="bg-purple-500/5 border border-purple-500/10 p-2.5 rounded text-[10px] text-slate-650 leading-relaxed">
                                    <strong>Judge Feedback:</strong> "{sub.scores[0].comment}"
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[9.5px] text-amber-800 font-semibold animate-pulse">
                                  Evaluation Pending: Regional judges are reviewing your prototype code repository.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Founder Network Hub & Skill Matching */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Ecosystem Founder Network & Skill Matching
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Identify and connect with other founders in regional outposts. Match collaboration requests against specific competency skills.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Search & Filters */}
              <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Search Directory</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search founders or startups..."
                      value={networkSearch}
                      onChange={(e) => setNetworkSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sector</label>
                  <select
                    value={networkSector}
                    onChange={(e) => setNetworkSector(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none text-slate-800"
                  >
                    <option value="All">All Sectors</option>
                    {SECTORS.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">District</label>
                  <select
                    value={networkDistrict}
                    onChange={(e) => setNetworkDistrict(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none text-slate-800"
                  >
                    <option value="All">All Districts</option>
                    {DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                {/* Skill Match filters */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Matching Filter</label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      'Prototyping',
                      'Market Research',
                      'B2B Sales',
                      'Financial Modeling'
                    ].map(skill => {
                      const isActive = networkSkillFilter === skill;
                      return (
                        <button
                          key={skill}
                          onClick={() => setNetworkSkillFilter(isActive ? null : skill)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 border rounded-lg text-[10px] font-bold text-left cursor-pointer transition-all ${
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700'
                              : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
                          }`}
                        >
                          <span>Need: {skill}</span>
                          {isActive && <Check className="w-3 h-3 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Founder Directory Cards */}
              <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFoundersList.length > 0 ? (
                  filteredFoundersList.map((fnd) => {
                    const stObj = fnd.startupId ? db.getStartup(fnd.startupId) : null;
                    const seedVal = fnd.name.charCodeAt(0) % 4;
                    const fndSkills = [
                      ['Market Research', 'Customer Discovery'],
                      ['Prototyping', 'Tech Architecture'],
                      ['Financial Modeling', 'Unit Economics'],
                      ['B2B Sales', 'Enterprise GTM']
                    ][seedVal] || [];

                    const isConnected = connectedFounders.includes(fnd.id);

                    return (
                      <div key={fnd.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <img src={fnd.avatar} alt={fnd.name} className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 shrink-0" />
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900">{fnd.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{fnd.title} • {stObj?.name || 'Stealth Startup'}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 text-[9px] font-semibold text-slate-500">
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-350" /> {fnd.district}</span>
                            <span>•</span>
                            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 uppercase">{stObj?.sector || 'General'}</span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Competency Strengths</p>
                            <div className="flex flex-wrap gap-1">
                              {fndSkills.map((sk, sIdx) => (
                                <span key={sIdx} className="px-1.5 py-0.5 rounded-[3px] bg-emerald-50 text-[9px] text-emerald-700 border border-emerald-100 font-bold">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3.5 mt-2 flex items-center justify-between">
                          <span className="text-[9px] text-slate-400">RTIH Active Founder</span>
                          <button
                            onClick={() => handleToggleConnection(fnd.id)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                              isConnected 
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isConnected ? 'Request Sent' : 'Request Collaboration'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-12 text-center text-xs font-bold text-slate-400 bg-white border border-slate-200 rounded-xl">
                    No founders found matching search filters.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 6: AI Startup Coach workspace */}
        {activeTab === 'copilot' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[520px]">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Bot className="w-5 h-5 text-emerald-500" />
                  AI Startup Copilot & Coach (LMM Extension C)
                </h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                  isAiLive 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAiLive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  {isAiLive ? `Live AI (${aiProvider})` : 'Local Sandbox Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-normal">
                Query strategy parameters, learning curriculum references, state policy guides, or draft seed funding submissions.
              </p>

              {/* Chat window */}
              <div className="h-[320px] overflow-y-auto border border-slate-100 bg-slate-50/50 rounded-xl p-4 space-y-4">
                {chatHistory.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      chat.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`p-3 rounded-xl text-xs leading-relaxed shadow-sm ${
                      chat.sender === 'user'
                        ? 'bg-emerald-500 text-white font-medium rounded-tr-none'
                        : 'bg-white border border-slate-200/50 text-slate-800 rounded-tl-none'
                    }`}>
                      {chat.sender === 'user' ? chat.text : renderMarkdown(chat.text)}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 animate-pulse font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Coach is compiling strategy recommendations...
                  </div>
                )}
              </div>
            </div>

            {/* Input form */}
            <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-slate-100 pt-4 mt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask: What learning modules fit my validation milestone?"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none text-slate-800"
              />
              <button
                type="submit"
                disabled={isTyping}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 7: Ecosystem matching */}
        {activeTab === 'linkages' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Government matching */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="w-4.5 h-4.5 text-emerald-500" />
                  Government Policy & Seed Fund Matching
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Automatic qualification index matching active AP Startup Policy benefits against your profile.
                </p>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                {schemes.slice(0, 3).map((sch) => (
                  <div
                    key={sch.id}
                    className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl text-xs flex justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 leading-tight">
                          {sch.name}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 bg-slate-200/60 px-1 py-0.2 rounded">
                          {sch.department}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        Benefits: {sch.benefits}
                      </p>
                      <p className="text-[9px] text-slate-400 leading-relaxed">
                        Eligibility: {sch.eligibility}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex flex-col justify-center">
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center min-w-[58px] shadow-sm">
                        <p className="text-xs font-bold text-emerald-600 leading-none">
                          {sch.matchingScore}%
                        </p>
                        <p className="text-[7px] text-slate-405 uppercase mt-0.5 leading-none">Match</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitch Deck Auditor */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkle className="w-4.5 h-4.5 text-emerald-500" />
                  Pitch Deck Reviewer
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Upload pitch documentation to review investment readiness.
                </p>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                <button
                  onClick={handlePitchReview}
                  className="w-full py-3.5 border border-dashed border-slate-355 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-500 hover:text-emerald-600 bg-slate-50/50 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  Simulate Pitch Audit Scan
                </button>

                {pitchScore && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Audit score:</span>
                      <span className="font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border border-emerald-500/20">
                        {pitchScore}% Ready
                      </span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1.5 text-[10px] text-slate-650 leading-relaxed">
                      {pitchFeedback.map((fb, fIdx) => (
                        <li key={fIdx}>{fb}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Discovery Log & Milestones */}
        {activeTab === 'traction' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Milestones Checklist */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Milestones & OKR Tracker</h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Toggle objective logs to recalculate your Venture Health and Investment Readiness scores.
                </p>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                {startup.milestones.map((milestone) => {
                  const isCompleted = milestone.status === 'Completed';
                  const isSubmitted = milestone.status === 'Submitted';
                  return (
                    <button
                      key={milestone.id}
                      onClick={() => handleToggleMilestone(milestone.id, milestone.status)}
                      className={`w-full text-left flex items-start gap-3 p-3 border rounded-xl transition-all shadow-sm ${
                        isCompleted
                          ? 'bg-emerald-50/50 border-emerald-250 text-emerald-800'
                          : isSubmitted
                            ? 'bg-amber-50/40 border-amber-250 text-amber-800 cursor-not-allowed'
                            : 'bg-slate-50 border-slate-200/50 hover:border-slate-350 hover:bg-slate-100/50 cursor-pointer'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : isSubmitted ? (
                        <Clock className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                      ) : (
                        <Circle className="w-4.5 h-4.5 text-slate-350 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {milestone.title}
                          </p>
                          {isSubmitted && (
                            <span className="text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                              Under Review
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-405 mt-1 leading-normal">{milestone.description}</p>
                        {isSubmitted && milestone.notes && (
                          <div className="mt-2 text-[8.5px] bg-white border border-slate-150 p-2 rounded text-slate-500 leading-normal">
                            <strong className="text-slate-700">Submitted Notes:</strong> {milestone.notes}
                            {milestone.evidenceUrl && (
                              <a href={milestone.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-650 font-bold block mt-1 hover:underline">
                                View Submitted Evidence Link ↗
                              </a>
                            )}
                          </div>
                        )}
                        {milestone.feedback && !isCompleted && (
                          <div className="mt-2 text-[8.5px] bg-rose-50 border border-rose-200/55 p-2 rounded text-rose-600 leading-normal">
                            <strong className="text-rose-800">Mentor Revision Feedback:</strong> {milestone.feedback}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer discovery log */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Customer Discovery Tracker</h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Log segments and interviews to update PMF indices.
                </p>
              </div>

              <form onSubmit={handleLogInterview} className="space-y-3 border-t border-slate-100 pt-4">
                <input
                  type="text"
                  value={customerInterviewName}
                  onChange={(e) => setCustomerInterviewName(e.target.value)}
                  placeholder="Interviewee Name / Target Segment"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                />
                <textarea
                  value={customerInterviewNotes}
                  onChange={(e) => setCustomerInterviewNotes(e.target.value)}
                  placeholder="Insights, key feedback, and pain points..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  Log Interview Record
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab: Organization Profile */}
        {activeTab === 'organization' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Organization Profile
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage your startup entity information, growth metrics, and view your assigned incubation center spokes.
              </p>
            </div>

            <form onSubmit={handleUpdateOrganization} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Startup Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-slate-550 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Tagline</label>
                  <input
                    type="text"
                    value={orgTagline}
                    onChange={(e) => setOrgTagline(e.target.value)}
                    className="w-full bg-slate-550 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Venture Description</label>
                <textarea
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-550 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Sector</label>
                  <select
                    value={orgSector}
                    onChange={(e) => setOrgSector(e.target.value)}
                    className="w-full bg-slate-550 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  >
                    {SECTORS.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">District Hub</label>
                  <select
                    value={orgDistrict}
                    onChange={(e) => setOrgDistrict(e.target.value)}
                    className="w-full bg-slate-550 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  >
                    {DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Logo URL</label>
                  <input
                    type="text"
                    value={orgLogo}
                    onChange={(e) => setOrgLogo(e.target.value)}
                    className="w-full bg-slate-550 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">Startup Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5">Jobs Created</label>
                    <input
                      type="number"
                      value={orgJobsCreated}
                      onChange={(e) => setOrgJobsCreated(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-550 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5">Monthly Revenue (₹)</label>
                    <input
                      type="number"
                      value={orgMonthlyRevenue}
                      onChange={(e) => setOrgMonthlyRevenue(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-550 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5">Total Funding (₹)</label>
                    <input
                      type="number"
                      value={orgTotalFunding}
                      onChange={(e) => setOrgTotalFunding(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-550 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5">Active Users</label>
                    <input
                      type="number"
                      value={orgActiveUsers}
                      onChange={(e) => setOrgActiveUsers(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-550 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
                >
                  Save Organization Details
                </button>
              </div>
            </form>

            {/* Incubation center & Mentor cards */}
            <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Incubation Center spoke */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-2">
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 border border-emerald-200 rounded uppercase">
                  Incubation Spoke
                </span>
                {(() => {
                  const center = db.getIncubationCenters().find(c => c.domains.includes(startup.sector)) || db.getIncubationCenters()[0];
                  if (!center) return <p className="text-xs text-slate-400 font-bold">Unassigned Incubation Center</p>;
                  return (
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{center.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-semibold">Location: {center.location}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Manager: {center.managerName} ({center.managerId})</p>
                    </div>
                  );
                })()}
              </div>

              {/* Lead Mentor */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-2">
                <span className="text-[9px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 border border-purple-200 rounded uppercase">
                  Lead Mentor
                </span>
                {(() => {
                  const mentor = db.getMentors().find(m => m.portfolioStartups?.includes(startup.id));
                  if (!mentor) return <p className="text-xs text-slate-400 font-bold">No Lead Mentor assigned yet. Please request one in the LMM Onboarding tab.</p>;
                  return (
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{mentor.name}</h4>
                      <p className="text-[10px] text-slate-550 mt-1 font-semibold">Expertise: {mentor.expertise.join(', ')}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{mentor.sessionsCompleted || 0} completed sessions</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Tasks Tracker */}
        {activeTab === 'tasks' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-500" />
                Mentor Task Tracker
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Track strategic milestones assigned by your lead mentor. Submit links and notes for review to advance stages.
              </p>
            </div>

            {/* List of Tasks */}
            <div className="space-y-4">
              {(() => {
                const tasks = db.getTasksByStartup(startup.id);
                if (tasks.length === 0) {
                  return (
                    <div className="text-center py-12 bg-slate-50 border border-slate-150 rounded-xl">
                      <ClipboardList className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">No tasks assigned yet</p>
                      <p className="text-[10px] text-slate-400 mt-1">Your lead mentor will assign your next operational benchmarks.</p>
                    </div>
                  );
                }

                return tasks.map(task => {
                  const isAssigned = task.status === 'Assigned';
                  const isInProgress = task.status === 'In Progress';
                  const isSubmitted = task.status === 'Submitted';
                  const isVerified = task.status === 'Verified';
                  const isOverdue = task.status === 'Overdue';

                  return (
                    <div
                      key={task.id}
                      className={`border rounded-xl p-5 shadow-sm space-y-4 transition-all ${
                        isVerified 
                          ? 'bg-emerald-500/5 border-emerald-500/20' 
                          : isSubmitted
                            ? 'bg-blue-500/5 border-blue-500/20'
                            : isOverdue
                              ? 'bg-rose-500/5 border-rose-500/20'
                              : 'bg-white border-slate-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800">{task.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">Due: {task.dueDate}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border self-start sm:self-auto ${
                          isVerified 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : isSubmitted
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : isOverdue
                                ? 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
                                : isInProgress
                                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {task.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Evidence submissions info */}
                      {(isSubmitted || isVerified) && (
                        <div className="bg-slate-50/80 border border-slate-200/50 p-3 rounded-lg text-[10px] space-y-1.5 leading-relaxed">
                          <p className="text-slate-500">
                            <strong className="text-slate-700">Submitted Evidence Notes:</strong> {task.evidenceNote}
                          </p>
                          {task.evidenceUrl && (
                            <a
                              href={task.evidenceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
                            >
                              View Submission Deliverable <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Task Operations */}
                      <div className="flex justify-end gap-2 pt-2">
                        {isAssigned && (
                          <button
                            onClick={() => handleStartTask(task.id)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-205 border border-slate-200 rounded text-[10.5px] font-bold text-slate-800 cursor-pointer"
                          >
                            Start Task
                          </button>
                        )}
                        {(isAssigned || isInProgress || isOverdue) && selectedTaskId !== task.id && (
                          <button
                            onClick={() => setSelectedTaskId(task.id)}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10.5px] font-bold cursor-pointer"
                          >
                            Submit Deliverables
                          </button>
                        )}
                      </div>

                      {/* Evidence Submission Form */}
                      {selectedTaskId === task.id && (
                        <form
                          onSubmit={(e) => handleSubmitTaskEvidence(task.id, e)}
                          className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-150"
                        >
                          <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                            <p className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Submit Evidence details</p>
                            <button
                              type="button"
                              onClick={() => setSelectedTaskId(null)}
                              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Deliverable URL / Shared Drive Link</label>
                            <input
                              type="url"
                              value={evidenceUrl}
                              onChange={(e) => setEvidenceUrl(e.target.value)}
                              placeholder="https://drive.google.com/..."
                              className="w-full bg-white border border-slate-205 rounded p-1.5 text-xs text-slate-800 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Submission Notes & Explanations</label>
                            <textarea
                              value={evidenceNote}
                              onChange={(e) => setEvidenceNote(e.target.value)}
                              placeholder="Describe how this milestone was met..."
                              className="w-full bg-white border border-slate-205 rounded p-1.5 text-xs text-slate-800 focus:outline-none resize-none"
                              rows={3}
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded text-xs transition-colors"
                          >
                            Upload and Submit Task
                          </button>
                        </form>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Tab: Documents */}
        {activeTab === 'documents' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Documents Vault
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Secure storage for pitch decks, financial models, regulatory audits, and due diligence assets.
              </p>
            </div>

            {/* Document Form */}
            <form onSubmit={handleAddDocument} className="bg-slate-50 border border-slate-150 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1.5">Document Name</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Q3 Financial Projections"
                  className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1.5">Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="Pitch Deck">Pitch Deck</option>
                  <option value="Business Plan">Business Plan</option>
                  <option value="Financial Model">Financial Model</option>
                  <option value="Technical Spec">Technical Spec</option>
                  <option value="Legal">Legal</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1.5">Document File Link</label>
                <input
                  type="url"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded text-xs shadow-md transition-colors"
                >
                  Add Document
                </button>
              </div>
            </form>

            {/* List of Documents */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vault Files</p>
              
              {(() => {
                const docs = db.getDocuments(startup.id);
                if (docs.length === 0) {
                  return (
                    <div className="text-center py-8 bg-slate-50 border border-slate-150 rounded-xl">
                      <p className="text-xs font-semibold text-slate-450">No documents uploaded yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-250 text-xs">
                      <thead className="bg-slate-50 font-bold text-slate-555">
                        <tr>
                          <th className="px-4 py-3 text-left">Document Name</th>
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-left">Uploaded By</th>
                          <th className="px-4 py-3 text-left">Uploaded At</th>
                          <th className="px-4 py-3 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {docs.map(doc => (
                          <tr key={doc.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-slate-800">{doc.name}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded font-semibold text-[10px]">
                                {doc.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-555 font-medium">{doc.uploadedBy} ({doc.uploaderRole})</td>
                            <td className="px-4 py-3 text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                              >
                                View File <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab: Communication Hub */}
        {activeTab === 'communications' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                Communication Hub
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Post comments, questions, or updates in the thread linked directly to your lead mentor and incubation center manager.
              </p>
            </div>

            {/* Messages Thread Container */}
            <div className="h-[360px] overflow-y-auto border border-slate-150 bg-slate-50/30 rounded-xl p-4 space-y-4">
              {(() => {
                const msgs = db.getMessages(startup.id);
                if (msgs.length === 0) {
                  return (
                    <div className="h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                      No thread entries logged yet. Initiate discussion below.
                    </div>
                  );
                }

                // Sort oldest first for thread view
                msgs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

                return msgs.map(msg => {
                  const isSelf = msg.senderId === currentUser?.email;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${
                        isSelf ? 'ml-auto items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-baseline gap-1.5 mb-1 px-1">
                        <span className="text-[9px] font-bold text-slate-800">{msg.senderName}</span>
                        <span className="text-[8px] font-bold uppercase text-slate-400">({msg.senderRole})</span>
                        <span className="text-[8px] text-slate-400">
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className={`p-3 rounded-xl text-xs leading-relaxed shadow-sm ${
                        isSelf 
                          ? 'bg-emerald-500 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* New Message Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Post question or update to thread..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none text-slate-800"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab: Recruitment */}
        {activeTab === 'recruitment' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-500" />
                Hiring & Recruitment Command
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Post open jobs or internships to the public board, review candidate submissions, and manage shortlists.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Job Form */}
              <form onSubmit={handlePostJob} className="lg:col-span-5 bg-slate-50 border border-slate-150 p-5 rounded-xl space-y-4">
                <p className="text-[10px] font-bold text-slate-555 uppercase tracking-wider border-b border-slate-200 pb-1.5">Post New Opening</p>
                
                <div>
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Junior Backend Developer"
                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-805 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Job Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Internship">Internship</option>
                      <option value="Part Time">Part Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-455 uppercase mb-1">Stipend / Salary</label>
                    <input
                      type="text"
                      value={jobStipend}
                      onChange={(e) => setJobStipend(e.target.value)}
                      placeholder="e.g. ₹15,000 / month"
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-805 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Hiring Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={jobSkills}
                    onChange={(e) => setJobSkills(e.target.value)}
                    placeholder="React, Node.js, TypeScript"
                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-805 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={jobDeadline}
                    onChange={(e) => setJobDeadline(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Role Description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={3}
                    placeholder="Detail core responsibilities..."
                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-805 focus:outline-none resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Publish Opening
                </button>
              </form>

              {/* Right: Existing Openings & Applications */}
              <div className="lg:col-span-7 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Openings</p>
                {(() => {
                  const jobs = db.getJobPostingsByStartup(startup.id);
                  if (jobs.length === 0) {
                    return (
                      <div className="text-center py-12 bg-slate-50 border border-slate-150 rounded-xl">
                        <p className="text-xs font-bold text-slate-450">No job openings listed yet.</p>
                      </div>
                    );
                  }

                  return jobs.map(job => (
                    <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
                      <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900">{job.title}</h4>
                          <p className="text-[9px] text-slate-450 mt-1 font-bold uppercase">{job.type} • {job.stipend}</p>
                        </div>
                        <span className="text-[9px] text-slate-400">Deadline: {job.deadline}</span>
                      </div>

                      {/* Applicant applications list */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-405 uppercase tracking-wider">Applications received ({job.applications?.length || 0})</p>
                        
                        {job.applications && job.applications.length > 0 ? (
                          job.applications.map(app => (
                            <div key={app.id} className="bg-slate-50 border border-slate-150 rounded-lg p-3 text-xs space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-slate-800">{app.candidateName}</p>
                                  <p className="text-[9px] text-slate-450 font-semibold">{app.email}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  app.status === 'Shortlisted' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : app.status === 'Rejected'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {app.status}
                                </span>
                              </div>

                              <p className="text-[10px] text-slate-555">
                                <strong>Skills:</strong> {app.skills}
                              </p>

                              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/50">
                                <a 
                                  href={app.resumeUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5 text-[10px]"
                                >
                                  View Resume <ExternalLink className="w-3 h-3" />
                                </a>
                                {app.status === 'Applied' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdateApplicationStatus(job.id, app.id, 'Rejected')}
                                      className="px-2 py-1 border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 text-[9px] rounded cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => handleUpdateApplicationStatus(job.id, app.id, 'Shortlisted')}
                                      className="px-2 py-1 bg-emerald-500 text-white font-bold hover:bg-emerald-600 text-[9px] rounded cursor-pointer"
                                    >
                                      Shortlist
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">No applications received yet for this listing.</p>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Startup Metrics */}
        {activeTab === 'metrics' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Startup Metrics & Growth
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Log your monthly metrics to build your traction history for investors.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <form onSubmit={handleUpdateLiveMetrics} className="bg-slate-50 border border-slate-150 p-5 rounded-xl space-y-4">
                <p className="text-[10px] font-bold text-slate-555 uppercase tracking-wider border-b border-slate-200 pb-1.5">Log Monthly Update</p>
                <div>
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Month</label>
                  <input required type="month" value={metricMonth} onChange={e => setMetricMonth(e.target.value)} className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Revenue (INR)</label>
                    <input required type="number" min="0" value={metricRev} onChange={e => setMetricRev(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Burn Rate (INR)</label>
                    <input required type="number" min="0" value={metricBurn} onChange={e => setMetricBurn(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Active Customers / Users</label>
                  <input required type="number" min="0" value={metricCust} onChange={e => setMetricCust(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded text-xs shadow-md">
                  Save Snapshot
                </button>
              </form>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-555 uppercase tracking-wider border-b border-slate-200 pb-1.5">Current Live Metrics</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded flex flex-col justify-center">
                    <span className="text-[10px] uppercase text-emerald-700 font-bold">Revenue</span>
                    <span className="text-lg font-black text-slate-800">₹{startup?.liveMetrics?.revenue?.toLocaleString() || 0}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded flex flex-col justify-center">
                    <span className="text-[10px] uppercase text-blue-700 font-bold">Customers</span>
                    <span className="text-lg font-black text-slate-800">{startup?.liveMetrics?.activeUsers?.toLocaleString() || 0}</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded flex flex-col justify-center">
                    <span className="text-[10px] uppercase text-rose-700 font-bold">Monthly Burn</span>
                    <span className="text-lg font-black text-slate-800">₹{startup?.liveMetrics?.burnRate?.toLocaleString() || 0}</span>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 p-3 rounded flex flex-col justify-center">
                    <span className="text-[10px] uppercase text-indigo-700 font-bold">Runway</span>
                    <span className="text-lg font-black text-slate-800">{startup?.liveMetrics?.runwayMonths || 0} Months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Mentor Matching */}
        {activeTab === 'mentors' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                AI Mentor Matching
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                We've evaluated your venture health and needs assessment to recommend these domain experts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {db.getMentors().slice(0, 4).map(mentor => {
                const isRequested = requestedMentorId === mentor.id || db.getMentorMatches().some(m => m.mentorId === mentor.id);
                return (
                <div key={mentor.id} className="border border-slate-200 rounded-xl p-4 flex flex-col">
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 border border-emerald-200 text-emerald-700 font-black">
                      {mentor.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{mentor.name}</h4>
                      <p className="text-[10px] text-slate-500">{mentor.designation} at {mentor.company}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[8px] font-bold">
                          95% Match
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">{mentor.sessionsCompleted} Sessions</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600 mb-4 flex-1">
                    <strong>Expertise:</strong> {mentor.expertise.join(', ')}
                  </div>
                  <button 
                    onClick={() => handleRequestMentor(mentor.id)}
                    disabled={isRequested}
                    className={`w-full py-2 rounded text-xs font-bold transition-all ${isRequested ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer'}`}
                  >
                    {isRequested ? 'Request Pending' : 'Request Introduction'}
                  </button>
                </div>
              )})}
            </div>
          </div>
        )}

          </div>
        </div>
      </main>

      {/* Certificate Modal Overlay */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl relative p-6 sm:p-10 text-slate-900 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-55 flex items-center justify-center text-slate-450 hover:text-slate-700 transition-colors text-sm font-semibold"
            >
              ✕
            </button>

            {/* Certificate Elegant Body */}
            <div className="bg-amber-50/20 border-double border-8 border-amber-600/30 p-8 rounded-xl text-center space-y-6 select-none relative overflow-hidden">
              {/* Background watermark seal */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Award className="w-[300px] h-[300px] text-amber-900" />
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-none">RATAN TATA INNOVATION HUB</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">GOVERNMENT OF ANDHRA PRADESH</p>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-amber-900 serif border-b border-amber-600/20 pb-3 max-w-sm mx-auto">
                Milestone Capacity Certificate
              </h2>

              <div className="space-y-4 pt-2">
                <p className="text-[10px] text-slate-500 italic">This credential is officially awarded to</p>
                <h3 className="text-lg font-black text-slate-900 tracking-tight underline underline-offset-4 decoration-amber-600/40">
                  {startup.name}
                </h3>
                <p className="text-[10px] text-slate-600 leading-relaxed max-w-md mx-auto">
                  for successfully satisfying all capacity building benchmarks and validating the 
                  <strong className="text-amber-800"> "{selectedCertificate.type}" </strong> 
                  milestone under the AP Innovation OS framework.
                </p>
              </div>

              {/* Gold Seal Graphic and Signatures */}
              <div className="grid grid-cols-3 items-end pt-8 gap-4">
                {/* Sign 1 */}
                <div className="border-t border-slate-300 pt-1.5 text-left">
                  <p className="text-[8px] font-black text-slate-800 leading-none">Sri L. Premchandra Reddy, IAS</p>
                  <p className="text-[7px] text-slate-400 uppercase mt-0.5 leading-none">Governing Board Director</p>
                </div>

                {/* Gold Seal */}
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full border-4 border-amber-600/45 bg-amber-50 flex flex-col items-center justify-center shadow-md relative">
                    <span className="text-[6px] font-black text-amber-800 leading-none">APIS</span>
                    <span className="text-[5px] font-black text-slate-400 mt-0.5 uppercase tracking-tighter">Verified</span>
                  </div>
                </div>

                {/* Sign 2 */}
                <div className="border-t border-slate-300 pt-1.5 text-right">
                  <p className="text-[8px] font-black text-slate-800 leading-none">K. Lakshmi Narayana</p>
                  <p className="text-[7px] text-slate-400 uppercase mt-0.5 leading-none">Director Spoke Operations</p>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-600/10 text-[8px] text-slate-400 font-mono flex justify-between">
                <span>Certificate Ref: {selectedCertificate.id}</span>
                <span>Issued: {new Date(selectedCertificate.issuedAt).toLocaleDateString()}</span>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedCertificate(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleCertificateDownload}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Evidence Modal Overlay */}
      {selectedMilestoneId && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl relative p-6 text-slate-900 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Submit Milestone Evidence</h3>
              <button
                onClick={() => setSelectedMilestoneId(null)}
                className="text-slate-400 hover:text-slate-655 font-semibold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMilestoneEvidence} className="space-y-4 pt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Evidence Notes / Explanation
                </label>
                <textarea
                  required
                  value={milestoneEvidenceNote}
                  onChange={(e) => setMilestoneEvidenceNote(e.target.value)}
                  placeholder="Explain how this milestone was completed, what results were achieved, and details of deployment..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Evidence URL / Link (Optional)
                </label>
                <input
                  type="url"
                  value={milestoneEvidenceUrl}
                  onChange={(e) => setMilestoneEvidenceUrl(e.target.value)}
                  placeholder="https://github.com/myproject or https://drive.google.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedMilestoneId(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-55 rounded-lg text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs shadow-md cursor-pointer"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
