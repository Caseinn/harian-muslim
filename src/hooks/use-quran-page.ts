import { useEffect, useMemo, useRef, useState } from "react";
import {
  getPageIndex,
  getSurahPageNumbers,
  type QuranPageVerseIndex,
  type SurahItem,
} from "@/lib/api/quran";

type UseQuranPageOptions = {
  surahList: SurahItem[];
  initialMode?: "surah" | "page";
  initialQuery?: string;
};

type LastRead = {
  type: "surah" | "page";
  id: number;
  label: string;
};

type PageMeta = {
  juz: number | null;
  surahs: string[];
};

type PaginationEntry = number | "ellipsis";

const LS_KEY = "hm:last_read";
const ITEMS_PER_PAGE_SURAH = 18;
const ITEMS_PER_PAGE_PAGE = 50;

function buildPagination(current: number, total: number): PaginationEntry[] {
  if (total <= 1) return [1];

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: PaginationEntry[] = [];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  items.push(1);

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < total - 1) {
    items.push("ellipsis");
  }

  items.push(total);

  return items;
}

function getChapterIdFromKey(verseKey: string) {
  const [chapter] = verseKey.split(":");
  const id = Number(chapter);
  return Number.isFinite(id) ? id : null;
}

function getUniqueChapterIds(verses: QuranPageVerseIndex[]) {
  const ids = new Set<number>();
  for (const verse of verses) {
    const id = verse.chapter_id ?? getChapterIdFromKey(verse.verse_key);
    if (id) ids.add(id);
  }
  return Array.from(ids);
}

