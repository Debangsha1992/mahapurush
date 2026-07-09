import type { NextRequest } from "next/server";
import { getFactBatch } from "@/lib/content/loaders";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 20;
const MAX_SEED_LENGTH = 128;
const MAX_EXCLUDE_IDS = 20;
const MAX_EXCLUDE_ID_LENGTH = 128;

function parseLimit(value: string | null): number {
  const limit = Number.parseInt(value ?? String(DEFAULT_LIMIT), 10);
  if (!Number.isFinite(limit) || limit < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(limit, MAX_LIMIT);
}

function parseExcludeIds(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((id) => id.trim())
    .map((id) => id.slice(0, MAX_EXCLUDE_ID_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_EXCLUDE_IDS);
}

export function parseFactBatchQuery(searchParams: URLSearchParams): {
  seed: string;
  limit: number;
  excludeIds: string[];
} {
  const seed =
    searchParams.get("seed")?.slice(0, MAX_SEED_LENGTH) ??
    new Date().toISOString().slice(0, 10);

  return {
    seed,
    limit: parseLimit(searchParams.get("limit")),
    excludeIds: parseExcludeIds(searchParams.get("exclude")),
  };
}

export function GET(request: NextRequest) {
  const { seed, limit, excludeIds } = parseFactBatchQuery(
    request.nextUrl.searchParams,
  );
  const facts = getFactBatch({ seed, limit, excludeIds });

  return Response.json({
    facts,
  });
}
