import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import PaymentDashboard from "@/components/PaymentDashboard";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Users, Calendar, CreditCard, BookOpen, GraduationCap } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const ParentPage = async () => {
  const session = await getUserSession();
  
  if (!session || session.role !== 'parent') {
    redirect('/sign-in');
  }
  
  const currentUserId = session?.id;
  
  const students = await prisma.student.findMany({
    where: {
      parentId: currentUserId!,
    },
    include: {
      class: true,
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Parent Dashboard</h1>
              <p className="text-purple-100">
                Managing {students.length} student{students.length !== 1 ? 's' : ''} • Parent Portal
              </p>
            </div>
          </div>
          
          {/* My Children Card */}
          <Link href="/list/students" className="block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">👨‍👩‍👧‍👦</span>
                </div>
                <div>
                  <p className="text-white/80 text-sm">My Children</p>
                  <p className="text-white text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Student Schedules */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Student Schedules</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {students.map((student) => (
                  <div key={student.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {student.name} {student.surname}
                        </h3>
                        <p className="text-sm text-gray-600">Class {student.class.name}</p>
                      </div>
                    </div>
                    <BigCalendarContainer type="classId" id={student.classId} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Dashboards for each student */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-green-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">Payment Management</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {students.map((student) => (
                  <div key={student.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <BookOpen className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Payments for {student.name} {student.surname}
                        </h3>
                        <p className="text-sm text-gray-600">Class {student.class.name}</p>
                      </div>
                    </div>
                    <PaymentDashboard studentId={student.id} userRole="PARENT" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default ParentPage;
