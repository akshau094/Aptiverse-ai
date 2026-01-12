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

    const explanation = await getAptitudeExplanation(question, correctAnswer, userAnswer);
    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error("Aptitude AI Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI explanation.", details: error.message },
      { status: 500 }
    );
  }
}
