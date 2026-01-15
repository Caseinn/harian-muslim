type PageMeta = {
  juz: number | null;
  surahs: string[];
};

type Props = {
  pages: number[];
  pageMeta: Record<number, PageMeta>;
};

export default function PageGrid({ pages, pageMeta }: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-9 2xl:grid-cols-10">
      {pages.map((page) => {
        const meta = pageMeta[page];
        const juzLabel = meta?.juz ? `Juz ${meta.juz}` : "Juz -";
        const surahLabel = meta?.surahs?.length ? meta.surahs.join(", ") : "Surah -";

        return (
          <a
            key={page}
            href={`/quran/halaman/${page}`}
            className="group flex min-h-[120px] flex-col justify-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 text-center transition hover:border-primary/50 hover:bg-background/80"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {juzLabel}
            </div>
            <div className="text-2xl font-semibold leading-none tabular-nums">
              {page}
            </div>
            <div
              className="truncate text-xs text-muted-foreground"
              title={surahLabel}
            >
              {surahLabel}
            </div>
          </a>
        );
      })}
    </div>
  );
}
