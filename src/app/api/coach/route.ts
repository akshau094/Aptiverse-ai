import { NextResponse } from "next/server";

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
        details: "The OpenRouter API key is not set in Vercel Environment Variables. The Communication Coach requires this key to function."
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
    // Use OpenRouter with DeepSeek R1 as requested
    console.log("Attempting DeepSeek R1 feedback via OpenRouter...");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "X-Title": "AptiVerse",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature: 0.7,
        max_tokens: 500,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenRouter API failed");
    }

    const data = await response.json();
    const feedback = data.choices?.[0]?.message?.content?.trim();
    
    if (feedback) {
      console.log("DeepSeek feedback successful.");
      // Remove any <think> tags if they exist (DeepSeek R1 specific)
      const cleanFeedback = feedback.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      return NextResponse.json({ feedback: cleanFeedback });
    }

    return NextResponse.json(
      { 
        error: "AI Generation Failed",
        details: "DeepSeek service failed to return feedback. Please verify your OPENROUTER_API_KEY in Vercel.",
        debug: {
          hasOpenRouter: !!openRouterKey,
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

