import { NextResponse } from "next/server";
import { startInterview } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { role, isParagraph } = await req.json();

    if (!role) {
      return NextResponse.json(
        { error: "Missing required field: role." },
        { status: 400 }
      );
    }

    const content = await startInterview(role, isParagraph);
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Interview Start AI Error:", error);
    return NextResponse.json(
      { error: "Failed to start AI interview.", details: error.message },
      { status: 500 }
    );
  }
}
