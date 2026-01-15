const BASE = "https://equran.id/api/v2";
const PAGE_BASE = "https://api.quran.com/api/v4";

/* =========================
 * EQURAN.ID TYPES + FETCH
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

export async function getSurahList(): Promise<SurahItem[]> {
  const url = `${BASE}/surat`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed fetch /surah (${res.status})`);
  const json = await res.json();
  return json.data;
}

export async function getSurahDetail(
  nomor: string | number
): Promise<SurahItem & { ayat: AyatItem[] }> {
  const url = `${BASE}/surat/${nomor}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed fetch /surah/${nomor} (${res.status})`);
  const json = await res.json();
  return json.data;
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

function pickStatusErr(res: Response, url: string) {
  return `${url} (${res.status} ${res.statusText || ""})`.trim();
}

/* =========================
 * CACHES (IN-MEMORY)
 * NOTE: Works per runtime instance (good enough for SSR / edge-ish).
 * ========================= */
const surahDetailCache = new Map<number, Promise<SurahItem & { ayat: AyatItem[] }>>();
const surahPagesCache = new Map<number, Promise<number[]>>();

async function getSurahDetailCached(chapterId: number) {
  const existing = surahDetailCache.get(chapterId);
  if (existing) return existing;

  const p = getSurahDetail(chapterId);
  surahDetailCache.set(chapterId, p);
  return p;
}

export function clearQuranCaches() {
  surahDetailCache.clear();
  surahPagesCache.clear();
}

/* =========================
 * QURAN.COM: INDEX ONLY
 * ========================= */
export type GetPageIndexOptions = {
  pageNumber: number;
};

export async function getPageIndex(
  options: GetPageIndexOptions
): Promise<QuranPageIndexResponse> {
  const params = new URLSearchParams();

  // Keep it LIGHT: only fields needed for indexing/mapping
  params.set(
    "fields",
    ["chapter_id", "verse_key", "verse_number", "juz_number", "page_number"].join(",")
  );

  const url = `${PAGE_BASE}/verses/by_page/${options.pageNumber}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed fetch index ${pickStatusErr(res, url)}`);

  const json = await res.json();
  return {
    verses: (json.verses ?? []) as QuranPageVerseIndex[],
    pagination: json.pagination as QuranComPagination,
  };
}

export async function getSurahPageNumbers(
  chapterId: number
): Promise<number[]> {
  const existing = surahPagesCache.get(chapterId);
  if (existing) return existing;

  const promise = (async () => {
    const params = new URLSearchParams();
    params.set(
      "fields",
      ["chapter_id", "verse_key", "verse_number", "page_number"].join(",")
    );
    params.set("per_page", "300");

    const url = `${PAGE_BASE}/verses/by_chapter/${chapterId}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed fetch chapter ${pickStatusErr(res, url)}`);

    const json = await res.json();
    const verses = (json.verses ?? []) as QuranPageVerseIndex[];
    const pages = new Set<number>();
    for (const verse of verses) {
      if (verse.page_number) pages.add(verse.page_number);
    }
    return Array.from(pages).sort((a, b) => a - b);
  })();

  surahPagesCache.set(chapterId, promise);
  return promise;
}

/* =========================
 * MAIN: PAGE_BASE index, BASE content
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
  // 1) Indexing: Quran.com (page -> list verse refs)
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

  // 2) Fetch content per-surah from equran.id (cached)
  const surahIds = getUniqueChapterIdsFromIndex(versesIndex);

  const surahDetails = await Promise.all(
    surahIds.map((id) => getSurahDetailCached(id))
  );

  const surahMap = new Map<number, SurahItem & { ayat: AyatItem[] }>(
    surahDetails.map((s) => [s.nomor, s])
  );

  // 3) Build surah meta for the page
  const surahs = surahIds.map((id) => {
    const surah = surahMap.get(id);
    const name = surah?.namaLatin ?? surah?.nama ?? `Surah ${id}`;
    return { name, number: id };
  });

  // 4) Resolve each indexed verse into actual ayat content from equran
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
