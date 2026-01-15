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
  const currentPath =
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const normalizedPath = normalizePath(currentPath);

  return (
    <header className="sticky top-0 z-50 border-b px-4 md:px-6 bg-background">
      <div className="mx-auto w-full lg:max-w-7xl">
      <div className="relative flex h-16 items-stretch">
        {/* LEFT */}
        <div className="z-10 flex items-center gap-2">
          <a className="text-primary hover:text-primary/90" href="/">
            <Logo />
          </a>
        </div>

        {/* CENTER: desktop nav */}
        <div className="absolute inset-0 flex h-full items-stretch justify-center max-md:hidden">
          <NavigationMenu className="h-full *:h-full">
            <NavigationMenuList className="h-full gap-2">
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
                    className="h-full justify-center rounded-none border-transparent border-y-2 py-1.5 font-semibold text-muted-foreground hover:border-b-primary hover:bg-transparent hover:text-primary data-[active]:border-b-primary data-[active]:bg-transparent!"
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
        <div className="ml-auto z-10 flex items-center gap-2">
          <ThemeSwitch />

          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="group size-8" size="icon" variant="ghost">
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

              <PopoverContent align="end" className="w-44 p-1 md:hidden">
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
                          className="py-1.5"
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
