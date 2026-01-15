import { Button } from "@/components/ui/button";
import { FaBookOpen, FaClock } from "react-icons/fa";

export default function HeroSection() {
  return (
    <section className="min-h-[85vh] flex items-center justify-center py-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-px w-10 bg-secondary/70" />
            <span>Harian Muslim</span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Bangun Kebiasaan Baik, <br className="hidden md:block" />
            Mulai Dari Satu Hari Ini.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Jadikan Harian Muslim pegangan rutinmu. Paduan lengkap antara pengingat waktu, 
            bacaan ayat suci, dan doa harian yang siap diakses kapan saja.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="gap-2 cursor-pointer">
              <a href="/quran">
                <FaBookOpen className="text-lg" />
                Baca Al-Qur&apos;an
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 cursor-pointer">
              <a href="/sholat">
                <FaClock className="text-lg" />
                Jadwal Sholat
              </a>
            </Button>
          </div>
        </div>

        <div className="illumination-panel p-6 sm:p-8">
          <div className="relative z-10 space-y-5">
            <p className="ink-eyebrow text-muted-foreground">Manuskrip Harian</p>
            <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
              Satu Ruang Tenang Untuk Menjaga Niat Dan Ritme Ibadah.
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="mt-2 size-2 rounded-full bg-secondary" />
                <span>Bacaan Al-Qur&apos;an dengan tampilan bersih dan nyaman di mata.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-2 size-2 rounded-full bg-secondary" />
                <span>Jadwal sholat akurat yang menyesuaikan lokasimu berada.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-2 size-2 rounded-full bg-secondary" />
                <span>Kumpulan doa pilihan untuk menemani setiap aktivitas.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
