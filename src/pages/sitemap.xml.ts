const STATIC_ROUTES = ["/", "/quran", "/sholat", "/doa"];

function buildUrl(origin: string, path: string) {
  return new URL(path, origin).href;
}

function renderUrl(loc: string, lastmod: string) {
  return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
}

export async function GET({ request }: { request: Request }) {
  const siteOrigin = import.meta.env.SITE_ORIGIN;
  if (!siteOrigin && !import.meta.env.DEV) {
    return new Response("Missing SITE_ORIGIN", { status: 500 });
  }
  const origin = siteOrigin
    ? new URL(siteOrigin).origin
    : new URL(request.url).origin;
  const lastmod = new Date().toISOString();

  const urls = [
    ...STATIC_ROUTES.map((path) => buildUrl(origin, path)),
    ...Array.from({ length: 114 }, (_, index) =>
      buildUrl(origin, `/quran/${index + 1}`),
    ),
    ...Array.from({ length: 604 }, (_, index) =>
      buildUrl(origin, `/quran/halaman/${index + 1}`),
    ),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((loc) => renderUrl(loc, lastmod)),
    "</urlset>",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
