import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const snapshotDir = join(root, "public", "snapshots");

const EQURAN_V2 = "https://equran.id/api/v2";
const EQURAN = "https://equran.id/api";
const QURAN_COM = "https://api.quran.com/api/v4";

await mkdir(snapshotDir, { recursive: true });

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch failed: ${url} (${res.status})`);
  }
  return res.json();
}

async function writeJson(path, data) {
  const payload = JSON.stringify(data, null, 2);
  await writeFile(path, payload, "utf8");
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: limit }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
}

console.log("Snapshot: fetch surah list");
const surahListResponse = await fetchJson(`${EQURAN_V2}/surat`);
const surahList = (surahListResponse.data ?? []).sort(
  (a, b) => a.nomor - b.nomor
);
await writeJson(join(snapshotDir, "quran-surah-list.json"), surahList);
console.log(`Snapshot: saved ${surahList.length} surah list items`);

console.log("Snapshot: fetch surah details");
const surahDetails = await mapWithConcurrency(surahList, 6, async (surah, index) => {
  const url = `${EQURAN_V2}/surat/${surah.nomor}`;
  const response = await fetchJson(url);
  if ((index + 1) % 10 === 0 || index === surahList.length - 1) {
    console.log(`Snapshot: fetched surah ${index + 1}/${surahList.length}`);
  }
  return response.data;
});
await writeJson(join(snapshotDir, "quran-surah-detail.json"), surahDetails);
console.log("Snapshot: saved surah details");

console.log("Snapshot: fetch doa list");
const doaResponse = await fetchJson(`${EQURAN}/doa`);
const doaList = doaResponse.data ?? [];
await writeJson(join(snapshotDir, "doa.json"), doaList);
console.log(`Snapshot: saved ${doaList.length} doa items`);

console.log("Snapshot: fetch quran page index");
const pageIndex = { pages: {} };
const pageNumbers = Array.from({ length: 604 }, (_, index) => index + 1);

await mapWithConcurrency(pageNumbers, 8, async (pageNumber, index) => {
  const params = new URLSearchParams();
  params.set(
    "fields",
    ["chapter_id", "verse_key", "verse_number", "juz_number", "page_number"].join(
      ","
    )
  );
  params.set("per_page", "300");

  const url = `${QURAN_COM}/verses/by_page/${pageNumber}?${params.toString()}`;
  const response = await fetchJson(url);
  const verses = (response.verses ?? []).map((verse) => ({
    id: verse.id,
    verse_number: verse.verse_number,
    verse_key: verse.verse_key,
    chapter_id: verse.chapter_id,
    page_number: verse.page_number,
    juz_number: verse.juz_number,
  }));

  pageIndex.pages[String(pageNumber)] = verses;

  if ((index + 1) % 50 === 0 || index === pageNumbers.length - 1) {
    console.log(`Snapshot: fetched page index ${index + 1}/${pageNumbers.length}`);
  }
});

await writeJson(join(snapshotDir, "quran-page-index.json"), pageIndex);
console.log("Snapshot: saved quran page index");
