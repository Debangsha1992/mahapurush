import type { NextRequest } from "next/server";
import { getFactBatch } from "@/lib/content/loaders";

export const dynamic = "force-dynamic";

function parseLimit(value: string | null): number {
  const limit = Number.parseInt(value ?? "20", 10);
  return Number.isFinite(limit) && limit > 0 ? limit : 20;
}

function parseExcludeIds(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function GET(request: NextRequest) {
  const seed =
    request.nextUrl.searchParams.get("seed") ??
    new Date().toISOString().slice(0, 10);
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));
  const excludeIds = parseExcludeIds(request.nextUrl.searchParams.get("exclude"));

  return Response.json({
    facts: getFactBatch({ seed, limit, excludeIds }),
  });
}
