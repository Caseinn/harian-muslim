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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sholat Berikutnya</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">Berikutnya</p>
        <p className="text-2xl font-bold">{nextPrayer?.label ?? "-"}</p>
        <p className="text-3xl font-bold text-primary">
          {nextPrayer?.time ?? "--:--"}
        </p>
        <p className="py-2 text-xs text-muted-foreground">
          Mulai dalam <span className="font-semibold">{countdown}</span>
        </p>
        <div className="border-t pt-2 text-sm text-muted-foreground flex justify-between">
          <span>{followingPrayer?.label ?? "-"}</span>
          <span>{followingPrayer?.time ?? "--:--"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
