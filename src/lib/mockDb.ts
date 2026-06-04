// Deterministic Seeding Engine with Demo & Executive Modes for RTIH InnovationOS

import { calculateDynamicVentureHealth, generateAIHealthReport } from './engines';

export type StartupStage = 'idea' | 'validation' | 'prototype' | 'mvp' | 'users' | 'revenue' | 'funding' | 'scale';

export interface MetricSnapshot {
  id: string;
  startupId: string;
  month: string;
  revenue: number;
  customers: number;
  activeUsers: number;
  teamSize: number;
  burnRate: number;
  runwayMonths: number;
  createdAt: string;
}

export interface MentorshipGoal {
  id: string;
  mentorId: string;
  startupId: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'Pending' | 'In Progress' | 'Achieved' | 'Missed';
}

export interface ActionItem {
  id: string;
  mentorId: string;
  startupId: string;
  ownerId: string;
  title: string;
  deadline: string;
  status: 'Pending' | 'Completed';
  evidence?: string;
}

export interface MentorMatch {
  mentorId: string;
  matchScore: number;
  industryMatch: boolean;
  stageMatch: boolean;
  expertiseAlignment: string[];
}

export interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  sector: string;
  stage: StartupStage;
  district: string;
  universityId: string | null;
  logo: string;
  jobsCreated: number;
  monthlyRevenue: number; // in INR
  totalFunding: number; // in INR
  activeUsers: number;
  healthScore: number; // 0-100
  founderReputation: number; // 0-100
  unicornScore: number; // 0-100
  soonicornScore: number; // 0-100
  investmentScore: number; // 0-100
  fundingReadiness: number; // 0-100
  isRural: boolean;
  isWomenLed: boolean;
  riskLevel: 'Low' | 'Medium' | 'High';
  founders: string[]; // founder IDs
  tractionHistory: { month: string; revenue: number; users: number; jobs: number }[];
  healthBreakdown: { 
    team: number; 
    product: number; 
    market: number; 
    traction: number; 
    revenue: number; 
    mentorship: number; 
    execution: number;
    progress?: number;
    financial?: number;
    funding?: number;
    mentor?: number;
    documentation?: number;
    risk?: number;
  };
  milestones: { 
    id: string; 
    title: string; 
    description: string; 
    status: 'Completed' | 'Pending' | 'Submitted'; 
    targetDate: string;
    notes?: string;
    evidenceUrl?: string;
    submittedAt?: string;
    approvedAt?: string;
    feedback?: string;
  }[];
  healthCategory?: 'Critical' | 'At Risk' | 'Stable' | 'Healthy' | 'Excellent';
  healthHistory?: { date: string; score: number; breakdown: any }[];
  healthAlerts?: { id: string; type: string; title: string; message: string; createdAt: string; resolved: boolean }[];
  mentorAssessments?: { id: string; mentorId: string; mentorName: string; rating: number; feedback: string; createdAt: string }[];
  riskFlags?: { id: string; type: string; severity: 'Low' | 'Medium' | 'High'; description: string; resolved: boolean; createdAt: string }[];
  aiHealthReports?: { id: string; summary: string; strengths: string[]; weaknesses: string[]; recommendations: string[]; nextMilestones: string[]; expectedImprovement: number; createdAt: string }[];
  interventionLogs?: { id: string; title: string; description: string; status: 'Active' | 'Resolved'; createdAt: string }[];
  liveMetrics?: { revenue: number; monthlyGrowth: number; activeUsers: number; teamSize: number; burnRate: number; runwayMonths: number; };
  metricHistory?: MetricSnapshot[];
}

export interface Founder {
  id: string;
  name: string;
  email: string;
  avatar: string;
  startupId: string | null;
  title: string;
  bio: string;
  district: string;
  isYouth: boolean;
  isWomen: boolean;
  isRural: boolean;
  incomeBracket: string;
  firstGen: boolean;
  industry?: string;
  needsAssessment?: { product?: number; market?: number; funding?: number; tech?: number; hiring?: number; sales?: number; };
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  expertise: string[];
  designation?: string;
  company?: string;
  bio: string;
  impactScore: number;
  reputationScore: number;
  sessionsCompleted: number;
  portfolioStartups: string[]; // startup IDs
  industry?: string;
}

export interface Investor {
  id: string;
  name: string;
  firmName: string;
  email: string;
  avatar: string;
  stageFocus: string[];
  sectorFocus: string[];
  minTicket: number; // in INR
  maxTicket: number; // in INR
  investmentsCount: number;
}

export interface University {
  id: string;
  name: string;
  district: string;
  innovationCell: string;
  studentCount: number;
  startupsCount: number;
  foundersCount: number;
  innovationScore: number; // 0-100
}

export interface Outpost {
  id: string;
  name: string;
  district: string;
  leadName: string;
  incubatedCount: number;
  programsCount: number;
  mentorEngagement: number; // 0-100
  rank: number;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  startupId: string;
  scheduledAt: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes: string;
  aiSummary: string;
  actionItems: string[];
}

export interface Hackathon {
  id: string;
  title: string;
  tagline: string;
  tracks: string[];
  judges: string[]; // Mentor IDs
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Active' | 'Closed';
}

export interface HackathonRegistration {
  id: string;
  hackathonId: string;
  startupId: string;
  teamMembers: string[]; // Founder IDs
  registeredAt: string;
}

export interface HackathonSubmission {
  id: string;
  hackathonId: string;
  startupId: string;
  projectTitle: string;
  description: string;
  demoUrl: string;
  submittedAt: string;
  scores: {
    innovation: number;
    feasibility: number;
    impact: number;
    execution: number;
    judgeId: string; // Mentor ID
    comment?: string;
  }[];
  finalScore?: number;
}

export interface Certificate {
  id: string;
  certificateId: string; // RTIH-CERT-2026-XXXX
  startupId: string;
  type: 'Idea Validation' | 'MVP Ready' | 'Product-Market Fit' | 'Investment Ready' | 'Startup Leadership';
  issuedAt: string;
}

export interface InvestorWatchlist {
  id: string;
  investorId: string;
  startupIds: string[];
}

export interface FounderAssessment {
  startupId: string;
  startupIdea: string;
  sector: string;
  stage: string;
  teamSize: number;
  revenueStatus: string;
  mvpStatus: string;
  targetCustomers: string;
  problemStatement: string;
  founderExperience: string;
  readinessScore: number;
  maturityScore: number;
  learningJourney: string[];
  recommendedMentors: { name: string; matchScore: number; reason: string; focus: string }[];
  recommendedSchemes: string[];
  recommendedMilestones: string[];
  completedAt: string;
}

export interface StartupApplication {
  id: string;
  founderName: string;
  email: string;
  phone: string;
  district: string;
  background: string;
  education: string;
  startupName: string;
  tagline: string;
  sector: string;
  stage: string;
  problemStatement: string;
  solution: string;
  teamSize: number;
  coFounders: string;
  pitchDeckUrl: string;
  prototypeUrl: string;
  businessPlanUrl: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  assignedCenterId?: string;
}

export interface IncubationCenter {
  id: string;
  name: string;
  location: string;
  domains: string[];
  managerId: string;
  managerName: string;
  activeStartups: number;
  capacity: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  focusArea: string;
  createdAt: string;
}

export interface Program {
  id: string;
  departmentId: string;
  name: string;
  description: string;
  eligibleStages: string[];
  durationMonths: number;
  mentorCount: number;
  linkedStartupIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  startupId: string;
  mentorId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'Assigned' | 'In Progress' | 'Submitted' | 'Verified' | 'Overdue';
  evidenceUrl?: string;
  evidenceNote?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'application_approved' | 'application_rejected' | 'mentor_assigned' | 'task_assigned' | 'task_verified' | 'stage_promoted' | 'message_received' | 'milestone_approved' | 'review_pending';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}