export default function useQuranPage({
  surahList,
  initialMode = "surah",
  initialQuery = "",
}: UseQuranPageOptions) {
  const [mode, setMode] = useState<"surah" | "page">(initialMode);
  const [query, setQuery] = useState(initialQuery);
  const [listPage, setListPage] = useState(1);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [lastReadResolved, setLastReadResolved] = useState(false);
  const [pageMeta, setPageMeta] = useState<Record<number, PageMeta>>({});
  const pageMetaInFlight = useRef<Set<number>>(new Set());
  const [surahPagesById, setSurahPagesById] = useState<
    Record<number, number[]>
  >({});
  const surahPagesInFlight = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const urlQuery = url.searchParams.get("q") ?? "";
    const urlMode = url.searchParams.get("mode");
    const nextMode =
      urlMode === "page" || urlMode === "surah" ? urlMode : null;

    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
    if (nextMode && nextMode !== mode) {
      setMode(nextMode);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LastRead;
        if (parsed?.id && parsed?.type) setLastRead(parsed);
      }
    } catch {}
    setLastReadResolved(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    url.searchParams.set("mode", mode);
    window.history.replaceState({}, "", url.toString());
  }, [query, mode]);

  useEffect(() => {
    setListPage(1);
  }, [mode, query]);

  const lastReadHref = useMemo(() => {
    if (!lastRead) return null;
    return lastRead.type === "surah"
      ? `/quran/${lastRead.id}`
      : `/quran/halaman/${lastRead.id}`;
  }, [lastRead]);

  const surahNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const surah of surahList) {
      map.set(
        surah.nomor,
        surah.namaLatin || surah.nama || `Surah ${surah.nomor}`
      );
    }
    return map;
  }, [surahList]);

  const normalizedQuery = query.trim().toLowerCase();
  const isNumericQuery = normalizedQuery.length > 0 && /^\d+$/.test(normalizedQuery);
  const pageList = useMemo(
    () => Array.from({ length: 604 }, (_, index) => index + 1),
    []
  );

  const filteredSurah = useMemo(() => {
    if (!normalizedQuery) return surahList;
    const needle = normalizedQuery;
    return surahList.filter((s) => {
      return (
        String(s.nomor) === needle ||
        s.namaLatin.toLowerCase().includes(needle) ||
        s.arti.toLowerCase().includes(needle)
      );
    });
  }, [surahList, normalizedQuery]);

  const matchedSurahIds = useMemo(() => {
    if (!normalizedQuery || isNumericQuery) return [];
    const needle = normalizedQuery;
    return surahList
      .filter((s) => {
        return (
          s.namaLatin.toLowerCase().includes(needle) ||
          s.arti.toLowerCase().includes(needle) ||
          s.tempatTurun.toLowerCase().includes(needle) ||
          s.nama.toLowerCase().includes(needle)
        );
      })
      .map((s) => s.nomor);
  }, [surahList, normalizedQuery, isNumericQuery]);

  const filteredPages = useMemo(() => {
    if (!normalizedQuery) return pageList;
    if (isNumericQuery) {
      return pageList.filter((page) => String(page).includes(normalizedQuery));
    }
    if (!matchedSurahIds.length) return [];

    const pages = new Set<number>();
    for (const id of matchedSurahIds) {
      const list = surahPagesById[id];
      if (!list) continue;
      for (const page of list) {
        pages.add(page);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  }, [pageList, normalizedQuery, isNumericQuery, matchedSurahIds, surahPagesById]);

  useEffect(() => {
    if (mode !== "page") return;
    if (!matchedSurahIds.length) return;
    let active = true;

    const missing = matchedSurahIds.filter(
      (id) => !surahPagesById[id] && !surahPagesInFlight.current.has(id)
    );

    if (!missing.length) return;

    missing.forEach((id) => surahPagesInFlight.current.add(id));

    Promise.all(
      missing.map(async (id) => {
        try {
          const pages = await getSurahPageNumbers(id);
          return { id, pages };
        } catch {
          return { id, pages: [] as number[] };
        }
      })
    )
      .then((results) => {
        if (!active) return;
        setSurahPagesById((prev) => {
          const next = { ...prev };
          for (const result of results) {
            next[result.id] = result.pages;
          }
          return next;
        });
      })
      .finally(() => {
        missing.forEach((id) => surahPagesInFlight.current.delete(id));
      });

    return () => {
      active = false;
    };
  }, [mode, matchedSurahIds, surahPagesById]);

  const totalItems =
    mode === "surah" ? filteredSurah.length : filteredPages.length;
  const itemsPerPage =
    mode === "surah" ? ITEMS_PER_PAGE_SURAH : ITEMS_PER_PAGE_PAGE;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(listPage, totalPages);

  useEffect(() => {
    if (listPage > totalPages) setListPage(totalPages);
  }, [listPage, totalPages]);

  const sliceStart = (safePage - 1) * itemsPerPage;
  const sliceEnd = sliceStart + itemsPerPage;

  const visibleSurah =
    mode === "surah" ? filteredSurah.slice(sliceStart, sliceEnd) : [];
  const visiblePages =
    mode === "page" ? filteredPages.slice(sliceStart, sliceEnd) : [];

  useEffect(() => {
    if (mode !== "page") return;
    let active = true;

    const extraPages =
      lastRead?.type === "page" && Number.isFinite(lastRead.id)
        ? [lastRead.id]
        : [];

    const pagesToLoad = Array.from(new Set([...visiblePages, ...extraPages])).filter(
      (page) => !pageMeta[page] && !pageMetaInFlight.current.has(page)
    );

    if (!pagesToLoad.length) return;

    pagesToLoad.forEach((page) => pageMetaInFlight.current.add(page));

    Promise.all(
      pagesToLoad.map(async (page) => {
        try {
          const index = await getPageIndex({ pageNumber: page });
          const verses = (index.verses ?? []) as QuranPageVerseIndex[];
          const juz = verses[0]?.juz_number ?? null;
          const chapterIds = getUniqueChapterIds(verses);
          const surahs = chapterIds.map(
            (id) => surahNameById.get(id) ?? `Surah ${id}`
          );
          return { page, meta: { juz, surahs } };
        } catch {
          return { page, meta: { juz: null, surahs: [] } };
        }
      })
    )
      .then((results) => {
        if (!active) return;
        setPageMeta((prev) => {
          const next = { ...prev };
          for (const result of results) {
            next[result.page] = result.meta;
          }
          return next;
        });
      })
      .finally(() => {
        pagesToLoad.forEach((page) => pageMetaInFlight.current.delete(page));
      });

    return () => {
      active = false;
    };
  }, [lastRead, mode, pageMeta, surahNameById, visiblePages]);

  const paginationItems = useMemo(
    () => buildPagination(safePage, totalPages),
    [safePage, totalPages]
  );

  const listTitle = mode === "surah" ? "Daftar Surah" : "Daftar Halaman";
  const listDescription = normalizedQuery
    ? `Hasil untuk "${query.trim()}" - ${totalItems} ${
        mode === "surah" ? "surah" : "halaman"
      }`
    : mode === "surah"
      ? "Pilih surah untuk mulai membaca."
      : "Pilih halaman untuk mulai membaca.";

  const emptyLabel =
    mode === "surah" ? "Surah tidak ditemukan." : "Halaman tidak ditemukan.";

  return {
    emptyLabel,
    lastRead,
    lastReadResolved,
    lastReadHref,
    listDescription,
    listPage,
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
  };
}
