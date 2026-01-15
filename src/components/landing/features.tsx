import { FiBookOpen, FiClock, FiHeart } from "react-icons/fi";

const features = [
  {
    icon: FiBookOpen,
    title: "Al-Qur'an",
    desc: "Tampilan ayat yang bersih dan nyaman dibaca, lengkap dengan latin serta audio.",
  },
  {
    icon: FiClock,
    title: "Jadwal Sholat",
    desc: "Penanda waktu presisi yang mengikuti lokasimu, menjaga sholat tetap di awal waktu.",
  },
  {
    icon: FiHeart,
    title: "Doa Harian",
    desc: "Rangkaian doa ringkas untuk menyertakan keberkahan dalam setiap aktivitasmu.",
  },
];

export default function FeaturesSection() {
  return (
    <section>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-4">
          <p className="ink-eyebrow text-muted-foreground">Pondasi Harian</p>
          <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
          Tiga Pilar Untuk Rutinitas Yang Lebih Terjaga.
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
          Membangun kebiasaan baik dimulai dari kemudahan. Akses inti ibadahmu 
          dengan cepat, pahami maknanya, dan amalkan dalam keseharian tanpa 
          hambatan antarmuka.
          </p>
        </div>

        <div className="space-y-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const indexLabel = String(index + 1).padStart(2, "0");
            return (
              <div
                key={feature.title}
                className="flex flex-col gap-3 border-b border-border/60 pb-6 last:border-0"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10 text-secondary">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      {indexLabel}
                    </p>
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
