type SnapshotMap<T> = Record<string, T>;

async function readSnapshotFile<T>(fileName: string): Promise<T> {
  if (import.meta.env.SSR) {
    const { readFile } = await import("node:fs/promises");
    const { resolve } = await import("node:path");
    const filePath = resolve(process.cwd(), "public", "snapshots", fileName);
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  }

  const res = await fetch(`/snapshots/${fileName}`);
  if (!res.ok) {
    throw new Error(`Missing snapshot /snapshots/${fileName} (${res.status})`);
  }
  return (await res.json()) as T;
}

/* =========================
 * EQURAN.ID TYPES
 * ========================= */
export type SurahItem = {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
};

export type AyatItem = {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
};

/* =========================
 * SNAPSHOTS (SERVER + CLIENT)
 * ========================= */
type QuranPageIndexSnapshot = {
  pages: SnapshotMap<QuranPageVerseIndex[]>;
};

let surahListSnapshotPromise: Promise<SurahItem[]> | null = null;
let surahDetailSnapshotPromise: Promise<
  Map<number, SurahItem & { ayat: AyatItem[] }>
> | null = null;
let pageIndexSnapshotPromise: Promise<QuranPageIndexSnapshot> | null = null;
let surahPagesSnapshotPromise: Promise<Record<number, number[]>> | null = null;

async function loadSurahListSnapshot() {
  if (!surahListSnapshotPromise) {
    surahListSnapshotPromise = readSnapshotFile<SurahItem[]>(
      "quran-surah-list.json"
    );
  }
  return surahListSnapshotPromise;
}

async function loadSurahDetailSnapshot() {
  if (!surahDetailSnapshotPromise) {
    surahDetailSnapshotPromise = readSnapshotFile<
      (SurahItem & { ayat: AyatItem[] })[]
    >("quran-surah-detail.json").then((list) => {
      return new Map(list.map((surah) => [surah.nomor, surah]));
    });
  }
  return surahDetailSnapshotPromise;
}

async function loadPageIndexSnapshot() {
  if (!pageIndexSnapshotPromise) {
    pageIndexSnapshotPromise = readSnapshotFile<QuranPageIndexSnapshot>(
      "quran-page-index.json"
    );
  }
  return pageIndexSnapshotPromise;
}

async function loadSurahPagesSnapshot() {
  if (!surahPagesSnapshotPromise) {
    surahPagesSnapshotPromise = (async () => {
      const index = await loadPageIndexSnapshot();
      const map = new Map<number, Set<number>>();

      for (const [pageKey, verses] of Object.entries(index.pages ?? {})) {
        const pageNumber = Number(pageKey);
        if (!Number.isFinite(pageNumber)) continue;

        for (const verse of verses) {
          const chapterId =
            verse.chapter_id ?? getChapterIdFromKey(verse.verse_key);
          if (!chapterId) continue;

          let pages = map.get(chapterId);
          if (!pages) {
            pages = new Set();
            map.set(chapterId, pages);
          }
          pages.add(pageNumber);
        }
      }

      const result: Record<number, number[]> = {};
      for (const [id, pages] of map) {
        result[id] = Array.from(pages).sort((a, b) => a - b);
      }
      return result;
    })();
  }
  return surahPagesSnapshotPromise;
}

/* =========================
 * PUBLIC API (SNAPSHOT)
 * ========================= */
export async function getSurahList(): Promise<SurahItem[]> {
  return loadSurahListSnapshot();
}

export async function getSurahDetail(
  nomor: string | number
): Promise<SurahItem & { ayat: AyatItem[] }> {
  const id = Number(nomor);
  if (!Number.isFinite(id)) {
    throw new Error(`Invalid surah id (${nomor})`);
  }

  const map = await loadSurahDetailSnapshot();
  const surah = map.get(id);
  if (!surah) {
    throw new Error(`Surah ${id} not found in snapshot.`);
  }
  return surah;
}

/* =========================
 * QURAN.COM TYPES (INDEX ONLY)
 * ========================= */
export type QuranPageVerseIndex = {
  id: number;
  verse_number: number;
  verse_key: string; // e.g. "2:255"
  chapter_id?: number;
  page_number: number;
  juz_number: number;
};

export type QuranComPagination = {
  per_page: number;
  current_page: number;
  next_page?: number | null;
  total_pages: number;
  total_records: number;
};

export type QuranPageIndexResponse = {
  verses: QuranPageVerseIndex[];
  pagination: QuranComPagination;
};

/* =========================
 * PAGE DATA (CONTENT FROM EQURAN)
 * ========================= */
