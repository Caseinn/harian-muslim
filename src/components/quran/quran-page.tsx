import LastReadCard from "@/components/quran/last-read-card";
import PageGrid from "@/components/quran/page-grid";
import PaginationBar from "@/components/quran/pagination-bar";
import QuranControls from "@/components/quran/quran-controls";
import SurahGrid from "@/components/quran/surah-grid";
import type { SurahItem } from "@/lib/api/quran";
import useQuranPage from "@/hooks/use-quran-page";

type Props = {
  surahList: SurahItem[];
  initialMode?: "surah" | "page";
  initialQuery?: string;
};

export default function QuranPage({
  surahList,
  initialMode = "surah",
  initialQuery = "",
}: Props) {
  const {
    emptyLabel,
    lastRead,
    lastReadResolved,
    lastReadHref,
    listDescription,
    listTitle,
    mode,
    pageMeta,
    paginationItems,
    query,
    safePage,
    setListPage,
    setMode,
    setQuery,
    totalItems,
    totalPages,
    visiblePages,
    visibleSurah,
  } = useQuranPage({ surahList, initialMode, initialQuery });

  return (
    <>
      <section className="pb-12 sm:pb-16">
        <div className="illumination-panel p-6 sm:p-8">
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold md:text-4xl">
                Baca Al-Qur&apos;an
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Baca dan pelajari Al-Qur&apos;an dengan teks Arab, transliterasi Latin,
                dan terjemahan Indonesia.
              </p>
            </div>

            <LastReadCard
              lastRead={lastRead}
              href={lastReadHref}
              resolved={lastReadResolved}
            />
          </div>

          <div className="my-6 ornament-divider" />

          <QuranControls
            mode={mode}
            onModeChange={setMode}
            query={query}
            onQueryChange={setQuery}
          />
        </div>
      </section>

      <section className="pb-12">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{listTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {listDescription}
            </p>
          </div>
        </header>

        {totalItems === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : mode === "surah" ? (
          <SurahGrid surahList={visibleSurah} />
        ) : (
          <PageGrid pages={visiblePages} pageMeta={pageMeta} />
        )}

        {totalPages > 1 ? (
          <PaginationBar
            paginationItems={paginationItems}
            safePage={safePage}
            totalPages={totalPages}
            onPageChange={setListPage}
          />
        ) : null}
      </section>
    </>
  );
}
