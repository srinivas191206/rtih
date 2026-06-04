import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Force dynamic rendering to prevent Next.js from caching GET/POST responses at build time
export const dynamic = 'force-dynamic';

// Helper functions to validate API key formats before making network requests
function isValidGeminiKey(key?: string): boolean {
  // Accept any non-empty key with reasonable length — don't restrict by prefix
  // since different Google API key formats exist (AIzaSy*, AQ.*, etc.)
  return !!key && key.length > 10;
}

function isValidOpenRouterKey(key?: string): boolean {
  return !!key && key.length > 20;
}

function isValidGroqKey(key?: string): boolean {
  return !!key && (key.startsWith('gsk_') || key.length > 20);
}

// Multi-key rotation pool for Groq (user-provided active keys)
const GROQ_KEYS: string[] = Array.from(new Set([
  process.env.GROQ_API_KEY,
  ...(process.env.GROQ_API_KEYS_POOL || '').split(',').map(s => s.trim())
].filter(Boolean).filter(isValidGroqKey))) as string[];

function getActiveProvider() {
  if (isValidGeminiKey(process.env.GEMINI_API_KEY)) return 'Google Gemini';
  if (isValidOpenRouterKey(process.env.OPENROUTER_API_KEY)) return 'OpenRouter';
  if (GROQ_KEYS.length > 0) return 'Groq';
  return null;
}

export async function GET() {
  const provider = getActiveProvider();
  return NextResponse.json({
    isLive: provider !== null,
    provider: provider || 'Sandbox Fallback'
  });
}

