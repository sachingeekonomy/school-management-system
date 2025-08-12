import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface PaymentDetailPageProps {
  params: {
    id: string;
  };
}

const PaymentDetailPage = async ({ params }: PaymentDetailPageProps) => {
  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: {
      student: {
        select: {
          name: true,
          surname: true,
          email: true,
          img: true,
          phone: true,
          address: true,
          bloodType: true,
          sex: true,
          birthday: true,
          class: {
            select: {
              name: true,
              grade: {
                select: {
                  level: true,
                }
              }
            }
          },
          parent: {
            select: {
              name: true,
              surname: true,
              email: true,
              phone: true,
            }
          }
        }
      }
    }
  });

  if (!payment) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "TUITION":
        return "bg-blue-100 text-blue-800";
      case "EXAM":
        return "bg-purple-100 text-purple-800";
      case "TRANSPORT":
        return "bg-orange-100 text-orange-800";
      case "LIBRARY":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-4 flex-1 w-full h-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
          <Link href="/list/payments">
            <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
              Back to Payments
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Payment Information</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-medium">{payment.id}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-green-600 text-lg">{payment.amount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Type:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentTypeColor(payment.paymentType)}`}>
                  {payment.paymentType}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{payment.paymentMethod.replace('_', ' ')}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">{new Date(payment.dueDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</span>
              </div>
              
              {payment.description && (
                <div className="border-t pt-4">
                  <span className="text-gray-600 block mb-2">Description:</span>
                  <p className="text-gray-900">{payment.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Student Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Student Information</h2>
            
            <div className="flex items-center mb-4">
              <Image
                src={payment.student.img || "/noAvatar.png"}
                alt="Student"
                width={60}
                height={60}
                className="rounded-full object-cover mr-4"
              />
              <div>
                <h3 className="text-lg font-semibold">
                  {payment.student.name} {payment.student.surname}
                </h3>
                <p className="text-gray-600">ID: {payment.studentId}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{payment.student.email || "N/A"}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{payment.student.phone || "N/A"}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Class:</span>
                <span className="font-medium">
                  {payment.student.class.name} (Grade {payment.student.class.grade.level})
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium">{payment.student.sex}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Blood Type:</span>
                <span className="font-medium">{payment.student.bloodType}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Birthday:</span>
                <span className="font-medium">
                  {new Date(payment.student.birthday).toLocaleDateString()}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <span className="text-gray-600 block mb-2">Address:</span>
                <p className="text-gray-900">{payment.student.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Parent Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Parent Name:</span>
                <span className="font-medium">
                  {payment.student.parent.name} {payment.student.parent.surname}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Parent Email:</span>
                <span className="font-medium">{payment.student.parent.email || "N/A"}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Parent Phone:</span>
                <span className="font-medium">{payment.student.parent.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailPage;
