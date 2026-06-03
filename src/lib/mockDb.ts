// Deterministic Seeding Engine with Demo & Executive Modes for RTIH InnovationOS

export type StartupStage = 'idea' | 'validation' | 'prototype' | 'mvp' | 'users' | 'revenue' | 'funding' | 'scale';

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
  healthBreakdown: { team: number; product: number; market: number; traction: number; revenue: number; mentorship: number; execution: number };
  milestones: { id: string; title: string; description: string; status: 'Completed' | 'Pending'; targetDate: string }[];
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
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  expertise: string[];
  bio: string;
  impactScore: number;
  reputationScore: number;
  sessionsCompleted: number;
  portfolioStartups: string[]; // startup IDs
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

// Actual RTIH sectors
export const SECTORS = [
  'AI',
  'Biotech',
  'Climate Tech',
  'Clean Energy',
  'Advanced Manufacturing',
  'FinTech',
  'AgriTech',
  'Healthcare',
  'Blue Economy',
  'Smart Infrastructure',
  'Emerging Technologies'
];

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
  'Chittoor'
];

// High-fidelity local startup names based on AP context
const PREMIUM_STARTUPS = [
  { name: 'Kalyan AgriSystems', sector: 'AgriTech', tag: 'IoT soil diagnostic probes and automated drone spraying links.' },
  { name: 'Vizaq NeuroTech', sector: 'AI', tag: 'Edge AI diagnostic toolkits for local clinics and neurologists.' },
  { name: 'Rayalaseema Solars', sector: 'Clean Energy', tag: 'Micro-inverter arrays for off-grid rural power grids.' },
  { name: 'Amaravati FinPay', sector: 'FinTech', tag: 'UPI-linked crop-collateralized seed credit algorithms.' },
  { name: 'Nellore ShrimpTech', sector: 'Blue Economy', tag: 'Satellite telemetry water quality checkers for aquaculture.' },
  { name: 'Tirupati BioLabs', sector: 'Biotech', tag: 'Enzyme-based natural plant defense formulations.' },
  { name: 'Godavari EcoFuels', sector: 'Climate Tech', tag: 'Bio-refinery mapping models transforming crop waste into clean fuels.' },
  { name: 'Krishna AdvancedForge', sector: 'Advanced Manufacturing', tag: 'Additive metal printing nodes for heavy industrial axles.' },
  { name: 'Indo SmartGrid', sector: 'Smart Infrastructure', tag: 'Mesh topology power routing controls for municipal lights.' },
  { name: 'Kakinada OceanSensors', sector: 'Emerging Technologies', tag: 'Sonar-guided fish migration predictors for coastal trawlers.' }
];

const STARTUP_PREFIX = ['Tejas', 'Vijay', 'Bharat', 'Kalyan', 'Veda', 'Pragati', 'Ganga', 'Dakshin', 'Vyom', 'Sankalp'];
const STARTUP_SUFFIX = ['Systems', 'Analytics', 'Robotics', 'Space', 'Dynamics', 'Digital', 'Solutions', 'Genetics', 'Power'];

const FIRST_NAMES = ['Ramesh', 'Suresh', 'Venkatesh', 'Kalyani', 'Radha', 'Srinivas', 'Satish', 'Sai', 'Divya', 'Pavan', 'Chandra', 'Madhav', 'Lakshmi', 'Anirudh'];
const LAST_NAMES = ['Koppula', 'Yalamanchili', 'Bhimavarapu', 'Koneru', 'Devineni', 'Galla', 'Palla', 'Jasti', 'Katragadda', 'Sunkara', 'Mylavarapu'];

