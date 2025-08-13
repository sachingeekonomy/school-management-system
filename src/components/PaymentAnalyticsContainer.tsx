import PaymentAnalyticsChart from "./PaymentAnalyticsChart";

const PaymentAnalyticsContainer = async () => {
  try {
    // Import Prisma client
    const { default: prisma } = await import("@/lib/prisma");
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Fetch all payments from the Payment table
    const payments = await prisma.payment.findMany({
      select: {
        amount: true,
        status: true,
        createdAt: true,
        studentId: true,
      },
    });

    // Get total number of students
    const totalStudents = await prisma.student.count();

    // Process payments by month for the current year
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthName = new Date(currentYear, i).toLocaleString('default', { month: 'short' });
      const monthStart = new Date(currentYear, i, 1);
      const monthEnd = new Date(currentYear, i + 1, 0);
      
      const monthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });

      const totalCollected = monthPayments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalPending = monthPayments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalOverdue = monthPayments
        .filter(p => p.status === 'OVERDUE')
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        month: monthName,
        totalCollected,
        totalPending,
        totalOverdue,
      };
    });

    // Calculate summary statistics from all payments
    const totalCollected = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalPending = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalOverdue = payments
      .filter(p => p.status === 'OVERDUE')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalRevenue = totalCollected + totalPending + totalOverdue;
    const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;

    const summary = {
      totalCollected,
      totalPending,
      totalOverdue,
      totalStudents,
      collectionRate,
    };

    return <PaymentAnalyticsChart data={monthlyData} summary={summary} />;
  } catch (error) {
    console.error("Error fetching payment data from database:", error);
    
    // Return empty data if database fetch fails
    const currentYear = new Date().getFullYear();
    const emptyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(currentYear, i).toLocaleString('default', { month: 'short' }),
      totalCollected: 0,
      totalPending: 0,
      totalOverdue: 0,
    }));

    const emptySummary = {
      totalCollected: 0,
      totalPending: 0,
      totalOverdue: 0,
      totalStudents: 0,
      collectionRate: 0,
    };

    return <PaymentAnalyticsChart data={emptyData} summary={emptySummary} />;
  }
};

export default PaymentAnalyticsContainer;
