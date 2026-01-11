import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, correctAnswer, userAnswer } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const systemPrompt = `You are a world-class Aptitude Tutor for AptiVerse.
A student just answered an aptitude question incorrectly.
Your goal is to provide a DEEP, COMPREHENSIVE, and DETAILED explanation.

STRICT FORMATTING RULES:
1. CORRECT ANSWER FIRST: Start by clearly stating the correct answer.
2. WHY IT IS RIGHT: Provide a detailed, step-by-step logical breakdown of the correct path to the answer.
3. WHY STUDENT WAS WRONG: Specifically analyze the student's choice (${userAnswer}) and explain the logical trap or mistake they likely made.
4. BE DETAILED: Use 5-8 sentences minimum for the total explanation.
5. SIMPLE LANGUAGE: Use clear, simple language.
6. NO MARKDOWN: Use plain text only.
7. DOUBLE NEWLINES: Use double newlines (\\n\\n) to separate the sections.`;

    const userPrompt = `
QUESTION: ${question}
STUDENT'S WRONG CHOICE: ${userAnswer}
ACTUAL CORRECT ANSWER: ${correctAnswer}

Please provide the detailed explanation following the rules above.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "AptiVerse",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No explanation generated.";
    
    return NextResponse.json({ explanation: text.trim() });
  } catch (error) {
    console.error("Aptitude explanation error:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
