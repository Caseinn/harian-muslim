export async function GET({ request }: { request: Request }) {
  const siteOrigin = import.meta.env.SITE_ORIGIN;
  if (!siteOrigin && !import.meta.env.DEV) {
    return new Response("Missing SITE_ORIGIN", { status: 500 });
  }
  const url = siteOrigin ? new URL(siteOrigin) : new URL(request.url);
  const origin = url.origin;
  const host = url.host;
  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${origin}/sitemap.xml`,
    `Host: ${host}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
