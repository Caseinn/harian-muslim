import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRAYER_ORDER, type ShalatRow } from "@/lib/api/sholat";

type Props = {
  todayRow: ShalatRow | null;
  todayISO: string;
};

export default function TodayScheduleCard({ todayRow, todayISO }: Props) {
  return (
    <Card className="illumination-panel overflow-hidden">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Jadwal Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span>{todayRow?.hari ?? "-"}</span>
          <span>{todayRow?.tanggal_lengkap ?? todayISO}</span>
        </div>
        <div className="grid gap-2 text-sm">
          {PRAYER_ORDER.map((prayer) => (
            <div key={prayer.key} className="flex justify-between">
              <span className="text-muted-foreground">{prayer.label}</span>
              <span className="font-semibold tabular-nums text-foreground">
                {todayRow?.[prayer.key] ?? "--:--"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
