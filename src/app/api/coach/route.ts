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
const apiKey = process.env.GEMINI_API_KEY;
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
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openRouterKey && !geminiKey) {
    return NextResponse.json(
      { 
        error: "All AI API keys are missing.",
        details: "Neither OPENROUTER_API_KEY nor GEMINI_API_KEY is set in Vercel Environment Variables. The AI cannot function without at least one of these keys."
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
    if (openRouterKey) {
      console.log("Attempting OpenRouter feedback...");
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

      if (upstream.ok) {
        const data = await upstream.json();
        const feedback = data.choices?.[0]?.message?.content;
        if (feedback) {
          console.log("OpenRouter feedback successful.");
          return NextResponse.json({ feedback: feedback.trim() });
        }
      } else {
        const errText = await upstream.text();
        console.warn("OpenRouter API returned error:", errText);
      }
    }
    
    // If we reach here, OpenRouter failed or returned empty
    console.warn("OpenRouter failed or unavailable, trying Gemini fallback...");
    
    if (geminiKey) {
      const fallbackGenAI = new GoogleGenerativeAI(geminiKey);
      const model = fallbackGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: `${system}\n\n${user}` }] }
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 500,
        }
      });
      const response = await result.response;
      const feedback = response.text().trim();
      
      if (feedback) {
        console.log("Gemini fallback successful.");
        return NextResponse.json({ feedback });
      }
    }

    return NextResponse.json(
      { 
        error: "AI Generation Failed",
        details: "Both OpenRouter and Gemini services failed to generate feedback. This usually happens if the API keys are invalid or have no credits.",
        debug: {
          hasOpenRouter: !!openRouterKey,
          hasGemini: !!geminiKey
        }
      },
      { status: 500 }
    );

  } catch (error: any) {
    console.error("Coach API Global Error:", error);
    
    return NextResponse.json(
      { 
        error: "AI Connection Error",
        message: error.message || "An unexpected error occurred while connecting to the AI service.",
        details: "Please check your internet connection and Vercel Environment Variables."
      },
      { status: 500 }
    );
  }
}

