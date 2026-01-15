import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRAYER_ORDER, type ShalatRow } from "@/lib/api/sholat";

type Props = {
  todayRow: ShalatRow | null;
  todayISO: string;
};

export default function TodayScheduleCard({ todayRow, todayISO }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Jadwal Hari Ini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{todayRow?.hari ?? "-"}</span>
          <span>{todayRow?.tanggal_lengkap ?? todayISO}</span>
        </div>
        <div className="grid gap-2 text-sm">
          {PRAYER_ORDER.map((prayer) => (
            <div key={prayer.key} className="flex justify-between">
              <span>{prayer.label}</span>
              <span className="font-medium">
                {todayRow?.[prayer.key] ?? "--:--"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
