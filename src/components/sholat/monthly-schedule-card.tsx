import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ShalatRow } from "@/lib/api/sholat";

type Props = {
  schedule: ShalatRow[];
  monthLabel: string;
  loading: boolean;
  error: string | null;
  todayISO: string;
};

export default function MonthlyScheduleCard({
  schedule,
  monthLabel,
  loading,
  error,
  todayISO,
}: Props) {
  return (
    <Card className="illumination-panel mt-8 overflow-hidden">
      <CardHeader className="flex flex-col gap-2 border-b border-border/60 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Jadwal Bulanan
        </CardTitle>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {monthLabel || "Bulan ini"}
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat jadwal...</p>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : schedule.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <th className="py-3 pr-3 text-center font-semibold">Tanggal</th>
                  <th className="py-3 px-3 text-center font-semibold">Subuh</th>
                  <th className="py-3 px-3 text-center font-semibold">Dzuhur</th>
                  <th className="py-3 px-3 text-center font-semibold">Ashar</th>
                  <th className="py-3 px-3 text-center font-semibold">Maghrib</th>
                  <th className="py-3 px-3 text-center font-semibold">Isya</th>
                </tr>
              </thead>

              <tbody>
                {schedule.map((row) => {
                  const isToday = row.tanggal_lengkap === todayISO;

                  return (
                    <tr
                      key={row.tanggal_lengkap}
                      className={cn(
                        "border-b last:border-0",
                        isToday && "bg-primary/10"
                      )}
                    >
                      {/* Tanggal */}
                      <td className="py-3 pr-3 text-center">
                        <div className="font-medium">{row.tanggal}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.hari}
                        </div>
                      </td>

                      {/* Jam sholat */}
                      <td className="py-3 px-3 text-center tabular-nums">{row.subuh}</td>
                      <td className="py-3 px-3 text-center tabular-nums">{row.dzuhur}</td>
                      <td className="py-3 px-3 text-center tabular-nums">{row.ashar}</td>
                      <td className="py-3 px-3 text-center tabular-nums">{row.maghrib}</td>
                      <td className="py-3 px-3 text-center tabular-nums">{row.isya}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        ) : (
          <p className="text-sm text-muted-foreground">
            Jadwal belum tersedia.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
