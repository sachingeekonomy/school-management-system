import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";

const CountChartContainer = async () => {
  const data = await prisma.student.groupBy({
    by: ["sex"],
    _count: true,
  });

  const boys = data.find((d) => d.sex === "MALE")?._count || 0;
  const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl w-full h-full p-4 border border-white/20 flex flex-col">
      {/* TITLE */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-white">Students</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} className="filter invert" />
      </div>
      {/* CHART */}
      <div className="flex-1 flex items-center justify-center">
        <CountChart boys={boys} girls={girls} />
      </div>
      {/* BOTTOM */}
      <div className="flex justify-center gap-16 mt-4">
        <div className="flex flex-col gap-1 items-center">
          <div className="w-5 h-5 bg-cyan-400 rounded-full shadow-lg" />
          <h1 className="font-bold text-white text-xl">{boys}</h1>
          <h2 className="text-xs text-pink-100 font-medium">
            Boys ({Math.round((boys / (boys + girls)) * 100)}%)
          </h2>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <div className="w-5 h-5 bg-yellow-400 rounded-full shadow-lg" />
          <h1 className="font-bold text-white text-xl">{girls}</h1>
          <h2 className="text-xs text-pink-100 font-medium">
            Girls ({Math.round((girls / (boys + girls)) * 100)}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
