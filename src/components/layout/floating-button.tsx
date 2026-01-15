import React, { useEffect, useRef, useState } from "react";
import { HeartHandshake, X } from "lucide-react";

type Props = {
  danaUrl?: string;
  qrSrc?: string;
  /** auto-open hanya sekali (per browser) */
  autoOpenOnce?: boolean;
};

const LS_KEY = "hm:sedekah_auto_opened_v1";

export default function FloatingSedekahButton({
  danaUrl = "https://link.dana.id/minta?full_url=https://qr.dana.id/v1/281012012019041854304694",
  qrSrc = "/qr.webp",
  autoOpenOnce = true,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setIsMounted(true), []);

    useEffect(() => {
    if (!isMounted || !autoOpenOnce) return;

    try {
        const already = sessionStorage.getItem(LS_KEY);
        if (!already) {
        const t = window.setTimeout(() => {
            setOpen(true);
            sessionStorage.setItem(LS_KEY, "1");
        }, 350);
        return () => window.clearTimeout(t);
        }
    } catch {
        setOpen(true);
    }
    }, [isMounted, autoOpenOnce]);

  // close on click outside + ESC
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[60]">
      {/* Bubble / Panel */}
      {isMounted && (
        <div
          className={[
            "absolute bottom-[76px] right-0 w-[min(92vw,380px)] sm:w-[460px] lg:w-[520px]",
            "origin-bottom-right transition-all duration-200 ease-out",
            open
              ? "opacity-100 scale-100 translate-y-0"
              : "pointer-events-none opacity-0 scale-95 translate-y-2",
          ].join(" ")}
          aria-hidden={!open}
        >
          <div className="rounded-2xl border border-border/60 bg-card/95 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Tabungan Akhirat
                  </p>
                  <p className="text-sm font-semibold">Sedekah</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted cursor-pointer"
                aria-label="Tutup"
                disabled={!open}
                tabIndex={open ? 0 : -1}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="shrink-0 rounded-2xl border border-border/60 bg-background p-3 mx-auto sm:mx-0">
                  <img
                    src={qrSrc}
                    alt="QRIS Donasi"
                    className={[
                      "h-40 w-40",
                      "sm:h-44 sm:w-44",
                      "lg:h-52 lg:w-52",
                      "rounded-xl object-contain",
                    ].join(" ")}
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                  <h4 className="text-base sm:text-lg font-semibold">
                    Dukung perbaikan portal ibadah
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Aplikasi ini gratis tanpa iklan. Jika berkenan, sedekah kamu bantu kualitas & fitur terus bertumbuh.
                  </p>

                  <a
                    href={danaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-95 sm:w-auto"
                    tabIndex={open ? 0 : -1}
                  >
                    Sedekah via DANA
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 px-4 py-3 text-center text-[11px] text-muted-foreground">
              Terima kasih atas dukungan Anda.
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
        <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-lg transition hover:shadow-xl cursor-pointer"
        aria-label="Buka sedekah"
        aria-expanded={open}
        >
        <HeartHandshake className="h-6 w-6 text-primary transition group-hover:scale-105" />
      </button>
    </div>
  );
}
