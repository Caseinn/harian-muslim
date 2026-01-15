import type { APIRoute } from "astro";
import supabase from "@/lib/server/supabase";

type SubscribePayload = {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  kabkota?: string;
  provinsi?: string;
};

export const POST: APIRoute = async ({ request }) => {
  let payload: SubscribePayload;

  try {
    payload = (await request.json()) as SubscribePayload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const endpoint = payload.subscription?.endpoint;
  const p256dh = payload.subscription?.keys?.p256dh;
  const auth = payload.subscription?.keys?.auth;
  const kabkota = payload.kabkota?.trim();
  const provinsi = payload.provinsi?.trim();

  if (!endpoint || !p256dh || !auth || !kabkota || !provinsi) {
    return new Response("Missing subscription fields", { status: 400 });
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
    return new Response("Failed to store subscription", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
