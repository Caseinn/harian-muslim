import type { SurahItem } from "@/lib/api/quran";

type Props = {
  surahList: SurahItem[];
};

export default function SurahGrid({ surahList }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {surahList.map((s) => (
        <a
          key={s.nomor}
          href={`/quran/${s.nomor}`}
          className="group rounded-2xl border border-border/60 bg-background/70 p-5 transition hover:border-primary/50 hover:bg-background/80"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Surah {s.nomor}
              </div>
              <div className="truncate text-lg font-semibold">
                {s.namaLatin}
              </div>
              <div className="text-sm text-muted-foreground">
                {s.arti} - {s.tempatTurun} - {s.jumlahAyat} ayat
              </div>
            </div>

            <div className="shrink-0 text-2xl font-semibold text-primary" lang="ar" dir="rtl">
              {s.nama}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
