import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo (use database in production)
const sessions = new Map<string, Record<string, unknown>>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    sessions.set(sessionId, {
      id: sessionId,
      createdAt: new Date().toISOString(),
      ...body,
    });

    return NextResponse.json({ sessionId });
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("id");

  if (!sessionId || !sessions.has(sessionId)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(sessions.get(sessionId));
}

export async function PUT(req: NextRequest) {
  try {
    const { sessionId, ...updates } = await req.json();

    if (!sessionId || !sessions.has(sessionId)) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const existing = sessions.get(sessionId) ?? {};
    sessions.set(sessionId, { ...existing, ...updates, updatedAt: new Date().toISOString() });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