export interface Message {
  id: string;
  startupId: string;
  senderId: string;
  senderName: string;
  senderRole: 'founder' | 'mentor' | 'manager' | 'admin';
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface Document {
  id: string;
  startupId: string;
  name: string;
  type: 'Pitch Deck' | 'Business Plan' | 'Financial Model' | 'Technical Spec' | 'Legal' | 'Other';
  url: string;
  uploadedBy: string;
  uploaderRole: 'founder' | 'mentor' | 'manager';
  uploadedAt: string;
  accessLevel: 'All' | 'Mentor+Manager' | 'Manager+Admin';
}

export interface AlumniStartup {
  id: string;
  startupId: string;
  name: string;
  sector: string;
  graduatedAt: string;
  journeyMonths: number;
  finalStage: string;
  achievement: string;
  currentStatus: string;
  district: string;
  founderName: string;
}

export interface IdeaPost {
  id: string;
  authorName: string;
  occupation: string;
  district: string;
  sector: string;
  problemTitle: string;
  problemDescription: string;
  postedAt: string;
  interestedCount: number;
  status: 'Open' | 'Being Solved' | 'Solved';
}

export interface CitizenProfile {
  id: string;
  name: string;
  email: string;
  occupation: string;
  interests: string[];
  skills: string[];
  district: string;
  aptitudeRole?: string;
  joinedAt: string;
}

export interface StageRecommendation {
  id: string;
  startupId: string;
  mentorId: string;
  currentStage: string;
  proposedStage: string;
  notes: string;
  evidenceUrls: string[];
  healthScore: number;
  milestoneCompletion: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  managerFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface JobPosting {
  id: string;
  startupId: string;
  title: string;
  type: 'Full Time' | 'Internship' | 'Part Time';
  description: string;
  skills: string[];
  stipend: string;
  deadline: string;
  postedAt: string;
  isActive: boolean;
  applications: {
    id: string;
    candidateName: string;
    email: string;
    skills: string;
    resumeUrl: string;
    appliedAt: string;
    status: 'Applied' | 'Shortlisted' | 'Rejected';
  }[];
}


class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  nextRange(min: number, max: number) {
    return Math.floor(min + this.next() * (max - min));
  }
  nextElement<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  nextBoolean(probability = 0.5) {
    return this.next() < probability;
  }
}

// Regional Domain Mapping for Outposts and Central Hub
export const REGIONAL_DOMAINS: Record<string, { district: string; domains: string[] }> = {
  'Visakhapatnam': {
    district: 'Visakhapatnam',
    domains: ['Medtech', 'Fintech', 'Biotech', 'Blue economy', 'Smart Infra']
  },
  'Vijayawada': {
    district: 'NTR',
    domains: ['Industrial IoT', 'Agri Technology', 'Auto-Body Building/Light Engineering', 'Construction Technology']
  },
  'Rajamahendravaram': {
    district: 'East Godavari',
    domains: ['Food Processing', 'Marine Tech', 'Aquaculture', 'Energy Transition']
  },
  'Ananthapuramu': {
    district: 'Anantapur',
    domains: ['Automotive & EV sys', 'Hybrid RE', 'Agri & Food Processing', 'Logistics-Warehousing', 'Defence & Aerospace']
  },
  'Amaravati': {
    district: 'Guntur',
    domains: ['Climate Tech', 'Blockchain', 'AVGC & XR', 'Health Care', 'Urban Systems', 'Supply Chain']
  },
  'Tirupati': {
    district: 'Tirupati',
    domains: ['Battery & Adv. Manufacturing', 'Electronics Cluster', 'Horti Tech & Diary', 'Space Tech']
  }
};

// Flatten domains list to export actual RTIH sectors
export const SECTORS = Object.values(REGIONAL_DOMAINS).flatMap(x => x.domains);

export const DISTRICTS = [
  'Visakhapatnam',
  'NTR',
  'East Godavari',
  'Tirupati',
  'Anantapur',
  'Guntur',
  'Krishna',
  'Kurnool',
  'Sri Potti Sriramulu Nellore',
  'Prakasam',
  'Vizianagaram',
  'Srikakulam',
  'YSR Kadapa',
  'West Godavari',
  'Chittoor',
  'Kakinada',
  'Palnadu',
  'Eluru'
];

// High-fidelity local startup names based on AP context
const PREMIUM_STARTUPS = [
  { name: 'Kalyan AgriSystems', sector: 'Agri Technology', tag: 'IoT soil diagnostic probes and automated drone spraying links.' },
  { name: 'Vizaq NeuroTech', sector: 'Medtech', tag: 'Edge AI diagnostic toolkits for local clinics and neurologists.' },
  { name: 'Rayalaseema Solars', sector: 'Energy Transition', tag: 'Micro-inverter arrays for off-grid rural power grids.' },
  { name: 'Amaravati FinPay', sector: 'Fintech', tag: 'UPI-linked crop-collateralized seed credit algorithms.' },
  { name: 'Nellore ShrimpTech', sector: 'Blue economy', tag: 'Satellite telemetry water quality checkers for aquaculture.' },
  { name: 'Tirupati BioLabs', sector: 'Biotech', tag: 'Enzyme-based natural plant defense formulations.' },
  { name: 'Godavari EcoFuels', sector: 'Climate Tech', tag: 'Bio-refinery mapping models transforming crop waste into clean fuels.' },
  { name: 'Krishna AdvancedForge', sector: 'Battery & Adv. Manufacturing', tag: 'Additive metal printing nodes for heavy industrial axles.' },
  { name: 'Indo SmartGrid', sector: 'Smart Infra', tag: 'Mesh topology power routing controls for municipal lights.' },
  { name: 'Kakinada OceanSensors', sector: 'Marine Tech', tag: 'Sonar-guided fish migration predictors for coastal trawlers.' }
];

const STARTUP_PREFIX = ['Tejas', 'Vijay', 'Bharat', 'Kalyan', 'Veda', 'Pragati', 'Ganga', 'Dakshin', 'Vyom', 'Sankalp'];
const STARTUP_SUFFIX = ['Systems', 'Analytics', 'Robotics', 'Space', 'Dynamics', 'Digital', 'Solutions', 'Genetics', 'Power'];

const FIRST_NAMES = ['Ramesh', 'Suresh', 'Venkatesh', 'Kalyani', 'Radha', 'Srinivas', 'Satish', 'Sai', 'Divya', 'Pavan', 'Chandra', 'Madhav', 'Lakshmi', 'Anirudh'];
const LAST_NAMES = ['Koppula', 'Yalamanchili', 'Bhimavarapu', 'Koneru', 'Devineni', 'Galla', 'Palla', 'Jasti', 'Katragadda', 'Sunkara', 'Mylavarapu'];

const UNIVERSITIES_MAP = [
  { name: 'JNTU Kakinada', district: 'Kakinada' },
  { name: 'Andhra University', district: 'Visakhapatnam' },
  { name: 'Acharya Nagarjuna University', district: 'Guntur' },
  { name: 'Sri Venkateswara University', district: 'Tirupati' },
  { name: 'NIT Andhra Pradesh', district: 'West Godavari' },
  { name: 'SRM AP University', district: 'Palnadu' },
  { name: 'VIT AP University', district: 'Guntur' },
  { name: 'KL University', district: 'Guntur' },
  { name: 'GITAM University', district: 'Visakhapatnam' },
  { name: 'Adikavi Nannaya University', district: 'East Godavari' },
  { name: 'RGUKT Nuzvid', district: 'Eluru' },
  { name: 'RGUKT RK Valley', district: 'YSR Kadapa' },
  { name: 'IIIT Sri City', district: 'Tirupati' }
];

export const SPOKES = [
  { name: 'Visakhapatnam', district: 'Visakhapatnam', lead: 'Dr. Srinivas Prasad' },
  { name: 'Vijayawada', district: 'NTR', lead: 'G. Rama Chandra Murthy' },
  { name: 'Rajamahendravaram', district: 'East Godavari', lead: 'K. Lakshmi Narayana' },
  { name: 'Tirupati', district: 'Tirupati', lead: 'Prof. S. R. Venkat Raman' },
  { name: 'Ananthapuramu', district: 'Anantapur', lead: 'B. R. K. Prasad' }
];

function generateInitialData(demoMode = false): {
  startups: Startup[];
  founders: Founder[];
  mentors: Mentor[];
  investors: Investor[];
  universities: University[];
  outposts: Outpost[];
  sessions: MentorSession[];
  hackathons: Hackathon[];
  registrations: HackathonRegistration[];
  submissions: HackathonSubmission[];
  certifications: Certificate[];
  watchlists: InvestorWatchlist[];
  assessments: FounderAssessment[];
  applications: StartupApplication[];
  incubationCenters: IncubationCenter[];
  departments: Department[];
  programs: Program[];
  tasks: Task[];
  notifications: Notification[];
  messages: Message[];
  documents: Document[];
  alumniStartups: AlumniStartup[];
  ideaPosts: IdeaPost[];
  citizenProfiles: CitizenProfile[];
  stageRecommendations: StageRecommendation[];
  jobPostings: JobPosting[];
  mentorshipGoals: MentorshipGoal[];
  actionItems: ActionItem[];
  mentorMatches: MentorMatch[];
} {

  const rng = new SeededRandom(101); // deterministic seed

  // Helper to generate 6 months of health history
  const generateHealthHistory = (baseScore: number, trend: 'up' | 'down' | 'stable' | 'volatile') => {
    const dates = ['2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01', '2026-06-01'];
    return dates.map((date, idx) => {
      let variance = 0;
      if (trend === 'up') variance = (idx - 5) * 3; // rises to baseScore
      else if (trend === 'down') variance = (5 - idx) * 3; // falls to baseScore
      else if (trend === 'volatile') variance = Math.sin(idx) * 6;
      else variance = (rng.next() - 0.5) * 4;
      const score = Math.max(10, Math.min(100, Math.floor(baseScore + variance)));
      return {
        date,
        score,
        breakdown: {
          progress: Math.max(0, Math.min(100, Math.floor(score * 0.95))),
          product: Math.max(0, Math.min(100, Math.floor(score * 0.90))),
          team: Math.max(0, Math.min(100, Math.floor(score * 1.02))),
          market: Math.max(0, Math.min(100, Math.floor(score * 0.88))),
          financial: Math.max(0, Math.min(100, Math.floor(score * 0.92))),
          funding: Math.max(0, Math.min(100, Math.floor(score * 0.85))),
          mentor: Math.max(0, Math.min(100, Math.floor(score * 1.05))),
          documentation: Math.max(0, Math.min(100, Math.floor(score * 0.98))),
          risk: Math.max(0, Math.min(100, Math.floor(score * 0.94)))
        }
      };
    });
  };

  // 1. Generate Universities
  const universities: University[] = UNIVERSITIES_MAP.map((uni, idx) => {
    return {
      id: `univ-${idx + 1}`,
      name: uni.name,
      district: uni.district,
      innovationCell: `${uni.name} Innovation Cell`,
      studentCount: rng.nextRange(8000, 25000),
      startupsCount: 0,
      foundersCount: 0,
      innovationScore: demoMode ? rng.nextRange(82, 98) : rng.nextRange(65, 95)
    };
  });

  // 2. Generate Outposts
  const outposts: Outpost[] = SPOKES.map((spoke, idx) => {
    return {
      id: `spoke-${idx + 1}`,
      name: spoke.name,
      district: spoke.district,
      leadName: spoke.lead,
      incubatedCount: 0,
      programsCount: demoMode ? rng.nextRange(25, 60) : rng.nextRange(10, 35),
      mentorEngagement: demoMode ? rng.nextRange(85, 98) : rng.nextRange(70, 92),
      rank: idx + 1
    };
  });

  // 3. Generate Founders
  const founders: Founder[] = [];
  const generatedFounderNames = new Set<string>();

  // Inject 3 hand-crafted presentation founders
  const demoFounders: Founder[] = [
    {
      id: 'founder-1',
      name: 'Hari Prasad Ananth',
      email: 'hari.prasad@rtihfounder.in',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HariPrasad',
      startupId: 'startup-1',
      title: 'Founder & CEO',
      bio: 'Automotive hardware innovator from Ananthapuramu. B.Tech graduate from JNTU Anantapur. Passionate about scaling localized EV solutions for rural logistics.',
      district: 'Anantapur',
      isYouth: true,
      isWomen: false,
      isRural: true,
      incomeBracket: '2-5 LPA',
      firstGen: true
    },
    {
      id: 'founder-2',
      name: 'Kalyani Devineni',
      email: 'kalyani.d@rtihfounder.in',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kalyani',
      startupId: 'startup-2',
      title: 'Founder & CEO',
      bio: 'Marine biologist and startup founder from East Godavari. Focused on developing low-cost telemetry nodes for AP aquaculture cooperatives.',
      district: 'East Godavari',
      isYouth: true,
      isWomen: true,
      isRural: true,
      incomeBracket: '5-10 LPA',
      firstGen: true
    },
    {
      id: 'founder-3',
      name: 'Dr. Srinivas Koppula',
      email: 'srinivas.koppula@rtihfounder.in',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SrinivasK',
      startupId: 'startup-3',
      title: 'Founder & CEO',
      bio: 'Former senior research scientist. Developed clinical-grade portable ECG and triage devices deployed across Visakhapatnam clinics.',
      district: 'Visakhapatnam',
      isYouth: false,
      isWomen: false,
      isRural: false,
      incomeBracket: '> 10 LPA',
      firstGen: false
    }
  ];

  demoFounders.forEach(f => {
    founders.push(f);
    generatedFounderNames.add(f.name);
  });

  for (let i = 3; i < 250; i++) {
    let name = `${rng.nextElement(FIRST_NAMES)} ${rng.nextElement(LAST_NAMES)}`;
    let attempts = 0;
    while (generatedFounderNames.has(name) && attempts < 10) {
      name = `${rng.nextElement(FIRST_NAMES)} ${rng.nextElement(LAST_NAMES)}`;
      attempts++;
    }
    if (generatedFounderNames.has(name)) {
      name = `${name} ${i}`;
    }
    generatedFounderNames.add(name);

    const isWomen = rng.nextBoolean(0.35); // 35% women led
    const isRural = rng.nextBoolean(0.42); // 42% rural
    const isYouth = rng.nextBoolean(0.80); // 80% youth
    const district = rng.nextElement(DISTRICTS);

    const background = rng.nextElement([
      `IIT Tirupati computer science graduate`,
      `former Tata Group research engineer`,
      `AP Agritech Scholar`,
      `Stanford biotech research associate`
    ]);

    founders.push({
      id: `founder-${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@rtihfounder.in`,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
      startupId: null,
      title: rng.nextElement(['Founder & CEO', 'Co-Founder & CTO', 'Co-Founder & COO']),
      bio: `${background}. Focused on leveraging deep-tech tools in ${district} to build scalable solutions for AP and global markets.`,
      district,
      isYouth,
      isWomen,
      isRural,
      incomeBracket: rng.nextElement(['< 2 LPA', '2-5 LPA', '5-10 LPA', '> 10 LPA']),
      firstGen: rng.nextBoolean(0.65)
    });
  }

  // 4. Generate Startups
  const startups: Startup[] = [];
  const generatedStartupNames = new Set<string>();
  const stages: StartupStage[] = ['idea', 'validation', 'prototype', 'mvp', 'users', 'revenue', 'funding', 'scale'];

  for (let i = 0; i < 100; i++) {
    const startupId = `startup-${i + 1}`;
    let name = '';
    let tagline = '';
    let description = '';
    let sector = '';
    let stage: StartupStage = 'idea';
    let district = '';
    let univ = rng.nextBoolean(0.70) ? rng.nextElement(universities) : null;
    let isRural = false;
    let isWomenLed = false;
    let monthlyRevenue = 0;
    let totalFunding = 0;
    let activeUsers = 0;
    let jobsCreated = 0;
    let healthScore = 70;
    let founderReputation = 70;
    let unicornScore = 10;
    let soonicornScore = 15;
    let investmentScore = 30;
    let fundingReadiness = 30;
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Medium';
    let assignedFounders: string[] = [];
    let tractionHistory: { month: string; revenue: number; users: number; jobs: number }[] = [];
    let milestones: { 
      id: string; 
      title: string; 
      description: string; 
      status: 'Completed' | 'Pending' | 'Submitted'; 
      targetDate: string;
      notes?: string;
      evidenceUrl?: string;
      submittedAt?: string;
      approvedAt?: string;
      feedback?: string;
    }[] = [];
    let healthBreakdown = { team: 70, product: 70, market: 70, traction: 70, revenue: 70, mentorship: 70, execution: 70 };

    if (i === 0) {
      // Hari Prasad Ananth - Rayalaseema EV-Drive (Ideation-only)
      name = 'Rayalaseema EV-Drive';
      tagline = 'Modular EV conversions and swappable drivetrains for rural transport. Incubated in Ananthapuramu.';
      description = 'Modular EV conversions and swappable drivetrains for rural transport. Incubated in Ananthapuramu.';
      sector = 'Automotive & EV sys';
      stage = 'idea';
      district = 'Anantapur';
      isRural = true;
      isWomenLed = false;
      monthlyRevenue = 0;
      totalFunding = 0;
      activeUsers = 0;
      jobsCreated = 2;
      healthScore = 63;
      founderReputation = 55;
      unicornScore = 5;
      soonicornScore = 8;
      investmentScore = 20;
      fundingReadiness = 25;
      riskLevel = 'Medium';
      assignedFounders = ['founder-1'];
      healthBreakdown = { team: 85, product: 40, market: 70, traction: 15, revenue: 0, mentorship: 90, execution: 50 };
      milestones = [
        { id: `milestone-${i}-1`, title: 'Formulate battery pack housing specs', description: 'Determine dimensions for regional auto-rickshaws conversions.', status: 'Pending', targetDate: '2026-06-30' },
        { id: `milestone-${i}-2`, title: 'Apply for AP Innovation Grant', description: 'Submit EV conversions proof-of-concept design sheets.', status: 'Pending', targetDate: '2026-07-15' },
        { id: `milestone-${i}-3`, title: 'Establish JNTU incubation lab access', description: 'Acquire official workspace and testing bench clearance.', status: 'Pending', targetDate: '2026-08-01' }
      ];
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      tractionHistory = months.map(month => ({
        month,
        revenue: 0,
        users: 0,
        jobs: 2
      }));
    } else if (i === 1) {
      // Kalyani Devineni - Godavari MarineTech (Middle/MVP Stage)
      name = 'Godavari MarineTech';
      tagline = 'Low-cost smart telemetry probes and sonar arrays for delta region aquaculture.';
      sector = 'Marine Tech';
      stage = 'mvp';
      district = 'East Godavari';
      isRural = true;
      isWomenLed = true;
      monthlyRevenue = 120000;
      totalFunding = 1500000;
      activeUsers = 3200;
      jobsCreated = 8;
      healthScore = 82;
      founderReputation = 78;
      unicornScore = 15;
      soonicornScore = 45;
      investmentScore = 68;
      fundingReadiness = 72;
      riskLevel = 'Low';
      assignedFounders = ['founder-2'];
      healthBreakdown = { team: 88, product: 82, market: 85, traction: 78, revenue: 65, mentorship: 92, execution: 84 };
      milestones = [
        { id: `milestone-${i}-1`, title: 'Verify field telemetry nodes in freshwater test', description: 'Calibrate water salinity and temp algorithms across 7 days.', status: 'Completed', targetDate: '2026-03-20' },
        { id: `milestone-${i}-2`, title: 'Submit stage promotion evaluation', description: 'Provide customer discovery notes and verification to Spoke Manager.', status: 'Completed', targetDate: '2026-06-02' },
        { id: `milestone-${i}-3`, title: 'Onboard 50 aquaculture cooperatives', description: 'Deploy telemetry probes to Godavari delta farming communities.', status: 'Pending', targetDate: '2026-09-15' }
      ];

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const revs = [20000, 45000, 70000, 90000, 105000, 120000];
      const usrs = [400, 900, 1500, 2200, 2800, 3200];
      const jbs = [4, 5, 6, 7, 8, 8];
      
      tractionHistory = months.map((m, idx) => ({
        month: m,
        revenue: revs[idx],
        users: usrs[idx],
        jobs: jbs[idx]
      }));
    } else if (i === 2) {
      // Dr. Srinivas Koppula - Vizag MedTech Solutions (Scale / Fully Funded)
      name = 'Vizag MedTech Solutions';
      tagline = 'Clinical-grade portable screening devices and cloud diagnostics for clinics.';
      sector = 'Medtech';
      stage = 'scale';
      district = 'Visakhapatnam';
      isRural = false;
      isWomenLed = false;
      monthlyRevenue = 1850000;
      totalFunding = 35000000;
      activeUsers = 125000;
      jobsCreated = 45;
      healthScore = 94;
      founderReputation = 95;
      unicornScore = 88;
      soonicornScore = 94;
      investmentScore = 96;
      fundingReadiness = 98;
      riskLevel = 'Low';
      assignedFounders = ['founder-3'];
      healthBreakdown = { team: 95, product: 94, market: 96, traction: 92, revenue: 95, mentorship: 98, execution: 94 };
      milestones = [
        { id: `milestone-${i}-1`, title: 'Secure ISO 13485 medical device clearance', description: 'Pass audit for clinical diagnostics sensor array.', status: 'Completed', targetDate: '2026-02-10' },
        { id: `milestone-${i}-2`, title: 'Complete Series A fundraising round', description: 'Raise 3.5 Crore INR from Amaravati Ventures & Andhra Angels.', status: 'Completed', targetDate: '2026-05-15' },
        { id: `milestone-${i}-3`, title: 'Scale clinic deployments to 5 districts', description: 'Onboard 120 secondary clinics across coastal AP.', status: 'Pending', targetDate: '2026-11-20' }
      ];

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const revs = [800000, 1050000, 1300000, 1550000, 1720000, 1850000];
      const usrs = [45000, 60000, 80000, 95000, 112000, 125000];
      const jbs = [28, 32, 36, 40, 45, 45];
      
      tractionHistory = months.map((m, idx) => ({
        month: m,
        revenue: revs[idx],
        users: usrs[idx],
        jobs: jbs[idx]
      }));
    } else {
      // Dynamic generation of remaining 97 startups
      // Match their district and sector to outpost regions
      const regionNames = Object.keys(REGIONAL_DOMAINS);
      const chosenRegion = rng.nextElement(regionNames);
      const regionData = REGIONAL_DOMAINS[chosenRegion];
      
      district = regionData.district;
      sector = rng.nextElement(regionData.domains);

      if (i < PREMIUM_STARTUPS.length) {
        // Use premium startup template but keep correct sector and district
        name = PREMIUM_STARTUPS[i].name;
        tagline = PREMIUM_STARTUPS[i].tag;
      } else {
        name = `${rng.nextElement(STARTUP_PREFIX)} ${rng.nextElement(STARTUP_SUFFIX)}`;
        let attempts = 0;
        while (generatedStartupNames.has(name) && attempts < 10) {
          name = `${rng.nextElement(STARTUP_PREFIX)} ${rng.nextElement(STARTUP_SUFFIX)}`;
          attempts++;
        }
        if (generatedStartupNames.has(name)) {
          name = `${name} ${i}`;
        }
        tagline = `Pioneering scalable technological frameworks in ${sector} out of ${chosenRegion}.`;
      }

      stage = rng.nextElement(stages);
      if (demoMode) {
        stage = rng.nextElement(['mvp', 'users', 'revenue', 'funding', 'scale']);
      }

      isRural = rng.nextBoolean(0.38);
      isWomenLed = rng.nextBoolean(0.30);
      jobsCreated = rng.nextRange(2, 6);

      if (stage === 'mvp') {
        activeUsers = rng.nextRange(500, 2000);
        jobsCreated = rng.nextRange(4, 12);
      } else if (stage === 'users') {
        activeUsers = rng.nextRange(2000, 15000);
        jobsCreated = rng.nextRange(6, 18);
      } else if (stage === 'revenue') {
        activeUsers = rng.nextRange(8000, 40000);
        monthlyRevenue = demoMode ? rng.nextRange(150000, 800000) : rng.nextRange(50000, 450000);
        jobsCreated = rng.nextRange(10, 30);
      } else if (stage === 'funding') {
        activeUsers = rng.nextRange(15000, 150000);
        monthlyRevenue = demoMode ? rng.nextRange(300000, 2000000) : rng.nextRange(150000, 1000000);
        totalFunding = demoMode ? rng.nextRange(4000000, 35000000) : rng.nextRange(1500000, 15000000);
        jobsCreated = rng.nextRange(15, 60);
      } else if (stage === 'scale') {
        activeUsers = rng.nextRange(80000, 800000);
        monthlyRevenue = demoMode ? rng.nextRange(2000000, 8000000) : rng.nextRange(800000, 4000000);
        totalFunding = demoMode ? rng.nextRange(25000000, 150000000) : rng.nextRange(8000000, 80000000);
        jobsCreated = rng.nextRange(30, 150);
      }

      healthBreakdown = {
        team: demoMode ? rng.nextRange(75, 98) : rng.nextRange(60, 95),
        product: demoMode ? rng.nextRange(72, 98) : rng.nextRange(55, 94),
        market: demoMode ? rng.nextRange(80, 99) : rng.nextRange(65, 97),
        traction: demoMode ? rng.nextRange(65, 98) : rng.nextRange(40, 92),
        revenue: stage === 'idea' || stage === 'validation' ? 0 : (demoMode ? rng.nextRange(70, 98) : rng.nextRange(40, 90)),
        mentorship: demoMode ? rng.nextRange(82, 99) : rng.nextRange(70, 95),
        execution: demoMode ? rng.nextRange(78, 98) : rng.nextRange(60, 95)
      };

      healthScore = Math.floor(
        (healthBreakdown.team +
          healthBreakdown.product +
          healthBreakdown.market +
          healthBreakdown.traction +
          healthBreakdown.revenue +
          healthBreakdown.mentorship +
          healthBreakdown.execution) /
          7
      );

      founderReputation = demoMode ? rng.nextRange(75, 99) : rng.nextRange(50, 96);
      unicornScore = stage === 'scale' || stage === 'funding' ? (demoMode ? rng.nextRange(75, 98) : rng.nextRange(60, 90)) : rng.nextRange(15, 55);
      soonicornScore = stage === 'revenue' || stage === 'funding' ? (demoMode ? rng.nextRange(80, 98) : rng.nextRange(65, 92)) : rng.nextRange(20, 65);
      investmentScore = demoMode ? rng.nextRange(70, 98) : rng.nextRange(40, 92);
      fundingReadiness = demoMode ? rng.nextRange(75, 99) : rng.nextRange(40, 94);
      riskLevel = demoMode ? 'Low' : (rng.nextElement(['Low', 'Low', 'Medium', 'High']) as 'Low' | 'Medium' | 'High');

      // Generate traction with dynamic variance patterns
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const growthPattern = rng.nextElement(['steady', 'exponential', 'volatile', 'flat']);
      
      tractionHistory = months.map((month, idx) => {
        let multiplier = 1.0;
        
        switch (growthPattern) {
          case 'exponential':
            multiplier = 0.5 + Math.pow(idx, 2) * 0.25; // sharp hockey-stick
            break;
          case 'steady':
            multiplier = 0.7 + idx * 0.15; // smooth upward line
            break;
          case 'volatile':
            // cyclical wave with noise
            const wave = Math.sin(idx * 1.5) * 0.25;
            const noise = (rng.next() - 0.5) * 0.15;
            multiplier = 0.85 + wave + noise;
            break;
          case 'flat':
          default:
            multiplier = 0.95 + (rng.next() - 0.5) * 0.1; // flat
            break;
        }
        
        multiplier = Math.max(0.1, multiplier);

        return {
          month,
          revenue: Math.floor(monthlyRevenue * multiplier),
          users: Math.floor(activeUsers * multiplier),
          jobs: Math.floor(jobsCreated * (0.85 + idx * 0.04 + (rng.next() - 0.5) * 0.05))
        };
      });

      milestones = [
        {
          id: `milestone-${i}-1`,
          title: 'Launch MVP and onboarding pilot users',
          description: 'Publish code to staging, distribute links to closed beta group, collect initial telemetry.',
          status: stage === 'idea' || stage === 'validation' ? 'Pending' : 'Completed',
          targetDate: '2026-03-15'
        },
        {
          id: `milestone-${i}-2`,
          title: 'Submit RTIH Seed Fund Application',
          description: 'Complete financials, pitch video, compliance checklist and submit via Command Center.',
          status: demoMode ? 'Completed' : (rng.nextElement(['Completed', 'Pending']) as 'Completed' | 'Pending'),
          targetDate: '2026-06-30'
        },
        {
          id: `milestone-${i}-3`,
          title: 'Formulate Go-To-Market and Corporate Partnerships',
          description: 'Interface with RTIH corporate advisors to initiate a PoC integration.',
          status: 'Pending',
          targetDate: '2026-09-10'
        }
      ];

      // Assign background founders wrapped to exclude first 3 demo founders
      const startFounderIdx = 3 + (i - 3) * 2;
      for (let f = 0; f < rng.nextRange(2, 4); f++) {
        const founderIdx = 3 + ((startFounderIdx - 3 + f) % (founders.length - 3));
        founders[founderIdx].startupId = startupId;
        founders[founderIdx].isWomen = isWomenLed;
        founders[founderIdx].isRural = isRural;
        assignedFounders.push(founders[founderIdx].id);
      }
    }

    generatedStartupNames.add(name);

    if (univ) {
      const uniObj = universities.find(u => u.id === univ.id);
      if (uniObj) {
        uniObj.startupsCount += 1;
        uniObj.foundersCount += assignedFounders.length;
      }
    }

    const outpost = outposts.find(o => o.district === district) || rng.nextElement(outposts);
    outpost.incubatedCount += 1;

    const category = healthScore < 50 ? 'Critical' : healthScore < 60 ? 'At Risk' : healthScore < 75 ? 'Stable' : healthScore < 90 ? 'Healthy' : 'Excellent';
    
    // Generate history
    let trend: 'up' | 'down' | 'stable' | 'volatile' = 'stable';
    if (i === 1 || i === 2) trend = 'up';
    else if (healthScore < 60) trend = 'down';
    else if (healthScore > 85) trend = 'up';
    const history = generateHealthHistory(healthScore, trend);

    // Generate alerts
    const alerts = [];
    if (healthScore < 60) {
      alerts.push({
        id: `alert-${startupId}-1`,
        type: 'critical_health',
        title: 'Critical Health Score Alert',
        message: `${name} health score is ${healthScore}, falling below the 60 threshold. Immediate intervention requested.`,
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        resolved: false
      });
    }

    // Generate assessments
    const assessments = [];
    const mentorName = i === 0 ? 'Ananthapuramu Mentor 1' : i === 1 ? 'Rajamahendravaram Mentor 2' : 'Vizag Mentor 1';
    assessments.push({
      id: `ass-${startupId}-1`,
      mentorId: `mentor-${(i % 12) + 1}`,
      mentorName,
      rating: healthScore > 85 ? 5 : healthScore > 65 ? 4 : 3,
      feedback: healthScore > 85 
        ? 'Excellent progress on product roadmap and strong engagement in all mentor check-ins.' 
        : 'Solid foundation, but the team needs to accelerate their user validation and document uploads.',
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    });

    // Generate risk flags
    const riskFlags = [];
    if (healthScore < 60) {
      riskFlags.push({
        id: `risk-${startupId}-1`,
        type: 'Inactivity',
        severity: 'High' as 'High',
        description: 'No progress updates or milestone submissions in the last 30 days.',
        resolved: false,
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      });
    }

    // Generate AI report
    const aiHealthReports = [{
      id: `rep-${startupId}-1`,
      summary: `Overall venture health is currently graded as ${category.toUpperCase()}. Key areas of attention include ${healthScore < 60 ? 'milestone completion and financial runway tracking' : 'maintaining the current growth velocity'}.`,
      strengths: healthScore > 75 
        ? ['Active mentor engagement', 'Consistent traction growth', 'Excellent milestone execution'] 
        : ['Strong core team', 'Clear problem statement validation'],
      weaknesses: healthScore < 75 
        ? ['Incomplete compliance documentation in Vault', 'Slow validation cycle response time'] 
        : ['Requires capital runway optimization for subsequent stages'],
      recommendations: healthScore < 75 
        ? ['Upload missing pitch deck and financial model immediately', 'Schedule a progress audit with lead mentor'] 
        : ['Prepare Series A data room materials', 'Initiate pilot scaling in neighbouring districts'],
      nextMilestones: ['Complete Pitch Deck draft', 'Conduct 10 validation surveys'],
      expectedImprovement: 12,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    }];

    // Generate intervention log
    const interventionLogs = [];
    if (healthScore < 60) {
      interventionLogs.push({
        id: `int-${startupId}-1`,
        title: 'Mentor Audit Scheduled',
        description: `Automated alert triggered review. Meeting scheduled with mentor ${mentorName} to create Action Plan.`,
        status: 'Active' as 'Active',
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      });
    }

    startups.push({
      id: startupId,
      name,
      tagline,
      description: description || `Developing standard-compliant tech solutions. Working directly with regional innovation centers and local outposts in AP to solve key challenges in ${sector}.`,
      sector,
      stage,
      district,
      universityId: univ ? univ.id : null,
      logo: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      jobsCreated,
      monthlyRevenue,
      totalFunding,
      activeUsers,
      healthScore,
      founderReputation,
      unicornScore,
      soonicornScore,
      investmentScore,
      fundingReadiness,
      isRural,
      isWomenLed,
      riskLevel,
      founders: assignedFounders,
      tractionHistory,
      healthBreakdown: {
        ...healthBreakdown,
        progress: Math.max(0, Math.min(100, Math.floor(healthScore * 0.95))),
        product: Math.max(0, Math.min(100, Math.floor(healthScore * 0.90))),
        team: Math.max(0, Math.min(100, Math.floor(healthScore * 1.02))),
        market: Math.max(0, Math.min(100, Math.floor(healthScore * 0.88))),
        financial: Math.max(0, Math.min(100, Math.floor(healthScore * 0.92))),
        funding: Math.max(0, Math.min(100, Math.floor(healthScore * 0.85))),
        mentor: Math.max(0, Math.min(100, Math.floor(healthScore * 1.05))),
        documentation: Math.max(0, Math.min(100, Math.floor(healthScore * 0.98))),
        risk: Math.max(0, Math.min(100, Math.floor(healthScore * 0.94)))
      },
      milestones,
      healthCategory: category,
      healthHistory: history,
      healthAlerts: alerts,
      mentorAssessments: assessments,
      riskFlags,
      aiHealthReports,
      interventionLogs
    });
  }

  // 5. Generate Mentors
  const mentors: Mentor[] = [];
  const generatedMentorNames = new Set<string>();

  const cityMentors = [
    { name: 'Dr. A. Srinivas Rao', district: 'Visakhapatnam', email: 'vizag.mentor1@rtihmentor.in', expertise: ['Medtech', 'Blue economy'] },
    { name: 'Prof. G. Veerraju', district: 'Visakhapatnam', email: 'vizag.mentor2@rtihmentor.in', expertise: ['Biotech', 'Fintech'] },
    { name: 'Dr. M. Sridhar', district: 'NTR', email: 'vijayawada.mentor1@rtihmentor.in', expertise: ['Industrial IoT', 'Construction Technology'] },
    { name: 'Smt. K. Rama Devi', district: 'Krishna', email: 'vijayawada.mentor2@rtihmentor.in', expertise: ['Agri Technology', 'Auto-Body Building/Light Engineering'] },
    { name: 'Sri P. Venkateswara Rao', district: 'East Godavari', email: 'rajamundry.mentor1@rtihmentor.in', expertise: ['Food Processing', 'Energy Transition'] },
    { name: 'Dr. N. Mangadevi', district: 'East Godavari', email: 'rajamundry.mentor2@rtihmentor.in', expertise: ['Aquaculture', 'Marine Tech'] },
    { name: 'Prof. K. Hemachandra Reddy', district: 'Anantapur', email: 'ananthapuramu.mentor1@rtihmentor.in', expertise: ['Automotive & EV sys', 'Logistics-Warehousing'] },
    { name: 'Dr. C. R. Giridhar', district: 'Anantapur', email: 'ananthapuramu.mentor2@rtihmentor.in', expertise: ['Hybrid RE', 'Agri & Food Processing'] },
    { name: 'Sri J. A. Chowdary', district: 'Guntur', email: 'amaravati.mentor1@rtihmentor.in', expertise: ['Climate Tech', 'Blockchain'] },
    { name: 'Dr. T. Lasya', district: 'Guntur', email: 'amaravati.mentor2@rtihmentor.in', expertise: ['AVGC & XR', 'Health Care'] },
    { name: 'Prof. S. R. S. Prasanna', district: 'Tirupati', email: 'tirupati.mentor1@rtihmentor.in', expertise: ['Battery & Adv. Manufacturing', 'Space Tech'] },
    { name: 'Dr. V. R. K. Prasad', district: 'Tirupati', email: 'tirupati.mentor2@rtihmentor.in', expertise: ['Electronics Cluster', 'Horti Tech & Diary'] }
  ];

  // Prepend city-specific mentors
  cityMentors.forEach((cm, index) => {
    const districtStartups = startups.filter(s => s.district === cm.district);
    const portStartups: string[] = [];
    const pool = districtStartups.length > 0 ? districtStartups : startups;
    
    // Select 2 to 4 unique random startups from the pool
    const selectedIndices = new Set<number>();
    const limit = Math.min(pool.length, rng.nextRange(2, 5));
    while (selectedIndices.size < limit) {
      selectedIndices.add(rng.nextRange(0, pool.length));
    }
    selectedIndices.forEach(idx => {
      portStartups.push(pool[idx].id);
    });

    mentors.push({
      id: `mentor-${index + 1}`,
      name: cm.name,
      email: cm.email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cm.name.replace(/\s+/g, '')}`,
      expertise: cm.expertise,
      bio: `RTIH Hub-Certified Mentor based in ${cm.district}. Specializes in ${cm.expertise.join(' & ')} to guide regional startups.`,
      impactScore: rng.nextRange(85, 98),
      reputationScore: rng.nextRange(80, 98),
      sessionsCompleted: rng.nextRange(15, 45),
      portfolioStartups: portStartups
    });
    generatedMentorNames.add(cm.name);
  });

  // Generate remaining mentors
  for (let i = 12; i < 80; i++) {
    let name = `Prof. ${rng.nextElement(FIRST_NAMES)} ${rng.nextElement(LAST_NAMES)}`;
    if (rng.nextBoolean(0.45)) name = `Dr. ${rng.nextElement(FIRST_NAMES)} ${rng.nextElement(LAST_NAMES)}`;

    let attempts = 0;
    while (generatedMentorNames.has(name) && attempts < 10) {
      name = `${rng.nextElement(FIRST_NAMES)} ${rng.nextElement(LAST_NAMES)}`;
      attempts++;
    }
    if (generatedMentorNames.has(name)) {
      name = `${name} ${i}`;
    }
    generatedMentorNames.add(name);

    const expertise = [rng.nextElement(SECTORS), rng.nextElement(SECTORS)];
    const portStartups: string[] = [];
    for (let s = 0; s < rng.nextRange(2, 5); s++) {
      portStartups.push(rng.nextElement(startups).id);
    }

    mentors.push({
      id: `mentor-${i + 1}`,
      name,
      email: `${name.toLowerCase().replace('prof. ', 'prof.').replace('dr. ', 'dr.').replace(/\s+/g, '.')}@rtihmentor.in`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name.replace(/\s+/g, '')}`,
      expertise,
      bio: `Ecosystem veteran and research advisor with 15+ years experience in ${expertise.join(', ')}. Specialize in scaling early-stage ventures.`,
      impactScore: demoMode ? rng.nextRange(82, 99) : rng.nextRange(70, 95),
      reputationScore: demoMode ? rng.nextRange(80, 98) : rng.nextRange(65, 93),
      sessionsCompleted: rng.nextRange(20, 65),
      portfolioStartups: portStartups
    });
  }

  // 6. Generate Investors
  const investors: Investor[] = [];
  const generatedFirmNames = new Set<string>();
  const FIRM_PREFIX = ['Amaravati', 'Godavari', 'Rayalaseema', 'Krishna', 'Tejas', 'Deccan', 'Andhra', 'Vanguard', 'Alpha'];
  const FIRM_SUFFIX = ['Capital', 'Ventures', 'Angels', 'Partners', 'Fund'];

  for (let i = 0; i < 30; i++) {
    let firmName = `${rng.nextElement(FIRM_PREFIX)} ${rng.nextElement(FIRM_SUFFIX)}`;
    let attempts = 0;
    while (generatedFirmNames.has(firmName) && attempts < 10) {
      firmName = `${rng.nextElement(FIRM_PREFIX)} ${rng.nextElement(FIRM_SUFFIX)}`;
      attempts++;
    }
    if (generatedFirmNames.has(firmName)) {
      firmName = `${firmName} ${i}`;
    }
    generatedFirmNames.add(firmName);

    const name = `${rng.nextElement(FIRST_NAMES)} ${rng.nextElement(LAST_NAMES)}`;
    const stageFocus = [rng.nextElement(['pre-seed', 'seed', 'pre-series-a']), rng.nextElement(['seed', 'series-a', 'series-b'])];

    investors.push({
      id: `investor-${i + 1}`,
      name,
      firmName,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@${firmName.toLowerCase().replace(/\s+/g, '')}.com`,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${firmName}`,
      stageFocus,
      sectorFocus: [rng.nextElement(SECTORS), rng.nextElement(SECTORS)],
      minTicket: rng.nextRange(1000000, 10000000), // 10L to 1Cr INR
      maxTicket: rng.nextRange(10000000, 200000000), // 1Cr to 20Cr INR
      investmentsCount: rng.nextRange(5, 30)
    });
  }

  // 7. Generate Sessions
  const sessions: MentorSession[] = [];
  for (let i = 0; i < 40; i++) {
    const mentor = rng.nextElement(mentors);
    const startup = startups.find(s => mentor.portfolioStartups.includes(s.id)) || rng.nextElement(startups);

    sessions.push({
      id: `session-${i + 1}`,
      mentorId: mentor.id,
      startupId: startup.id,
      scheduledAt: `2026-06-${rng.nextRange(10, 28)}T14:00:00Z`,
      status: demoMode ? 'Completed' : (rng.nextElement(['Scheduled', 'Completed', 'Completed']) as any),
      notes: `Discussion focused on target milestones, compliance documentation for Andhra Pradesh Startup Policy benefits, and resolving hiring gaps.`,
      aiSummary: `Startup is finalizing their validation cohort. Recommending immediate connection to university cells for student interns. Action items defined.`,
      actionItems: [
        'Complete registration on RTIH scheme dashboard',
        'Draft technical requirements for internship positions',
        'Upload updated financial projections for next review'
      ]
    });
  }

  // 8. Generate Hackathons
  const hackathons: Hackathon[] = [
    {
      id: 'hack-1',
      title: 'Andhra Pradesh SmartState Hackathon 2026',
      tagline: 'Leverage AI, IoT, and AgriTech to optimize public utilities and rural welfare across AP.',
      tracks: ['AgriTech Solutions', 'AI Public Governance', 'Clean Energy Microgrids'],
      judges: ['mentor-1', 'mentor-2', 'mentor-3'],
      startDate: '2026-06-01',
      endDate: '2026-06-25',
      status: 'Active'
    },
    {
      id: 'hack-2',
      title: 'Rayalaseema Agri-Tech Ideathon',
      tagline: 'Transforming dry-land farming, water conservation, and farm-to-market logistics.',
      tracks: ['Precision Drip Irrigation', 'Crop Yield Analytics', 'Farm Telemetry Nodes'],
      judges: ['mentor-4', 'mentor-5'],
      startDate: '2026-07-05',
      endDate: '2026-07-28',
      status: 'Active'
    }
  ];

  // 9. Generate Registrations and Submissions
  const registrations: HackathonRegistration[] = [];
  const submissions: HackathonSubmission[] = [];

  // Register first 10 startups
  startups.slice(0, 10).forEach((s, idx) => {
    const regId = `reg-${idx + 1}`;
    registrations.push({
      id: regId,
      hackathonId: 'hack-1',
      startupId: s.id,
      teamMembers: s.founders,
      registeredAt: '2026-06-05T09:00:00Z'
    });

    // Let first 5 submit projects
    if (idx < 5) {
      const subId = `sub-${idx + 1}`;
      const scores = [
        {
          judgeId: 'mentor-1',
          innovation: rng.nextRange(80, 96),
          feasibility: rng.nextRange(78, 95),
          impact: rng.nextRange(82, 98),
          execution: rng.nextRange(75, 94),
          comment: 'Outstanding alignment with Andhra Pradesh rural targets and solid proof of concept.'
        },
        {
          judgeId: 'mentor-2',
          innovation: rng.nextRange(82, 94),
          feasibility: rng.nextRange(80, 92),
          impact: rng.nextRange(85, 96),
          execution: rng.nextRange(78, 92),
          comment: 'Strong execution capabilities displayed. Excellent integration of regional outposts.'
        }
      ];
      
      const finalScore = parseFloat((scores.reduce((sum, sc) => sum + (sc.innovation + sc.feasibility + sc.impact + sc.execution) / 4, 0) / scores.length).toFixed(1));

      submissions.push({
        id: subId,
        hackathonId: 'hack-1',
        startupId: s.id,
        projectTitle: `${s.name} - IoT Smart Linkages`,
        description: `Deployment of low-power node transmitters to optimize ${s.sector} data telemetry in ${s.district}.`,
        demoUrl: 'https://github.com/rtih-labs/smart-linkages',
        submittedAt: '2026-06-12T18:30:00Z',
        scores,
        finalScore
      });
    }
  });

  // 10. Generate Certifications (Stage-locked)
  const certifications: Certificate[] = [];
  startups.forEach((s, idx) => {
    // Stage Idea Validation Certificate for validation or above
    if (s.stage !== 'idea') {
      certifications.push({
        id: `cert-${s.id}-1`,
        certificateId: `RTIH-CERT-2026-${1000 + idx}-1`,
        startupId: s.id,
        type: 'Idea Validation',
        issuedAt: '2026-03-20T10:00:00Z'
      });
    }
    // MVP Ready Certificate for MVP or above
    if (['mvp', 'users', 'revenue', 'funding', 'scale'].includes(s.stage)) {
      certifications.push({
        id: `cert-${s.id}-2`,
        certificateId: `RTIH-CERT-2026-${1000 + idx}-2`,
        startupId: s.id,
        type: 'MVP Ready',
        issuedAt: '2026-05-10T10:00:00Z'
      });
    }
    // PMF Certificate for revenue or above
    if (['revenue', 'funding', 'scale'].includes(s.stage)) {
      certifications.push({
        id: `cert-${s.id}-3`,
        certificateId: `RTIH-CERT-2026-${1000 + idx}-3`,
        startupId: s.id,
        type: 'Product-Market Fit',
        issuedAt: '2026-05-28T10:00:00Z'
      });
    }
    // Investment Ready Certificate for funding or above
    if (['funding', 'scale'].includes(s.stage) && s.investmentScore > 75) {
      certifications.push({
        id: `cert-${s.id}-4`,
        certificateId: `RTIH-CERT-2026-${1000 + idx}-4`,
        startupId: s.id,
        type: 'Investment Ready',
        issuedAt: '2026-06-01T10:00:00Z'
      });
    }
    // Startup Leadership Certificate for scale stage
    if (s.stage === 'scale') {
      certifications.push({
        id: `cert-${s.id}-5`,
        certificateId: `RTIH-CERT-2026-${1000 + idx}-5`,
        startupId: s.id,
        type: 'Startup Leadership',
        issuedAt: '2026-06-03T10:00:00Z'
      });
    }
  });

  // 11. Watchlists
  const watchlists: InvestorWatchlist[] = [
    {
      id: 'wl-1',
      investorId: 'investor-1',
      startupIds: ['startup-1', 'startup-2', 'startup-3']
    }
  ];

  // 12. Assessments
  const assessments: FounderAssessment[] = [
    {
      startupId: 'startup-1',
      startupIdea: 'Automated Crop Telemetry via IoT Linkages',
      sector: 'Agri Technology',
      stage: 'prototype',
      teamSize: 4,
      revenueStatus: 'validation',
      mvpStatus: 'prototype',
      targetCustomers: 'Rural Farmers in East Godavari',
      problemStatement: 'Lack of affordable real-time soil health indicators.',
      founderExperience: 'Graduated from Gitam Innovation Cell, former research intern.',
      readinessScore: 88,
      maturityScore: 74,
      learningJourney: ['Customer Discovery & Problem Validation', 'Market Research & Competitive Auditing', 'Product Development & Prototyping'],
      recommendedMentors: [
        {
          name: 'Prof. Ramesh Koppula',
          matchScore: 92,
          reason: 'AgriTech + Rural Market Scaling + Fundraising Experience',
          focus: 'Milestone GPS review and seed grant applications'
        },
        {
          name: 'Dr. Venkatesh Koppula',
          matchScore: 85,
          reason: 'AgriTech + Product Prototyping',
          focus: 'IoT node design reviews and field testing logs'
        }
      ],
      recommendedSchemes: ['Ratan Tata Seed Capital Fund', 'Rural Agri-Linkage Scheme'],
      recommendedMilestones: ['Submit RTIH Seed Fund Application', 'Deploy crop telemetry beta nodes'],
      completedAt: '2026-06-03T18:00:00Z'
    }
  ];

  // NEW: Applications (3 pending, 1 approved, 1 rejected)
  const applications: StartupApplication[] = [
    {
      id: 'app-1',
      founderName: 'Ravi Shankar Yeluri',
      email: 'ravi.yeluri@gmail.com',
      phone: '9876543210',
      district: 'Visakhapatnam',
      background: 'Engineering Graduate, 2 years in embedded systems at Wipro',
      education: 'B.Tech ECE - Andhra University 2022',
      startupName: 'AquaSense AI',
      tagline: 'AI-powered shrimp disease prediction for AP aquaculture',
      sector: 'Blue economy',
      stage: 'idea',
      problemStatement: 'Shrimp farmers in coastal AP lose 40% of yield to undetected disease outbreaks',
      solution: 'IoT water quality sensors + ML disease prediction model with 72hr early warning',
      teamSize: 3,
      coFounders: 'Priya Nanduri (Marine Biology, AU), Karthik Rao (ML Engineer)',
      pitchDeckUrl: 'https://drive.google.com/aquasense-pitch',
      prototypeUrl: '',
      businessPlanUrl: 'https://drive.google.com/aquasense-plan',
      submittedAt: '2026-06-01T10:30:00Z',
      status: 'Pending'
    },
    {
      id: 'app-2',
      founderName: 'Meena Devi Kondapalli',
      email: 'meena.kondapalli@gmail.com',
      phone: '9876512345',
      district: 'Kurnool',
      background: 'Farmer, 15 years experience in drip irrigation',
      education: 'B.Sc Agriculture - ANGRAU 2009',
      startupName: 'DripSmart',
      tagline: 'Solar-powered automated drip irrigation for Rayalaseema farmers',
      sector: 'Agri Technology',
      stage: 'prototype',
      problemStatement: 'Water scarcity in Rayalaseema costs farmers 30% yield loss annually',
      solution: 'Smart soil moisture sensors linked to solar-powered automated drip valves',
      teamSize: 2,
      coFounders: 'Suresh Kondapalli (Hardware Engineer)',
      pitchDeckUrl: 'https://drive.google.com/dripsmart-pitch',
      prototypeUrl: 'https://youtube.com/dripsmart-demo',
      businessPlanUrl: '',
      submittedAt: '2026-06-02T14:15:00Z',
      status: 'Pending'
    },
    {
      id: 'app-3',
      founderName: 'Arjun Reddy Mandali',
      email: 'arjun.mandali@gmail.com',
      phone: '9988776655',
      district: 'Tirupati',
      background: 'Medical Doctor, MBBS + MBA Healthcare Management',
      education: 'MBBS - Sri Venkateswara Medical College 2018',
      startupName: 'HealthBridge AP',
      tagline: 'Last-mile telemedicine for rural AP villages',
      sector: 'Horti Tech & Diary',
      stage: 'mvp',
      problemStatement: '60% of AP villages lack access to specialist doctors',
      solution: 'WhatsApp-based telemedicine with AI symptom triage and district hospital routing',
      teamSize: 5,
      coFounders: 'Lalitha Srinivas (Tech), Ramesh Guptha (Operations)',
      pitchDeckUrl: 'https://drive.google.com/healthbridge-pitch',
      prototypeUrl: 'https://healthbridge.demo.in',
      businessPlanUrl: 'https://drive.google.com/healthbridge-plan',
      submittedAt: '2026-06-03T09:00:00Z',
      status: 'Approved',
      assignedCenterId: 'center-1'
    },
    {
      id: 'app-4',
      founderName: 'Vijay Kumar Paluri',
      email: 'vijay.paluri@gmail.com',
      phone: '9123456789',
      district: 'Guntur',
      background: 'Marketing professional, FMCG background',
      education: 'MBA Marketing - Acharya Nagarjuna University 2020',
      startupName: 'SpiceMarket Direct',
      tagline: 'D2C platform for Guntur chilli farmers to urban consumers',
      sector: 'Health Care',
      stage: 'idea',
      problemStatement: 'Guntur chilli farmers earn only 20% of retail price due to middlemen',
      solution: 'Mobile app connecting farmers directly to urban retail chains and restaurants',
      teamSize: 1,
      coFounders: '',
      pitchDeckUrl: '',
      prototypeUrl: '',
      businessPlanUrl: '',
      submittedAt: '2026-05-28T11:00:00Z',
      status: 'Rejected',
      rejectionReason: 'Application incomplete. No co-founder or technical team indicated. Please resubmit with a technical co-founder and prototype evidence.'
    },
    {
      id: 'app-5',
      founderName: 'Sai Priya Nakka',
      email: 'sai.nakka@gmail.com',
      phone: '9871234560',
      district: 'East Godavari',
      background: 'Data Scientist at TCS, 3 years',
      education: 'M.Tech Data Science - JNTU Kakinada 2021',
      startupName: 'GodavariAI',
      tagline: 'Flood prediction and disaster early-warning for delta districts',
      sector: 'Marine Tech',
      stage: 'validation',
      problemStatement: 'Godavari delta floods displace 500,000 people annually with inadequate warning',
      solution: 'Satellite + river gauge sensor fusion with ML flood prediction 48hrs in advance',
      teamSize: 4,
      coFounders: 'Dr. Ravi Muppala (Hydrology Expert), Asha Kumari (GIS Engineer)',
      pitchDeckUrl: 'https://drive.google.com/godavariai-pitch',
      prototypeUrl: 'https://godavariai.vercel.app',
      businessPlanUrl: 'https://drive.google.com/godavariai-plan',
      submittedAt: '2026-06-03T16:45:00Z',
      status: 'Pending'
    }
  ];

  // NEW: Incubation Centers
  const incubationCenters: IncubationCenter[] = [
    { id: 'center-1', name: 'RTIH Tirupati Hub', location: 'Tirupati', domains: ['Battery & Adv. Manufacturing', 'Electronics Cluster', 'Horti Tech & Diary', 'Space Tech'], managerId: 'manager.tirupati@rtih.ap.gov.in', managerName: 'Prof. S. R. Venkat Raman', activeStartups: 18, capacity: 30 },
    { id: 'center-2', name: 'RTIH Rajamahendravaram Hub', location: 'Rajamahendravaram', domains: ['Food Processing', 'Marine Tech', 'Aquaculture', 'Energy Transition'], managerId: 'manager.rajamahendravaram@rtih.ap.gov.in', managerName: 'K. Lakshmi Narayana', activeStartups: 24, capacity: 40 },
    { id: 'center-3', name: 'RTIH Visakhapatnam Hub', location: 'Visakhapatnam', domains: ['Medtech', 'Fintech', 'Biotech', 'Blue economy', 'Smart Infra'], managerId: 'manager.vizag@rtih.ap.gov.in', managerName: 'Dr. Srinivas Prasad', activeStartups: 22, capacity: 35 },
    { id: 'center-4', name: 'RTIH Amaravati Central Hub', location: 'Amaravati', domains: ['Climate Tech', 'Blockchain', 'AVGC & XR', 'Health Care', 'Urban Systems', 'Supply Chain'], managerId: 'manager.amaravati@rtih.ap.gov.in', managerName: 'Sri L. Premchandra Reddy, IAS', activeStartups: 15, capacity: 25 },
    { id: 'center-5', name: 'RTIH Vijayawada Hub', location: 'Vijayawada', domains: ['Industrial IoT', 'Agri Technology', 'Auto-Body Building/Light Engineering', 'Construction Technology'], managerId: 'manager.vijayawada@rtih.ap.gov.in', managerName: 'G. Rama Chandra Murthy', activeStartups: 14, capacity: 30 },
    { id: 'center-6', name: 'RTIH Ananthapuramu Hub', location: 'Ananthapuramu', domains: ['Automotive & EV sys', 'Hybrid RE', 'Agri & Food Processing', 'Logistics-Warehousing', 'Defence & Aerospace'], managerId: 'manager.ananthapuramu@rtih.ap.gov.in', managerName: 'B. R. K. Prasad', activeStartups: 12, capacity: 30 }
  ];

  // NEW: Departments
  const departments: Department[] = [
    { id: 'dept-1', name: 'Technology & Innovation', description: 'Deep tech, AI, and advanced engineering programs', focusArea: 'AI, Advanced Manufacturing, Emerging Tech', createdAt: '2026-01-10T09:00:00Z' },
    { id: 'dept-2', name: 'AgriTech & Rural Development', description: 'Agriculture, fisheries, and rural economic programs', focusArea: 'AgriTech, Blue Economy, Climate Tech', createdAt: '2026-01-15T09:00:00Z' },
    { id: 'dept-3', name: 'Health & Life Sciences', description: 'Healthcare, biotech, and pharma startup programs', focusArea: 'Healthcare, Biotech', createdAt: '2026-02-01T09:00:00Z' },
    { id: 'dept-4', name: 'Finance & Infrastructure', description: 'FinTech, smart city and clean energy programs', focusArea: 'FinTech, Smart Infrastructure, Clean Energy', createdAt: '2026-02-15T09:00:00Z' }
  ];

  // NEW: Programs
  const programs: Program[] = [
    { id: 'prog-1', departmentId: 'dept-1', name: 'AI Founders Accelerator', description: '6-month intensive for AI-first startups with GPU access and expert mentorship', eligibleStages: ['idea', 'validation', 'prototype'], durationMonths: 6, mentorCount: 8, linkedStartupIds: ['startup-1', 'startup-3'], createdAt: '2026-02-01T09:00:00Z' },
    { id: 'prog-2', departmentId: 'dept-2', name: 'Kisan Tech Launchpad', description: 'AgriTech pre-acceleration for rural founders with district field deployments', eligibleStages: ['idea', 'validation'], durationMonths: 4, mentorCount: 5, linkedStartupIds: ['startup-2', 'startup-5'], createdAt: '2026-02-10T09:00:00Z' },
    { id: 'prog-3', departmentId: 'dept-3', name: 'HealthX Scale Program', description: 'Scaling healthcare startups with hospital partnerships and regulatory guidance', eligibleStages: ['mvp', 'users', 'revenue'], durationMonths: 8, mentorCount: 6, linkedStartupIds: ['startup-4'], createdAt: '2026-03-01T09:00:00Z' },
    { id: 'prog-4', departmentId: 'dept-4', name: 'FinTech Compliance Track', description: 'RBI-compliant FinTech startups with regulatory sandbox access', eligibleStages: ['prototype', 'mvp', 'users'], durationMonths: 5, mentorCount: 4, linkedStartupIds: ['startup-6', 'startup-7'], createdAt: '2026-03-15T09:00:00Z' }
  ];

  // NEW: Tasks
  const tasks: Task[] = [
    { id: 'task-1', startupId: 'startup-1', mentorId: 'mentor-1', title: 'Complete Customer Discovery Interviews', description: 'Conduct 20 structured interviews with potential farmers in your target district. Document key insights and pain point validations.', dueDate: '2026-06-15', status: 'Submitted', evidenceUrl: 'https://docs.google.com/startup1-interviews', evidenceNote: 'Completed 23 interviews. 87% confirmed water sensor need.', createdAt: '2026-06-01T09:00:00Z', completedAt: '2026-06-12T14:00:00Z' },
    { id: 'task-2', startupId: 'startup-1', mentorId: 'mentor-1', title: 'Submit RTIH Seed Fund Application', description: 'Complete and submit the RTIH Seed Capital application with all required financial projections.', dueDate: '2026-06-20', status: 'In Progress', createdAt: '2026-06-05T09:00:00Z' },
    { id: 'task-3', startupId: 'startup-2', mentorId: 'mentor-2', title: 'Deploy IoT Node Beta in Field', description: 'Set up 3 soil moisture sensor nodes in the test farm. Run 7-day data collection. Upload CSV data log.', dueDate: '2026-06-18', status: 'Assigned', createdAt: '2026-06-08T09:00:00Z' },
    { id: 'task-4', startupId: 'startup-3', mentorId: 'mentor-1', title: 'Build MVP Financial Model', description: 'Create a 3-year financial model with unit economics. Show path to profitability by Month 18.', dueDate: '2026-06-10', status: 'Overdue', createdAt: '2026-05-25T09:00:00Z' },
    { id: 'task-5', startupId: 'startup-1', mentorId: 'mentor-1', title: 'Prepare Investor Pitch Deck v2', description: 'Update pitch deck incorporating feedback from last session. Focus on market size and go-to-market strategy.', dueDate: '2026-06-25', status: 'Assigned', createdAt: '2026-06-10T09:00:00Z' }
  ];

  // NEW: Notifications
  const notifications: Notification[] = [
    { id: 'notif-1', userId: 'manager@rtih.ap.gov.in', type: 'application_approved', title: 'New Startup Approved', message: 'HealthBridge AP has been approved and assigned to RTIH HealthTech Hub. Please review and assign a mentor.', isRead: false, createdAt: '2026-06-03T09:05:00Z', linkTo: '/manager' },
    { id: 'notif-2', userId: 'manager@rtih.ap.gov.in', type: 'review_pending', title: 'Stage Promotion Request', message: 'Kalyan AgriSystems mentor has submitted a stage promotion recommendation. Review required.', isRead: false, createdAt: '2026-06-02T14:30:00Z', linkTo: '/manager' },
    { id: 'notif-3', userId: 'mentor-1', type: 'task_verified', title: 'Task Evidence Submitted', message: 'Kalyan AgriSystems has submitted evidence for "Customer Discovery Interviews". Please verify.', isRead: false, createdAt: '2026-06-12T15:00:00Z', linkTo: '/mentor' },
    { id: 'notif-4', userId: 'founder-1', type: 'mentor_assigned', title: 'Mentor Assigned to Your Startup', message: 'Prof. Ramesh Koppula has been assigned as your mentor. Session scheduling begins shortly.', isRead: true, createdAt: '2026-05-30T10:00:00Z', linkTo: '/founder' },
    { id: 'notif-5', userId: 'admin@rtih.ap.gov.in', type: 'application_approved', title: 'New Application Received', message: 'GodavariAI has submitted a startup application. 2 more applications pending review.', isRead: false, createdAt: '2026-06-03T16:50:00Z', linkTo: '/admin' }
  ];

  // NEW: Messages
  const messages: Message[] = [
    { id: 'msg-1', startupId: 'startup-1', senderId: 'mentor-1', senderName: 'Prof. Ramesh Koppula', senderRole: 'mentor', content: 'Great progress on the customer discovery! Your 87% validation rate is excellent. For next week, focus on the financial model — unit economics need to be clearer before we approach seed investors.', sentAt: '2026-06-12T16:00:00Z', isRead: true },
    { id: 'msg-2', startupId: 'startup-1', senderId: 'founder-1', senderName: 'Ramesh Koppula', senderRole: 'founder', content: 'Thank you! We are working on the unit economics now. We project break-even at 450 sensor deployments. Will share the model by Friday.', sentAt: '2026-06-12T17:30:00Z', isRead: true },
    { id: 'msg-3', startupId: 'startup-1', senderId: 'manager@rtih.ap.gov.in', senderName: 'K. Lakshmi Narayana', senderRole: 'manager', content: 'I have reviewed your milestone progress. Very strong performance. The incubation committee will be reviewing your stage promotion request next week. Keep up the excellent work.', sentAt: '2026-06-13T09:00:00Z', isRead: false },
    { id: 'msg-4', startupId: 'startup-2', senderId: 'mentor-2', senderName: 'Dr. Venkatesh Koppula', senderRole: 'mentor', content: 'The field deployment task is critical. Please ensure sensor placement follows the grid pattern we discussed. Document everything with photos.', sentAt: '2026-06-09T11:00:00Z', isRead: true }
  ];

  // NEW: Documents
  const documents: Document[] = [
    { id: 'doc-1', startupId: 'startup-1', name: 'Kalyan AgriSystems Pitch Deck v2.pdf', type: 'Pitch Deck', url: 'https://drive.google.com/kalyan-pitch-v2', uploadedBy: 'Ramesh Koppula', uploaderRole: 'founder', uploadedAt: '2026-06-01T10:00:00Z', accessLevel: 'All' },
    { id: 'doc-2', startupId: 'startup-1', name: 'Financial Projections 2026-2029.xlsx', type: 'Financial Model', url: 'https://drive.google.com/kalyan-financials', uploadedBy: 'Ramesh Koppula', uploaderRole: 'founder', uploadedAt: '2026-06-10T14:00:00Z', accessLevel: 'Mentor+Manager' },
    { id: 'doc-3', startupId: 'startup-1', name: 'Customer Discovery Report.pdf', type: 'Other', url: 'https://docs.google.com/startup1-interviews', uploadedBy: 'Ramesh Koppula', uploaderRole: 'founder', uploadedAt: '2026-06-12T14:30:00Z', accessLevel: 'All' },
    { id: 'doc-4', startupId: 'startup-2', name: 'IoT Sensor Technical Spec.pdf', type: 'Technical Spec', url: 'https://drive.google.com/vizaq-techspec', uploadedBy: 'Suresh Yalamanchili', uploaderRole: 'founder', uploadedAt: '2026-05-28T09:00:00Z', accessLevel: 'All' }
  ];

  // NEW: Alumni Startups (graduated)
  const alumniStartups: AlumniStartup[] = [
    { id: 'alumni-1', startupId: 'alumni-startup-1', name: 'Vijayawada PayTech', sector: 'Fintech', graduatedAt: '2024-12-15', journeyMonths: 18, finalStage: 'scale', achievement: 'Raised ₹12Cr Series A, 200,000+ active users, expanded to 3 states', currentStatus: 'Active – Scaling nationally with RBI sandbox approval', district: 'NTR', founderName: 'Kiran Srinivas' },
    { id: 'alumni-2', startupId: 'alumni-startup-2', name: 'AP CropScan', sector: 'Agri Technology', graduatedAt: '2025-03-20', journeyMonths: 14, finalStage: 'revenue', achievement: 'Serving 12,000 farmers across 5 districts, ₹2.1Cr ARR', currentStatus: 'Active – Profitable, expanding to Telangana', district: 'Krishna', founderName: 'Padma Yalamanchili' },
    { id: 'alumni-3', startupId: 'alumni-startup-3', name: 'NeuroDiag Vizag', sector: 'Medtech', graduatedAt: '2025-06-10', journeyMonths: 22, finalStage: 'funding', achievement: 'AI diagnostic tool deployed in 45 AP district hospitals, ₹8Cr raised', currentStatus: 'Active – Government partnership, 180 jobs created', district: 'Visakhapatnam', founderName: 'Dr. Asha Devineni' },
    { id: 'alumni-4', startupId: 'alumni-startup-4', name: 'GreenGrid AP', sector: 'Hybrid RE', graduatedAt: '2025-09-05', journeyMonths: 20, finalStage: 'scale', achievement: 'Solar microgrids powering 80 villages, ₹22Cr raised, 350 jobs', currentStatus: 'Active – Government smart village contract secured', district: 'Anantapur', founderName: 'Ravi Koneru' }
  ];

  // NEW: Idea Posts (Problem Marketplace)
  const ideaPosts: IdeaPost[] = [
    { id: 'idea-1', authorName: 'Subbaiah Reddy', occupation: 'Farmer', district: 'Kurnool', sector: 'Agri Technology', problemTitle: 'No warning system for crop disease outbreaks', problemDescription: 'Every year I lose 30-40% of my groundnut crop to fungal diseases. By the time I see the symptoms, it has spread everywhere. I wish there was a way to detect it earlier.', postedAt: '2026-06-01T08:00:00Z', interestedCount: 23, status: 'Open' },
    { id: 'idea-2', authorName: 'Sister Mary Agnes', occupation: 'School Principal', district: 'Srikakulam', sector: 'Health Care', problemTitle: 'Children miss school due to undetected eye problems', problemDescription: 'We have 1200 students and no eye screening. Many children sit in the back and cannot see the board. Vision issues are only caught when they fail exams.', postedAt: '2026-06-02T09:30:00Z', interestedCount: 31, status: 'Being Solved' },
    { id: 'idea-3', authorName: 'Fisherman Cooperative', occupation: 'Fishermen', district: 'Srikakulam', sector: 'Blue economy', problemTitle: 'Cannot predict safe fishing zones or fish locations', problemDescription: 'We go out to sea and many times come back empty-handed. Sometimes there are dangerous weather patches we cannot detect. A system that tells us where fish are and where weather is safe would save lives and income.', postedAt: '2026-06-01T11:00:00Z', interestedCount: 47, status: 'Open' },
    { id: 'idea-4', authorName: 'Government Hospital Admin', occupation: 'Healthcare Administrator', district: 'Prakasam', sector: 'Health Care', problemTitle: 'Patient records still on paper, causing medical errors', problemDescription: 'Our district hospital serves 800 patients daily. All records are paper-based. Doctors waste 2 hours daily on paperwork. Drug interactions are missed. We need a simple digital system.', postedAt: '2026-05-30T14:00:00Z', interestedCount: 56, status: 'Open' },
    { id: 'idea-5', authorName: 'Tourism Board Member', occupation: 'Government Official', district: 'Tirupati', sector: 'Space Tech', problemTitle: 'Tirupati pilgrims waste hours in wrong queues', problemDescription: 'Every day 100,000 pilgrims visit. Many spend 3-4 hours finding the right entrance or getting lost. An AR-based navigation system specific to the temple complex could transform visitor experience.', postedAt: '2026-06-03T10:00:00Z', interestedCount: 38, status: 'Open' }
  ];

  // NEW: Citizen Profiles
  const citizenProfiles: CitizenProfile[] = [
    { id: 'citizen-1', name: 'Naveen Reddy', email: 'naveen.reddy@gmail.com', occupation: 'Student', interests: ['Space Tech', 'Health Care'], skills: ['Python', 'Data Science', 'Research'], district: 'Visakhapatnam', aptitudeRole: 'Technical Builder', joinedAt: '2026-06-01T10:00:00Z' },
    { id: 'citizen-2', name: 'Bhavani Lakshmi', email: 'bhavani.l@gmail.com', occupation: 'Homemaker', interests: ['Agri Technology', 'Education'], skills: ['Communication', 'Community Building', 'Hindi/Telugu'], district: 'Kurnool', aptitudeRole: 'Marketing Lead', joinedAt: '2026-06-02T11:00:00Z' },
    { id: 'citizen-3', name: 'Dr. Prasad Namburi', email: 'prasad.namburi@gmail.com', occupation: 'Doctor', interests: ['Health Care', 'Space Tech'], skills: ['Medical Domain Expertise', 'Research', 'Patient Management'], district: 'Guntur', aptitudeRole: 'Co-founder', joinedAt: '2026-06-02T15:00:00Z' }
  ];

  // NEW: Stage Recommendations
  const stageRecommendations: StageRecommendation[] = [
    { id: 'sr-1', startupId: 'startup-1', mentorId: 'mentor-1', currentStage: 'prototype', proposedStage: 'mvp', notes: 'Team has completed 23 customer discovery interviews with 87% validation. IoT prototype deployed in 3 farms. Strong unit economics model. Ready for MVP stage investment and customer onboarding.', evidenceUrls: ['https://drive.google.com/evidence-sr1'], healthScore: 84, milestoneCompletion: 78, status: 'Pending', submittedAt: '2026-06-13T10:00:00Z' }
  ];

  // NEW: Job Postings
  const jobPostings: JobPosting[] = [
    {
      id: 'job-1',
      startupId: 'startup-1',
      title: 'ML Engineer Intern',
      type: 'Internship',
      description: 'Work on our crop disease prediction ML model. Ideal for final year B.Tech/M.Tech students with Python and computer vision skills.',
      skills: ['Python', 'TensorFlow', 'Computer Vision', 'Data Analysis'],
      stipend: '₹15,000/month',
      deadline: '2026-07-01',
      postedAt: '2026-06-10T09:00:00Z',
      isActive: true,
      applications: [
        { id: 'japp-1', candidateName: 'Arun Kumar', email: 'arun.k@gmail.com', skills: 'Python, TensorFlow, 3 ML projects', resumeUrl: 'https://drive.google.com/arun-resume', appliedAt: '2026-06-11T10:00:00Z', status: 'Applied' },
        { id: 'japp-2', candidateName: 'Priya Nair', email: 'priya.n@gmail.com', skills: 'Python, Keras, Computer Vision project', resumeUrl: 'https://drive.google.com/priya-resume', appliedAt: '2026-06-12T14:00:00Z', status: 'Shortlisted' }
      ]
    }
  ];

  // NEW: Mentor Matching and Metrics data
  const mentorshipGoals: MentorshipGoal[] = [];
  const actionItems: ActionItem[] = [];
  const mentorMatches: MentorMatch[] = [];

  return { startups, founders, mentors, investors, universities, outposts, sessions, hackathons, registrations, submissions, certifications, watchlists, assessments, applications, incubationCenters, departments, programs, tasks, notifications, messages, documents, alumniStartups, ideaPosts, citizenProfiles, stageRecommendations, jobPostings, mentorshipGoals, actionItems, mentorMatches };
}


export class MockDatabase {
  private static STORAGE_KEY = 'rtih_innovationos_db';

