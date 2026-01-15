(() => {
  const STORAGE_KEY = "hm:last_read";

  const getPayload = (doc) => {
    const el = doc.querySelector("[data-last-read]");
    if (!el) return null;

    const { type, id, label } = el.dataset;
    const parsedId = Number(id);
    if (!type || !label || !Number.isFinite(parsedId)) return null;

    return { type, id: parsedId, label };
  };

  const writePayload = (doc) => {
    const payload = getPayload(doc);
    if (!payload) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  };

  writePayload(document);

  document.addEventListener("astro:page-load", () => {
    writePayload(document);
  });

  document.addEventListener("astro:after-swap", () => {
    writePayload(document);
  });
})();
