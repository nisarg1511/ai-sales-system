import { NextRequest, NextResponse } from "next/server";
import { crawlWebsite, combinePageContents } from "@/lib/crawler";
import { extractBusinessData } from "@/lib/extractor";

export async function POST(req: NextRequest) {
  try {
    const { sources, businessContext } = await req.json();

    const allContent: string[] = [];

    for (const source of sources ?? []) {
      if (source.type === "url" || source.type === "gdrive" || source.type === "notion") {
        try {
          const maxPages = source.type === "url" ? 15 : 3;
          const pages = await crawlWebsite(source.value, maxPages);
          if (pages.length > 0) {
            allContent.push(combinePageContents(pages));
          }
        } catch (err) {
          console.warn(`Failed to crawl ${source.value}:`, err);
        }
      } else if (source.type === "text" && source.content) {
        allContent.push(source.content);
      }
    }

    const combinedContent = allContent.join("\n\n=====\n\n") || "No content available.";

    const extractedData = await extractBusinessData(combinedContent, businessContext);

    return NextResponse.json(extractedData);
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
