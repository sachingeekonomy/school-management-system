import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import prisma from "@/lib/prisma";

const AdminPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  // Fetch real data from database
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalParents,
    totalSubjects,
    totalExams,
    totalAssignments,
    totalResults,
    totalEvents,
    totalAnnouncements
  ] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
    prisma.parent.count(),
    prisma.subject.count(),
    prisma.exam.count(),
    prisma.assignment.count(),
    prisma.result.count(),
    prisma.event.count(),
    prisma.announcement.count()
  ]);

  // Calculate attendance percentage from attendance records
  const attendanceData = await prisma.attendance.findMany({
    select: {
      present: true
    }
  });

  const totalAttendanceRecords = attendanceData.length;
  const presentRecords = attendanceData.filter(record => record.present).length;
  const attendancePercentage = totalAttendanceRecords > 0 
    ? Math.round((presentRecords / totalAttendanceRecords) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Header Section with Stats */}
      <div className="relative overflow-hidden bg-gradient-to-r from-lamaSky via-blue-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
        
        <div className="relative px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
            
              <div className="flex items-center gap-2 ml-auto">
                
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Welcome back, Administrator
            </h1>
            <p className="text-blue-100 text-xl max-w-3xl mb-8">
              Monitor your school's performance, track student progress, and manage all activities from one central dashboard.
            </p>
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">📊</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Total Students</p>
                    <p className="text-white text-2xl font-bold">{totalStudents.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">👨‍🏫</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Active Teachers</p>
                    <p className="text-white text-2xl font-bold">{totalTeachers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">📚</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Classes</p>
                    <p className="text-white text-2xl font-bold">{totalClasses.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">📈</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Attendance</p>
                    <p className="text-white text-2xl font-bold">{attendancePercentage}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-10 flex-col lg:flex-row">
          
          {/* LEFT SIDE - Main Content */}
          <div className="w-full lg:w-2/3 flex flex-col gap-10">
            
            {/* Enhanced User Cards Section */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-lamaSky to-blue-600 rounded-full animate-pulse"></div>
                  <h2 className="text-2xl font-bold text-gray-800">User Statistics</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Live Data
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="transform hover:scale-105 transition-all duration-300">
                  <UserCard type="admin" />
                </div>
                <div className="transform hover:scale-105 transition-all duration-300">
                  <UserCard type="teacher" />
                </div>
                <div className="transform hover:scale-105 transition-all duration-300">
                  <UserCard type="student" />
                </div>
                <div className="transform hover:scale-105 transition-all duration-300">
                  <UserCard type="parent" />
                </div>
              </div>
            </div>

            {/* Enhanced Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Count Chart */}
              <div className="lg:col-span-1 group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-gradient-to-r from-lamaPurple to-purple-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-800">Overview</h3>
                </div>
                <div className="h-[400px] transform group-hover:scale-[1.02] transition-transform duration-300">
                  <CountChartContainer />
                </div>
              </div>

              {/* Attendance Chart */}
              <div className="lg:col-span-2 group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-gradient-to-r from-lamaYellow to-yellow-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-800">Attendance Analytics</h3>
                </div>
                <div className="h-[400px] transform group-hover:scale-[1.02] transition-transform duration-300">
                  <AttendanceChartContainer />
                </div>
              </div>
            </div>

            {/* Enhanced Finance Chart Section */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Financial Overview</h3>
              </div>
              <div className="h-[450px] transform group-hover:scale-[1.02] transition-transform duration-300">
                <FinanceChart />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Enhanced Sidebar */}
          <div className="w-full lg:w-1/3 flex flex-col gap-10">
            
            {/* Enhanced Events Calendar */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-lamaSky to-blue-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Upcoming Events</h3>
              </div>
              <div className="transform group-hover:scale-[1.02] transition-transform duration-300">
                <EventCalendarContainer searchParams={searchParams} />
              </div>
            </div>

            {/* Enhanced Announcements */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Recent Announcements</h3>
              </div>
              <div className="transform group-hover:scale-[1.02] transition-transform duration-300">
                <Announcements />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
