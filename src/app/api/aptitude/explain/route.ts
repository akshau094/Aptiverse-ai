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

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { 
          error: "GEMINI_API_KEY is missing.",
          details: "The Gemini API key is not set in Vercel Environment Variables. The AI Tutor cannot generate feedback without this key."
        },
        { status: 500 }
      );
    }

    const explanation = await getAptitudeExplanation(question, correctAnswer, userAnswer);
    
    if (explanation.startsWith("ERROR:")) {
      return NextResponse.json(
        { error: "AI Generation Failed", details: explanation },
        { status: 500 }
      );
    }

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
