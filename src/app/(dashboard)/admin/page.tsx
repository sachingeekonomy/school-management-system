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
    <div className="min-h-screen bg-transparent relative">
      {/* Enhanced Header Section with Stats */}
      <div className="relative z-10 overflow-hidden bg-gradient-to-r from-lamaSky via-blue-600 to-indigo-600 text-white">
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
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-10 flex-col lg:flex-row">
          
          {/* LEFT SIDE - Main Content */}
          <div className="w-full lg:w-2/3 flex flex-col gap-10">
            
            {/* Enhanced User Cards Section */}
            <div className="group relative overflow-hidden bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
              <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse"></div>
              
              <div className="relative p-8 text-white">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-white/80 rounded-full animate-pulse shadow-lg"></div>
                    <h2 className="text-2xl font-bold text-white">User Statistics</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-blue-100 bg-white/10 px-4 py-2 rounded-full font-medium border border-white/20">
                      Live Data
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
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
            </div>

            {/* Enhanced Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Count Chart */}
              <div className="lg:col-span-1 group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
                <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full animate-pulse"></div>
                
                <div className="relative p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                    <h3 className="text-xl font-bold text-white">Overview</h3>
                  </div>
                  <div className="h-[400px] transform group-hover:scale-[1.02] transition-transform duration-300">
                    <CountChartContainer />
                  </div>
                </div>
              </div>

              {/* Attendance Chart */}
              <div className="lg:col-span-2 group relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse"></div>
                
                <div className="relative p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                    <h3 className="text-xl font-bold text-white">Attendance Analytics</h3>
                  </div>
                  <div className="h-[400px] transform group-hover:scale-[1.02] transition-transform duration-300">
                    <AttendanceChartContainer />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Finance Chart Section */}
            <div className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-36 translate-x-36"></div>
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-28 -translate-x-28"></div>
              <div className="absolute top-1/2 right-1/3 w-28 h-28 bg-white/5 rounded-full animate-pulse"></div>
              
              <div className="relative p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                  <h3 className="text-xl font-bold text-white">Financial Overview</h3>
                </div>
                <div className="h-[450px] transform group-hover:scale-[1.02] transition-transform duration-300">
                  <FinanceChart />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Enhanced Sidebar */}
          <div className="w-full lg:w-1/3 flex flex-col gap-10">
            
            {/* Enhanced Events Calendar */}
            <div className="group relative overflow-hidden bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              {/* Subtle Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/3 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                  <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
                </div>
                <div className="transform group-hover:scale-[1.02] transition-transform duration-300">
                  <EventCalendarContainer searchParams={searchParams} />
                </div>
              </div>
            </div>

            {/* Enhanced Announcements */}
            <div className="group relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              {/* Subtle Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10"></div>
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-white/4 to-transparent rounded-full -translate-y-18 translate-x-18"></div>
              <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-white/3 to-transparent rounded-full translate-y-14 -translate-x-14"></div>
              
                              <div className="relative p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                    <h3 className="text-xl font-bold text-white">Recent Announcements</h3>
                  </div>
                <div className="transform group-hover:scale-[1.02] transition-transform duration-300">
                  <Announcements />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
