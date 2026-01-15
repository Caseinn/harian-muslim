const BASE = "https://equran.id/api";

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

export async function getAllDoa(): Promise<DoaItem[]> {
  const res = await fetch(`${BASE}/doa`);
  if (!res.ok) throw new Error("Failed fetch /doa");
  const json = await res.json();
  return json.data;
}

export async function getDoaById(id: string | number): Promise<DoaItem> {
  const res = await fetch(`${BASE}/doa/${id}`);
  if (!res.ok) throw new Error("Failed fetch /doa/:id");
  const json = await res.json();
  return json.data;
}
