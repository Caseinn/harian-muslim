import { Button } from "@/components/ui/button";
import { FaBookOpen, FaClock } from "react-icons/fa";

export default function HeroSection() {
  return (
    <section className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="container mx-auto max-w-4xl text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Pendamping Ibadah Harian Muslim, Sederhana dan Terpercaya
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Membantu Muslim menjalani ibadah harian dengan tenang melalui Al-Qur’an, jadwal sholat, dan doa pilihan.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button size="lg" className="px-8 py-6 text-base font-medium gap-2">
            <FaBookOpen className="text-lg" />
            Baca Al-Qur’an
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-6 text-base font-medium gap-2">
            <FaClock className="text-lg" />
            Lihat Jadwal Sholat
          </Button>
        </div>
      </div>
    </section>
  );
}