  private data: {
    startups: Startup[];
    founders: Founder[];
    mentors: Mentor[];
    investors: Investor[];
    universities: University[];
    outposts: Outpost[];
    sessions: MentorSession[];
    hackathons: Hackathon[];
    registrations: HackathonRegistration[];
    submissions: HackathonSubmission[];
    certifications: Certificate[];
    watchlists: InvestorWatchlist[];
    assessments: FounderAssessment[];
    applications: StartupApplication[];
    incubationCenters: IncubationCenter[];
    departments: Department[];
    programs: Program[];
    tasks: Task[];
    notifications: Notification[];
    messages: Message[];
    documents: Document[];
    alumniStartups: AlumniStartup[];
    ideaPosts: IdeaPost[];
    citizenProfiles: CitizenProfile[];
    stageRecommendations: StageRecommendation[];
    jobPostings: JobPosting[];
    mentorshipGoals: MentorshipGoal[];
    actionItems: ActionItem[];
    mentorMatches: MentorMatch[];
  };


  constructor() {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(MockDatabase.STORAGE_KEY);
      if (cached) {
        try {
          this.data = JSON.parse(cached);
          // If we have cached data, ensure it is the updated database with Rayalaseema EV-Drive
          if (this.data && this.data.startups && this.data.startups.length > 0) {
            const hasDemoStartup = this.data.startups.some(s => s.name === 'Rayalaseema EV-Drive');
            if (!hasDemoStartup) {
              this.data = generateInitialData(true);
              this.save(true);
            }
          }
          // Force regeneration if university data is outdated (less than 13 universities or missing mapping)
          if (this.data && (!this.data.universities || this.data.universities.length < 13)) {
            this.data = generateInitialData(true);
            this.save(true);
          }
          // Ensure new collections exist (for cached data from older versions)
          if (!this.data.applications) this.data.applications = [];
          if (!this.data.incubationCenters) this.data.incubationCenters = [];
          if (!this.data.departments) this.data.departments = [];
          if (!this.data.programs) this.data.programs = [];
          if (!this.data.tasks) this.data.tasks = [];
          if (!this.data.notifications) this.data.notifications = [];
          if (!this.data.messages) this.data.messages = [];
          if (!this.data.documents) this.data.documents = [];
          if (!this.data.alumniStartups) this.data.alumniStartups = [];
          if (!this.data.ideaPosts) this.data.ideaPosts = [];
          if (!this.data.citizenProfiles) this.data.citizenProfiles = [];
          if (!this.data.stageRecommendations) this.data.stageRecommendations = [];
          if (!this.data.jobPostings) this.data.jobPostings = [];
          if (!this.data.mentorshipGoals) this.data.mentorshipGoals = [];
          if (!this.data.actionItems) this.data.actionItems = [];
          if (!this.data.mentorMatches) this.data.mentorMatches = [];
          
          // NOTE: Do NOT force-reset startup-1 milestones here — doing so would wipe
          // submitted evidence on every page load. Seed data resets only happen above
          // when the startup name is missing (brand-new install).

          setTimeout(() => { this.syncWithBackend(); }, 500);
          setInterval(() => { this.syncWithBackend(true); }, 8000);
          setTimeout(() => { this.subscribeToRealtime(); }, 1000);
          return;
        } catch (e) {
          console.error(e);
        }
      }
    }
    this.data = generateInitialData(true);
    this.save(true);
    if (typeof window !== 'undefined') {
      setTimeout(() => { this.syncWithBackend(); }, 500);
      setInterval(() => { this.syncWithBackend(true); }, 8000);
      setTimeout(() => { this.subscribeToRealtime(); }, 1000);
    }
  }

