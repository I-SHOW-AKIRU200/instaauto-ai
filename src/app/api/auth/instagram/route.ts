import { NextResponse } from "next/server";
import { buildOAuthUrl } from "@/lib/meta";

export async function GET() {
  try {
    const url = buildOAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to build OAuth URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
