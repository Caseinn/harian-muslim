import Logo from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import { FiInstagram, FiGithub } from "react-icons/fi";

const navigationLinks = [
  { href: "/", label: "Beranda" },
  { href: "/quran", label: "Al-Qur'an" },
  { href: "/sholat", label: "Jadwal Sholat" },
  { href: "/doa", label: "Doa Harian" },
];

export default function Footer() {
  return (
    <footer className="border-t bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid items-start justify-items-start gap-10 sm:grid-cols-2 md:grid-cols-3 md:justify-items-center">
          {/* Brand */}
          <div className="space-y-4 md:w-full md:max-w-[260px]">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Platform ibadah harian yang sederhana dan fokus.
              Membantu menjaga ketenangan dan konsistensi ibadah.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4 md:w-full md:max-w-[180px]">
            <h4 className="text-sm font-semibold">Navigasi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4 md:w-full md:max-w-[180px]">
            <h4 className="text-sm font-semibold">Sosial Media</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://instagram.com/ditorifkii"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <FiInstagram size={18} />
                  <span>@Ditorifkii</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/caseinn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <FiGithub size={18} />
                  <span>@Caseinn</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>
            Caseinn {new Date().getFullYear()}. All rights reserved.
          </span>
          <span>Data bersumber dari API EQuran.id</span>
        </div>
      </div>
    </footer>
  );
}
