const BASE = "https://equran.id/api/v2";

export async function getShalatProvinsi(): Promise<string[]> {
  const res = await fetch(`${BASE}/shalat/provinsi`);
  if (!res.ok) throw new Error("Failed fetch /shalat/provinsi");
  const json = await res.json();
  return json.data;
}

export async function postShalatKabKota(provinsi: string): Promise<string[]> {
  const res = await fetch(`${BASE}/shalat/kabkota`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provinsi }),
  });
  if (!res.ok) throw new Error("Failed POST /shalat/kabkota");
  const json = await res.json();
  return json.data;
}

export type ShalatKabKotaItem = {
  kabkota: string;
  provinsi: string;
  value: string;
  label: string;
};

let shalatKabKotaCache:
  | { list: ShalatKabKotaItem[]; map: Record<string, string>; timestamp: number }
  | null = null;

const SHALAT_CACHE_TTL_MS = 1000 * 60 * 60 * 12;

export async function getShalatKabKotaAll(): Promise<{
  list: ShalatKabKotaItem[];
  map: Record<string, string>;
}> {
  if (
    shalatKabKotaCache &&
    Date.now() - shalatKabKotaCache.timestamp < SHALAT_CACHE_TTL_MS
  ) {
    return { list: shalatKabKotaCache.list, map: shalatKabKotaCache.map };
  }

  try {
    const provinsiList = await getShalatProvinsi();
    const kabkotaByProvinsi = await Promise.all(
      provinsiList.map(async (provinsi) => ({
        provinsi,
        list: await postShalatKabKota(provinsi),
      }))
    );

    const map: Record<string, string> = {};
    const list: ShalatKabKotaItem[] = [];

    for (const { provinsi, list: kabList } of kabkotaByProvinsi) {
      for (const kabkota of kabList) {
        if (!map[kabkota]) {
          map[kabkota] = provinsi;
        }

        list.push({
          kabkota,
          provinsi,
          value: `${kabkota}||${provinsi}`,
          label: `${kabkota}`,
        });
      }
    }

    list.sort((a, b) => a.label.localeCompare(b.label));
    shalatKabKotaCache = { list, map, timestamp: Date.now() };
    return { list, map };
  } catch (error) {
    if (shalatKabKotaCache) {
      return { list: shalatKabKotaCache.list, map: shalatKabKotaCache.map };
    }
    throw error;
  }
}

export type ShalatRow = {
  tanggal: number;
  tanggal_lengkap: string; // "YYYY-MM-DD"
  hari: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
};

export async function postShalatJadwal(args: {
  provinsi: string;
  kabkota: string;
  bulan: number;
  tahun: number;
}): Promise<{
  provinsi: string;
  kabkota: string;
  bulan: number;
  tahun: number;
  bulan_nama: string;
  jadwal: ShalatRow[];
}> {
  const res = await fetch(`${BASE}/shalat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error("Failed POST /shalat");
  const json = await res.json();
  return json.data;
}

export const PRAYER_ORDER = [
  { key: "subuh", label: "Subuh" },
  { key: "dzuhur", label: "Dzuhur" },
  { key: "ashar", label: "Ashar" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isya", label: "Isya" },
] as const;

export type PrayerKey = (typeof PRAYER_ORDER)[number]["key"];

export type NextPrayer = {
  key: PrayerKey;
  label: string;
  time: string;
  dateISO: string;
  dateTime: Date;
  dayOffset: number;
};

export function getWibNow() {
  if (typeof window === "undefined") {
    throw new Error("getWibNow must run in the browser to use device time.");
  }
  return new Date();
}

export function getWibISO(now: Date) {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

export function getWibDateTime(dateISO: string, time: string) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map((value) => Number(value));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  return new Date(`${dateISO}T${h}:${m}:00+07:00`);
}

function getRowByISO(schedule: ShalatRow[], dateISO: string) {
  return schedule.find((row) => row.tanggal_lengkap === dateISO) ?? null;
}

export function getNextPrayer(
  schedule: ShalatRow[],
  now: Date = getWibNow()
) {
  if (!schedule.length) return null;

  const todayISO = getWibISO(now);
  const todayRow = getRowByISO(schedule, todayISO);
  if (!todayRow) return null;

  for (const prayer of PRAYER_ORDER) {
    const time = todayRow[prayer.key];
    const dateTime = getWibDateTime(todayISO, time);
    if (dateTime && dateTime.getTime() > now.getTime()) {
      return {
        key: prayer.key,
        label: prayer.label,
        time,
        dateISO: todayISO,
        dateTime,
        dayOffset: 0,
      };
    }
  }

  const tomorrow = new Date(now.getTime());
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = getWibISO(tomorrow);
  const tomorrowRow = getRowByISO(schedule, tomorrowISO);
  if (!tomorrowRow) return null;

  const nextPrayer = PRAYER_ORDER[0];
  const nextTime = tomorrowRow[nextPrayer.key];
  const nextDateTime = getWibDateTime(tomorrowISO, nextTime);
  if (!nextDateTime) return null;

  return {
    key: nextPrayer.key,
    label: nextPrayer.label,
    time: nextTime,
    dateISO: tomorrowISO,
    dateTime: nextDateTime,
    dayOffset: 1,
  };
}

export function getUpcomingPrayers(
  schedule: ShalatRow[],
  now: Date = getWibNow()
) {
  if (!schedule.length) return [];

  const todayISO = getWibISO(now);
  const todayRow = getRowByISO(schedule, todayISO);
  if (!todayRow) return [];

  const upcoming = PRAYER_ORDER.map((prayer) => {
    const time = todayRow[prayer.key];
    const dateTime = getWibDateTime(todayISO, time);
    if (!dateTime) return null;
    if (dateTime.getTime() <= now.getTime()) return null;
    return {
      key: prayer.key,
      label: prayer.label,
      time,
      dateISO: todayISO,
      dateTime,
      dayOffset: 0,
    };
  }).filter(Boolean) as NextPrayer[];

  if (upcoming.length) return upcoming;

  const tomorrow = new Date(now.getTime());
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = getWibISO(tomorrow);
  const tomorrowRow = getRowByISO(schedule, tomorrowISO);
  if (!tomorrowRow) return [];

  const firstPrayer = PRAYER_ORDER[0];
  const firstTime = tomorrowRow[firstPrayer.key];
  const firstDateTime = getWibDateTime(tomorrowISO, firstTime);
  if (!firstDateTime) return [];

  return [
    {
      key: firstPrayer.key,
      label: firstPrayer.label,
      time: firstTime,
      dateISO: tomorrowISO,
      dateTime: firstDateTime,
      dayOffset: 1,
    },
  ];
}

export function formatCountdown(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}
