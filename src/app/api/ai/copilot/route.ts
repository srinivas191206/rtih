import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to determine which provider is loaded
function getActiveProvider() {
  if (process.env.GEMINI_API_KEY) return 'Google Gemini';
  if (process.env.OPENROUTER_API_KEY) return 'OpenRouter';
  if (process.env.GROQ_API_KEY) return 'Groq';
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

    // 1. Try Native Gemini API first
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: systemInstruction
        });

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        return NextResponse.json({ text, isLive: true, provider: 'Google Gemini' });
      } catch (geminiError) {
        console.error('Native Gemini API error, falling back:', geminiError);
      }
    }

    // 2. Try OpenRouter API second
    if (openrouterKey) {
      try {
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
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({ text, isLive: true, provider: 'OpenRouter' });
          }
        } else {
          console.error('OpenRouter API returned non-200 status:', response.status);
        }
      } catch (orError) {
        console.error('OpenRouter API error, falling back:', orError);
      }
    }

    // 3. Try Groq API third
    if (groqKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({ text, isLive: true, provider: 'Groq' });
          }
        } else {
          console.error('Groq API returned non-200 status:', response.status);
        }
      } catch (groqError) {
        console.error('Groq API error, falling back:', groqError);
      }
    }

    // 4. High-fidelity fallback logic if all API Keys fail or are missing
    let text = `Based on your startup's context and metrics, we should optimize your current runway. I suggest verifying your milestones for matching grants under the AP IT Policy.`;

    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('grant') || lowerPrompt.includes('funding')) {
      text = `Regarding funding: Your sector and district qualify for the Ratan Tata Seed Capital Fund (grants up to ₹15 Lakhs at 0% equity). You should finalize your MVP traction log to submit your application.`;
    } else if (lowerPrompt.includes('women') || lowerPrompt.includes('female')) {
      text = `For women-led startups: The AP Standup Women Startup Grant provides direct subsidies up to ₹5 Lakhs and dedicated lab space. Ensure your registration documents reflect >51% female equity.`;
    } else if (lowerPrompt.includes('hiring') || lowerPrompt.includes('team') || lowerPrompt.includes('intern')) {
      text = `To resolve your team resource gaps, RTIH links directly to local universities (like Gitam, SRM, and IIT Tirupati). You can post your engineering intern JDs directly to their outposts.`;
    } else if (lowerPrompt.includes('risk') || lowerPrompt.includes('vulnerable')) {
      text = `Risk Analysis: Your current indicators show runway constraints. Let's schedule a review with an RTIH EIR (Entrepreneur-in-Residence) to pivot your CAC strategy.`;
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
