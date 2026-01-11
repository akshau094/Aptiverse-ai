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

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing OPENROUTER_API_KEY." },
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
    "Connect the metrics (like ${Math.round(speed)} WPM) directly to the user's delivery quality.",
    "Give one unique exercise for next time.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "AptiVerse",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.9,
        max_tokens: 300,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      }),  messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      let errorMessage = "Upstream AI request failed.";
      try {
        const errorJson = JSON.parse(text);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        errorMessage = text.slice(0, 200);
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: upstream.status === 401 ? 401 : 502 }
      );
    }

    const data = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const feedback = data.choices?.[0]?.message?.content?.trim();
    if (!feedback) {
      return NextResponse.json({ error: "Empty AI response." }, { status: 502 });
    }

    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json(
      { error: "AI request failed unexpectedly." },
      { status: 502 }
    );
  }
}

