self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || "Harian Muslim";
  const options = {
    body: data.body || "Pengingat waktu sholat.",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            const clientUrl = new URL(client.url);
            const target = new URL(targetUrl, clientUrl.origin);
            if (clientUrl.pathname === target.pathname) {
              return client.focus();
            }
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
        return undefined;
      })
  );
});
