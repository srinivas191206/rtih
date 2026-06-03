// Flagship Core Engines for RTIH InnovationOS
import type { Startup, StartupStage, Task, Document, MentorSession } from './mockDb';

// 1. Startup GPS Stages and Thresholds
export const GPS_STAGES: { stage: StartupStage; label: string; description: string; nextRequirements: string[] }[] = [
  {
    stage: 'idea',
    label: 'Idea Stage',
    description: 'Initial brainstorming, problem definition, and forming the founding team.',
    nextRequirements: ['Submit customer discovery plan', 'Conduct 20 customer interviews', 'Verify market problem-solution fit']
  },
  {
    stage: 'validation',
    label: 'Validation Stage',
    description: 'Validating the problem and solution via quantitative surveys and qualitative research.',
    nextRequirements: ['Complete market sizing (TAM/SAM/SOM)', 'Define value proposition canvas', 'Create landing page and get 100 signups']
  },
  {
    stage: 'prototype',
    label: 'Prototype Stage',
    description: 'Designing and building the mockups, wireframes, or working physical prototype.',
    nextRequirements: ['Deploy prototype to sandbox/local environment', 'Demo prototype to 3 mentors', 'Incorporate initial mentor feedback']
  },
  {
    stage: 'mvp',
    label: 'MVP Launch',
    description: 'Building and launching the Minimum Viable Product (MVP) to early adopters.',
    nextRequirements: ['Acquire 500 active users', 'Obtain product-market fit feedback score > 40%', 'Launch basic analytics instrumentation']
  },
  {
    stage: 'users',
    label: 'User Traction',
    description: 'Focusing heavily on user acquisition, engagement metrics, and organic retention.',
    nextRequirements: ['Maintain weekly active user (WAU) growth > 5%', 'Demonstrate 30-day user retention > 35%', 'Implement initial monetization models']
  },
  {
    stage: 'revenue',
    label: 'Revenue Generation',
    description: 'Monetizing user behaviors and building predictable monthly recurring revenue stream.',
    nextRequirements: ['Reach monthly recurring revenue (MRR) of 1,00,000 INR', 'Stabilize customer acquisition cost (CAC)', 'Optimize margins to positive unit economics']
  },
  {
    stage: 'funding',
    label: 'Seed Funding',
    description: 'Raising external seed investments, venture capitals, or government matching grants.',
    nextRequirements: ['Complete legal and financial due diligence checks', 'Raise minimum 15,00,000 INR in capital', 'Expand engineering and sales core teams']
  },
  {
    stage: 'scale',
    label: 'Global Scaling',
    description: 'Scaling operations across state borders, global expansion, and structural maturation.',
    nextRequirements: ['Expand distribution to 3 Indian states / globally', 'Grow workforce by > 100 jobs created', 'Initiate institutional Series-A conversations']
  }
];

