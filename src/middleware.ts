import { defineMiddleware } from "astro/middleware";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'sha256-JCEBku6f0AvV9kE5gnScK44UMI3Cnm2nlvVOAS8bwPY=' 'sha256-xGWu/UvLZbd67NckrAx5QpjEZVkzTn1cI8MnZdIiC58='",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://equran.id https://nominatim.openstreetmap.org",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(self)");

  if (!import.meta.env.DEV) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
    response.headers.set("Content-Security-Policy", csp);
  }

  return response;
});
