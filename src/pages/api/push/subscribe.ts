import type { APIRoute } from "astro";
import supabase from "@/lib/server/supabase";
import { getShalatKabKotaAll } from "@/lib/api/sholat";

const SITE_ORIGIN = import.meta.env.SITE_ORIGIN;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const MAX_ENDPOINT_LENGTH = 2048;
const MAX_KEY_LENGTH = 256;
const MAX_LOCATION_LENGTH = 80;

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

async function isLocationAllowed(kabkota: string, provinsi: string) {
  try {
    const { list } = await getShalatKabKotaAll();
    return list.some(
      (item) => item.kabkota === kabkota && item.provinsi === provinsi
    );
  } catch {
    return false;
  }
}

type SubscribePayload = {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  kabkota?: string;
  provinsi?: string;
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

  let payload: SubscribePayload;

  try {
    payload = (await request.json()) as SubscribePayload;
  } catch {
    return new Response("Invalid JSON", { status: 400, headers });
  }

  const endpoint = asString(payload.subscription?.endpoint).trim();
  const p256dh = asString(payload.subscription?.keys?.p256dh).trim();
  const auth = asString(payload.subscription?.keys?.auth).trim();
  const kabkota = asString(payload.kabkota).trim();
  const provinsi = asString(payload.provinsi).trim();

  if (!endpoint || !p256dh || !auth || !kabkota || !provinsi) {
    return new Response("Missing subscription fields", { status: 400, headers });
  }
  if (
    endpoint.length > MAX_ENDPOINT_LENGTH ||
    p256dh.length > MAX_KEY_LENGTH ||
    auth.length > MAX_KEY_LENGTH ||
    kabkota.length > MAX_LOCATION_LENGTH ||
    provinsi.length > MAX_LOCATION_LENGTH
  ) {
    return new Response("Invalid subscription fields", { status: 400, headers });
  }
  if (!(await isLocationAllowed(kabkota, provinsi))) {
    return new Response("Invalid location", { status: 400, headers });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        endpoint,
        p256dh,
        auth,
        kabkota,
        provinsi,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );

  if (error) {
    return new Response("Failed to store subscription", { status: 500, headers });
  }

  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers,
  });
};
