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
import { cn } from "@/lib/utils";

type VerseAudio = {
  verseKey: string;
  audio: Record<string, string>;
};

type Props = {
  verses: VerseAudio[];
};

const QORI_OPTIONS = [
  { id: "01", label: "Abdullah Al-Juhany" },
  { id: "02", label: "Abdul Muhsin Al-Qasim" },
  { id: "03", label: "Abdurrahman As-Sudais" },
  { id: "04", label: "Ibrahim Al-Dossari" },
  { id: "05", label: "Misyari Rasyid Al-Afasy" },
  { id: "06", label: "Yasser Al-Dosari" },
];

const FADE_OUT_MS = 400;
const FADE_IN_MS = 250;

export default function PageAudioPlayer({ verses }: Props) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const shouldAutoPlayRef = React.useRef(false);
  const fadeFrameRef = React.useRef<number | null>(null);
  const isFadingRef = React.useRef(false);
  const hasFadedOutRef = React.useRef(false);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const availableQori = React.useMemo(() => {
    const firstAudio = verses[0]?.audio ?? {};
    return QORI_OPTIONS.filter((qori) => firstAudio[qori.id]);
  }, [verses]);

  const [qoriId, setQoriId] = React.useState(
    availableQori[0]?.id ?? Object.keys(verses[0]?.audio ?? {})[0] ?? ""
  );
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (!availableQori.length) return;
    if (availableQori.some((qori) => qori.id === qoriId)) return;
    setQoriId(availableQori[0].id);
  }, [availableQori, qoriId]);

  const currentVerse = verses[currentIndex];
  const audioSrc = qoriId ? currentVerse?.audio?.[qoriId] : "";

  const cancelFade = React.useCallback(() => {
    if (fadeFrameRef.current != null) {
      cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
    isFadingRef.current = false;
  }, []);

  const fadeVolume = React.useCallback(
    (audio: HTMLAudioElement, from: number, to: number, durationMs: number) => {
      cancelFade();
      isFadingRef.current = true;
      const start = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / durationMs);
        audio.volume = from + (to - from) * progress;
        if (progress < 1) {
          fadeFrameRef.current = requestAnimationFrame(step);
          return;
        }
        fadeFrameRef.current = null;
        isFadingRef.current = false;
      };

      fadeFrameRef.current = requestAnimationFrame(step);
    },
    [cancelFade]
  );

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    hasFadedOutRef.current = false;
    cancelFade();
    audio.volume = 1;

    if (!shouldAutoPlayRef.current || !audioSrc) return;
    shouldAutoPlayRef.current = false;
    audio.volume = 0;
    audio
      .play()
      .then(() => fadeVolume(audio, 0, 1, FADE_IN_MS))
      .catch(() => {
        setIsPlaying(false);
        audio.volume = 1;
      });
  }, [audioSrc, cancelFade, fadeVolume]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    if (audio.paused) {
      cancelFade();
      hasFadedOutRef.current = false;
      audio.volume = 1;
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
    cancelFade();
    hasFadedOutRef.current = false;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  const handleVerseSelect = (index: number) => {
    if (index === currentIndex) return;
    cancelFade();
    hasFadedOutRef.current = false;
    shouldAutoPlayRef.current = isPlaying;
    setCurrentIndex(index);
  };

  const handleEnded = () => {
    cancelFade();
    if (currentIndex < verses.length - 1) {
      shouldAutoPlayRef.current = true;
      setCurrentIndex((value) => value + 1);
      return;
    }
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || isFadingRef.current || hasFadedOutRef.current) return;
    if (currentIndex >= verses.length - 1) return;
    if (!Number.isFinite(audio.duration)) return;

    const remaining = audio.duration - audio.currentTime;
    if (remaining <= FADE_OUT_MS / 1000) {
      hasFadedOutRef.current = true;
      fadeVolume(audio, audio.volume, 0, FADE_OUT_MS);
    }
  };

  if (!verses.length || !availableQori.length) {
    return (
      <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
        Audio ayat belum tersedia untuk halaman ini.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Audio Halaman
          </p>
          <p className="text-sm text-muted-foreground">
            Putar ayat otomatis satu per satu.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={qoriId} onValueChange={handleQoriChange}>
          <SelectTrigger
            className="w-full sm:w-[260px]"
            aria-label="Pilih qori"
          >
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

      <div className="mt-4 flex flex-wrap gap-2">
        {verses.map((verse, index) => (
          <button
            key={verse.verseKey}
            type="button"
            onClick={() => handleVerseSelect(index)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition",
              index === currentIndex
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 hover:border-primary/50"
            )}
          >
            {verse.verseKey}
          </button>
        ))}
      </div>

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="none"
        onPlay={() => {
          hasFadedOutRef.current = false;
          setIsPlaying(true);
        }}
        onPause={() => {
          cancelFade();
          setIsPlaying(false);
        }}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
}