export type PageAyat = {
  chapterId: number; // nomor surah
  verseNumber: number; // nomor ayat
  verseKey: string; // "2:255"
  pageNumber: number;
  juzNumber: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
};

export type QuranPageData = {
  pageNumber: number;
  imageUrl: string | null;
  verses: PageAyat[];
  meta: {
    juz: number;
    surahs: { name: string; number: number }[];
  };
};

/* =========================
 * SMALL HELPERS
 * ========================= */
function getChapterIdFromKey(verseKey: string) {
  const [chapter] = verseKey.split(":");
  const id = Number(chapter);
  return Number.isFinite(id) ? id : null;
}

/* =========================
 * CACHES
 * ========================= */
const surahDetailCache = new Map<
  number,
  Promise<SurahItem & { ayat: AyatItem[] }>
>();

async function getSurahDetailCached(chapterId: number) {
  const existing = surahDetailCache.get(chapterId);
  if (existing) return existing;

  const p = getSurahDetail(chapterId);
  surahDetailCache.set(chapterId, p);
  return p;
}

export function clearQuranCaches() {
  surahDetailCache.clear();
  surahListSnapshotPromise = null;
  surahDetailSnapshotPromise = null;
  pageIndexSnapshotPromise = null;
  surahPagesSnapshotPromise = null;
}

/* =========================
 * QURAN PAGE INDEX (SNAPSHOT)
 * ========================= */
export type GetPageIndexOptions = {
  pageNumber: number;
};

export async function getPageIndex(
  options: GetPageIndexOptions
): Promise<QuranPageIndexResponse> {
  const index = await loadPageIndexSnapshot();
  const key = String(options.pageNumber);
  const verses = (index.pages?.[key] ?? []) as QuranPageVerseIndex[];

  return {
    verses,
    pagination: {
      per_page: verses.length,
      current_page: 1,
      total_pages: 1,
      total_records: verses.length,
    },
  };
}

export async function getSurahPageNumbers(
  chapterId: number
): Promise<number[]> {
  const pagesBySurah = await loadSurahPagesSnapshot();
  return pagesBySurah[chapterId] ?? [];
}

/* =========================
 * MAIN: PAGE INDEX + SURAH SNAPSHOT
 * ========================= */
function getUniqueChapterIdsFromIndex(verses: QuranPageVerseIndex[]) {
  const ids = new Set<number>();
  for (const v of verses) {
    const cid = v.chapter_id ?? getChapterIdFromKey(v.verse_key);
    if (cid != null) ids.add(cid);
  }
  return Array.from(ids).sort((a, b) => a - b);
}

export async function getQuranPageData(
  pageNumber: number
): Promise<QuranPageData> {
  const pageIndex = await getPageIndex({ pageNumber });

  const versesIndex = pageIndex.verses ?? [];
  const juz = versesIndex[0]?.juz_number ?? 0;

  if (!versesIndex.length) {
    return {
      pageNumber,
      imageUrl: null,
      verses: [],
      meta: { juz, surahs: [] },
    };
  }

  const surahIds = getUniqueChapterIdsFromIndex(versesIndex);

  const surahDetails = await Promise.all(
    surahIds.map((id) => getSurahDetailCached(id))
  );

  const surahMap = new Map<number, SurahItem & { ayat: AyatItem[] }>(
    surahDetails.map((s) => [s.nomor, s])
  );

  const surahs = surahIds.map((id) => {
    const surah = surahMap.get(id);
    const name = surah?.namaLatin ?? surah?.nama ?? `Surah ${id}`;
    return { name, number: id };
  });

  const verses: PageAyat[] = versesIndex
    .map((v) => {
      const chapterId = v.chapter_id ?? getChapterIdFromKey(v.verse_key);
      if (chapterId == null) return null;

      const surah = surahMap.get(chapterId);
      if (!surah) return null;

      const ayat = surah.ayat?.find((a) => a.nomorAyat === v.verse_number);
      if (!ayat) return null;

      return {
        chapterId,
        verseNumber: v.verse_number,
        verseKey: v.verse_key,
        pageNumber: v.page_number ?? pageNumber,
        juzNumber: v.juz_number,
        teksArab: ayat.teksArab,
        teksLatin: ayat.teksLatin,
        teksIndonesia: ayat.teksIndonesia,
        audio: ayat.audio,
      } as PageAyat;
    })
    .filter(Boolean) as PageAyat[];

  return {
    pageNumber,
    imageUrl: null,
    verses,
    meta: {
      juz,
      surahs,
    },
  };
}
