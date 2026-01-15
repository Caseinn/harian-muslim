import * as React from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAllDoa, type DoaItem } from "@/lib/api/doa";
import {
  getPageIndex,
  getSurahList,
  type QuranPageVerseIndex,
  type SurahItem,
} from "@/lib/api/quran";
import {
  formatCountdown,
  getShalatKabKotaAll,
  getUpcomingPrayersWithFallback,
  getWibISO,
  postShalatJadwal,
  type NextPrayer,
  type ShalatKabKotaItem,
} from "@/lib/api/sholat";
import { cn } from "@/lib/utils";

const DEFAULT_PROVINSI = "DKI Jakarta";
const DEFAULT_KABKOTA = "Kota Jakarta";

const SHALAT_LOCATION_KEY = "hm:shalat_location";
const LAST_READ_KEY = "hm:last_read";

type ShalatLocation = {
  kabkota: string;
  provinsi: string;
};

type LastRead = {
  type: "surah" | "page";
  id: number;
  label: string;
};

type PageMeta = {
  juz: number | null;
  chapterIds: number[];
};

function getDayIndexWib(now: Date) {
  const iso = getWibISO(now);
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return 0;

  const start = new Date(`${year}-01-01T00:00:00+07:00`);
  const current = new Date(`${iso}T00:00:00+07:00`);
  return Math.max(
    0,
    Math.floor((current.getTime() - start.getTime()) / 86400000)
  );
}

function getCurrentMonthYearWib() {
  const iso = getWibISO(new Date());
  const [year, month] = iso.split("-").map(Number);
  return { year, month };
}

function readLocationFromStorage(): ShalatLocation | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SHALAT_LOCATION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.kabkota || !parsed?.provinsi) return null;
    return {
      kabkota: String(parsed.kabkota),
      provinsi: String(parsed.provinsi),
    };
  } catch {
    return null;
  }
}

function readLastRead(): LastRead | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LAST_READ_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastRead;
  } catch {
    return null;
  }
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

function normalizeLocationName(value: string) {
  return value
    .toLowerCase()
    .replace(/\bkabupaten\b/g, "")
    .replace(/\bkab\.\b/g, "")
    .replace(/\bkab\b/g, "")
    .replace(/\bkota\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findBestLocationMatch(
  options: ShalatKabKotaItem[],
  rawName: string
) {
  const target = normalizeLocationName(rawName);
  if (!target) return null;

  let best: ShalatKabKotaItem | null = null;
  let bestLen = 0;

  for (const option of options) {
    const normalized = normalizeLocationName(option.kabkota);
    if (!normalized) continue;

    if (normalized === target) return option;

    const matches =
      target.includes(normalized) || normalized.includes(target);

    if (matches && normalized.length > bestLen) {
      best = option;
      bestLen = normalized.length;
    }
  }

  return best;
}

async function reverseGeocodeKabKota(lat: number, lon: number) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "id");

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const json = await res.json();
  const address = json?.address ?? {};

  return (
    address.city ??
    address.town ??
    address.municipality ??
    address.county ??
    address.state_district ??
    address.village ??
    address.state ??
    address.region ??
    null
  );
}

