import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import { getUserSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const TeacherPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const session = await getUserSession();
  const userId = session?.id;
  const role = session?.role;

  // Redirect non-teacher users to their appropriate dashboard
  if (role !== 'teacher') {
    redirect(`/${role || 'admin'}`);
  }

  // Fetch teacher-specific data
  const teacher = await prisma.teacher.findUnique({
    where: { id: userId! },
    include: {
      subjects: true,
      classes: true,
      lessons: {
        include: {
          class: true,
          subject: true,
        },
      },
    },
  });

  if (!teacher) {
    redirect('/sign-in');
  }

  // Fetch teacher's students
  const teacherStudents = await prisma.student.findMany({
    where: {
      class: {
        supervisorId: userId!,
      },
    },
    include: {
      class: true,
      parent: true,
    },
  });
  console.log("teacherStudents>>", teacherStudents);

  // Fetch teacher's lessons
  const teacherLessons = await prisma.lesson.findMany({
    where: {
      teacherId: userId!,
    },
    include: {
      class: true,
      subject: true,
    },
  });

  // Calculate attendance for teacher's classes
  const attendanceData = await prisma.attendance.findMany({
    where: {
      lesson: {
        teacherId: userId!,
      },
    },
    select: {
      present: true,
    },
  });

  const totalAttendanceRecords = attendanceData.length;
  const presentRecords = attendanceData.filter((record) => record.present).length;
  const attendancePercentage = totalAttendanceRecords > 0
    ? Math.round((presentRecords / totalAttendanceRecords) * 100)
    : 0;

  // Get today's date and day of week
  const today = new Date();
  const todayDay = today.toLocaleDateString('en-US', { weekday: 'long' });
  const todayDate = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Get today's classes/lessons
  const todaysLessons = teacherLessons.filter(lesson => 
    lesson.day.toLowerCase() === todayDay.toLowerCase()
  );

  // Get upcoming lessons (next 3 days)
  const upcomingLessons = teacherLessons
    .filter(lesson => {
      const lessonDay = lesson.day.toLowerCase();
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const todayIndex = daysOfWeek.indexOf(todayDay.toLowerCase());
      const lessonIndex = daysOfWeek.indexOf(lessonDay);
      
      // If lesson is today or in the next 3 days
      return lessonIndex >= todayIndex && lessonIndex <= todayIndex + 3;
    })
    .slice(0, 5); // Limit to 5 upcoming lessons

  // Get recent attendance records (last 7 days)
  const recentAttendance = await prisma.attendance.findMany({
    where: {
      lesson: {
        teacherId: userId!,
      },
      date: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
    include: {
      student: {
        select: {
          name: true,
          surname: true,
        },
      },
      lesson: {
        select: {
          name: true,
          subject: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
    take: 10, // Last 10 records
  });

  // Get assignments count for teacher's lessons
  const assignmentsCount = await prisma.assignment.count({
    where: {
      lesson: {
        teacherId: userId!,
      },
    },
  });

  // Get exams count for teacher's lessons
  const examsCount = await prisma.exam.count({
    where: {
      lesson: {
        teacherId: userId!,
      },
    },
  });

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Enhanced Header Section with Stats */}
      <div className="relative z-10 overflow-hidden bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white">
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
              Welcome back, {teacher.name} {teacher.surname}
            </h1>
            <p className="text-green-100 text-xl max-w-3xl mb-8">
              Manage your classes, track student progress, and stay updated with your teaching schedule.
            </p>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <Link href="/list/students" className="block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-bold">👥</span>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">My Students</p>
                      <p className="text-white text-2xl font-bold">{teacherStudents.length}</p>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">📚</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">My Classes</p>
                    <p className="text-white text-2xl font-bold">{teacher.classes.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">📖</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">My Subjects</p>
                    <p className="text-white text-2xl font-bold">{teacher.subjects.length}</p>
                  </div>
                </div>
              </div>
              <Link href="/list/attendance" className="block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer">
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
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-10 flex-col lg:flex-row">

          {/* LEFT SIDE - Main Content */}
          <div className="w-full lg:w-2/3 flex flex-col gap-10">

            {/* Enhanced Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Count Chart */}
              <div className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
                <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full animate-pulse"></div>

                <div className="relative p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                    <h3 className="text-xl font-bold text-white">My Overview</h3>
                  </div>
                  <div className="h-[400px] transform group-hover:scale-[1.02] transition-transform duration-300">
                    <CountChartContainer />
                  </div>
                </div>
              </div>

              {/* Attendance Chart */}
              <div className="group relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse"></div>

                <div className="relative p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                    <h3 className="text-xl font-bold text-white">My Classes Attendance</h3>
                  </div>
                  <div className="h-[400px] transform group-hover:scale-[1.02] transition-transform duration-300">
                    <AttendanceChartContainer />
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Classes Section */}
            <div className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>

              <div className="relative p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                    <h3 className="text-xl font-bold text-white">Today's Classes</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/80">{todayDay}</p>
                    <p className="text-xs text-white/60">{todayDate}</p>
                  </div>
                </div>
                
                {todaysLessons.length > 0 ? (
                  <div className="space-y-4">
                    {todaysLessons.map((lesson) => (
                      <div key={lesson.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{lesson.name}</h4>
                            <p className="text-sm text-white/80">{lesson.subject.name} • {lesson.class.name}</p>
                            <p className="text-xs text-white/60">
                              {new Date(lesson.startTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(lesson.endTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <Link href="/list/attendance" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                            Take Attendance
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/80">No classes scheduled for today</p>
                    <p className="text-sm text-white/60 mt-2">Enjoy your day off!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assignments & Exams */}
              <div className="group relative overflow-hidden bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>

                <div className="relative p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                    <h3 className="text-lg font-bold text-white">Academic</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📝</span>
                        <div>
                          <p className="text-sm text-white/80">Assignments</p>
                          <p className="text-xl font-bold">{assignmentsCount}</p>
                        </div>
                      </div>
                      <Link href="/list/assignments" className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-colors">
                        View
                      </Link>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <div>
                          <p className="text-sm text-white/80">Exams</p>
                          <p className="text-xl font-bold">{examsCount}</p>
                        </div>
                      </div>
                      <Link href="/list/exams" className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-colors">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Attendance */}
              <div className="group relative overflow-hidden bg-gradient-to-r from-rose-500 via-pink-600 to-red-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>

                <div className="relative p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                    <h3 className="text-lg font-bold text-white">Recent Attendance</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {recentAttendance.slice(0, 3).map((record) => (
                      <div key={record.id} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {record.student.name} {record.student.surname}
                          </p>
                          <p className="text-xs text-white/60">{record.lesson.name}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          record.present 
                            ? 'bg-green-500/20 text-green-200' 
                            : 'bg-red-500/20 text-red-200'
                        }`}>
                          {record.present ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    ))}
                    {recentAttendance.length === 0 && (
                      <p className="text-sm text-white/60 text-center py-2">No recent attendance records</p>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Link href="/list/attendance" className="text-sm text-white/80 hover:text-white transition-colors">
                      View All Attendance →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Upcoming Lessons */}
              <div className="group relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>

                <div className="relative p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                    <h3 className="text-lg font-bold text-white">Upcoming</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {upcomingLessons.slice(0, 3).map((lesson) => (
                      <div key={lesson.id} className="bg-white/10 rounded-lg p-2">
                        <p className="text-sm font-medium text-white">{lesson.name}</p>
                        <p className="text-xs text-white/60">{lesson.subject.name}</p>
                        <p className="text-xs text-white/60">{lesson.day} • {lesson.class.name}</p>
                      </div>
                    ))}
                    {upcomingLessons.length === 0 && (
                      <p className="text-sm text-white/60 text-center py-2">No upcoming lessons</p>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Link href="/list/lessons" className="text-sm text-white/80 hover:text-white transition-colors">
                      View All Lessons →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Enhanced Sidebar */}
          <div className="w-full lg:w-1/3 flex flex-col gap-10">

            {/* Enhanced Events Calendar */}
            <div className="group relative overflow-hidden bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/3 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                  <h3 className="text-xl font-bold text-white">My Schedule</h3>
                </div>
                <div className="transform group-hover:scale-[1.02] transition-transform duration-300">
                  <EventCalendarContainer searchParams={searchParams} />
                </div>
              </div>
            </div>

            {/* Enhanced Announcements */}
            <div className="group relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10"></div>
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-white/4 to-transparent rounded-full -translate-y-18 translate-x-18"></div>
              <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-white/3 to-transparent rounded-full translate-y-14 -translate-x-14"></div>

              <div className="relative p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-4 h-4 bg-white/80 rounded-full shadow-lg"></div>
                  <h3 className="text-xl font-bold text-white">Announcements</h3>
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

export default TeacherPage;
