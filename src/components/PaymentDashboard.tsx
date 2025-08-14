"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { CreditCard, DollarSign, AlertTriangle, CheckCircle, Clock, Calendar, TrendingUp } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  dueDate: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  student: {
    name: string;
    surname: string;
    email?: string;
    img?: string;
    class: {
      name: string;
      grade: {
        level: number;
      };
    };
  };
}

interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

interface PaymentDashboardProps {
  studentId: string;
  userRole: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentDashboard = ({ studentId, userRole }: PaymentDashboardProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  const fetchPayments = useCallback(async () => {
    try {
      const statusParam = filter !== "ALL" ? `&status=${filter}` : "";
      const response = await fetch(`/api/payments/student/${studentId}?${statusParam}`);
      console.log("Payment API Response:", response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Payment Data:", data);
        setPayments(data.payments);
        setSummary(data.summary);
      } else {
        const errorData = await response.json();
        console.error("Payment API Error:", errorData);
        toast.error(errorData.error || "Failed to fetch payments");
      }
    } catch (error) {
      console.error("Payment fetch error:", error);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [studentId, filter]);

  // Fetch payments when component mounts or dependencies change
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handlePayment = async (payment: Payment) => {
    if (payment.status === "PAID") {
      toast.error("Payment already completed");
      return;
    }

    setProcessingPayment(payment.id);

    try {
      console.log("Starting payment process for:", payment.id);
      
      // Check if Razorpay is loaded
      if (typeof window === 'undefined') {
        toast.error("Cannot process payment in server environment");
        return;
      }

      if (!window.Razorpay) {
        console.error("Razorpay not loaded");
        toast.error("Payment gateway not loaded. Please refresh the page and try again.");
        setProcessingPayment(null);
        return;
      }

      console.log("Razorpay is available, creating order...");

      // Create Razorpay order
      const orderResponse = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.id,
          studentId: studentId,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error("Order creation failed:", errorData);
        throw new Error(errorData.error || `Failed to create payment order (${orderResponse.status})`);
      }

      const orderData = await orderResponse.json();
      console.log("Order created successfully:", orderData);

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "School Management System",
        description: `${payment.paymentType} - ${payment.description || "Payment"}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          console.log("Payment successful:", response);
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: payment.id,
              }),
            });

            if (verifyResponse.ok) {
              toast.success("Payment completed successfully!");
              fetchPayments(); // Refresh payments
            } else {
              const errorData = await verifyResponse.json();
              toast.error(errorData.error || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: payment.student.name + " " + payment.student.surname,
          email: payment.student.email || "",
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed");
            setProcessingPayment(null);
          }
        }
      };

      console.log("Opening Razorpay modal with options:", options);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to initiate payment");
      setProcessingPayment(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "OVERDUE":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Payment Dashboard</h2>
            <p className="text-sm text-gray-600">Manage your fee payments</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Payments</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">💰 Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">✅ Paid Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.paidAmount)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium mb-1">⏳ Pending Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.pendingAmount)}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium mb-1">⚠️ Overdue Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.overdueAmount)}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500">There are no payments matching your current filter.</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(payment.status)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {payment.paymentType}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Amount:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Due Date:</span>
                      <span>{new Date(payment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Method:</span>
                      <span>{payment.paymentMethod}</span>
                    </div>
                  </div>
                  
                  {payment.description && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Description:</span> {payment.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-6">
                  {payment.status === "PENDING" || payment.status === "OVERDUE" ? (
                    <button
                      onClick={() => handlePayment(payment)}
                      disabled={processingPayment === payment.id}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {processingPayment === payment.id ? "Processing..." : "Pay Now"}
                      </span>
                    </button>
                  ) : (
                    <div className="text-center">
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                        ✓ Completed
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(payment.updatedAt || payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentDashboard;