export default function TodaySection() {
  const [location, setLocation] = React.useState<ShalatLocation>({
    kabkota: DEFAULT_KABKOTA,
    provinsi: DEFAULT_PROVINSI,
  });

  const [locationOptions, setLocationOptions] = React.useState<
    ShalatKabKotaItem[]
  >([]);
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [detectingLocation, setDetectingLocation] = React.useState(false);
  const detectInFlightRef = React.useRef(false);

  const [nextPrayer, setNextPrayer] = React.useState<NextPrayer | null>(null);
  const [followingPrayer, setFollowingPrayer] =
    React.useState<NextPrayer | null>(null);

  const [dailyDoa, setDailyDoa] = React.useState<DoaItem | null>(null);
  const [lastRead, setLastRead] = React.useState<LastRead | null>(null);
  const [surahList, setSurahList] = React.useState<SurahItem[]>([]);
  const [pageMeta, setPageMeta] = React.useState<PageMeta | null>(null);

  const [countdown, setCountdown] = React.useState("00:00:00");

  React.useEffect(() => {
    const stored = readLocationFromStorage();
    if (stored) setLocation(stored);
    setLastRead(readLastRead());

    const onStorage = (e: StorageEvent) => {
      if (e.key === LAST_READ_KEY) setLastRead(readLastRead());
      if (e.key === SHALAT_LOCATION_KEY) {
        const storedLoc = readLocationFromStorage();
        if (storedLoc) setLocation(storedLoc);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SHALAT_LOCATION_KEY, JSON.stringify(location));
  }, [location]);

  React.useEffect(() => {
    let active = true;

    getShalatKabKotaAll()
      .then(({ list }) => {
        if (active) setLocationOptions(list);
      })
      .catch(() => {
        if (active) setLocationOptions([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const detectLocation = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!("geolocation" in navigator)) return;
    if (detectInFlightRef.current) return;

    detectInFlightRef.current = true;
    setDetectingLocation(true);

    try {
      const options =
        locationOptions.length > 0
          ? locationOptions
          : (await getShalatKabKotaAll()).list;

      if (!options.length) return;

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
          );
        }
      );

      const name = await reverseGeocodeKabKota(
        position.coords.latitude,
        position.coords.longitude
      );
      if (!name) return;

      const match = findBestLocationMatch(options, name);
      if (!match) return;

      setLocation({ kabkota: match.kabkota, provinsi: match.provinsi });
    } catch {
      // ignore detect errors
    } finally {
      detectInFlightRef.current = false;
      setDetectingLocation(false);
    }
  }, [locationOptions]);

  React.useEffect(() => {
    let active = true;
    const { year, month } = getCurrentMonthYearWib();

    postShalatJadwal({
      provinsi: location.provinsi,
      kabkota: location.kabkota,
      bulan: month,
      tahun: year,
    })
      .then(async (schedule) => {
        const upcoming = await getUpcomingPrayersWithFallback({
          schedule: schedule.jadwal ?? [],
          provinsi: location.provinsi,
          kabkota: location.kabkota,
          now: new Date(),
        });
        if (!active) return;
        setNextPrayer(upcoming[0] ?? null);
        setFollowingPrayer(upcoming[1] ?? null);
      })
      .catch(() => {
        if (!active) return;
        setNextPrayer(null);
        setFollowingPrayer(null);
      });

    return () => {
      active = false;
    };
  }, [location]);

  React.useEffect(() => {
    if (!nextPrayer?.dateTime) {
      setCountdown("00:00:00");
      return;
    }

    const tick = () => {
      const diff = nextPrayer.dateTime.getTime() - Date.now();
      setCountdown(formatCountdown(diff));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [nextPrayer]);

  React.useEffect(() => {
    let active = true;
    const index = getDayIndexWib(new Date());

    getAllDoa()
      .then((list) => {
        if (active && list.length) setDailyDoa(list[index % list.length]);
      })
      .catch(() => {
        if (active) setDailyDoa(null);
      });

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;

    getSurahList()
      .then((list) => {
        if (active) setSurahList(list ?? []);
      })
      .catch(() => {
        if (active) setSurahList([]);
      });

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;

    if (!lastRead || lastRead.type !== "page") {
      setPageMeta(null);
      return () => {
        active = false;
      };
    }

    getPageIndex({ pageNumber: lastRead.id })
      .then((data) => {
        if (!active) return;
        const verses = data.verses ?? [];
        const juz = verses[0]?.juz_number ?? null;
        const chapterIds = getUniqueChapterIds(verses);
        setPageMeta({ juz, chapterIds });
      })
      .catch(() => {
        if (!active) return;
        setPageMeta(null);
      });

    return () => {
      active = false;
    };
  }, [lastRead]);

  const surahById = React.useMemo(() => {
    const map = new Map<number, SurahItem>();
    for (const surah of surahList) map.set(surah.nomor, surah);
    return map;
  }, [surahList]);

  const lastReadView = React.useMemo(() => {
    if (!lastRead) return null;

    if (lastRead.type === "surah") {
      const surah = surahById.get(lastRead.id);
      const title =
        surah?.namaLatin ??
        surah?.nama ??
        lastRead.label ??
        `Surah ${lastRead.id}`;
      const arab = surah?.nama ?? "";
      const meta = surah
        ? `${surah.arti} • ${surah.tempatTurun} • ${surah.jumlahAyat} ayat`
        : null;

      return {
        mode: "Per Surah" as const,
        title,
        arab,
        meta,
        href: `/quran/${lastRead.id}`,
      };
    }

    const juz = pageMeta?.juz ?? null;
    const chapterIds = pageMeta?.chapterIds ?? [];
    const surahNames = chapterIds
      .map(
        (id) =>
          surahById.get(id)?.namaLatin ??
          surahById.get(id)?.nama ??
          `Surah ${id}`
      )
      .filter(Boolean);

    return {
      mode: "Per Halaman" as const,
      title: `Halaman ${lastRead.id}`,
      arab: "",
      meta: surahNames.length ? `${surahNames.join(", ")}` : null,
      href: `/quran/halaman/${lastRead.id}`,
      page: lastRead.id,
      juz,
    };
  }, [lastRead, pageMeta, surahById]);

  const locationLabel = location.kabkota || "Pilih kab/kota";

  return (
    <section className="py-16">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Fokus Hari Ini</h2>
        <p className="text-sm text-muted-foreground">
          Ringkasan ibadah yang bisa langsung digunakan hari ini
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* TERAKHIR DIBACA */}
        <Card className="flex flex-col border-border/60 bg-card/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Terakhir Dibaca</CardTitle>
              {lastReadView ? (
                <Badge variant="secondary" className="text-[11px]">
                  {lastReadView.mode}
                </Badge>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col">
            {lastReadView ? (
              <>
                <div className="space-y-1">
                  <p className="text-xl font-semibold leading-tight tracking-tight">
                    {lastReadView.title}
                  </p>

                  {lastReadView.arab ? (
                    <p className="text-right text-2xl font-semibold leading-none text-primary">
                      {lastReadView.arab}
                    </p>
                  ) : null}

                  {lastReadView.meta ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {lastReadView.meta}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Lanjutkan dari bacaan terakhir Anda
                    </p>
                  )}
                </div>

                <div className="my-4 h-px w-full bg-border/60" />

                <Button asChild className="mt-auto w-full">
                  <a href={lastReadView.href}>Lanjutkan Bacaan</a>
                </Button>
              </>
            ) : (
              <div className="flex flex-1 flex-col justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-lg font-semibold leading-tight">
                    Belum ada bacaan
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Mulai membaca dari daftar surah atau mode halaman.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button asChild className="w-full">
                    <a href="/quran">Buka Surah</a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/quran/halaman/1">Mode Halaman</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* JADWAL SHOLAT */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Jadwal Sholat
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-[170px] justify-between"
                  >
                    {locationLabel}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[220px] p-0" align="end">
                  <Command>
                    {/* keep open while search */}
                    <CommandInput placeholder="Cari kab/kota..." />
                    <CommandList>
                      <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                      <CommandGroup heading="Lokasi otomatis">
                        <CommandItem
                          value="deteksi lokasi"
                          onSelect={() => {
                            detectLocation();
                            setLocationOpen(false);
                          }}
                          disabled={detectingLocation}
                        >
                          <MapPin />
                          {detectingLocation
                            ? "Mendeteksi lokasi..."
                            : "Deteksi lokasi otomatis"}
                        </CommandItem>
                      </CommandGroup>
                      <CommandSeparator />
                      <CommandGroup heading="Kab/Kota">
                        {locationOptions.map((item) => {
                          const selected =
                            item.kabkota === location.kabkota &&
                            item.provinsi === location.provinsi;
                          return (
                            <CommandItem
                              key={item.value}
                              value={item.kabkota}
                              onSelect={() => {
                                setLocation({
                                  kabkota: item.kabkota,
                                  provinsi: item.provinsi,
                                });
                                setLocationOpen(false);
                              }}
                            >
                              {item.kabkota}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  selected ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Sholat Berikutnya</p>
            <p className="text-2xl font-bold">{nextPrayer?.label ?? "—"}</p>
            <p className="text-3xl font-bold text-primary">
              {nextPrayer?.time ?? "--:--"}
            </p>
            <p className="py-2 text-xs text-muted-foreground">
              Mulai dalam <span className="font-semibold">{countdown}</span>
            </p>
            <div className="border-t pt-2 text-sm text-muted-foreground flex justify-between">
              <span>{followingPrayer?.label ?? "—"}</span>
              <span>{followingPrayer?.time ?? "--:--"}</span>
            </div>
          </CardContent>
        </Card>

        {/* DOA */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Doa Harian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-right text-lg leading-relaxed">
              {dailyDoa?.ar ?? "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dailyDoa?.idn ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
