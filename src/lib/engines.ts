// Flagship Core Engines for RTIH InnovationOS
import { Startup, StartupStage } from './mockDb';

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
      eligibility: 'Sectors: AI, Emerging Technologies, Advanced Manufacturing, FinTech, AgriTech.',
      matchFunc: (s: Startup) => {
        let score = 40;
        if (['AI', 'Emerging Technologies', 'Advanced Manufacturing', 'FinTech', 'AgriTech'].includes(s.sector)) score += 40;
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
        if (s.sector === 'AgriTech') score += 60;
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
        if (s.sector === 'Blue Economy') score += 70;
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
