import type { APIRoute } from "astro";
import supabase from "@/lib/server/supabase";

const SITE_ORIGIN = import.meta.env.SITE_ORIGIN;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const MAX_ENDPOINT_LENGTH = 2048;

function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return (
    ip ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function isRateLimited(request: Request) {
  const key = getClientKey(request);
  const now = Date.now();
  const current = rateLimitStore.get(key);
  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  if (current.count > RATE_LIMIT_MAX) return true;
  return false;
}

function getCorsHeaders(origin: string | null) {
  const headers = new Headers();
  if (SITE_ORIGIN) {
    headers.set("Access-Control-Allow-Origin", SITE_ORIGIN);
    headers.set("Vary", "Origin");
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
}

function isOriginAllowed(origin: string | null) {
  if (!SITE_ORIGIN) return true;
  if (!origin) return false;
  return origin === SITE_ORIGIN;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

type UnsubscribePayload = {
  endpoint?: string;
};

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  if (!isOriginAllowed(origin)) {
    return new Response("Forbidden", { status: 403, headers });
  }
  return new Response(null, { status: 204, headers });
};

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  if (!isOriginAllowed(origin)) {
    return new Response("Forbidden", { status: 403, headers });
  }
  if (isRateLimited(request)) {
    return new Response("Too Many Requests", { status: 429, headers });
  }

  let payload: UnsubscribePayload;

  try {
    payload = (await request.json()) as UnsubscribePayload;
  } catch {
    return new Response("Invalid JSON", { status: 400, headers });
  }

  const endpoint = asString(payload.endpoint).trim();
  if (!endpoint) {
    return new Response("Missing endpoint", { status: 400, headers });
  }
  if (endpoint.length > MAX_ENDPOINT_LENGTH) {
    return new Response("Invalid endpoint", { status: 400, headers });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    return new Response("Failed to remove subscription", { status: 500, headers });
  }

  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers,
  });
};
