import { NextRequest, NextResponse } from "next/server";
import { generateAgentConfiguration } from "@/lib/extractor";

export async function POST(req: NextRequest) {
  try {
    const { extractedData, dynamicAnswers } = await req.json();

    if (!extractedData) {
      return NextResponse.json({ error: "No extracted data provided" }, { status: 400 });
    }

    const config = await generateAgentConfiguration(extractedData, dynamicAnswers ?? {});

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Agent generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
