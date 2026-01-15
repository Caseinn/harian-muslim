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
            className="rounded-xl border border-border/60 bg-card/70 p-4 text-center transition hover:border-border min-h-[120px] flex flex-col justify-center gap-3"
          >
            <div className="text-xs text-muted-foreground">{juzLabel}</div>
            <div className="text-2xl font-bold leading-none">{page}</div>
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
