export type DoaItem = {
  id: number;
  grup: string;
  nama: string;
  ar: string;
  tr: string;
  idn: string;
  tentang: string;
  tag: string[];
};

let doaSnapshotPromise: Promise<DoaItem[]> | null = null;

async function readDoaSnapshot(): Promise<DoaItem[]> {
  if (import.meta.env.SSR) {
    const { readFile } = await import("node:fs/promises");
    const { resolve } = await import("node:path");
    const filePath = resolve(process.cwd(), "public", "snapshots", "doa.json");
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as DoaItem[];
  }

  const res = await fetch("/snapshots/doa.json");
  if (!res.ok) {
    throw new Error(`Missing snapshot /snapshots/doa.json (${res.status})`);
  }
  return (await res.json()) as DoaItem[];
}

export async function getAllDoa(): Promise<DoaItem[]> {
  if (!doaSnapshotPromise) {
    doaSnapshotPromise = readDoaSnapshot();
  }
  return doaSnapshotPromise;
}

export async function getDoaById(id: string | number): Promise<DoaItem> {
  const list = await getAllDoa();
  const found = list.find((item) => String(item.id) === String(id));
  if (!found) {
    throw new Error(`Doa ${id} not found in snapshot.`);
  }
  return found;
}
