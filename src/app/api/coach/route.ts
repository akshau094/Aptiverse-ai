import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type CoachRequest = {
  paragraph: string;
  transcript: string;
  metrics: {
    speed: number;
    confidence: number;
    fillers: number;
    pauses: number;
  };
  context?: {
    langs?: string | null;
    company?: string | null;
  };
  previousFeedback?: string | null;
};

// Use the Gemini API Key from environment variables
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  let body: CoachRequest;
  try {
    body = (await req.json()) as CoachRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const paragraph = (body.paragraph || "").trim();
  const transcript = (body.transcript || "").trim();

  if (!paragraph || !transcript) {
    return NextResponse.json({ error: "Missing paragraph or transcript." }, { status: 400 });
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    return NextResponse.json(
      { 
        error: "OPENROUTER_API_KEY is missing.",
        details: "Please ensure OPENROUTER_API_KEY is set in your Vercel Environment Variables."
      },
      { status: 500 }
    );
  }

  const { speed, confidence, fillers, pauses } = body.metrics || {
    speed: 0,
    confidence: 0,
    fillers: 0,
    pauses: 0,
  };

  const langs = body.context?.langs ?? null;
  const company = body.context?.company ?? null;
  const previousFeedback = (body.previousFeedback || "").trim();

  const system = [
    "You are an expert communication coach for AptiVerse.",
    "Your goal is to provide HIGHLY VARIED, unique, and personalized feedback for every single attempt.",
    "NEVER repeat the same sentence structure or generic advice.",
    "Always reference specific words or errors found in the transcript and relate them to the metrics.",
    "Be professional, concise, and actionable. No markdown, no bullets, plain text only.",
    "If this is a repeat attempt, change your tone or focus to keep it fresh.",
  ].join(" ");

  const user = [
    "Context:",
    `Role focus: ${langs ? langs : "General"}${company ? ` at ${company}` : ""}.`,
    "",
    "Original text to read:",
    `"${paragraph}"`,
    "",
    "Actual spoken transcript:",
    `"${transcript}"`,
    "",
    "Performance Data:",
    `- Speed: ${Math.round(speed)} WPM`,
    `- Confidence: ${Number.isFinite(confidence) ? (confidence * 100).toFixed(0) : "0"}%`,
    `- Fillers: ${Math.round(fillers)} detected`,
    `- Pauses: ${Math.round(pauses)} detected`,
    "",
    previousFeedback ? `AVOID these previous comments: ${previousFeedback}` : "",
    "",
    "Instructions:",
    "Provide exactly 4 to 6 natural sentences.",
    "DO NOT use a template. Speak like a real human coach who just listened to this specific recording.",
    "Compare the original text to the transcript to find specific missing or mispronounced words.",
    "Connect the metrics directly to the user's delivery quality.",
    "Give one unique exercise for next time.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "X-Title": "AptiVerse",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.9,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      console.error("OpenRouter Error:", errorText);
      return NextResponse.json(
        { 
          error: "API Key is invalid. Please update OPENROUTER_API_KEY in Vercel Settings.",
          details: "How to fix: Go to your Vercel Dashboard → Project Settings → Environment Variables. Update OPENROUTER_API_KEY, then redeploy the project."
        },
        { status: 500 }
      );
    }

    const data = await upstream.json();
    const feedback = data.choices?.[0]?.message?.content || "I couldn't generate feedback. Please try again.";
    
    return NextResponse.json({ feedback: feedback.trim() });
  } catch (error) {
    console.error("Coach API Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to feedback service." },
      { status: 500 }
    );
  }
}

