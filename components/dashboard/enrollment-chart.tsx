"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", enrollments: 32 },
  { month: "Feb", enrollments: 45 },
  { month: "Mar", enrollments: 41 },
  { month: "Apr", enrollments: 58 },
  { month: "May", enrollments: 63 },
  { month: "Jun", enrollments: 72 },
  { month: "Jul", enrollments: 69 },
  { month: "Aug", enrollments: 78 },
  { month: "Sep", enrollments: 91 },
  { month: "Oct", enrollments: 104 },
  { month: "Nov", enrollments: 97 },
  { month: "Dec", enrollments: 118 },
];

export function EnrollmentChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip
          formatter={(value: number) => [value, "Enrollments"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <Bar dataKey="enrollments" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