const UNIVERSITIES_LIST = [
  'Andhra University',
  'Sri Venkateswara University',
  'JNTU Anantapur',
  'JNTU Kakinada',
  'Gitam University',
  'K L University',
  'Acharya Nagarjuna University',
  'SRM University AP',
  'VIT AP University',
  'IIT Tirupati',
  'NIT Andhra Pradesh'
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
} {
  const rng = new SeededRandom(101); // deterministic seed

  // 1. Generate Universities
  const universities: University[] = UNIVERSITIES_LIST.map((univName, idx) => {
    const district = rng.nextElement(DISTRICTS);
    return {
      id: `univ-${idx + 1}`,
      name: univName,
      district,
      innovationCell: `${univName} Innovation Cell`,
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

  for (let i = 0; i < 250; i++) {
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

    const uniName = rng.nextElement(UNIVERSITIES_LIST);
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
    let name = '';
    let tagline = '';
    let sector = '';

    if (i < PREMIUM_STARTUPS.length) {
      name = PREMIUM_STARTUPS[i].name;
      sector = PREMIUM_STARTUPS[i].sector;
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
      sector = rng.nextElement(SECTORS);
      tagline = `Pioneering scalable technological frameworks in ${sector} out of AP.`;
    }
    generatedStartupNames.add(name);

    // Dynamic stage distribution (Demo Mode shifts startups towards scale/funding)
    let stage = rng.nextElement(stages);
    if (demoMode) {
      stage = rng.nextElement(['mvp', 'users', 'revenue', 'funding', 'scale']);
    }

    const district = rng.nextElement(DISTRICTS);
    const univ = rng.nextBoolean(0.70) ? rng.nextElement(universities) : null;
    const isRural = rng.nextBoolean(0.38);
    const isWomenLed = rng.nextBoolean(0.30);

    let monthlyRevenue = 0;
    let totalFunding = 0;
    let activeUsers = 0;
    let jobsCreated = rng.nextRange(2, 6);

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

    const healthBreakdown = {
      team: demoMode ? rng.nextRange(75, 98) : rng.nextRange(60, 95),
      product: demoMode ? rng.nextRange(72, 98) : rng.nextRange(55, 94),
      market: demoMode ? rng.nextRange(80, 99) : rng.nextRange(65, 97),
      traction: demoMode ? rng.nextRange(65, 98) : rng.nextRange(40, 92),
      revenue: stage === 'idea' || stage === 'validation' ? 0 : (demoMode ? rng.nextRange(70, 98) : rng.nextRange(40, 90)),
      mentorship: demoMode ? rng.nextRange(82, 99) : rng.nextRange(70, 95),
      execution: demoMode ? rng.nextRange(78, 98) : rng.nextRange(60, 95)
    };

    const healthScore = Math.floor(
      (healthBreakdown.team +
        healthBreakdown.product +
        healthBreakdown.market +
        healthBreakdown.traction +
        healthBreakdown.revenue +
        healthBreakdown.mentorship +
        healthBreakdown.execution) /
        7
    );

    const founderReputation = demoMode ? rng.nextRange(75, 99) : rng.nextRange(50, 96);
    const unicornScore = stage === 'scale' || stage === 'funding' ? (demoMode ? rng.nextRange(75, 98) : rng.nextRange(60, 90)) : rng.nextRange(15, 55);
    const soonicornScore = stage === 'revenue' || stage === 'funding' ? (demoMode ? rng.nextRange(80, 98) : rng.nextRange(65, 92)) : rng.nextRange(20, 65);
    const investmentScore = demoMode ? rng.nextRange(70, 98) : rng.nextRange(40, 92);
    const fundingReadiness = demoMode ? rng.nextRange(75, 99) : rng.nextRange(40, 94);
    const riskLevel: 'Low' | 'Medium' | 'High' = demoMode ? 'Low' : (rng.nextElement(['Low', 'Low', 'Medium', 'High']) as 'Low' | 'Medium' | 'High');

    // Generate traction with perfect upward slope for Demo Mode
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const tractionHistory = months.map((month, idx) => {
      const multiplier = demoMode ? (1.1 + idx * 0.15) : (0.7 + idx * 0.1);
      return {
        month,
        revenue: Math.floor(monthlyRevenue * multiplier),
        users: Math.floor(activeUsers * multiplier),
        jobs: Math.floor(jobsCreated * (0.8 + idx * 0.05))
      };
    });

    const milestones: { id: string; title: string; description: string; status: 'Completed' | 'Pending'; targetDate: string }[] = [
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

    const startupId = `startup-${i + 1}`;
    const startFounderIdx = i * 2;
    const assignedFounders: string[] = [];
    for (let f = 0; f < rng.nextRange(2, 4); f++) {
      const founderIdx = (startFounderIdx + f) % founders.length;
      founders[founderIdx].startupId = startupId;
      founders[founderIdx].isWomen = isWomenLed;
      founders[founderIdx].isRural = isRural;
      assignedFounders.push(founders[founderIdx].id);
    }

    if (univ) {
      const uniObj = universities.find(u => u.id === univ.id);
      if (uniObj) {
        uniObj.startupsCount += 1;
        uniObj.foundersCount += assignedFounders.length;
      }
    }

    const outpost = outposts.find(o => o.district === district) || rng.nextElement(outposts);
    outpost.incubatedCount += 1;

    startups.push({
      id: startupId,
      name,
      tagline,
      description: `Developing standard-compliant tech solutions. Working directly with regional innovation centers and local outposts in AP to solve key challenges in ${sector}.`,
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
      healthBreakdown,
      milestones
    });
  }

  // 5. Generate Mentors
  const mentors: Mentor[] = [];
  const generatedMentorNames = new Set<string>();

  for (let i = 0; i < 80; i++) {
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
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
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

  return { startups, founders, mentors, investors, universities, outposts, sessions };
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
  };

  constructor() {
    const demoMode = true;
    
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(MockDatabase.STORAGE_KEY);
      if (cached) {
        try {
          this.data = JSON.parse(cached);
          // If we have cached data, ensure it is high-fidelity and not the basic seed
          if (this.data && this.data.startups && this.data.startups.length > 0) {
            const hasScale = this.data.startups.some(s => s.stage === 'scale');
            if (!hasScale) {
              this.data = generateInitialData(true);
              this.save();
            }
          }
          return;
        } catch (e) {
          console.error(e);
        }
      }
    }
    this.data = generateInitialData(true);
    this.save();
  }

  reseed(demoMode: boolean) {
    this.data = generateInitialData(true);
    this.save();
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MockDatabase.STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  getStartups() { return this.data.startups; }
  getStartup(id: string) { return this.data.startups.find(s => s.id === id); }
  getFounders() { return this.data.founders; }
  getFounder(id: string) { return this.data.founders.find(f => f.id === id); }
  getMentors() { return this.data.mentors; }
  getMentor(id: string) { return this.data.mentors.find(m => m.id === id); }
  getInvestors() { return this.data.investors; }
  getInvestor(id: string) { return this.data.investors.find(i => i.id === id); }
  getUniversities() { return this.data.universities; }
  getOutposts() { return this.data.outposts; }
  getSessions() { return this.data.sessions; }

  updateStartup(id: string, updates: Partial<Startup>) {
    const idx = this.data.startups.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.startups[idx] = { ...this.data.startups[idx], ...updates };
      this.save();
      return this.data.startups[idx];
    }
    return null;
  }

  updateMilestone(startupId: string, milestoneId: string, status: 'Completed' | 'Pending') {
    const startup = this.getStartup(startupId);
    if (startup) {
      const mIdx = startup.milestones.findIndex(m => m.id === milestoneId);
      if (mIdx !== -1) {
        startup.milestones[mIdx].status = status;
        this.updateStartup(startupId, { milestones: [...startup.milestones] });
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
  role: 'founder' | 'mentor' | 'manager' | 'admin';
  startupId?: string | null;
  companyName?: string | null;
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
