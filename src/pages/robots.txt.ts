export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
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