export async function POST(request: Request) {
  try {
    const { prompt, startupContext, role } = await request.json();

    const geminiKey = process.env.GEMINI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // Standard instruction system prompt matching the CPO/Y Combinator persona
    const systemInstruction = `
      You are the RTIH AI Startup Coach & Advisor.
      RTIH (Ratan Tata Innovation Hub) is Andhra Pradesh's premier startup accelerator.
      Your tone is crisp, professional, analytical, and highly supportive, similar to a Y Combinator Partner or T-Hub Director.
      Always focus on actionable milestones, unit economics, risk mitigation, and AP State Startup Policy grants.
      Active startup context: ${JSON.stringify(startupContext || {})}
      Role context: ${role || 'Founder'}
    `;

    // 1. Try Native Gemini API if key is valid
    if (isValidGeminiKey(geminiKey)) {
      try {
        console.log('[RTIH AI] Trying Google Gemini...');
        const genAI = new GoogleGenerativeAI(geminiKey!);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: systemInstruction
        });

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        if (text) {
          console.log('[RTIH AI] Google Gemini responded successfully.');
          return NextResponse.json({ text, isLive: true, provider: 'Google Gemini' });
        }
      } catch (geminiError: any) {
        console.error('[RTIH AI] Gemini failed:', geminiError?.message || geminiError);
      }
    }

    // 2. Try OpenRouter API if key is valid
    if (isValidOpenRouterKey(openrouterKey)) {
      try {
        console.log('[RTIH AI] Trying OpenRouter...');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openrouterKey}`,
            'HTTP-Referer': 'https://rtih.ap.gov.in',
            'X-Title': 'RTIH InnovationOS'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            max_tokens: 1024,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt }
            ]
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            console.log('[RTIH AI] OpenRouter responded successfully.');
            return NextResponse.json({ text, isLive: true, provider: 'OpenRouter' });
          }
        } else {
          console.error('[RTIH AI] OpenRouter non-200:', response.status, await response.text());
        }
      } catch (orError: any) {
        console.error('[RTIH AI] OpenRouter failed:', orError?.message || orError);
      }
    }

    // 3. Try Groq API (iterating over the list of valid Groq keys for automatic failover)
    for (let i = 0; i < GROQ_KEYS.length; i++) {
      const activeGroqKey = GROQ_KEYS[i];
      try {
        console.log(`[RTIH AI] Trying Groq Key ${i + 1}/${GROQ_KEYS.length}...`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeGroqKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt }
            ]
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            console.log(`[RTIH AI] Groq Key ${i + 1} responded successfully.`);
            return NextResponse.json({ text, isLive: true, provider: `Groq (Key ${i + 1})` });
          }
        } else {
          const errText = await response.text();
          console.error(`[RTIH AI] Groq Key ${i + 1} non-200:`, response.status, errText);
        }
      } catch (groqError: any) {
        console.error(`[RTIH AI] Groq Key ${i + 1} failed:`, groqError?.message || groqError);
      }
    }

    // 4. High-fidelity dynamic local fallback engine (Sandbox mode)
    const lowerPrompt = prompt.toLowerCase();
    
    // Parse startup details with fallback values
    const startupName = startupContext?.name || 'your venture';
    const sector = startupContext?.sector || 'your industry';
    const stage = startupContext?.stage || 'idea';
    const district = startupContext?.district || 'Andhra Pradesh';
    const activeMentor = startupContext?.mentorName || 'Prof. Ramesh Koppula';
    
    let text = `Based on your startup's context and metrics, we should optimize your current runway. I suggest verifying your milestones for matching grants under the AP IT Policy.`;

    if (role === 'Program Manager') {
      const highRiskCount = startupContext?.highRiskCount || 0;
      const totalStartups = startupContext?.totalStartups || 0;
      
      if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey') || lowerPrompt.includes('help')) {
        text = `Hello Hub Manager! I am your RTIH AI Co-Pilot.\n\nCurrently, you are managing **${totalStartups} startups** in the accelerator, with **${highRiskCount} flagged as high-risk** due to runway constraints.\n\nHow can I assist you today? You can ask me to compile risk briefs, draft policy recommendations, or analyze regional center performance.`;
      } else if (lowerPrompt.includes('risk') || lowerPrompt.includes('vulnerable')) {
        text = `### ⚠️ Regional Risk Assessment\n\nThere are **${highRiskCount} startups** under your hub exhibiting runway and milestone stagnation risks.\n\n**Recommended Action:**\n1. Schedule a mandatory Entrepreneur-in-Residence (EIR) audit for these teams.\n2. Verify if their mentor sync frequency has dropped below the required weekly threshold.\n3. Assist them in unlocking the Ratan Tata Seed Capital matching grant.`;
      } else if (lowerPrompt.includes('grant') || lowerPrompt.includes('funding')) {
        text = `### 💰 Grant Disbursements & Approvals\n\nUnder the AP Startup Policy, seed capital applications (up to ₹15 Lakhs) require Hub Manager sign-off on the milestone verification checklist. \n\nEnsure that the applicant startup has completed at least 80% of their customer discovery course and logged their prototype demonstration evidence before endorsing them to the state panel.`;
      } else {
        text = `### 📊 RTIH Manager Hub Co-Pilot\n\nI can assist you with managing the accelerator operations. Try asking me:\n* \`Summarize the high-risk startups under my hub\`\n* \`What are the requirements for approving seed grant applications?\`\n* \`Review the incubation capacity for Guntur and Visakhapatnam Centers\``;
      }
    } else if (role === 'Mentor') {
      const portfolioSize = startupContext?.portfolioSize || 0;
      const mentorName = startupContext?.mentorName || 'Mentor';
      
      if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey') || lowerPrompt.includes('help')) {
        text = `Hello **Prof. ${mentorName}**! I am your RTIH Mentor Co-Pilot. I see you are advising **${portfolioSize} startups** in the active portfolio.\n\nHow can I help you support your founders today? I can help draft milestone action items, formulate technical due-diligence criteria, or write stage promotion endorsements.`;
      } else if (lowerPrompt.includes('promotion') || lowerPrompt.includes('stage') || lowerPrompt.includes('milestone')) {
        text = `### 🏆 Stage Promotion Recommendations\n\nWhen recommending a startup for stage promotion (e.g. from Validation to Prototype), please verify that they have logged:\n1. 20+ documented customer interviews.\n2. A signed customer discovery report.\n3. Positive feedback from recent mentoring sessions.\n\nYou can submit your stage promotion recommendation directly from the startup details view.`;
      } else if (lowerPrompt.includes('task') || lowerPrompt.includes('action')) {
        text = `### 📝 Creating Actionable Mentor Tasks\n\nTo ensure your founders make consistent progress, assign targeted tasks with clear evidence criteria. For example:\n* *Title:* Update Financial Runway Model\n* *Description:* Document unit economics, CAC, and LTV parameters for Month 12.\n* *Evidence:* Upload spreadsheet links in the documents panel.`;
      } else {
        text = `### 🧠 RTIH Mentor Co-Pilot\n\nI am here to help you guide your founders. Try asking me:\n* \`What criteria should I use for recommending stage promotion?\`\n* \`Help me design a customer discovery task checklist\`\n* \`Review the roadmap guidelines for the AI Founders Accelerator\``;
      }
    } else {
      // Default Role: Founder
      if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey') || lowerPrompt.includes('greetings')) {
        text = `Hello! I am your **RTIH AI Startup Coach & Advisor**.\n\nI've analyzed the venture profile for **${startupName}** (Stage: *${stage}*, Sector: *${sector}*, Location: *${district}*).\n\nHow can I help you accelerate your growth today? You can ask me about matching grants, recommended learning modules, university intern hiring, or booking sessions with your mentor **${activeMentor}**.`;
      } else if (lowerPrompt.includes('grant') || lowerPrompt.includes('funding') || lowerPrompt.includes('seed') || lowerPrompt.includes('capital') || lowerPrompt.includes('money') || lowerPrompt.includes('invest')) {
        text = `### 💰 Tailored Funding Options for ${startupName}\n\nBased on your venture profile, here are the matching grants you qualify for under the **Andhra Pradesh Startup Policy**:\n\n1. **Ratan Tata Seed Capital Fund**: Since you are in the *${stage}* stage, you qualify for up to **₹15 Lakhs** at 0% equity. Routed through Amaravati hub.\n2. **AP Innovation Subsidies**: Up to **₹5 Lakhs** for testing and validating prototypes in regional spokes.\n3. **Women Entrepreneur Subsidies**: If your startup has >51% female equity, an additional ₹5 Lakhs direct subsidy + 50% discount on co-working.\n\n**Action Item:** Complete the *Customer Discovery* course and log 20+ interviews to unlock the manager's endorsement.`;
      } else if (lowerPrompt.includes('milestone') || lowerPrompt.includes('gps') || lowerPrompt.includes('learn') || lowerPrompt.includes('curriculum') || lowerPrompt.includes('course') || lowerPrompt.includes('roadmap') || lowerPrompt.includes('next step')) {
        text = `### 🗺️ Recommended Roadmap & Curriculum for ${startupName}\n\nSince **${startupName}** is in the **${stage}** stage, your primary focus is product-market fit.\n\n**Recommended Learning Modules:**\n* **Idea & Validation:** Complete *Customer Discovery & Problem Validation* — conduct 20+ user interviews.\n* **Prototype & MVP:** Focus on *Value Proposition Design* & *MVP Architecture*.\n* **Scaling:** Complete *Unit Economics & Pitching to Seed Investors*.\n\n**Next Step:** Complete the pending tasks assigned by your mentor (**${activeMentor}**) in the *Tasks* panel.`;
      } else if (lowerPrompt.includes('hire') || lowerPrompt.includes('team') || lowerPrompt.includes('intern') || lowerPrompt.includes('recruit') || lowerPrompt.includes('talent') || lowerPrompt.includes('employee')) {
        text = `### 👥 Student Talent Recruitment for ${startupName}\n\nRecruit student interns directly from RTIH's university partner outposts near **${district}**:\n* **IIT Tirupati** — Deep Tech & Engineering\n* **SRM University AP** — Software Engineering & AI\n* **Andhra University** — Marine Science, Biotech & Management\n\n**Action Item:** Go to the *Recruitment* panel to post a Job Listing. It auto-syncs with placement cells of all partner universities.`;
      } else if (lowerPrompt.includes('mentor') || lowerPrompt.includes('coach') || lowerPrompt.includes('advisor') || lowerPrompt.includes('session') || lowerPrompt.includes('guidance')) {
        text = `### 🤝 Mentorship Alignment\n\nYour startup is matched with specialized mentors in the *${sector}* domain. Your active mentor is **${activeMentor}**.\n\n**Recommendations:**\n1. Share your latest customer discovery interviews via the *Documents* panel.\n2. Schedule a 30-minute review session in the *Mentors* tab.\n3. Use the *Communications* tab to message them directly.`;
      } else if (lowerPrompt.includes('risk') || lowerPrompt.includes('health') || lowerPrompt.includes('score') || lowerPrompt.includes('vulnerable') || lowerPrompt.includes('weak')) {
        text = `### ⚠️ Venture Health & Risk Audit for ${startupName}\n\nYour health score is evaluated across milestone completions, runway, and mentor engagement:\n* **Milestone Progress:** Log customer discovery interviews to prevent stagnation.\n* **Runway:** Access the Ratan Tata Seed Capital matching grant for 6+ months of runway.\n* **Engagement:** Reach out to **${activeMentor}** if stuck on product roadmap pivots.`;
      } else if (
        lowerPrompt.includes('best') || lowerPrompt.includes('grow') || lowerPrompt.includes('succeed') ||
        lowerPrompt.includes('improve') || lowerPrompt.includes('how') || lowerPrompt.includes('what should') ||
        lowerPrompt.includes('advice') || lowerPrompt.includes('tip') || lowerPrompt.includes('strategy') ||
        lowerPrompt.includes('ok') || lowerPrompt.includes('okay') || lowerPrompt.includes('sure') ||
        lowerPrompt.includes('yes') || lowerPrompt.includes('go') || lowerPrompt.includes('start') ||
        lowerPrompt.includes('help') || lowerPrompt.includes('what') || lowerPrompt.includes('scale')
      ) {
        text = `### 🚀 Growth Strategy for ${startupName}\n\nTo become the best **${sector}** startup in ${district}, here is your 5-step accelerator playbook:\n\n**1. 🎯 Lock in Product-Market Fit**\nConduct 20+ structured customer interviews. Use the RTIH Customer Discovery module in the *Executive Hub → GPS Pathway* section. This unlocks your mentor's endorsement for seed funding.\n\n**2. 🧠 Complete Your Milestone OKRs**\nEvery completed milestone with submitted evidence increases your Venture Health Score. A score above 75 puts you in the **Priority Cohort** — eligible for RTIH's direct investor introductions.\n\n**3. 💰 Apply for AP State Grants**\nAs a *${stage}* stage startup in *${sector}*, you qualify for the **Ratan Tata Seed Capital Fund** (up to ₹15 Lakhs, 0% equity). Ask your manager to endorse your application.\n\n**4. 👥 Build Your Core Team**\nPost internship openings via the *Recruitment* panel — synced directly to university placement cells in ${district} and nearby districts.\n\n**5. 📅 Stay in Your Mentor's Orbit**\nSchedule weekly sync sessions with **${activeMentor}**. Startups with 4+ monthly mentor touchpoints exit the incubator 2x faster.\n\nWhich of these would you like to dive deeper into?`;
      } else {
        text = `### 💡 RTIH Startup Coach — ${startupName}\n\nGreat question! Based on your ${sector} venture in ${district} (Stage: ${stage}), here is what I recommend focusing on right now:\n\n**Immediate Priority:**\n- Complete your current milestone and submit evidence for mentor verification\n- This directly improves your Venture Health Score and unlocks the next funding tier\n\n**This Week:**\n- Message your mentor **${activeMentor}** with your latest progress update\n- Review the AP Innovation Grant checklist in the *Documents* panel\n\n**Ask me something specific:**\n* \`What grants do I qualify for?\`\n* \`What should I do to grow faster?\`\n* \`How do I improve my health score?\`\n* \`Help me build my team\``;
      }
    }

    return NextResponse.json({ text, isLive: false, provider: 'Sandbox Fallback' });
  } catch (error: any) {
    console.error('AI API Route general error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    );
  }
}