// 2. Venture Health Evaluation Breakdown
export function calculateVentureHealth(startup: Startup) {
  const { team, product, market, traction, revenue, mentorship, execution } = startup.healthBreakdown;
  const overallScore = Math.floor((team + product + market + traction + revenue + mentorship + execution) / 7);

  const statuses = [
    { label: 'Critically Vulnerable', max: 45, color: 'text-red-500 bg-red-500/10 border-red-500/20', description: 'Requires immediate program manager intervention.' },
    { label: 'Needs Improvement', max: 65, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', description: 'Gaps identified in execution or traction metrics.' },
    { label: 'Healthy & Progressing', max: 85, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', description: 'Steady growth. Meeting standard milestones.' },
    { label: 'Exemplary Performance', max: 100, color: 'text-teal-400 bg-teal-400/10 border-teal-400/20', description: 'High-growth trajectory. Strong candidate for Soonicorn cohort.' }
  ];

  const currentStatus = statuses.find(s => overallScore <= s.max) || statuses[statuses.length - 1];

  return {
    overallScore,
    statusLabel: currentStatus.label,
    colorClass: currentStatus.color,
    description: currentStatus.description,
    breakdown: [
      { name: 'Team Alignment', score: team },
      { name: 'Product/Tech Maturity', score: product },
      { name: 'Market Potential (TAM)', score: market },
      { name: 'User Traction Velocity', score: traction },
      { name: 'Revenue / Unit Economics', score: revenue },
      { name: 'Mentor Net Promoter Score', score: mentorship },
      { name: 'Execution of Milestones', score: execution }
    ]
  };
}

// 3. Startup Risk Predictor
export interface StartupRiskReport {
  overallRisk: 'Low' | 'Medium' | 'High';
  color: string;
  indicators: { title: string; risk: 'Low' | 'Medium' | 'High'; detail: string }[];
  recommendations: string[];
}

export function predictStartupRisk(startup: Startup): StartupRiskReport {
  const indicators: { title: string; risk: 'Low' | 'Medium' | 'High'; detail: string }[] = [];
  const recommendations: string[] = [];

  // Index 1: Financial Runway Risk
  if (startup.stage === 'revenue' || startup.stage === 'funding' || startup.stage === 'scale') {
    if (startup.monthlyRevenue < 100000 && startup.totalFunding < 1000000) {
      indicators.push({ title: 'Capital Runway', risk: 'High', detail: 'Low monthly revenue combined with minimal seed capital increases operational runway risk.' });
      recommendations.push('Apply immediately for the RTIH Seed Support grant up to 10 Lakhs INR.');
    } else {
      indicators.push({ title: 'Capital Runway', risk: 'Low', detail: 'Adequate revenue generation or funding matches current team overhead.' });
    }
  } else {
    indicators.push({ title: 'Capital Runway', risk: 'Medium', detail: 'Pre-revenue stage. Dependent on boot-strapped founder capital.' });
    recommendations.push('Participate in the upcoming Demo Day to pitch to early-stage angel syndicates.');
  }

  // Index 2: Team Attrition / Competency Risk
  if (startup.healthBreakdown.team < 60) {
    indicators.push({ title: 'Founding Team Cohere', risk: 'High', detail: 'Low team alignment indicates co-founder misalignment or skill gaps.' });
    recommendations.push('Schedule a mediation session with an RTIH EIR (Entrepreneur-in-Residence).');
  } else if (startup.healthBreakdown.team < 75) {
    indicators.push({ title: 'Founding Team Cohere', risk: 'Medium', detail: 'Tech or marketing gaps identified in the operational team.' });
    recommendations.push('Leverage university outpost talent portal to hire skilled student interns.');
  } else {
    indicators.push({ title: 'Founding Team Cohere', risk: 'Low', detail: 'Robust co-founder compatibility and balanced technical-business skills.' });
  }

  // Index 3: Traction Growth Velocity
  if (startup.stage !== 'idea' && startup.healthBreakdown.traction < 55) {
    indicators.push({ title: 'User Adoption Velocity', risk: 'High', detail: 'Declining user signups or high product churn indicates low retention.' });
    recommendations.push('Run a Customer Discovery Pivot cycle to audit customer needs.');
  } else {
    indicators.push({ title: 'User Adoption Velocity', risk: 'Low', detail: 'Consistent monthly compounding active user growth.' });
  }

  // Determine overall risk
  const highCounts = indicators.filter(i => i.risk === 'High').length;
  const medCounts = indicators.filter(i => i.risk === 'Medium').length;

  let overallRisk: 'Low' | 'Medium' | 'High' = 'Low';
  let color = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

  if (highCounts >= 1 || startup.riskLevel === 'High') {
    overallRisk = 'High';
    color = 'text-red-500 bg-red-500/10 border-red-500/20';
  } else if (medCounts >= 1 || startup.riskLevel === 'Medium') {
    overallRisk = 'Medium';
    color = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
  }

  return {
    overallRisk,
    color,
    indicators,
    recommendations
  };
}

// 4. Government Scheme & Grant Matching Engine
export interface GovernmentScheme {
  id: string;
  name: string;
  department: string;
  benefits: string;
  eligibility: string;
  matchingScore: number;
}

export function matchGovernmentSchemes(startup: Startup): GovernmentScheme[] {
  const ALL_SCHEMES = [
    {
      id: 'scheme-rtih-seed',
      name: 'Ratan Tata Seed Capital Fund',
      department: 'RTIH / AP Innovation Society',
      benefits: 'Seed funding grant up to 15,00,000 INR at 0% equity.',
      eligibility: 'Must be incubated under RTIH, have a registered entity in Andhra Pradesh, and be at MVP or Traction stage.',
      matchFunc: (s: Startup) => {
        let score = 50;
        if (s.stage !== 'idea' && s.stage !== 'validation') score += 30;
        if (s.healthScore > 70) score += 20;
        return score;
      }
    },
    {
      id: 'scheme-ap-it-policy',
      name: 'Andhra Pradesh Startup IT Policy 2021-2026 Incentives',
      department: 'Dept of IT, Electronics & Communications, AP',
      benefits: 'Reimbursement of patent filing fees (100% domestic, 50% international), power subsidy, and office space rental rebate.',
      eligibility: 'Sectors: Fintech, Blockchain, AVGC & XR, Space Tech, Battery & Adv. Manufacturing, Electronics Cluster, Industrial IoT, Automotive & EV sys, Smart Infra, Urban Systems.',
      matchFunc: (s: Startup) => {
        let score = 40;
        if (['Fintech', 'Blockchain', 'AVGC & XR', 'Space Tech', 'Battery & Adv. Manufacturing', 'Electronics Cluster', 'Industrial IoT', 'Automotive & EV sys', 'Smart Infra', 'Urban Systems'].includes(s.sector)) score += 40;
        if (s.stage === 'revenue' || s.stage === 'scale') score += 20;
        return score;
      }
    },
    {
      id: 'scheme-women-entrepreneur',
      name: 'AP Standup Women Startup Grant',
      department: 'AP Women Cooperative Finance Corp & RTIH',
      benefits: 'Direct financial subsidy of 5,00,000 INR and priority co-working incubation space.',
      eligibility: 'Startup must be women-led (female co-founder holding >51% equity).',
      matchFunc: (s: Startup) => {
        return s.isWomenLed ? 100 : 0;
      }
    },
    {
      id: 'scheme-rural-agri',
      name: 'Rural AP Agri-Linkage Innovation Grant',
      department: 'Dept of Agriculture, Government of AP',
      benefits: 'Direct pilot linkage with Rythu Bharosa Kendras (RBKs) and a research stipend of 7,50,000 INR.',
      eligibility: 'AgriTech startups implementing rural deployment in AP districts.',
      matchFunc: (s: Startup) => {
        let score = 0;
        if (['Agri Technology', 'Agri & Food Processing', 'Horti Tech & Diary', 'Food Processing'].includes(s.sector)) score += 60;
        if (s.isRural) score += 40;
        return score;
      }
    },
    {
      id: 'scheme-blue-economy',
      name: 'AP Blue Economy Development Scheme',
      department: 'Fisheries & Marine Board, AP',
      benefits: 'Technology adoption subsidy of 12,00,000 INR for coastal tech deployment.',
      eligibility: 'Blue Economy startups deploying in Visakhapatnam, Kakinada, Nellore, or other coastal districts.',
      matchFunc: (s: Startup) => {
        let score = 0;
        if (['Blue economy', 'Marine Tech', 'Aquaculture'].includes(s.sector)) score += 70;
        if (['Visakhapatnam', 'Srikakulam', 'Vizianagaram', 'Prakasam', 'Sri Potti Sriramulu Nellore'].includes(s.district)) score += 30;
        return score;
      }
    }
  ];

  return ALL_SCHEMES.map(scheme => ({
    id: scheme.id,
    name: scheme.name,
    department: scheme.department,
    benefits: scheme.benefits,
    eligibility: scheme.eligibility,
    matchingScore: scheme.matchFunc(startup)
  }))
    .filter(scheme => scheme.matchingScore > 0)
    .sort((a, b) => b.matchingScore - a.matchingScore);
}

// 5. Universal Innovation Score Engine
export function calculateInnovationScore(
  startup: Startup,
  certificationsCount: number = 0,
  hasHackathonParticipation: boolean = false,
  lmmCompletionRate: number = 0.5
): number {
  const healthScore = startup.healthScore;
  const stageWeights: Record<StartupStage, number> = {
    idea: 5,
    validation: 10,
    prototype: 15,
    mvp: 20,
    users: 25,
    revenue: 30,
    funding: 33,
    scale: 35
  };
  const stageScore = stageWeights[startup.stage] || 5;
  const healthScoreWeight = (healthScore / 100) * 20;
  const certScore = Math.min(20, certificationsCount * 4); // 4 points per cert
  const hackScore = hasHackathonParticipation ? 10 : 0;
  const learningScore = lmmCompletionRate * 10;
  const investScore = (startup.investmentScore / 100) * 15;
  
  return Math.min(100, Math.floor(stageScore + healthScoreWeight + certScore + hackScore + learningScore + investScore));
}

// 6. Intelligent Onboarding Assessment Engine
export function evaluateFounderAssessment(
  idea: string,
  sector: string,
  stage: StartupStage,
  teamSize: number,
  revenueStatus: string,
  mvpStatus: string,
  experience: string,
  mentorsList: any[]
) {
  let readinessScore = 65;
  if (teamSize > 2) readinessScore += 10;
  if (experience.length > 50) readinessScore += 15;
  readinessScore = Math.min(95, readinessScore);

  let maturityScore = 20;
  const stageScores: Record<StartupStage, number> = {
    idea: 15,
    validation: 30,
    prototype: 50,
    mvp: 65,
    users: 75,
    revenue: 85,
    funding: 90,
    scale: 95
  };
  maturityScore = stageScores[stage] || 20;
  if (mvpStatus === 'mvp') maturityScore = Math.max(maturityScore, 65);
  if (revenueStatus === 'revenue') maturityScore = Math.max(maturityScore, 75);

  const learningJourney = [
    'Customer Discovery & Problem Validation',
    'Market Research & Competitive Auditing',
    'Product Development & Prototyping'
  ];
  if (stage === 'mvp' || stage === 'users') {
    learningJourney.push('Growth Hacking & User Acquisition');
  }
  if (['revenue', 'funding', 'scale'].includes(stage)) {
    learningJourney.push('Unit Economics & Financial Projections');
    learningJourney.push('Cap Table Modeling & Fundraising');
  }

  const sectorMentors = mentorsList.filter(m => 
    m.expertise.some((exp: string) => exp.toLowerCase() === sector.toLowerCase())
  );
  const chosenMentors = sectorMentors.length > 0 ? sectorMentors.slice(0, 2) : mentorsList.slice(0, 2);

  const recommendedMentors = chosenMentors.map((m, idx) => {
    const matchScore = 90 - idx * 5 + (sectorMentors.includes(m) ? 8 : 0);
    return {
      name: m.name,
      matchScore: Math.min(98, matchScore),
      reason: `${sector} domain expert with ${m.sessionsCompleted}+ successful state advisory sessions.`,
      focus: stage === 'idea' || stage === 'validation' ? 'Validating value proposition and initial target customer discovery.' : 'Refining product telemetry scaling and raising matching grants.'
    };
  });

  const recommendedMilestones = [
    'Submit RTIH Seed Fund Application',
    'Deploy crop telemetry beta nodes and review telemetry'
  ];

  return {
    readinessScore,
    maturityScore,
    learningJourney,
    recommendedMentors,
    recommendedMilestones
  };
}

// 7. Dynamic Venture Health Calculation Engine (9 Indicators)
export function calculateDynamicVentureHealth(
  startup: Startup,
  tasks: Task[],
  documents: Document[],
  sessions: MentorSession[],
  weights: {
    progress: number;
    product: number;
    team: number;
    market: number;
    financial: number;
    funding: number;
    mentor: number;
    documentation: number;
    risk: number;
  }
) {
  // 1. Progress (20%): milestones & tasks
  let milestoneScore = 100;
  if (startup.milestones && startup.milestones.length > 0) {
    const completed = startup.milestones.filter(m => m.status === 'Completed').length;
    milestoneScore = Math.floor((completed / startup.milestones.length) * 100);
  }
  let taskScore = 100;
  if (tasks && tasks.length > 0) {
    const completed = tasks.filter(t => t.status === 'Verified' || t.status === 'Submitted').length;
    taskScore = Math.floor((completed / tasks.length) * 100);
  }
  const progressScore = Math.floor((milestoneScore * 0.6) + (taskScore * 0.4));

  // 2. Product (15%): stage + documents
  const stageWeights: Record<StartupStage, number> = {
    idea: 30,
    validation: 45,
    prototype: 60,
    mvp: 75,
    users: 85,
    revenue: 90,
    funding: 95,
    scale: 100
  };
  const baseProductScore = stageWeights[startup.stage] || 30;
  let docProductBonus = 0;
  if (documents && documents.length > 0) {
    if (documents.some(d => d.type === 'Technical Spec')) docProductBonus += 10;
    if (documents.some(d => d.type === 'Business Plan')) docProductBonus += 10;
    if (documents.some(d => d.name.toLowerCase().includes('prototype') || d.name.toLowerCase().includes('demo'))) docProductBonus += 10;
  }
  const productScore = Math.min(100, baseProductScore + docProductBonus);

  // 3. Team (10%): team size, technical founders
  const founderCount = startup.founders ? startup.founders.length : 1;
  let teamScore = founderCount === 1 ? 50 : founderCount === 2 ? 85 : 100;
  if (startup.jobsCreated > 2) teamScore = Math.min(100, teamScore + 10);

  // 4. Market (15%): active users, interviews completed, survey/validation doc uploads
  let marketScore = 40;
  if (startup.stage === 'idea' || startup.stage === 'validation') {
    const hasValidationDoc = documents.some(d => d.name.toLowerCase().includes('validation') || d.name.toLowerCase().includes('discovery') || d.name.toLowerCase().includes('interview'));
    const hasValidationTask = tasks.some(t => (t.status === 'Verified' || t.status === 'Submitted') && (t.title.toLowerCase().includes('interview') || t.title.toLowerCase().includes('discovery') || t.title.toLowerCase().includes('customer')));
    if (hasValidationDoc) marketScore += 30;
    if (hasValidationTask) marketScore += 30;
  } else {
    if (startup.activeUsers > 50000) marketScore = 100;
    else if (startup.activeUsers > 10000) marketScore = 90;
    else if (startup.activeUsers > 1000) marketScore = 75;
    else if (startup.activeUsers > 100) marketScore = 60;
    else marketScore = 50;
  }
  if (documents.some(d => d.type === 'Pitch Deck')) marketScore = Math.min(100, marketScore + 10);

  // 5. Financial (15%): revenue, funding, runway, financial statements
  let financialScore = 50;
  if (startup.monthlyRevenue > 500000) financialScore = 100;
  else if (startup.monthlyRevenue > 100000) financialScore = 85;
  else if (startup.monthlyRevenue > 0) financialScore = 70;
  else if (startup.totalFunding > 1000000) financialScore = 60;
  
  if (documents.some(d => d.type === 'Financial Model')) financialScore = Math.min(100, financialScore + 20);

  // 6. Funding (10%): pitch deck, business plan, projections
  let fundingScore = 30;
  if (documents.some(d => d.type === 'Pitch Deck')) fundingScore += 40;
  if (documents.some(d => d.type === 'Financial Model')) fundingScore += 30;
  if (startup.stage === 'funding' || startup.stage === 'scale') fundingScore = Math.min(100, fundingScore + 20);
  fundingScore = Math.min(100, fundingScore);

  // 7. Mentor Engagement (5%): sessions, tasks
  let mentorScore = 50;
  if (sessions && sessions.length > 0) {
    const completedSessions = sessions.filter(s => s.status === 'Completed').length;
    mentorScore = completedSessions >= 5 ? 100 : completedSessions >= 3 ? 85 : completedSessions >= 1 ? 70 : 50;
  }
  const mentorTasks = tasks.filter(t => t.status === 'Verified').length;
  if (mentorTasks > 0) mentorScore = Math.min(100, mentorScore + 15);

  // 8. Documentation (5%): completeness, vault files
  let docScore = 40;
  if (startup.description && startup.description.length > 100) docScore += 20;
  if (documents && documents.length > 0) {
    docScore += Math.min(40, documents.length * 10);
  }
  docScore = Math.min(100, docScore);

  // 9. Risk (5%): inactivity, overdue tasks, risk Level
  let riskScore = 100;
  if (startup.riskLevel === 'High') riskScore -= 30;
  else if (startup.riskLevel === 'Medium') riskScore -= 15;
  
  const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;
  riskScore -= overdueTasks * 15;
  
  const pendingMilestones = startup.milestones ? startup.milestones.filter(m => m.status === 'Pending').length : 0;
  riskScore -= Math.min(30, pendingMilestones * 5);
  riskScore = Math.max(0, riskScore);

  // Overall Health Calculation
  const totalWeight = weights.progress + weights.product + weights.team + weights.market + weights.financial + weights.funding + weights.mentor + weights.documentation + weights.risk;
  const divisor = totalWeight > 0 ? totalWeight : 100;
  const rawOverall = (
    progressScore * weights.progress +
    productScore * weights.product +
    teamScore * weights.team +
    marketScore * weights.market +
    financialScore * weights.financial +
    fundingScore * weights.funding +
    mentorScore * weights.mentor +
    docScore * weights.documentation +
    riskScore * weights.risk
  ) / divisor;
  
  const healthScore = Math.max(0, Math.min(100, Math.floor(rawOverall)));
  const healthCategory = healthScore < 50 ? 'Critical' : healthScore < 60 ? 'At Risk' : healthScore < 75 ? 'Stable' : healthScore < 90 ? 'Healthy' : 'Excellent';

  const healthBreakdown = {
    team: Math.floor(teamScore),
    product: Math.floor(productScore),
    market: Math.floor(marketScore),
    traction: Math.floor(progressScore),
    revenue: Math.floor(financialScore),
    mentorship: Math.floor(mentorScore),
    execution: Math.floor(progressScore),
    
    progress: Math.floor(progressScore),
    financial: Math.floor(financialScore),
    funding: Math.floor(fundingScore),
    mentor: Math.floor(mentorScore),
    documentation: Math.floor(docScore),
    risk: Math.floor(riskScore)
  };

  return {
    healthScore,
    healthCategory,
    healthBreakdown
  };
}

export function generateAIHealthReport(startup: any, tasks: any[], documents: any[]) {
  const score = startup.healthScore;
  const category = startup.healthCategory || 'Stable';
  
  const missingDocs = [];
  if (!documents.some(d => d.type === 'Pitch Deck')) missingDocs.push('Pitch Deck');
  if (!documents.some(d => d.type === 'Business Plan')) missingDocs.push('Business Plan');
  if (!documents.some(d => d.type === 'Financial Model')) missingDocs.push('Financial Model');
  if (!documents.some(d => d.type === 'Technical Spec')) missingDocs.push('Technical Spec');

  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  if (score >= 75) {
    strengths.push('High customer validation and active user traction.');
    strengths.push('Excellent compliance documentation standing.');
    strengths.push('Strong, multi-founder team dynamics.');
  } else {
    strengths.push('Committed founding team with clear sector expertise.');
    strengths.push('Active participation in RTIH mentorship circles.');
  }

  if (missingDocs.length > 0) {
    weaknesses.push(`Missing critical documents in vault: ${missingDocs.slice(0, 2).join(', ')}.`);
    recommendations.push(`Upload missing ${missingDocs[0]} to vault to boost your Funding Readiness score.`);
  } else {
    weaknesses.push('Runway and financial margins require optimization.');
    recommendations.push('Develop secondary revenue pilot options to prove unit economics.');
  }

  if (startup.riskLevel === 'High' || score < 60) {
    weaknesses.push('High operational risk flagged due to inactivity or overdue milestones.');
    recommendations.push('Initiate a priority check-in with your assigned Mentor to outline a 30-day action plan.');
  } else {
    recommendations.push('Maintain active user acquisition growth and document progress on current milestones.');
  }

  const nextMilestones = startup.milestones 
    ? startup.milestones.filter((m: any) => m.status === 'Pending').map((m: any) => m.title).slice(0, 2)
    : ['Incorporate business', 'Launch pilot validation'];

  return {
    id: `rep-${startup.id}-${Date.now()}`,
    summary: `AI Analysis: Venture health is currently evaluated as ${category.toUpperCase()} (${score}/100). ${score < 60 ? 'Critical gaps detected in documentation or execution velocity.' : 'Venture is progressing steadily along its GPS stage pathway.'}`,
    strengths,
    weaknesses,
    recommendations,
    nextMilestones: nextMilestones.length > 0 ? nextMilestones : ['Secure customer reference letters', 'Formulate Series A deck'],
    expectedImprovement: missingDocs.length > 0 ? 10 : 5,
    createdAt: new Date().toISOString()
  };
}

// 8. AI Mentor Match Engine
export function calculateMentorCompatibility(founder: any, mentor: any): number {
  let score = 40; // Base baseline score
  
  // Industry Match (30 points)
  const fIndustry = founder.industry || founder.sector || '';
  if (fIndustry && mentor.industry && fIndustry.toLowerCase() === mentor.industry.toLowerCase()) {
    score += 30;
  } else if (fIndustry && mentor.expertise?.some((exp: string) => exp.toLowerCase() === fIndustry.toLowerCase())) {
    score += 30;
  }

  // Domain Needs Match (30 points)
  if (founder.needsAssessment) {
    // Find the highest need area
    const sortedNeeds = Object.entries(founder.needsAssessment)
      .sort((a, b) => (b[1] as number) - (a[1] as number));
    
    if (sortedNeeds.length > 0) {
      const topNeed = sortedNeeds[0][0]; // e.g. 'funding', 'tech'
      if (mentor.expertise?.some((exp: string) => exp.toLowerCase().includes(topNeed.toLowerCase()))) {
        score += 30;
      }
    }
  } else {
    // If no specific needs assessment, just give average bump
    score += 15;
  }

  return Math.min(100, score);
}

// 9. AI Growth Forecasting Engine
export function generateGrowthForecast(startup: any) {
  const currentRev = startup.liveMetrics?.revenue || startup.monthlyRevenue || 0;
  const currentUsers = startup.liveMetrics?.activeUsers || startup.activeUsers || 0;
  
  // Health score acts as the primary multiplier for velocity
  const healthRatio = (startup.healthScore || 50) / 100;
  // Maximum organic monthly growth capped at 20% for 100-health startups
  const monthlyGrowthRate = healthRatio * 0.20; 
  
  return {
    currentRevenue: currentRev,
    currentUsers: currentUsers,
    monthlyGrowthRate: (monthlyGrowthRate * 100).toFixed(1) + '%',
    forecast: {
      days30: {
        revenue: Math.floor(currentRev * (1 + monthlyGrowthRate)),
        users: Math.floor(currentUsers * (1 + monthlyGrowthRate))
      },
      days90: {
        revenue: Math.floor(currentRev * Math.pow(1 + monthlyGrowthRate, 3)),
        users: Math.floor(currentUsers * Math.pow(1 + monthlyGrowthRate, 3))
      },
      days180: {
        revenue: Math.floor(currentRev * Math.pow(1 + monthlyGrowthRate, 6)),
        users: Math.floor(currentUsers * Math.pow(1 + monthlyGrowthRate, 6))
      }
    },
    trendAnalysis: monthlyGrowthRate > 0.15 ? 'Hyper Growth' : monthlyGrowthRate > 0.08 ? 'Strong Growth' : 'Moderate/Stagnant'
  };
}


// 10. Hackathon OS Engines
export interface HOSRound { id: string; name: string; weightage: number; qualificationRules: string; }
export interface HOSEvaluation { id: string; submissionId: string; roundId: string; judgeId: string; totalScore: number; status: string; }
export interface HOSSubmission { id: string; teamId: string; roundId: string; version: number; }
export interface HOSTeam { id: string; hackathonId: string; name: string; status: string; startupPotentialCategory?: string; }

export function calculateRoundScore(evaluations: HOSEvaluation[], round: HOSRound): number {
  if (!evaluations || evaluations.length === 0) return 0;

  // For multi-judge, average the total scores.
  const total = evaluations.reduce((sum, ev) => sum + ev.totalScore, 0);
  return parseFloat((total / evaluations.length).toFixed(1));
}

export function generateLeaderboard(
  hackathonId: string, 
  teams: HOSTeam[], 
  submissions: HOSSubmission[], 
  evaluations: HOSEvaluation[], 
  rounds: HOSRound[]
) {
  const leaderboard = teams
    .filter(t => t.hackathonId === hackathonId && t.status !== 'Disqualified')
    .map(team => {
      let totalScore = 0;
      let totalInnovationScore = 0;
      let totalImpactScore = 0;
      const roundScores: Record<string, number> = {};

      rounds.forEach(round => {
        const teamSubmissions = submissions.filter(s => s.teamId === team.id && s.roundId === round.id);
        if (teamSubmissions.length > 0) {
          const latestSub = teamSubmissions.sort((a, b) => b.version - a.version)[0];
          const subEvals = evaluations.filter(e => e.submissionId === latestSub.id && e.status === 'Submitted');
          
          const roundScoreRaw = calculateRoundScore(subEvals, round);
          // Module 4: Apply round weightage
          const weightedScore = parseFloat((roundScoreRaw * (round.weightage / 100)).toFixed(1));
          
          roundScores[round.id] = weightedScore;
          totalScore += weightedScore;

          // Collect metrics for tie-breaking and startup potential
          subEvals.forEach((ev: any) => {
            const innScore = ev.scores.find((s: any) => s.criteriaId === 'innovation')?.score || ev.scores.find((s: any) => s.name?.toLowerCase().includes('innovation'))?.score || 0;
            const impScore = ev.scores.find((s: any) => s.criteriaId === 'impact')?.score || ev.scores.find((s: any) => s.name?.toLowerCase().includes('impact'))?.score || 0;
            totalInnovationScore += (innScore / subEvals.length);
            totalImpactScore += (impScore / subEvals.length);
          });

        } else {
          roundScores[round.id] = 0;
        }
      });

      return {
        teamId: team.id,
        teamName: team.name,
        totalScore,
        roundScores,
        metrics: {
          innovation: totalInnovationScore,
          impact: totalImpactScore
        }
      };
    });

  // Sort descending with Tie Resolution Engine (Total -> Innovation -> Impact)
  return leaderboard.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.metrics.innovation !== a.metrics.innovation) return b.metrics.innovation - a.metrics.innovation;
    return b.metrics.impact - a.metrics.impact;
  });
}

