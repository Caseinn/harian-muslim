import * as React from "react";
import Logo from "@/components/logo";
import ThemeSwitch from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const navigationLinks = [
  { href: "/", label: "Beranda" },
  { href: "/quran", label: "Baca Al-Qur'an" },
  { href: "/sholat", label: "Jadwal Sholat" },
  { href: "/doa", label: "Doa Harian" },
];

type Props = {
  pathname?: string;
};

function normalizePath(value: string) {
  if (value.length > 1 && value.endsWith("/")) return value.slice(0, -1);
  return value;
}

export default function Navbar({ pathname }: Props) {
  const [currentPath, setCurrentPath] = React.useState(() => {
    if (pathname) return pathname;
    if (typeof window !== "undefined") return window.location.pathname;
    return "/";
  });

  React.useEffect(() => {
    if (pathname) setCurrentPath(pathname);
  }, [pathname]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const syncPath = () => {
      setCurrentPath(window.location.pathname || "/");
    };

    syncPath();
    document.addEventListener("astro:after-swap", syncPath);
    document.addEventListener("astro:page-load", syncPath);

    return () => {
      document.removeEventListener("astro:after-swap", syncPath);
      document.removeEventListener("astro:page-load", syncPath);
    };
  }, []);

  const normalizedPath = normalizePath(currentPath);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="flex h-[72px] items-center justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <a className="group flex items-center gap-3 text-primary" href="/">
              <Logo />
              <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-foreground/80 sm:inline">
                Harian Muslim
              </span>
            </a>
          </div>

          {/* CENTER: desktop nav */}
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <NavigationMenu className="h-full *:h-full">
              <NavigationMenuList className="h-full gap-1">
                {navigationLinks.map((link, index) => {
                  const normalizedHref = normalizePath(link.href);
                  const isActive =
                    normalizedHref === "/"
                      ? normalizedPath === "/"
                      : normalizedPath.startsWith(normalizedHref);

                  return (
                    <NavigationMenuItem className="h-full" key={String(index)}>
                      <NavigationMenuLink
                        data-active={isActive ? "" : undefined}
                        className="relative h-full items-center px-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground transition hover:bg-transparent hover:text-primary focus:bg-transparent data-[active]:bg-transparent data-[active]:text-primary data-[active]:hover:bg-transparent data-[active]:focus-visible:bg-transparent after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:rounded-full after:bg-secondary after:opacity-0 after:transition data-[active]:after:opacity-100"
                        href={link.href}
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* RIGHT: mobile: theme + hamburger */}
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-border/60 bg-background/70 px-2 py-1 shadow-sm">
              <ThemeSwitch />
            </div>

            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="group size-10 border border-border/60 bg-background/70"
                    size="icon"
                    variant="ghost"
                  >
                    <svg
                      className="pointer-events-none"
                      fill="none"
                      height={16}
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width={16}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        className="-translate-y-[7px] origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"
                        d="M4 12L20 12"
                      />
                      <path
                        className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                        d="M4 12H20"
                      />
                      <path
                        className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
                        d="M4 12H20"
                      />
                    </svg>
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  className="w-56 rounded-xl border border-border/60 bg-background/95 p-2 shadow-xl lg:hidden"
                >
                  <NavigationMenu className="max-w-none *:w-full">
                    <NavigationMenuList className="flex-col items-start gap-0">
                      {navigationLinks.map((link, index) => {
                        const normalizedHref = normalizePath(link.href);
                        const isActive =
                          normalizedHref === "/"
                            ? normalizedPath === "/"
                            : normalizedPath.startsWith(normalizedHref);

                        return (
                          <NavigationMenuItem className="w-full" key={String(index)}>
                            <NavigationMenuLink
                              data-active={isActive ? "" : undefined}
                              className="w-full rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground data-[active]:bg-primary/10 data-[active]:text-primary data-[active]:hover:bg-primary/10 data-[active]:focus-visible:bg-primary/10"
                              href={link.href}
                            >
                              {link.label}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        );
                      })}
                    </NavigationMenuList>
                  </NavigationMenu>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
