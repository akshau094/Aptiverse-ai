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
    "You must produce varied, non-repetitive feedback every time.",
    "Use the provided metrics and transcript to be specific and practical.",
    "Be professional, concise, and actionable. No markdown, no bullets, plain text only.",
    "Do not mention being an AI model or policies.",
  ].join(" ");

  const user = [
    "Context:",
    `Role focus: ${langs ? langs : "General"}${company ? ` at ${company}` : ""}.`,
    "",
    "Reading paragraph:",
    paragraph,
    "",
    "User transcript:",
    transcript,
    "",
    "Metrics:",
    `Speed (WPM): ${Math.round(speed)}`,
    `Confidence (0 to 1): ${Number.isFinite(confidence) ? confidence.toFixed(2) : "0.00"}`,
    `Fillers: ${Math.round(fillers)}`,
    `Pauses: ${Math.round(pauses)}`,
    "",
    previousFeedback ? `Previous feedback (avoid repeating it): ${previousFeedback}` : "",
    "",
    "Task:",
    "Give 4 to 6 sentences:",
    "1) One sentence praising something specific.",
    "2) Two to three sentences of corrections referencing the metrics and/or transcript.",
    "3) One sentence with a concrete drill for the next attempt.",
    "Use numbers naturally (e.g., WPM, filler count, confidence %).",
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
        temperature: 0.7,
        max_tokens: 220,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json(
        { error: "Upstream AI request failed.", details: text.slice(0, 500) },
        { status: 502 }
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

