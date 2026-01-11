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

  if (!genAI) {
    return NextResponse.json(
      { 
        error: "API Key is missing or invalid.",
        details: "Please ensure NEXT_PUBLIC_GEMINI_API_KEY is set in your Vercel Environment Variables."
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

  const systemPrompt = `You are an expert communication coach for AptiVerse.
    Your goal is to provide HIGHLY VARIED, unique, and personalized feedback for every single attempt.
    NEVER repeat the same sentence structure or generic advice.
    Always reference specific words or errors found in the transcript and relate them to the metrics.
    Be professional, concise, and actionable. No markdown, no bullets, plain text only.
    If this is a repeat attempt, change your tone or focus to keep it fresh.
    Provide exactly 4 to 6 natural sentences.
    DO NOT use a template. Speak like a real human coach who just listened to this specific recording.
    Compare the original text to the transcript to find specific missing or mispronounced words.
    Connect the metrics directly to the user's delivery quality.`;

  const userPrompt = `
    Context:
    Role focus: ${langs ? langs : "General"}${company ? ` at ${company}` : ""}.
    
    Original text to read:
    "${paragraph}"
    
    Actual spoken transcript:
    "${transcript}"
    
    Performance Data:
    - Speed: ${Math.round(speed)} WPM
    - Confidence: ${Number.isFinite(confidence) ? (confidence * 100).toFixed(0) : "0"}%
    - Fillers: ${Math.round(fillers)} detected
    - Pauses: ${Math.round(pauses)} detected
    
    ${previousFeedback ? `AVOID these previous comments: ${previousFeedback}` : ""}
    
    Please provide the feedback now.
  `;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      }
    });

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
      ]
    });

    const response = await result.response;
    const text = response.text().replace(/\*/g, '').trim();
    
    return NextResponse.json({ feedback: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { 
        error: "AI failed to generate feedback.",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}

