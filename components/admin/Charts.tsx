"use client";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

const ACCENT = "var(--accent)";
const INK = "var(--text)";
const MUTED = "var(--borderStrong)";

export function MessagesTrend({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="h-28">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--secondary)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis hide domain={[0, "auto"]} />
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--border)", background: "var(--surfaceElevated)", color: "var(--text)", fontSize: 12 }} />
          <Area type="monotone" dataKey="count" stroke={ACCENT} fill={ACCENT} fillOpacity={0.15} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDonut({ published, draft, hidden }: { published: number; draft: number; hidden: number }) {
  const data = [
    { name: "Publiés", value: published, color: INK },
    { name: "Brouillons", value: draft, color: ACCENT },
    { name: "Masqués", value: hidden, color: MUTED },
  ].filter((d) => d.value > 0);
  if (data.length === 0) return <p className="text-sm text-muted">Aucun projet.</p>;
  return (
    <div className="flex items-center gap-6">
      <div className="h-24 w-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={28} outerRadius={44} dataKey="value" stroke="none">
              {data.map((e, i) => (
                <Cell key={i} fill={e.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 text-xs">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
            {d.name} — {d.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
