import type { APIRoute } from "astro";
import webpush from "web-push";
import supabase from "@/lib/server/supabase";
import {
  getWibDateTime,
  getWibISO,
  postShalatJadwal,
  PRAYER_ORDER,
  type ShalatRow,
} from "@/lib/api/sholat";

type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
  kabkota: string;
  provinsi: string;
  last_sent_key: string | null;
};

const SITE_ORIGIN = import.meta.env.SITE_ORIGIN;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const MAX_LOCATION_LENGTH = 80;
const SEND_WINDOW_MS = 1000 * 60 * 5;

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
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
}

function isOriginAllowed(origin: string | null) {
  if (!SITE_ORIGIN || !origin) return true;
  return origin === SITE_ORIGIN;
}

function getCurrentMonthYearWib() {
  const iso = getWibISO(new Date());
  const [year, month] = iso.split("-").map(Number);
  return { year, month };
}

function shouldSend(
  nowMs: number,
  prayerTime: Date | null,
  lastSentKey: string | null,
  sendKey: string
) {
  if (!prayerTime) return false;
  if (lastSentKey === sendKey) return false;
  const diff = nowMs - prayerTime.getTime();
  return diff >= 0 && diff <= SEND_WINDOW_MS;
}

function getPrayerTimes(row: ShalatRow, dateISO: string) {
  return PRAYER_ORDER.map((prayer) => ({
    key: prayer.key,
    label: prayer.label,
    time: row[prayer.key],
    dateTime: getWibDateTime(dateISO, row[prayer.key]),
  }));
}

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  if (!isOriginAllowed(origin)) {
    return new Response("Forbidden", { status: 403, headers });
  }
  return new Response(null, { status: 204, headers });
};

export const GET: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  if (!isOriginAllowed(origin)) {
    return new Response("Forbidden", { status: 403, headers });
  }
  if (isRateLimited(request)) {
    return new Response("Too Many Requests", { status: 429, headers });
  }

  const secret = import.meta.env.PUSH_CRON_SECRET;
  if (!secret) {
    return new Response("Missing PUSH_CRON_SECRET", { status: 500, headers });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401, headers });
  }

  const vapidPublic = import.meta.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = import.meta.env.VAPID_PRIVATE_KEY;
  const vapidSubject =
    import.meta.env.VAPID_SUBJECT || "mailto:admin@example.com";

  if (!vapidPublic || !vapidPrivate) {
    return new Response("Missing VAPID keys", { status: 500, headers });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint,p256dh,auth,kabkota,provinsi,last_sent_key");

  if (error) {
    return new Response("Failed to load subscriptions", { status: 500, headers });
  }

  const subscriptions = (data ?? []) as PushSubscriptionRow[];
  if (!subscriptions.length) {
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ ok: true, sent: 0 }), {
      status: 200,
      headers,
    });
  }

  const now = new Date();
  const nowMs = now.getTime();
  const todayISO = getWibISO(now);
  const { year, month } = getCurrentMonthYearWib();

  const locationGroups = new Map<
    string,
    { kabkota: string; provinsi: string; items: PushSubscriptionRow[] }
  >();

  for (const sub of subscriptions) {
    if (
      sub.kabkota.length > MAX_LOCATION_LENGTH ||
      sub.provinsi.length > MAX_LOCATION_LENGTH
    ) {
      continue;
    }
    const key = `${sub.kabkota}||${sub.provinsi}`;
    if (!locationGroups.has(key)) {
      locationGroups.set(key, {
        kabkota: sub.kabkota,
        provinsi: sub.provinsi,
        items: [],
      });
    }
    locationGroups.get(key)?.items.push(sub);
  }

  const scheduleByLocation = new Map<string, ShalatRow | null>();

  for (const [key, group] of locationGroups) {
    try {
      const schedule = await postShalatJadwal({
        provinsi: group.provinsi,
        kabkota: group.kabkota,
        bulan: month,
        tahun: year,
      });
      const row =
        schedule.jadwal.find((item) => item.tanggal_lengkap === todayISO) ?? null;
      scheduleByLocation.set(key, row);
    } catch {
      scheduleByLocation.set(key, null);
    }
  }

  let sentCount = 0;

  for (const [key, group] of locationGroups) {
    const row = scheduleByLocation.get(key);
    if (!row) continue;

    const prayers = getPrayerTimes(row, todayISO);

    for (const sub of group.items) {
      for (const prayer of prayers) {
        const sendKey = `${todayISO}|${prayer.key}`;
        if (!shouldSend(nowMs, prayer.dateTime, sub.last_sent_key, sendKey)) {
          continue;
        }

        const payload = JSON.stringify({
          title: `Waktu Sholat ${prayer.label}`,
          body: `${prayer.label} • ${prayer.time} (${sub.kabkota})`,
          url: "/sholat",
        });

        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );

          sentCount += 1;
          await supabase
            .from("push_subscriptions")
            .update({
              last_sent_key: sendKey,
              last_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("endpoint", sub.endpoint);
        } catch (err: any) {
          const status = err?.statusCode ?? err?.status;
          if (status === 404 || status === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }
        }
      }
    }
  }

  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify({ ok: true, sent: sentCount }), {
    status: 200,
    headers,
  });
};
