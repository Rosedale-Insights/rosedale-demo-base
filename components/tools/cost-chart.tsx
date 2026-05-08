"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

const COST_BAR_FILL = "var(--foreground)"

export interface CostChartProps {
  data: Array<{ name: string; value: number }>
  height?: number
  barSize?: number
}

export default function CostChart({ data, height = 220, barSize = 14 }: CostChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}K`} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={96} />
          <RechartsTooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={barSize} fill={COST_BAR_FILL} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
