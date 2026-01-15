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
    <Card className="mt-6">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-base">Jadwal Bulanan</CardTitle>
        <span className="text-xs text-muted-foreground">
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
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium text-center">Tanggal</th>
                  <th className="py-2 px-3 font-medium text-center">Subuh</th>
                  <th className="py-2 px-3 font-medium text-center">Dzuhur</th>
                  <th className="py-2 px-3 font-medium text-center">Ashar</th>
                  <th className="py-2 px-3 font-medium text-center">Maghrib</th>
                  <th className="py-2 px-3 font-medium text-center">Isya</th>
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
                        isToday && "bg-primary/5"
                      )}
                    >
                      {/* Tanggal */}
                      <td className="py-2 pr-3 text-center">
                        <div className="font-medium">{row.tanggal}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.hari}
                        </div>
                      </td>

                      {/* Jam sholat */}
                      <td className="py-2 px-3 text-center tabular-nums">{row.subuh}</td>
                      <td className="py-2 px-3 text-center tabular-nums">{row.dzuhur}</td>
                      <td className="py-2 px-3 text-center tabular-nums">{row.ashar}</td>
                      <td className="py-2 px-3 text-center tabular-nums">{row.maghrib}</td>
                      <td className="py-2 px-3 text-center tabular-nums">{row.isya}</td>
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
