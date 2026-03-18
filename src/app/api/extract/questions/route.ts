import { NextRequest, NextResponse } from "next/server";
import { generateDynamicQuestions } from "@/lib/extractor";

export async function POST(req: NextRequest) {
  try {
    const { businessModel, businessDescription } = await req.json();

    if (!businessModel || !businessDescription) {
      return NextResponse.json({ sections: [] });
    }

    const sections = await generateDynamicQuestions(businessModel, businessDescription);

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Questions generation error:", error);
    return NextResponse.json({ sections: [] });
  }
}
