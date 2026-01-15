import * as React from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import useScrollLock from "@/hooks/use-scroll-lock";
import type { ShalatKabKotaItem } from "@/lib/api/sholat";
import type { ShalatLocation } from "@/hooks/use-sholat-page";

type Props = {
  location: ShalatLocation;
  options: ShalatKabKotaItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (location: ShalatLocation) => void;
  onDetect: () => void;
  detecting: boolean;
};

export default function LocationPicker({
  location,
  options,
  open,
  onOpenChange,
  onSelect,
  onDetect,
  detecting,
}: Props) {
  const locationLabel = location.kabkota || "Pilih kab/kota";
  useScrollLock(open);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full justify-between sm:w-[220px] cursor-pointer"
        >
          {locationLabel}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] rounded-xl border border-border/60 bg-background/95 p-0"
        align="end"
      >
        <Command>
          <CommandInput placeholder="Cari kab/kota..." />
          <CommandList>
            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
            <CommandGroup heading="Lokasi otomatis">
              <CommandItem
                value="deteksi lokasi"
                onSelect={() => {
                  onDetect();
                  onOpenChange(false);
                }}
                disabled={detecting}
              >
                <MapPin />
                {detecting ? "Mendeteksi lokasi..." : "Deteksi lokasi otomatis"}
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Kab/Kota">
              {options.map((item) => {
                const selected =
                  item.kabkota === location.kabkota &&
                  item.provinsi === location.provinsi;
                return (
                  <CommandItem
                    key={item.value}
                    value={item.kabkota}
                    onSelect={() =>
                      onSelect({ kabkota: item.kabkota, provinsi: item.provinsi })
                    }
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
  );
}
