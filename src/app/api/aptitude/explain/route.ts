import { NextResponse } from "next/server";
import { getAptitudeExplanation } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { question, correctAnswer, userAnswer } = await req.json();

    if (!question || !correctAnswer || !userAnswer) {
      return NextResponse.json(
        { error: "Missing required fields: question, correctAnswer, or userAnswer." },
        { status: 400 }
      );
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      return NextResponse.json(
        { 
          error: "OPENROUTER_API_KEY is missing.",
          details: "The OpenRouter API key is not set in Vercel Environment Variables. The AI Tutor cannot generate feedback without this key."
        },
        { status: 500 }
      );
    }

    // Call OpenRouter with DeepSeek R1 for explanation
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
          { role: "system", content: "You are a world-class Aptitude Tutor. Provide a structured, deep, and comprehensive explanation for the following question." },
          { role: "user", content: `QUESTION: ${question}\nCORRECT ANSWER: ${correctAnswer}\nSTUDENT ANSWER: ${userAnswer}\n\nProvide a step-by-step logic and why the student was wrong. Plain text only, no markdown.` }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenRouter API failed");
    }

    const data = await response.json();
    let explanation = data.choices?.[0]?.message?.content?.trim() || "";
    explanation = explanation.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    
    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error("Aptitude AI Error:", error);
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
