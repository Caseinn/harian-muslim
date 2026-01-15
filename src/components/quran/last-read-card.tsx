import { Badge } from "@/components/ui/badge";

type LastRead = {
  type: "surah" | "page";
  id: number;
  label: string;
};

type Props = {
  lastRead: LastRead | null;
  href: string | null;
  resolved?: boolean;
};

export default function LastReadCard({
  lastRead,
  href,
  resolved = true,
}: Props) {
  if (!resolved) {
    return (
      <div
        className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-sm"
        aria-hidden="true"
      >
        <div className="space-y-2">
          <div className="h-3 w-24 rounded-full bg-muted/50" />
          <div className="h-4 w-40 rounded-full bg-muted/40" />
        </div>
      </div>
    );
  }

  if (!lastRead || !href) {
    return (
      <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground shadow-sm">
        Belum ada terakhir dibaca.
      </div>
    );
  }

  return (
    <a
      href={href}
      className="inline-flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm shadow-sm transition hover:border-border hover:bg-background/80"
    >
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">Terakhir dibaca</div>
        <div className="truncate font-medium">{lastRead.label}</div>
      </div>
      <Badge variant="secondary">
        {lastRead.type === "surah" ? "Surah" : "Halaman"}
      </Badge>
    </a>
  );
}
