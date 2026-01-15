import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NextPrayer } from "@/lib/api/sholat";

type Props = {
  nextPrayer: NextPrayer | null;
  followingPrayer: NextPrayer | null;
  countdown: string;
};

export default function NextPrayerCard({
  nextPrayer,
  followingPrayer,
  countdown,
}: Props) {
  return (
    <Card className="illumination-panel overflow-hidden">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Sholat Berikutnya
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-center">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Berikutnya
          </p>
          <p className="text-4xl font-semibold text-primary">
            {nextPrayer?.time ?? "--:--"}
          </p>
          <p className="text-base font-semibold">{nextPrayer?.label ?? "-"}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-xs text-muted-foreground">
          Mulai dalam <span className="font-semibold">{countdown}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{followingPrayer?.label ?? "-"}</span>
          <span className="font-semibold text-foreground">
            {followingPrayer?.time ?? "--:--"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
