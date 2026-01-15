import { Card, CardContent } from "@/components/ui/card";
import { FiBookOpen, FiClock, FiHeart } from "react-icons/fi";

const features = [
  {
    icon: FiBookOpen,
    title: "Al-Qur’an",
    desc: "Teks Arab, latin, terjemahan Indonesia, dan audio per ayat.",
  },
  {
    icon: FiClock,
    title: "Jadwal Sholat",
    desc: "Waktu sholat akurat sesuai lokasi pengguna.",
  },
  {
    icon: FiHeart,
    title: "Doa Harian",
    desc: "Kumpulan doa berdasarkan konteks dan kebutuhan.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center mb-12">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Fitur Utama
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
          Semua yang dibutuhkan, tanpa distraksi
        </h2>
        <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Fokus pada inti: membaca, memahami, dan menjalankan ibadah harian dengan pengalaman yang bersih dan nyaman.
        </p>
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className="
                  border border-border/50 bg-card/80 backdrop-blur-sm
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-md hover:border-border
                  rounded-xl
                "
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon container – more refined */}
                    <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </div>

                    {/* Text content */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}