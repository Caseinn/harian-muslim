import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatCountdown,
  getShalatKabKotaAll,
  getUpcomingPrayers,
  getWibISO,
  postShalatJadwal,
  type NextPrayer,
  type ShalatKabKotaItem,
  type ShalatRow,
} from "@/lib/api/sholat";

const DEFAULT_PROVINSI = "DKI Jakarta";
const DEFAULT_KABKOTA = "Kota Jakarta";
const SHALAT_LOCATION_KEY = "hm:shalat_location";
const VAPID_PUBLIC_KEY = import.meta.env.PUBLIC_VAPID_PUBLIC_KEY;

export type ShalatLocation = {
  kabkota: string;
  provinsi: string;
};

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

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function useSholatPage() {
  const [location, setLocation] = useState<ShalatLocation>({
    kabkota: DEFAULT_KABKOTA,
    provinsi: DEFAULT_PROVINSI,
  });
  const [locationOptions, setLocationOptions] = useState<
    ShalatKabKotaItem[]
  >([]);

  const [schedule, setSchedule] = useState<ShalatRow[]>([]);
  const [monthLabel, setMonthLabel] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [todayRow, setTodayRow] = useState<ShalatRow | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [followingPrayer, setFollowingPrayer] =
    useState<NextPrayer | null>(null);
  const [countdown, setCountdown] = useState("00:00:00");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const hasStoredLocationRef = useRef(false);
  const didAutoDetectRef = useRef(false);
  const detectInFlightRef = useRef(false);
  const locationRef = useRef(location);

  useEffect(() => {
    const stored = readLocationFromStorage();
    if (stored) {
      hasStoredLocationRef.current = true;
      setLocation(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SHALAT_LOCATION_KEY, JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
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

  const ensureLocationOptions = useCallback(async () => {
    if (locationOptions.length) return locationOptions;
    try {
      const { list } = await getShalatKabKotaAll();
      setLocationOptions(list);
      return list;
    } catch {
      return [];
    }
  }, [locationOptions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setNotificationSupported(supported);
    if (!supported) return;

    setNotificationPermission(Notification.permission);
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.pushManager.getSubscription() ?? null)
      .then((sub) => setNotificationsEnabled(Boolean(sub)))
      .catch(() => setNotificationsEnabled(false));
  }, []);

  const getActiveSubscription = useCallback(async () => {
    if (typeof window === "undefined") return null;
    if (!("serviceWorker" in navigator)) return null;
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return null;
    return registration.pushManager.getSubscription();
  }, []);

  const syncSubscriptionLocation = useCallback(async () => {
    const subscription = await getActiveSubscription();
    if (!subscription) return;

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        kabkota: locationRef.current.kabkota,
        provinsi: locationRef.current.provinsi,
      }),
    });
  }, [getActiveSubscription]);

  const enableNotifications = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!notificationSupported) return;
    if (!VAPID_PUBLIC_KEY) {
      setNotificationError("Kunci VAPID publik belum diatur.");
      return;
    }

    setNotificationBusy(true);
    setNotificationError(null);

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission !== "granted") return;

      const registration =
        (await navigator.serviceWorker.getRegistration()) ??
        (await navigator.serviceWorker.register("/sw.js"));

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          kabkota: locationRef.current.kabkota,
          provinsi: locationRef.current.provinsi,
        }),
      });

      setNotificationsEnabled(true);
    } catch {
      setNotificationError("Gagal mengaktifkan notifikasi.");
    } finally {
      setNotificationBusy(false);
    }
  }, [notificationSupported]);

  const disableNotifications = useCallback(async () => {
    if (typeof window === "undefined") return;
    setNotificationBusy(true);
    setNotificationError(null);

    try {
      const subscription = await getActiveSubscription();
      if (!subscription) {
        setNotificationsEnabled(false);
        return;
      }

      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      await subscription.unsubscribe();
      setNotificationsEnabled(false);
    } catch {
      setNotificationError("Gagal mematikan notifikasi.");
    } finally {
      setNotificationBusy(false);
    }
  }, [getActiveSubscription]);


  const detectLocation = useCallback(
    async (onlyIfDefault: boolean) => {
      if (typeof window === "undefined") return;
      if (!("geolocation" in navigator)) return;
      if (detectInFlightRef.current) return;

      const current = locationRef.current;
      const isDefault =
        current.kabkota === DEFAULT_KABKOTA &&
        current.provinsi === DEFAULT_PROVINSI;

      if (onlyIfDefault && !isDefault) return;

      detectInFlightRef.current = true;
      setDetectingLocation(true);

      try {
        const options = await ensureLocationOptions();
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
        // ignore location errors
      } finally {
        detectInFlightRef.current = false;
        setDetectingLocation(false);
      }
    },
    [ensureLocationOptions]
  );

  useEffect(() => {
    if (hasStoredLocationRef.current) return;
    if (didAutoDetectRef.current) return;
    if (typeof window === "undefined") return;
    if (!("geolocation" in navigator)) {
      didAutoDetectRef.current = true;
      return;
    }

    didAutoDetectRef.current = true;
    detectLocation(true);
  }, [detectLocation]);

  useEffect(() => {
    if (!notificationsEnabled) return;
    syncSubscriptionLocation();
  }, [notificationsEnabled, location, syncSubscriptionLocation]);

  useEffect(() => {
    let active = true;
    const { year, month } = getCurrentMonthYearWib();

    setLoading(true);
    setError(null);

    postShalatJadwal({
      provinsi: location.provinsi,
      kabkota: location.kabkota,
      bulan: month,
      tahun: year,
    })
      .then((data) => {
        if (!active) return;
        const list = data.jadwal ?? [];
        const todayISO = getWibISO(new Date());
        const today = list.find((row) => row.tanggal_lengkap === todayISO) ?? null;
        const upcoming = getUpcomingPrayers(list, new Date());

        setSchedule(list);
        setMonthLabel(`${data.bulan_nama} ${data.tahun}`);
        setTodayRow(today);
        setNextPrayer(upcoming[0] ?? null);
        setFollowingPrayer(upcoming[1] ?? null);
      })
      .catch(() => {
        if (!active) return;
        setSchedule([]);
        setMonthLabel("");
        setTodayRow(null);
        setNextPrayer(null);
        setFollowingPrayer(null);
        setError("Gagal memuat jadwal sholat.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [location]);

  useEffect(() => {
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

  return {
    countdown,
    detectLocation,
    detectingLocation,
    disableNotifications,
    error,
    followingPrayer,
    location,
    locationOptions,
    monthLabel,
    nextPrayer,
    notificationBusy,
    notificationError,
    notificationPermission,
    notificationSupported,
    notificationsEnabled,
    schedule,
    setLocation,
    todayRow,
    enableNotifications,
    loading,
  };
}