  private async subscribeToRealtime() {
    if (typeof window === 'undefined') return;
    try {
      const { isSupabaseConfigured, getSupabaseClient } = await import('./db');
      if (!isSupabaseConfigured()) return;
      const supabase = getSupabaseClient();
      supabase
        .channel('rtih-realtime-all')
        .on(
          'postgres_changes' as any,
          { event: '*', schema: 'public' },
          () => {
            // Any DB change on another device/tab → immediately pull fresh state
            this.syncWithBackend(true);
          }
        )
        .subscribe();
    } catch (e) {
      // Realtime not available, polling fallback still active
      console.warn('[RTIH] Realtime subscription failed, falling back to 8s polling:', e);
    }
  }

  reseed(demoMode: boolean) {
    this.data = generateInitialData(true);
    this.save();
  }

  reload() {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(MockDatabase.STORAGE_KEY);
      if (cached) {
        try {
          this.data = JSON.parse(cached);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  private save(skipBackendSync = false) {
    if (typeof window !== 'undefined') {
      const oldStr = localStorage.getItem(MockDatabase.STORAGE_KEY);
      localStorage.setItem(MockDatabase.STORAGE_KEY, JSON.stringify(this.data));
      if (!skipBackendSync) {
        setTimeout(() => { this.syncChanges(oldStr); }, 0);
      }
      // Notify all listening components/pages to refresh their state
      window.dispatchEvent(new Event('rtih_mode_change'));
    }
  }

  async syncWithBackend(silent = false) {
    if (typeof window === 'undefined') return;
    try {
      const { isSupabaseConfigured, supabasePullAll, supabaseSeedAll } = await import('./db');
      if (!isSupabaseConfigured()) {
        if (!silent) console.log('[RTIH] Supabase not configured. Running in LocalStorage Mode.');
        return;
      }

      if (!silent) console.log('[RTIH] Connecting to Supabase...');
      const pulled = await supabasePullAll();

      if (!pulled.startups || pulled.startups.length === 0) {
        // Tables are empty — seed from local mock data
        if (!silent) console.log('[RTIH] Supabase tables are empty. Seeding with pre-scaled mock data...');
        await supabaseSeedAll(this.data as any);
        if (!silent) console.log('[RTIH] ✅ Supabase seeding completed successfully!');
      } else {
        // Hydrate in-memory state from Supabase
        if (!silent) console.log('[RTIH] ✅ Synchronized state from live Supabase database.');
        const keys = Object.keys(pulled) as string[];
        let hasChanges = false;

        for (const key of keys) {
          const arr = pulled[key];
          if (Array.isArray(arr) && arr.length > 0 && (this.data as any)[key]) {
            const oldStr = JSON.stringify((this.data as any)[key]);
            const newStr = JSON.stringify(arr);
            if (oldStr !== newStr) {
              (this.data as any)[key] = arr;
              hasChanges = true;
            }
          }
        }

        if (hasChanges) {
          this.save(true);
          window.dispatchEvent(new Event('rtih_mode_change'));
        }
      }
    } catch (e) {
      if (!silent) console.warn('[RTIH] Supabase sync failed, running in offline LocalStorage mode:', e);
    }
  }

  private async syncChanges(oldStr: string | null) {
    if (!oldStr) return;
    try {
      const { isSupabaseConfigured, supabaseUpsertEntity } = await import('./db');
      if (!isSupabaseConfigured()) return;

      const oldData = JSON.parse(oldStr as string);
      const collections = [
        // Core entities
        'startups', 'founders', 'mentors', 'investors', 'universities', 'outposts',
        // Incubation & management
        'applications', 'incubationCenters', 'departments', 'programs',
        'tasks', 'notifications', 'messages', 'documents',
        'stageRecommendations', 'jobPostings', 'mentorshipGoals', 'actionItems',
        // Academic & events
        'sessions', 'hackathons', 'registrations', 'submissions',
        // Alumni & community
        'certifications', 'watchlists', 'assessments',
        'alumniStartups', 'ideaPosts', 'citizenProfiles',
      ];

      for (const key of collections) {
        const oldCol: any[] = oldData[key] || [];
        const newCol: any[] = (this.data as any)[key] || [];

        for (const item of newCol) {
          const oldItem = oldCol.find((o: any) => o.id === item.id);
          const isModified = !oldItem || JSON.stringify(oldItem) !== JSON.stringify(item);
          if (isModified) {
            await supabaseUpsertEntity(key, item);
          }
        }
      }
    } catch (e) {
      console.error('[RTIH] Supabase write-through replication error:', e);
    }
  }


  getHealthWeights() {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('rtih_health_weights');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          // fallback
        }
      }
    }
    return {
      progress: 20,
      product: 15,
      team: 10,
      market: 15,
      financial: 15,
      funding: 10,
      mentor: 5,
      documentation: 5,
      risk: 5
    };
  }

