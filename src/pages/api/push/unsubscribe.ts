import type { APIRoute } from "astro";
import supabase from "@/lib/server/supabase";

type UnsubscribePayload = {
  endpoint?: string;
};

export const POST: APIRoute = async ({ request }) => {
  let payload: UnsubscribePayload;

  try {
    payload = (await request.json()) as UnsubscribePayload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const endpoint = payload.endpoint?.trim();
  if (!endpoint) {
    return new Response("Missing endpoint", { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    return new Response("Failed to remove subscription", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
