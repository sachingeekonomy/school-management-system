import FinanceChart from "./FinanceChart";

const FinanceChartContainer = async () => {
  // Fallback data in case Prisma client has issues
  const fallbackData = [
    { name: "Jan", income: 55000, expense: 35000 },
    { name: "Feb", income: 52000, expense: 32000 },
    { name: "Mar", income: 58000, expense: 38000 },
    { name: "Apr", income: 54000, expense: 34000 },
    { name: "May", income: 60000, expense: 40000 },
    { name: "Jun", income: 56000, expense: 36000 },
    { name: "Jul", income: 62000, expense: 42000 },
    { name: "Aug", income: 58000, expense: 38000 },
    { name: "Sep", income: 64000, expense: 44000 },
    { name: "Oct", income: 60000, expense: 40000 },
    { name: "Nov", income: 66000, expense: 46000 },
    { name: "Dec", income: 62000, expense: 42000 },
  ];

  try {
    // Try to import and use Prisma
    const { default: prisma } = await import("@/lib/prisma");
    
    // Fetch financial data from database
    const financialData = await prisma.financial.findMany({
      where: {
        year: new Date().getFullYear(), // Current year
      },
      orderBy: {
        month: 'asc',
      },
      select: {
        month: true,
        income: true,
        expense: true,
      },
    });

    // Transform data for the chart
    const chartData = financialData.map((item: any) => ({
      name: item.month,
      income: item.income,
      expense: item.expense,
    }));

    return <FinanceChart data={chartData} />;
  } catch (error) {
    console.warn("Could not fetch financial data from database, using fallback data:", error);
    return <FinanceChart data={fallbackData} />;
  }
};

export default FinanceChartContainer;
