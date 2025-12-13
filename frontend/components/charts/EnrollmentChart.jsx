"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function EnrollmentChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-neutral-400">
        <p>No enrollment data available for the selected period</p>
      </div>
    );
  }

  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {payload[0].payload.date}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400 font-bold">
            {payload[0].value} enrollment{payload[0].value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorEnrollment" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => {
            
            if (value.includes('Week')) return value;
            if (value.length > 10) return value.substring(5); 
            return value;
          }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="enrollments"
          stroke="#9333ea"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorEnrollment)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
