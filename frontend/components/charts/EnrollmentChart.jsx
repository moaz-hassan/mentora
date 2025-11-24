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
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No enrollment data available for the selected period</p>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {payload[0].payload.date}
          </p>
          <p className="text-sm text-purple-600 font-bold">
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
            // Format date labels based on length
            if (value.includes('Week')) return value;
            if (value.length > 10) return value.substring(5); // Show MM-DD
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
