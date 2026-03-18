import * as cheerio from "cheerio";

interface CrawlResult {
  url: string;
  title: string;
  content: string;
  links: string[];
}

export async function fetchPageContent(url: string): Promise<CrawlResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AISalesBot/1.0; +https://aisales.app)",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $("script, style, nav, footer, header, aside, .cookie-banner, .popup, iframe").remove();

  const title = $("title").text().trim();

  // Extract main content
  const contentSelectors = ["main", "article", ".content", ".main-content", "#content", "body"];
  let content = "";

  for (const selector of contentSelectors) {
    const el = $(selector);
    if (el.length > 0) {
      content = el.text().replace(/\s+/g, " ").trim();
      if (content.length > 200) break;
    }
  }

  // Extract links for crawling
  const baseUrl = new URL(url).origin;
  const links: string[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    try {
      const absoluteUrl = href.startsWith("http") ? href : new URL(href, url).toString();
      if (absoluteUrl.startsWith(baseUrl) && !links.includes(absoluteUrl)) {
        links.push(absoluteUrl);
      }
    } catch {
      // Invalid URL, skip
    }
  });

  return { url, title, content, links };
}

export async function crawlWebsite(
  startUrl: string,
  maxPages = 20,
  onProgress?: (current: number, total: number) => void
): Promise<CrawlResult[]> {
  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const results: CrawlResult[] = [];

  // Priority paths to crawl
  const priorityPaths = [
    "/",
    "/about",
    "/product",
    "/products",
    "/services",
    "/pricing",
    "/features",
    "/solutions",
    "/how-it-works",
    "/use-cases",
    "/customers",
    "/case-studies",
    "/faq",
  ];

  // Add priority paths to front of queue
  const baseUrl = new URL(startUrl).origin;
  for (const path of priorityPaths) {
    const priorityUrl = `${baseUrl}${path}`;
    if (!queue.includes(priorityUrl)) {
      queue.unshift(priorityUrl);
    }
  }

  while (queue.length > 0 && results.length < maxPages) {
    const url = queue.shift()!;

    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const result = await fetchPageContent(url);
      if (result.content.length > 100) {
        results.push(result);
        onProgress?.(results.length, Math.min(queue.length + results.length, maxPages));

        // Add new links to queue (limit depth)
        for (const link of result.links.slice(0, 5)) {
          if (!visited.has(link) && !queue.includes(link)) {
            queue.push(link);
          }
        }
      }
    } catch {
      // Skip failed pages
    }

    // Small delay to be polite
    await new Promise((r) => setTimeout(r, 200));
  }

  return results;
}

export function combinePageContents(pages: CrawlResult[]): string {
  return pages
    .map((p) => `## ${p.title}\nURL: ${p.url}\n\n${p.content}`)
    .join("\n\n---\n\n");
}
