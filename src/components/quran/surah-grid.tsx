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
          className="rounded-2xl border border-border/60 bg-card p-4 transition hover:border-border"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">
                Surah {s.nomor}
              </div>
              <div className="mt-1 truncate text-base font-semibold">
                {s.namaLatin}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {s.arti} - {s.tempatTurun} - {s.jumlahAyat} ayat
              </div>
            </div>

            <div className="shrink-0 text-xl font-semibold text-primary">
              {s.nama}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
