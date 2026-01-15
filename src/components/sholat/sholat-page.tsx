import * as React from "react";
import { Button } from "@/components/ui/button";
import LocationPicker from "@/components/sholat/location-picker";
import MonthlyScheduleCard from "@/components/sholat/monthly-schedule-card";
import NextPrayerCard from "@/components/sholat/next-prayer-card";
import TodayScheduleCard from "@/components/sholat/today-schedule-card";
import useSholatPage from "@/hooks/use-sholat-page";
import { getWibISO } from "@/lib/api/sholat";

export default function SholatPage() {
  const [locationOpen, setLocationOpen] = React.useState(false);
  const {
    countdown,
    detectLocation,
    detectingLocation,
    disableNotifications,
    enableNotifications,
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
    loading,
  } = useSholatPage();

  const todayISO = getWibISO(new Date());

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold md:text-4xl">Jadwal Sholat</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Waktu sholat harian berdasarkan lokasi yang dipilih.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LocationPicker
            location={location}
            options={locationOptions}
            open={locationOpen}
            onOpenChange={setLocationOpen}
            onSelect={(next) => {
              setLocation(next);
              setLocationOpen(false);
            }}
            onDetect={() => detectLocation(false)}
            detecting={detectingLocation}
          />

          {notificationSupported ? (
            <Button
              type="button"
              variant={notificationsEnabled ? "secondary" : "outline"}
              onClick={() => {
                if (notificationsEnabled) {
                  disableNotifications();
                } else {
                  enableNotifications();
                }
              }}
              disabled={notificationBusy}
            >
              {notificationBusy
                ? "Memproses..."
                : notificationsEnabled
                  ? "Notifikasi Aktif"
                  : "Aktifkan Notifikasi"}
            </Button>
          ) : null}
        </div>

        {notificationPermission === "denied" ? (
          <p className="text-xs text-muted-foreground">
            Izin notifikasi diblokir di browser. Aktifkan lewat pengaturan browser.
          </p>
        ) : notificationError ? (
          <p className="text-xs text-destructive">{notificationError}</p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NextPrayerCard
          nextPrayer={nextPrayer}
          followingPrayer={followingPrayer}
          countdown={countdown}
        />
        <TodayScheduleCard todayRow={todayRow} todayISO={todayISO} />
      </div>

      <MonthlyScheduleCard
        schedule={schedule}
        monthLabel={monthLabel}
        loading={loading}
        error={error}
        todayISO={todayISO}
      />
    </section>
  );
}
