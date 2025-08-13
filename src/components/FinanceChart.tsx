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

interface FinancialData {
  name: string;
  income: number;
  expense: number;
}

interface FinanceChartProps {
  data: FinancialData[];
}

const FinanceChart = ({ data }: FinanceChartProps) => {
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl w-full h-full p-4 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-white">Financial Overview</h1>
          <Image src="/moreDark.png" alt="" width={20} height={20} className="filter invert" />
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-white/70 text-center">No financial data available</p>
        </div>
      </div>
    );
  }

  // Calculate financial metrics
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
  const totalProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((totalProfit / totalIncome) * 100).toFixed(1) : "0.0";
  
  // Find best and worst performing months
  const monthlyProfits = data.map(item => ({
    month: item.name,
    profit: item.income - item.expense
  }));
  
  const bestMonth = monthlyProfits.reduce((max, item) => 
    item.profit > max.profit ? item : max
  );
  
  const worstMonth = monthlyProfits.reduce((min, item) => 
    item.profit < min.profit ? item : min
  );

  // Custom tooltip formatter
  const formatTooltip = (value: any, name: string) => {
    if (name === 'income') return [`$${value.toLocaleString()}`, 'Income'];
    if (name === 'expense') return [`$${value.toLocaleString()}`, 'Expense'];
    return [value, name];
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl w-full h-full p-4 border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-white">Financial Overview</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} className="filter invert" />
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-white/70 text-xs">Total Income</p>
          <p className="text-green-400 text-sm font-bold">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-white/70 text-xs">Total Expense</p>
          <p className="text-red-400 text-sm font-bold">${totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-white/70 text-xs">Net Profit</p>
          <p className={`text-sm font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${totalProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-white/70 text-xs">Profit Margin</p>
          <p className={`text-sm font-bold ${parseFloat(profitMargin) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profitMargin}%
          </p>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-white/70 text-xs">Best Month</p>
          <p className="text-green-400 text-sm font-bold">{bestMonth.month} (${bestMonth.profit.toLocaleString()})</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-white/70 text-xs">Worst Month</p>
          <p className="text-red-400 text-sm font-bold">{worstMonth.month} (${worstMonth.profit.toLocaleString()})</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
            <XAxis
              dataKey="name"
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
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
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
              wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px", color: "white" }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#22D3EE"
              strokeWidth={3}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              stroke="#F59E0B" 
              strokeWidth={3}
              name="Expense"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceChart;