// Module 4: Startup Discovery Engine
export function calculateStartupPotential(
  teamId: string, 
  leaderboardRank: number, 
  evaluations: HOSEvaluation[]
): { score: number; category: HOSTeam['startupPotentialCategory'] } {
  const teamEvals = evaluations.filter(e => e.submissionId.includes(teamId) || true); // Simplified mapping for mock
  let score = 0;
  
  if (leaderboardRank === 1) score += 40;
  else if (leaderboardRank <= 3) score += 30;
  else if (leaderboardRank <= 10) score += 15;

  const avgEvalScore = teamEvals.reduce((sum, e) => sum + e.totalScore, 0) / (teamEvals.length || 1);
  score += (avgEvalScore * 0.6); // 60% weight to pure evaluation scores

  // Assign category
  let category: HOSTeam['startupPotentialCategory'] = 'Learning Stage';
  if (score >= 90) category = 'Incubation Ready';
  else if (score >= 80) category = 'Pre-Incubation Ready';
  else if (score >= 70) category = 'Prototype Stage';
  else if (score >= 60) category = 'Early Innovation';

  return { score: Math.min(100, parseFloat(score.toFixed(1))), category };
}

// Keep evaluateQualification below...
export function evaluateQualification(teamScore: number, round: HOSRound, leaderboard: any[]): boolean {
  if (!round.qualificationRules) return true;
  
  const rules = round.qualificationRules.toLowerCase();
  
  if (rules.includes('top 10')) {
    const cutoffScore = leaderboard.length >= 10 ? leaderboard[9].totalScore : 0;
    return teamScore >= cutoffScore;
  }
  
  if (rules.includes('top 50%')) {
    const halfIndex = Math.floor(leaderboard.length / 2) - 1;
    const cutoffScore = halfIndex >= 0 && halfIndex < leaderboard.length ? leaderboard[halfIndex].totalScore : 0;
    return teamScore >= cutoffScore;
  }

  // Default passthrough if rule not understood
  return true;
}
