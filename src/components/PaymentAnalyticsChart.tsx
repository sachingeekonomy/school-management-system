"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PaymentData {
  month: string;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
}

interface PaymentAnalyticsChartProps {
  data: PaymentData[];
  summary: {
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    totalStudents: number;
    collectionRate: number;
  };
}

const PaymentAnalyticsChart = ({ data, summary }: PaymentAnalyticsChartProps) => {
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl w-full h-full p-4 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-white">Payment Analytics</h1>
          <Image src="/moreDark.png" alt="" width={20} height={20} className="filter invert" />
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-white/70 text-center">No payment data available</p>
        </div>
      </div>
    );
  }

  // Custom tooltip formatter
  const formatTooltip = (value: any, name: string) => {
    return [`₹${value.toLocaleString()}`, name];
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl w-full h-full p-6 border border-white/20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/15 rounded-lg p-4 text-center border border-white/20">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-green-400 text-xl">💰</span>
          </div>
          <p className="text-white/80 text-sm mb-1">Total Collected</p>
          <p className="text-green-400 text-xl font-bold">₹{summary.totalCollected.toLocaleString()}</p>
        </div>

        <div className="bg-white/15 rounded-lg p-4 text-center border border-white/20">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-yellow-400 text-xl">⏳</span>
          </div>
          <p className="text-white/80 text-sm mb-1">Total Pending</p>
          <p className="text-yellow-400 text-xl font-bold">₹{summary.totalPending.toLocaleString()}</p>
        </div>

        <div className="bg-white/15 rounded-lg p-4 text-center border border-white/20">
          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-red-400 text-xl">⚠️</span>
          </div>
          <p className="text-white/80 text-sm mb-1">Total Overdue</p>
          <p className="text-red-400 text-xl font-bold">₹{summary.totalOverdue.toLocaleString()}</p>
        </div>

        <div className="bg-white/15 rounded-lg p-4 text-center border border-white/20">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-blue-400 text-xl">📊</span>
          </div>
          <p className="text-white/80 text-sm mb-1">Collection Rate</p>
          <p className="text-blue-400 text-xl font-bold">{summary.collectionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/15 rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 text-lg">👥</span>
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Students</p>
              <p className="text-white text-xl font-bold">{summary.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/15 rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <span className="text-teal-400 text-lg">💎</span>
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Revenue</p>
              <p className="text-teal-400 text-xl font-bold">
                ₹{(summary.totalCollected + summary.totalPending + summary.totalOverdue).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white/15 rounded-lg p-4 border border-white/20">
        <h3 className="text-white text-lg font-bold mb-4 text-center">Payment Trends Over Time</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tick={{ fill: "rgba(255, 255, 255, 0.8)" }}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis 
                axisLine={false} 
                tick={{ fill: "rgba(255, 255, 255, 0.8)" }} 
                tickLine={false}  
                tickMargin={20}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                domain={[0, 'dataMax + 100']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(0, 0, 0, 0.8)", 
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "white"
                }}
                formatter={formatTooltip}
              />
              <Legend
                align="center"
                verticalAlign="top"
                wrapperStyle={{ paddingTop: "10px", paddingBottom: "20px", color: "white" }}
              />
              <Line 
                type="monotone" 
                dataKey="totalCollected" 
                stroke="#22D3EE" 
                strokeWidth={3}
                name="Collected"
                dot={{ fill: "#22D3EE", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalPending" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Pending"
                dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalOverdue" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Overdue"
                dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalyticsChart;
