"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
  const data = [
    {
      name: "Total",
      count: boys + girls,
      fill: "rgba(255, 255, 255, 0.1)",
    },
    {
      name: "Girls",
      count: girls,
      fill: "#FBBF24", // More vibrant yellow for dark background
    },
    {
      name: "Boys",
      count: boys,
      fill: "#22D3EE", // More vibrant cyan for dark background
    },
  ];
  
  return (
    <div className="relative w-full h-48 flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="35%"
          outerRadius="85%"
          barSize={20}
          data={data}
        >
          <RadialBar background dataKey="count" />
        </RadialBarChart>
      </ResponsiveContainer>
      
      <Image
        src="/maleFemale.png"
        alt="Male and Female Icon"
        width={50}
        height={50}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-100 drop-shadow-lg filter brightness-110 contrast-110"
      />
    </div>
  );
};

export default CountChart;
