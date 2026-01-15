import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  mode: "surah" | "page";
  onModeChange: (mode: "surah" | "page") => void;
  query: string;
  onQueryChange: (value: string) => void;
};

export default function QuranControls({
  mode,
  onModeChange,
  query,
  onQueryChange,
}: Props) {
  return (
    <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="inline-flex w-full rounded-2xl border border-border/60 bg-background/40 p-1 md:w-auto">
        <Button
          type="button"
          variant={mode === "surah" ? "default" : "ghost"}
          className="w-full rounded-xl md:w-auto"
          onClick={() => onModeChange("surah")}
        >
          Per Surah
        </Button>
        <Button
          type="button"
          variant={mode === "page" ? "default" : "ghost"}
          className="w-full rounded-xl md:w-auto"
          onClick={() => onModeChange("page")}
        >
          Per Halaman
        </Button>
      </div>

      <div className="flex w-full md:max-w-md">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={
            mode === "surah"
              ? "Cari surah: nama / arti / nomor"
              : "Cari halaman atau surah"
          }
        />
      </div>
    </div>
  );
}
