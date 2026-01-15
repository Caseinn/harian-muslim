import React from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  audioFull: Record<string, string>;
};

const QORI_OPTIONS = [
  { id: "01", label: "Abdullah Al-Juhany" },
  { id: "02", label: "Abdul Muhsin Al-Qasim" },
  { id: "03", label: "Abdurrahman As-Sudais" },
  { id: "04", label: "Ibrahim Al-Dossari" },
  { id: "05", label: "Misyari Rasyid Al-Afasy" },
  { id: "06", label: "Yasser Al-Dosari" },
];

export default function AudioPlayer({ audioFull }: Props) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const availableQori = React.useMemo(
    () => QORI_OPTIONS.filter((qori) => audioFull?.[qori.id]),
    [audioFull]
  );

  const [qoriId, setQoriId] = React.useState(
    availableQori[0]?.id ?? Object.keys(audioFull ?? {})[0] ?? ""
  );

  React.useEffect(() => {
    if (!availableQori.length) return;
    if (availableQori.some((qori) => qori.id === qoriId)) return;
    setQoriId(availableQori[0].id);
  }, [availableQori, qoriId]);

  const audioSrc = qoriId ? audioFull?.[qoriId] : "";

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
  };

  const handleQoriChange = (value: string) => {
    setQoriId(value);
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  if (!availableQori.length) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/70 p-4 text-sm text-muted-foreground">
        Audio belum tersedia untuk surah ini.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold">Audio Surah</p>
          <p className="text-xs text-muted-foreground">
            Pilih qori dan putar audio lengkap.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={qoriId} onValueChange={handleQoriChange}>
            <SelectTrigger className="w-full sm:w-[260px]">
              <SelectValue placeholder="Pilih qori" />
            </SelectTrigger>
            <SelectContent>
              {availableQori.map((qori) => (
                <SelectItem key={qori.id} value={qori.id}>
                  {qori.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Jeda audio" : "Putar audio"}
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
            <span className="ml-2">{isPlaying ? "Jeda" : "Putar"}</span>
          </Button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