  updateHealthWeights(newWeights: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rtih_health_weights', JSON.stringify(newWeights));
    }
    this.recalculateAllStartupsHealth();
  }

  recalculateAllStartupsHealth() {
    this.data.startups.forEach(s => {
      this.recalculateStartupHealthInline(s.id);
    });
    this.save();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('rtih_mode_change'));
    }
  }

  recalculateStartupHealthInline(startupId: string) {
    const startup = this.getStartup(startupId);
    if (!startup) return;

    const weights = this.getHealthWeights();
    
    // Find sessions, tasks, and documents for this startup
    const tasks = (this.data.tasks || []).filter(t => t.startupId === startupId);
    const documents = (this.data.documents || []).filter(d => d.startupId === startupId);
    const sessions = (this.data.sessions || []).filter(s => s.startupId === startupId);

    const result = calculateDynamicVentureHealth(startup, tasks, documents, sessions, weights);

    startup.healthScore = result.healthScore;
    startup.healthBreakdown = result.healthBreakdown;
    startup.healthCategory = result.healthCategory as any;

    // Handle history trend appending
    if (!startup.healthHistory) startup.healthHistory = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const existingHistIdx = startup.healthHistory.findIndex(h => h.date === todayStr);
    if (existingHistIdx !== -1) {
      startup.healthHistory[existingHistIdx] = { date: todayStr, score: result.healthScore, breakdown: result.healthBreakdown };
    } else {
      startup.healthHistory.push({ date: todayStr, score: result.healthScore, breakdown: result.healthBreakdown });
      // Keep last 12 entries
      if (startup.healthHistory.length > 12) startup.healthHistory.shift();
    }

    // Automatic Low-Health Alerts and Intervention Workflow
    if (startup.healthScore < 60) {
      if (!startup.healthAlerts) startup.healthAlerts = [];
      const hasActiveAlert = startup.healthAlerts.some(a => a.type === 'critical_health' && !a.resolved);
      if (!hasActiveAlert) {
        startup.healthAlerts.unshift({
          id: `alert-${startupId}-${Date.now()}`,
          type: 'critical_health',
          title: 'Critical Health Score Alert',
          message: `${startup.name} health score is ${startup.healthScore}, falling below the 60 threshold. Immediate intervention requested.`,
          createdAt: new Date().toISOString(),
          resolved: false
        });
        
        // Notify Managers automatically
        const managerNotif: Notification = {
          id: `notif-${Date.now()}-c1`,
          userId: 'manager@rtih.ap.gov.in',
          type: 'review_pending',
          title: `Health Alert: ${startup.name}`,
          message: `Startup ${startup.name} health has dropped to ${startup.healthScore}. Please review their intervention console.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          linkTo: '/manager'
        };
        if (!this.data.notifications) this.data.notifications = [];
        this.data.notifications.unshift(managerNotif);
      }
    }

    // Generate AI Report Sandbox
    const aiReport = generateAIHealthReport(startup, tasks, documents);
    if (!startup.aiHealthReports) startup.aiHealthReports = [];
    startup.aiHealthReports.unshift(aiReport);
    if (startup.aiHealthReports.length > 5) startup.aiHealthReports.pop();
  }

  addMentorAssessment(startupId: string, assessment: any) {
    const startup = this.getStartup(startupId);
    if (startup) {
      if (!startup.mentorAssessments) startup.mentorAssessments = [];
      startup.mentorAssessments.unshift(assessment);
      this.recalculateStartupHealthInline(startupId);
      this.save();
    }
  }

  addRiskFlag(startupId: string, flag: any) {
    const startup = this.getStartup(startupId);
    if (startup) {
      if (!startup.riskFlags) startup.riskFlags = [];
      startup.riskFlags.unshift(flag);
      if (flag.severity === 'High') {
        startup.riskLevel = 'High';
      } else if (flag.severity === 'Medium' && startup.riskLevel !== 'High') {
        startup.riskLevel = 'Medium';
      }
      this.recalculateStartupHealthInline(startupId);
      this.save();
    }
  }

  addInterventionLog(startupId: string, title: string, description: string) {
    const startup = this.getStartup(startupId);
    if (startup) {
      if (!startup.interventionLogs) startup.interventionLogs = [];
      startup.interventionLogs.unshift({
        id: `interv-${Date.now()}`,
        title,
        description,
        status: 'Active',
        createdAt: new Date().toISOString()
      });
      
      if (!startup.healthAlerts) startup.healthAlerts = [];
      startup.healthAlerts.unshift({
        id: `alert-${startupId}-${Date.now()}`,
        type: 'intervention_scheduled',
        title: 'Intervention Session Scheduled',
        message: `A program manager has scheduled a formal intervention: "${title}". Description: ${description}`,
        createdAt: new Date().toISOString(),
        resolved: false
      });
      this.save();
    }
  }

  resolveInterventionLog(startupId: string, interventionId: string) {
    const startup = this.getStartup(startupId);
    if (startup) {
      if (startup.interventionLogs) {
        const log = startup.interventionLogs.find(l => l.id === interventionId);
        if (log) {
          log.status = 'Resolved';
        }
      }
      
      if (startup.healthAlerts) {
        startup.healthAlerts.forEach(a => {
          if (a.type === 'critical_health' || a.type === 'intervention_scheduled') {
            a.resolved = true;
          }
        });
      }
      this.save();
    }
  }

  getStartups() { return this.data.startups; }
  getStartup(id: string) { return this.data.startups.find(s => s.id === id); }
  getFounders() { return this.data.founders; }
  getFounder(id: string) { return this.data.founders.find(f => f.id === id); }
  getMentors() { return this.data.mentors; }
  getMentor(id: string) { return this.data.mentors.find(m => m.id === id); }
  
  assignMentor(startupId: string, mentorId: string) {
    this.data.mentors.forEach(m => {
      if (m.portfolioStartups && m.portfolioStartups.includes(startupId)) {
        m.portfolioStartups = m.portfolioStartups.filter(id => id !== startupId);
      }
    });

    const mentor = this.data.mentors.find(m => m.id === mentorId);
    if (mentor) {
      if (!mentor.portfolioStartups) mentor.portfolioStartups = [];
      if (!mentor.portfolioStartups.includes(startupId)) {
        mentor.portfolioStartups.push(startupId);
      }
    }

    const startup = this.getStartup(startupId);
    const founderIds = startup ? startup.founders : [];
    const founder = founderIds.length > 0 ? this.getFounder(founderIds[0]) : null;
    
    if (founder && mentor && startup) {
      const founderNotif: Notification = {
        id: `notif-${Date.now()}-m1`,
        userId: founder.email,
        type: 'mentor_assigned',
        title: 'Mentor Assigned to Your Startup',
        message: `${mentor.name} has been assigned as your lead mentor for ${startup.name}. Schedule a session now.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/founder'
      };
      
      const mentorNotif: Notification = {
        id: `notif-${Date.now()}-m2`,
        userId: mentor.email,
        type: 'mentor_assigned',
        title: 'New Mentorship Portfolio Startup',
        message: `You have been assigned as the lead mentor for ${startup.name}. Please review their profile.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        linkTo: '/mentor'
      };

      if (!this.data.notifications) this.data.notifications = [];
      this.data.notifications.unshift(founderNotif);
      this.data.notifications.unshift(mentorNotif);
    }
    
    this.save();
  }
  getInvestors() { return this.data.investors; }
  getInvestor(id: string) { return this.data.investors.find(i => i.id === id); }
  getUniversities() { return this.data.universities; }
  getOutposts() { return this.data.outposts; }
  getSessions() { return this.data.sessions; }
  addSession(session: MentorSession) {
    if (!this.data.sessions) this.data.sessions = [];
    this.data.sessions.push(session);
    
    // Increment mentor's sessionsCompleted count
    const mentor = this.data.mentors.find(m => m.id === session.mentorId);
    if (mentor && session.status === 'Completed') {
      mentor.sessionsCompleted = (mentor.sessionsCompleted || 0) + 1;
    }
    this.save();
  }
  updateSession(id: string, updates: Partial<MentorSession>) {
    if (!this.data.sessions) return;
    const idx = this.data.sessions.findIndex(s => s.id === id);
    if (idx !== -1) {
      const oldSession = this.data.sessions[idx];
      this.data.sessions[idx] = { ...oldSession, ...updates };
      
      // If status changed to Completed, increment mentor sessionsCompleted
      if (updates.status === 'Completed' && oldSession.status !== 'Completed') {
        const mentor = this.data.mentors.find(m => m.id === oldSession.mentorId);
        if (mentor) {
          mentor.sessionsCompleted = (mentor.sessionsCompleted || 0) + 1;
        }
      }
      this.save();
    }
  }
  getHackathons() { return this.data.hackathons || []; }
  getHackathon(id: string) { return this.data.hackathons?.find(h => h.id === id); }
  addHackathon(hack: Hackathon) {
    if (!this.data.hackathons) this.data.hackathons = [];
    this.data.hackathons.push(hack);
    this.save();
  }
  getRegistrations() { return this.data.registrations || []; }
  getSubmissions() { return this.data.submissions || []; }
  getCertifications() { return this.data.certifications || []; }
  getWatchlists() { return this.data.watchlists || []; }
  getAssessments() { return this.data.assessments || []; }
  getAssessment(startupId: string) { return this.data.assessments?.find(a => a.startupId === startupId); }

  // Mentorship Goals, Action Items, & Matches
  getMentorshipGoals(startupId?: string) { 
    if (startupId) return (this.data.mentorshipGoals || []).filter(g => g.startupId === startupId);
    return this.data.mentorshipGoals || []; 
  }
  addMentorshipGoal(goal: MentorshipGoal) {
    if (!this.data.mentorshipGoals) this.data.mentorshipGoals = [];
    this.data.mentorshipGoals.push(goal);
    this.save();
  }
  updateMentorshipGoal(id: string, updates: Partial<MentorshipGoal>) {
    const idx = (this.data.mentorshipGoals || []).findIndex(g => g.id === id);
    if (idx !== -1) {
      this.data.mentorshipGoals[idx] = { ...this.data.mentorshipGoals[idx], ...updates };
      this.save();
    }
  }

  getActionItems(mentorId?: string) { 
    if (mentorId) return (this.data.actionItems || []).filter(a => a.mentorId === mentorId);
    return this.data.actionItems || []; 
  }
  addActionItem(item: ActionItem) {
    if (!this.data.actionItems) this.data.actionItems = [];
    this.data.actionItems.push(item);
    this.save();
  }
  updateActionItem(id: string, updates: Partial<ActionItem>) {
    const idx = (this.data.actionItems || []).findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.actionItems[idx] = { ...this.data.actionItems[idx], ...updates };
      this.save();
    }
  }

  getMentorMatches() { return this.data.mentorMatches || []; }
  saveMentorMatch(match: MentorMatch) {
    if (!this.data.mentorMatches) this.data.mentorMatches = [];
    const idx = this.data.mentorMatches.findIndex(m => m.mentorId === match.mentorId);
    if (idx !== -1) {
      this.data.mentorMatches[idx] = match;
    } else {
      this.data.mentorMatches.push(match);
    }
    this.save();
  }
  clearMentorMatches() {
    this.data.mentorMatches = [];
    this.save();
  }

  // Update Live Metrics
  updateStartupMetrics(startupId: string, metrics: NonNullable<Startup['liveMetrics']>) {
    const startup = this.getStartup(startupId);
    if (startup) {
      startup.liveMetrics = { ...(startup.liveMetrics || {}), ...metrics };
      this.save();
    }
  }
  
  addMetricSnapshot(startupId: string, snapshot: MetricSnapshot) {
    const startup = this.getStartup(startupId);
    if (startup) {
      if (!startup.metricHistory) startup.metricHistory = [];
      startup.metricHistory.push(snapshot);
      this.save();
    }
  }

  // Applications
  getApplications() { return this.data.applications || []; }
  getApplication(id: string) { return this.data.applications?.find(a => a.id === id); }
  submitApplication(app: StartupApplication) {
    if (!this.data.applications) this.data.applications = [];
    this.data.applications.push(app);
    this.save();
  }
  updateApplication(id: string, updates: Partial<StartupApplication>) {
    if (!this.data.applications) return;
    const idx = this.data.applications.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.applications[idx] = { ...this.data.applications[idx], ...updates };
      this.save();
    }
  }

  approveApplication(id: string, centerId: string) {
    if (!this.data.applications) return;
    const appIdx = this.data.applications.findIndex(a => a.id === id);
    if (appIdx === -1) return;
    const app = this.data.applications[appIdx];
    
    app.status = 'Approved';
    app.assignedCenterId = centerId;
    
    const startupId = `startup-${Date.now()}`;
    const founderId = `founder-${Date.now()}`;
    
    const newStartup: Startup = {
      id: startupId,
      name: app.startupName,
      tagline: app.tagline,
      description: `${app.problemStatement}\n\nSolution: ${app.solution}`,
      sector: app.sector,
      stage: (app.stage as any) || 'idea',
      district: app.district,
      universityId: null,
      logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.startupName)}`,
      jobsCreated: app.teamSize || 1,
      monthlyRevenue: 0,
      totalFunding: 0,
      activeUsers: 0,
      healthScore: 70,
      founderReputation: 60,
      unicornScore: 15,
      soonicornScore: 15,
      investmentScore: 30,
      fundingReadiness: 30,
      isRural: app.district !== 'Visakhapatnam' && app.district !== 'Vijayawada' && app.district !== 'Guntur',
      isWomenLed: false,
      riskLevel: 'Medium',
      founders: [founderId],
      tractionHistory: [
        { month: 'Jan', revenue: 0, users: 0, jobs: app.teamSize || 1 },
        { month: 'Feb', revenue: 0, users: 0, jobs: app.teamSize || 1 },
        { month: 'Mar', revenue: 0, users: 0, jobs: app.teamSize || 1 },
      ],
      healthBreakdown: { team: 70, product: 50, market: 60, traction: 40, revenue: 30, mentorship: 80, execution: 50 },
      milestones: [
        { id: `milestone-${Date.now()}-1`, title: 'Incorporate Entity', description: 'Complete official startup registration in Andhra Pradesh', status: 'Pending', targetDate: '2026-07-31' },
        { id: `milestone-${Date.now()}-2`, title: 'Build and Launch MVP', description: 'Develop initial product prototype and launch to early users', status: 'Pending', targetDate: '2026-09-30' },
        { id: `milestone-${Date.now()}-3`, title: 'Customer Discovery Report', description: 'Interview at least 20 local target customers and document findings', status: 'Pending', targetDate: '2026-06-30' }
      ]
    };
    
    const newFounder: Founder = {
      id: founderId,
      name: app.founderName,
      email: app.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(app.founderName)}`,
      startupId: startupId,
      title: 'Founder & CEO',
      bio: `Background: ${app.background}. Education: ${app.education}`,
      district: app.district,
      isYouth: true,
      isWomen: false,
      isRural: newStartup.isRural,
      incomeBracket: 'Middle',
      firstGen: true
    };
    
    this.data.startups.push(newStartup);
    this.data.founders.push(newFounder);
    
    const center = this.data.incubationCenters?.find(c => c.id === centerId);
    if (center) {
      center.activeStartups = (center.activeStartups || 0) + 1;
    }
    
    const managerNotif: Notification = {
      id: `notif-${Date.now()}-1`,
      userId: center?.managerId || 'manager@rtih.ap.gov.in',
      type: 'application_approved',
      title: 'New Startup Incubation Portfolio',
      message: `${app.startupName} has been approved and assigned to your center (${center?.name || 'RTIH Hub'}). Please review and assign a mentor.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      linkTo: '/manager'
    };
    
    const founderNotif: Notification = {
      id: `notif-${Date.now()}-2`,
      userId: app.email,
      type: 'application_approved',
      title: 'Startup Application Approved',
      message: `Congratulations! Your startup ${app.startupName} has been approved for incubation at RTIH ${center?.name || ''}. Your organization account is now active.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      linkTo: '/founder'
    };
    
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.push(managerNotif);
    this.data.notifications.push(founderNotif);
    
    this.save();
  }
  
  rejectApplication(id: string, reason: string) {
    if (!this.data.applications) return;
    const appIdx = this.data.applications.findIndex(a => a.id === id);
    if (appIdx === -1) return;
    const app = this.data.applications[appIdx];
    
    app.status = 'Rejected';
    app.rejectionReason = reason;
    
    const founderNotif: Notification = {
      id: `notif-${Date.now()}-3`,
      userId: app.email,
      type: 'application_rejected',
      title: 'Startup Application Status Update',
      message: `We regret to inform you that your incubation application for ${app.startupName} was rejected. Reason: ${reason}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      linkTo: '/register'
    };
    
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.push(founderNotif);
    
    this.save();
  }

  // Incubation Centers
  getIncubationCenters() { return this.data.incubationCenters || []; }
  getIncubationCenter(id: string) { return this.data.incubationCenters?.find(c => c.id === id); }
  autoAssignCenter(sector: string): IncubationCenter | null {
    const centers = this.getIncubationCenters();
    return centers.find(c => c.domains.includes(sector)) || centers[0] || null;
  }

  // Departments
  getDepartments() { return this.data.departments || []; }
  addDepartment(dept: Department) {
    if (!this.data.departments) this.data.departments = [];
    this.data.departments.push(dept);
    this.save();
  }

  // Programs
  getPrograms() { return this.data.programs || []; }
  getProgramsByDept(deptId: string) { return this.getPrograms().filter(p => p.departmentId === deptId); }
  addProgram(prog: Program) {
    if (!this.data.programs) this.data.programs = [];
    this.data.programs.push(prog);
    this.save();
  }
  linkStartupToProgram(programId: string, startupId: string) {
    if (!this.data.programs) return;
    const idx = this.data.programs.findIndex(p => p.id === programId);
    if (idx !== -1 && !this.data.programs[idx].linkedStartupIds.includes(startupId)) {
      this.data.programs[idx].linkedStartupIds.push(startupId);
      this.save();
    }
  }

  // Tasks
  getTasks() { return this.data.tasks || []; }
  getTasksByStartup(startupId: string) { return this.getTasks().filter(t => t.startupId === startupId); }
  getTasksByMentor(mentorId: string) { return this.getTasks().filter(t => t.mentorId === mentorId); }
  addTask(task: Task) {
    if (!this.data.tasks) this.data.tasks = [];
    this.data.tasks.push(task);
    this.recalculateStartupHealthInline(task.startupId);
    this.save();
  }
  updateTask(id: string, updates: Partial<Task>) {
    if (!this.data.tasks) return;
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.tasks[idx] = { ...this.data.tasks[idx], ...updates };
      this.recalculateStartupHealthInline(this.data.tasks[idx].startupId);
      this.save();
    }
  }

  // Notifications
  getNotifications(userId: string) { return (this.data.notifications || []).filter(n => n.userId === userId); }
  getAllNotifications() { return this.data.notifications || []; }
  addNotification(notif: Notification) {
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift(notif);
    this.save();
  }
  markNotificationRead(id: string) {
    if (!this.data.notifications) return;
    const idx = this.data.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.data.notifications[idx].isRead = true;
      this.save();
    }
  }
  markAllNotificationsRead(userId: string) {
    if (!this.data.notifications) return;
    this.data.notifications.forEach(n => { if (n.userId === userId) n.isRead = true; });
    this.save();
  }

  // Messages
  getMessages(startupId: string) { return (this.data.messages || []).filter(m => m.startupId === startupId); }
  addMessage(msg: Message) {
    if (!this.data.messages) this.data.messages = [];
    this.data.messages.push(msg);
    this.save();
  }

  // Documents
  getDocuments(startupId: string) { return (this.data.documents || []).filter(d => d.startupId === startupId); }
  addDocument(doc: Document) {
    if (!this.data.documents) this.data.documents = [];
    this.data.documents.push(doc);
    this.recalculateStartupHealthInline(doc.startupId);
    this.save();
  }

  // Alumni
  getAlumniStartups() { return this.data.alumniStartups || []; }

  // Idea Posts
  getIdeaPosts() { return this.data.ideaPosts || []; }
  addIdeaPost(post: IdeaPost) {
    if (!this.data.ideaPosts) this.data.ideaPosts = [];
    this.data.ideaPosts.push(post);
    this.save();
  }
  incrementIdeaInterest(id: string) {
    if (!this.data.ideaPosts) return;
    const idx = this.data.ideaPosts.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.ideaPosts[idx].interestedCount++;
      this.save();
    }
  }

  // Citizen Profiles
  getCitizenProfiles() { return this.data.citizenProfiles || []; }
  saveCitizenProfile(profile: CitizenProfile) {
    if (!this.data.citizenProfiles) this.data.citizenProfiles = [];
    const idx = this.data.citizenProfiles.findIndex(p => p.email === profile.email);
    if (idx !== -1) this.data.citizenProfiles[idx] = profile;
    else this.data.citizenProfiles.push(profile);
    this.save();
  }

  // Stage Recommendations
  getStageRecommendations() { return this.data.stageRecommendations || []; }
  addStageRecommendation(rec: StageRecommendation) {
    if (!this.data.stageRecommendations) this.data.stageRecommendations = [];
    this.data.stageRecommendations.push(rec);
    this.save();
  }
  updateStageRecommendation(id: string, updates: Partial<StageRecommendation>) {
    if (!this.data.stageRecommendations) return;
    const idx = this.data.stageRecommendations.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.stageRecommendations[idx] = { ...this.data.stageRecommendations[idx], ...updates };
      this.save();
    }
  }

  // Job Postings
  getJobPostings() { return this.data.jobPostings || []; }
  getJobPostingsByStartup(startupId: string) { return this.getJobPostings().filter(j => j.startupId === startupId); }
  addJobPosting(job: JobPosting) {
    if (!this.data.jobPostings) this.data.jobPostings = [];
    this.data.jobPostings.push(job);
    this.save();
  }
  addJobApplication(jobId: string, application: JobPosting['applications'][0]) {
    if (!this.data.jobPostings) return;
    const idx = this.data.jobPostings.findIndex(j => j.id === jobId);
    if (idx !== -1) {
      this.data.jobPostings[idx].applications.push(application);
      this.save();
    }
  }
  updateJobApplication(jobId: string, appId: string, status: 'Applied' | 'Shortlisted' | 'Rejected') {
    if (!this.data.jobPostings) return;
    const jobIdx = this.data.jobPostings.findIndex(j => j.id === jobId);
    if (jobIdx !== -1) {
      const appIdx = this.data.jobPostings[jobIdx].applications.findIndex(a => a.id === appId);
      if (appIdx !== -1) {
        this.data.jobPostings[jobIdx].applications[appIdx].status = status;
        this.save();
      }
    }
  }

  addAssessment(assessment: FounderAssessment) {
    if (!this.data.assessments) this.data.assessments = [];
    const idx = this.data.assessments.findIndex(a => a.startupId === assessment.startupId);
    if (idx !== -1) {
      this.data.assessments[idx] = assessment;
    } else {
      this.data.assessments.push(assessment);
    }
    this.save();
  }

  registerForHackathon(reg: HackathonRegistration) {
    if (!this.data.registrations) this.data.registrations = [];
    this.data.registrations.push(reg);
    this.save();
  }

  submitHackathonProject(sub: HackathonSubmission) {
    if (!this.data.submissions) this.data.submissions = [];
    const idx = this.data.submissions.findIndex(s => s.startupId === sub.startupId && s.hackathonId === sub.hackathonId);
    if (idx !== -1) {
      this.data.submissions[idx] = sub;
    } else {
      this.data.submissions.push(sub);
    }
    this.save();
  }

  submitJudgeScore(submissionId: string, judgeScore: any) {
    if (!this.data.submissions) return;
    const idx = this.data.submissions.findIndex(s => s.id === submissionId);
    if (idx !== -1) {
      const sub = this.data.submissions[idx];
      if (!sub.scores) sub.scores = [];
      const existingJudgeIdx = sub.scores.findIndex(sc => sc.judgeId === judgeScore.judgeId);
      if (existingJudgeIdx !== -1) {
        sub.scores[existingJudgeIdx] = judgeScore;
      } else {
        sub.scores.push(judgeScore);
      }
      // Recalculate average
      const totalScore = sub.scores.reduce((sum, sc) => sum + (sc.innovation + sc.feasibility + sc.impact + sc.execution) / 4, 0);
      sub.finalScore = parseFloat((totalScore / sub.scores.length).toFixed(1));
      this.data.submissions[idx] = sub;
      this.save();
    }
  }

  addCertification(cert: Certificate) {
    if (!this.data.certifications) this.data.certifications = [];
    const exists = this.data.certifications.some(c => c.startupId === cert.startupId && c.type === cert.type);
    if (!exists) {
      this.data.certifications.push(cert);
      this.save();
    }
  }

  updateWatchlist(investorId: string, startupId: string, action: 'add' | 'remove') {
    if (!this.data.watchlists) this.data.watchlists = [];
    let wl = this.data.watchlists.find(w => w.investorId === investorId);
    if (!wl) {
      wl = { id: `wl-${investorId}`, investorId, startupIds: [] };
      this.data.watchlists.push(wl);
    }
    if (action === 'add') {
      if (!wl.startupIds.includes(startupId)) {
        wl.startupIds.push(startupId);
      }
    } else {
      wl.startupIds = wl.startupIds.filter(id => id !== startupId);
    }
    this.save();
  }

  updateStartup(id: string, updates: Partial<Startup>) {

    const idx = this.data.startups.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.startups[idx] = { ...this.data.startups[idx], ...updates };
      this.save();
      return this.data.startups[idx];
    }
    return null;
  }

  updateMilestone(
    startupId: string, 
    milestoneId: string, 
    status: 'Completed' | 'Pending' | 'Submitted',
    notes?: string,
    evidenceUrl?: string,
    feedback?: string
  ) {
    const startup = this.getStartup(startupId);
    if (startup) {
      const mIdx = startup.milestones.findIndex(m => m.id === milestoneId);
      if (mIdx !== -1) {
        const milestone = startup.milestones[mIdx];
        milestone.status = status;
        
        if (status === 'Submitted') {
          milestone.notes = notes;
          milestone.evidenceUrl = evidenceUrl;
          milestone.submittedAt = new Date().toISOString();
        } else if (status === 'Completed') {
          milestone.approvedAt = new Date().toISOString();
        } else if (status === 'Pending') {
          if (feedback) {
            milestone.feedback = feedback;
          }
        }
        
        this.recalculateStartupHealthInline(startupId);
        this.save();
      }
    }
  }

  getEcosystemStats() {
    const startups = this.getStartups();
    const founders = this.getFounders();
    const outposts = this.getOutposts();
    const demoMode = true;

    const totalStartups = startups.length;
    
    // Scale stats to impressive YC-grade curves if Demo Mode is active
    const liveStartupCount = demoMode ? 14850 : totalStartups + 450;
    const totalJobs = demoMode ? 122400 : startups.reduce((sum, s) => sum + s.jobsCreated, 0) + 12400;
    const soonicorns = demoMode ? 21 : startups.filter(s => s.soonicornScore > 75).length + 8;
    const unicorns = demoMode ? 11 : startups.filter(s => s.unicornScore > 80).length + 3;
    const activeOutposts = outposts.length;

    const districtDist: Record<string, number> = {};
    const sectorDist: Record<string, number> = {};
    startups.forEach(s => {
      districtDist[s.district] = (districtDist[s.district] || 0) + 1;
      sectorDist[s.sector] = (sectorDist[s.sector] || 0) + 1;
    });

    const familiesReached = demoMode ? 82400 : totalStartups * 8 + 4200;
    const ruralFounders = founders.filter(f => f.isRural).length + (demoMode ? 120 : 0);
    const womenFounders = founders.filter(f => f.isWomen).length + (demoMode ? 85 : 0);
    const youthFounders = founders.filter(f => f.isYouth).length + (demoMode ? 240 : 0);

    return {
      totalStartups: liveStartupCount,
      targetStartups: 20000,
      totalJobs,
      targetJobs: 100000,
      soonicorns,
      targetSoonicorns: 20,
      unicorns,
      targetUnicorns: 10,
      activeOutposts,
      targetOutposts: 10,
      districtDist,
      sectorDist,
      familyTrack: {
        familiesReached,
        entrepreneursCreated: founders.length + (demoMode ? 180 : 80),
        ruralFounders,
        womenFounders,
        youthFounders
      }
    };
  }
}

