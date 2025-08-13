import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import PaymentDashboard from "@/components/PaymentDashboard";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GraduationCap, Calendar, CreditCard, BookOpen } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const StudentPage = async () => {
  const session = await getUserSession();
  
  if (!session || session.role !== 'student') {
    redirect('/sign-in');
  }

  const userId = session?.id;

  // First, get the student record to find their class
  const student = await prisma.student.findUnique({
    where: { id: userId! },
    include: { class: true }
  });

  console.log('Student:', student);
  console.log('Student class:', student?.class);

  // If student doesn't exist or has no class, show a message
  if (!student || !student.class) {
    return (
      <div className="p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Student Dashboard</h1>
          <p className="text-gray-600">
            {!student 
              ? "Student record not found. Please contact your administrator." 
              : "No class assigned. Please contact your administrator."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {student.name}!</h1>
            <p className="text-blue-100">Class {student.class.name} • Student Dashboard</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content - Schedule & Payments */}
        <div className="xl:col-span-2 space-y-6">
          {/* Schedule Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Class Schedule</h2>
              </div>
            </div>
            <div className="p-6">
              <BigCalendarContainer type="classId" id={student.class.id} />
            </div>
          </div>
          
          {/* Payment Dashboard */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-green-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">Payment Dashboard</h2>
              </div>
            </div>
            <div className="p-6">
              <PaymentDashboard studentId={student.id} userRole="STUDENT" />
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <EventCalendar />
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