// Global active mode management helpers
export function isDemoModeActive(): boolean {
  return true;
}

export function setDemoModeActive(val: boolean) {
  // Demo mode is now permanently enabled as the premium high-fidelity default.
  if (typeof window === 'undefined') return;
  localStorage.setItem('rtih_demo_mode', 'true');
  window.dispatchEvent(new Event('rtih_mode_change'));
}


export function isExecutiveModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('rtih_executive_mode') === 'true';
}

export function setExecutiveModeActive(val: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rtih_executive_mode', val ? 'true' : 'false');
  window.dispatchEvent(new Event('rtih_mode_change'));
}

let dbInstance: MockDatabase | null = null;
export function getDb(): MockDatabase {
  if (!dbInstance) {
    dbInstance = new MockDatabase();
  }
  return dbInstance;
}

export interface ActiveUser {
  id: string;
  email: string;
  name: string;
  role: 'founder' | 'mentor' | 'manager' | 'admin' | 'investor';
  startupId?: string | null;
  companyName?: string | null;
  district?: string | null;
  hubName?: string | null;
}

export function getActiveUser(): ActiveUser | null {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem('rtih_active_user');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function setActiveUser(user: ActiveUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('rtih_active_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('rtih_active_user');
  }
  window.dispatchEvent(new Event('rtih_user_change'));
}

// Global storage event listener to synchronize database and user state across multiple tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'rtih_innovationos_db') {
      getDb().reload();
      window.dispatchEvent(new Event('rtih_mode_change'));
    }
    if (e.key === 'rtih_active_user') {
      window.dispatchEvent(new Event('rtih_user_change'));
    }
  });
}
