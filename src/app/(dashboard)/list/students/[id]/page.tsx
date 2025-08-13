import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/auth";
import { Student, Class, Grade, Parent } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const session = await getUserSession();
  const role = session?.role;

  const student:
    | (Student & {
        _count: { results: number; attendances: number };
        class: Class;
        grade: Grade;
        parent: Parent;
        results: { id: number; score: number; exam: { title: string } | null; assignment: { title: string } | null }[];
        attendances: { id: number; present: boolean; lesson: { name: string; day: string } }[];
      })
    | null = await prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
      grade: true,
      parent: true,
      results: {
        include: {
          exam: {
            select: { title: true }
          },
          assignment: {
            select: { title: true }
          }
        },
        take: 10,
        orderBy: {
          id: 'desc'
        }
      },
      attendances: {
        include: {
          lesson: {
            select: { name: true, day: true }
          }
        },
        take: 10,
        orderBy: {
          id: 'desc'
        }
      },
      _count: {
        select: {
          results: true,
          attendances: true,
        },
      },
    },
  });

  // Calculate comprehensive statistics for student
  let attendancePercentage = 0;
  let averageScore = 0;
  let totalExams = 0;
  let totalAssignments = 0;
  let totalLessons = 0;
  let recentPerformance = 0;
  
  if (student) {
    // Get attendance statistics
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['present'],
      where: {
        studentId: student.id
      },
      _count: {
        present: true
      }
    });

    const totalAttendances = attendanceStats.reduce((sum, stat) => sum + stat._count.present, 0);
    const presentAttendances = attendanceStats.find(stat => stat.present)?._count.present || 0;
    
    attendancePercentage = totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 0;

    // Get average score
    const resultStats = await prisma.result.aggregate({
      where: {
        studentId: student.id
      },
      _avg: {
        score: true
      }
    });

    averageScore = resultStats._avg.score ? Math.round(resultStats._avg.score) : 0;

    // Get total exams and assignments
    const examCount = await prisma.result.count({
      where: {
        studentId: student.id,
        examId: { not: null }
      }
    });
    totalExams = examCount;

    const assignmentCount = await prisma.result.count({
      where: {
        studentId: student.id,
        assignmentId: { not: null }
      }
    });
    totalAssignments = assignmentCount;

    // Get total lessons attended
    const lessonCount = await prisma.attendance.count({
      where: {
        studentId: student.id
      }
    });
    totalLessons = lessonCount;

    // Get recent performance (last 5 results)
    const recentResults = await prisma.result.findMany({
      where: {
        studentId: student.id
      },
      orderBy: {
        id: 'desc'
      },
      take: 5
    });

    if (recentResults.length > 0) {
      const recentAvg = recentResults.reduce((sum, result) => sum + result.score, 0) / recentResults.length;
      recentPerformance = Math.round(recentAvg);
    }
  }

  if (!student) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={student.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {student.name + " " + student.surname}
                </h1>
                <span className="text-sm text-gray-500">Student ID: {student.username}</span>
                <span className="text-sm text-gray-500">Password: {student.password}</span>
                {role === "admin" && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>
              
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Blood Type:</span>
                  <span className="font-semibold">{student.bloodType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Birthday:</span>
                  <span className="font-semibold">
                    {new Intl.DateTimeFormat("en-GB").format(student.birthday)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{student.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <Image src="/profile.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Address:</span>
                  <span className="font-semibold">{student.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/maleFemale.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-semibold">{student.sex}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/class.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Class:</span>
                  <span className="font-semibold">{student.class.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{student.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STUDENT STATISTICS SECTION */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Image src="/dashboard bg.png" alt="" width={24} height={24} />
            <h2 className="text-xl font-semibold text-gray-800">Student Statistics</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Attendance Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Image
                    src="/singleAttendance.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 filter brightness-0 invert"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-blue-900">{attendancePercentage}%</h3>
                  <p className="text-sm text-blue-700 font-medium">Attendance Rate</p>
                </div>
              </div>
            </div>

            {/* Average Score Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Image
                    src="/result.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 filter brightness-0 invert"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-green-900">{averageScore}%</h3>
                  <p className="text-sm text-green-700 font-medium">Average Score</p>
                </div>
              </div>
            </div>

            {/* Recent Performance Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Image
                    src="/result.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 filter brightness-0 invert"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-purple-900">{recentPerformance}%</h3>
                  <p className="text-sm text-purple-700 font-medium">Recent Performance</p>
                </div>
              </div>
            </div>

            {/* Total Lessons Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Image
                    src="/lesson.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 filter brightness-0 invert"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-orange-900">{totalLessons}</h3>
                  <p className="text-sm text-orange-700 font-medium">Lessons Attended</p>
                </div>
              </div>
            </div>

            {/* Exams Card */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500 rounded-lg">
                  <Image
                    src="/exam.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 filter brightness-0 invert"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-red-900">{totalExams}</h3>
                  <p className="text-sm text-red-700 font-medium">Exams Taken</p>
                </div>
              </div>
            </div>

            {/* Assignments Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500 rounded-lg">
                  <Image
                    src="/assignment.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 filter brightness-0 invert"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-indigo-900">{totalAssignments}</h3>
                  <p className="text-sm text-indigo-700 font-medium">Assignments</p>
                </div>
              </div>
            </div>

            {/* Grade Card */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-500 rounded-lg">
                  <Image
                    src="/class.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 filter brightness-0 invert"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-teal-900">Grade {student.grade.level}</h3>
                  <p className="text-sm text-teal-700 font-medium">Current Grade</p>
                </div>
              </div>
            </div>

            {/* Age Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border border-cyan-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500 rounded-lg">
                  <Image
                    src="/date.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 filter brightness-0 invert"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-cyan-900">
                    {new Date().getFullYear() - new Date(student.birthday).getFullYear()}
                  </h3>
                  <p className="text-sm text-cyan-700 font-medium">Age</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STUDENT DETAILS SECTIONS */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academic Information Section */}
          <div className="bg-white rounded-md p-4">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/class.png" alt="" width={20} height={20} />
              <h2 className="text-lg font-semibold">Academic Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium">Class</span>
                <span className="text-sm font-semibold">{student.class.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium">Grade</span>
                <span className="text-sm font-semibold">Grade {student.grade.level}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium">Student ID</span>
                <span className="text-sm font-semibold">{student.username}</span>
              </div>
            </div>
          </div>

          {/* Parent Information Section */}
          <div className="bg-white rounded-md p-4">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/parent.png" alt="" width={20} height={20} />
              <h2 className="text-lg font-semibold">Parent Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium">Parent Name</span>
                <span className="text-sm font-semibold">{student.parent.name} {student.parent.surname}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium">Parent Phone</span>
                <span className="text-sm font-semibold">{student.parent.phone || "-"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium">Parent Email</span>
                <span className="text-sm font-semibold">{student.parent.email || "-"}</span>
              </div>
            </div>
          </div>

          {/* Recent Results Section */}
          <div className="bg-white rounded-md p-4 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/result.png" alt="" width={20} height={20} />
              <h2 className="text-lg font-semibold">Recent Results</h2>
              <span className="text-sm text-gray-500">({student._count.results} total)</span>
            </div>
            <div className="space-y-2">
              {student.results.length > 0 ? (
                student.results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-lamaYellow rounded-full"></div>
                      <div className="flex flex-col">
                                                 <span className="font-medium">
                           {result.exam?.title || result.assignment?.title || "Unknown"}
                         </span>
                        <span className="text-xs text-gray-500">
                          {result.exam ? "Exam" : "Assignment"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Score</span>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.score >= 80 ? 'bg-green-100 text-green-700' :
                        result.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {result.score}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No results available</p>
              )}
              {student._count.results > 10 && (
                <div className="text-center mt-3">
                  <Link
                    href={`/list/results?studentId=${student.id}`}
                    className="text-lamaPurple text-sm font-medium hover:underline"
                  >
                    View all {student._count.results} results →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Attendance Section */}
          <div className="bg-white rounded-md p-4 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/singleAttendance.png" alt="" width={20} height={20} />
              <h2 className="text-lg font-semibold">Recent Attendance</h2>
              <span className="text-sm text-gray-500">({student._count.attendances} total)</span>
            </div>
            <div className="space-y-2">
              {student.attendances.length > 0 ? (
                student.attendances.map((attendance) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${attendance.present ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="flex flex-col">
                        <span className="font-medium">{attendance.lesson.name}</span>
                        <span className="text-xs text-gray-500">{attendance.lesson.day}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Status</span>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        attendance.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {attendance.present ? "Present" : "Absent"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No attendance records available</p>
              )}
              {student._count.attendances > 10 && (
                <div className="text-center mt-3">
                  <Link
                    href={`/list/attendance?studentId=${student.id}`}
                    className="text-lamaPurple text-sm font-medium hover:underline"
                  >
                    View all {student._count.attendances} attendance records →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STUDENT PERFORMANCE SECTION */}
        <div className="mt-4 bg-white rounded-md p-4">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/result.png" alt="" width={20} height={20} />
            <h2 className="text-lg font-semibold">Performance Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Image src="/result.png" alt="" width={24} height={24} className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-700">{averageScore}%</h3>
                  <p className="text-sm text-green-600">Overall Average</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-700">{attendancePercentage}%</h3>
                  <p className="text-sm text-blue-600">Attendance Rate</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Image src="/result.png" alt="" width={24} height={24} className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-700">{recentPerformance}%</h3>
                  <p className="text-sm text-purple-600">Recent Performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SCHEDULE SECTION */}
        <div className="mt-4 bg-white rounded-md p-4 h-[600px]">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/calendar.png" alt="" width={20} height={20} />
            <h1 className="text-lg font-semibold">Student&apos;s Schedule</h1>
          </div>
          <BigCalendarContainer type="classId" id={student.classId} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* Quick Stats */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-lamaPurpleLight rounded-md">
              <div className="flex items-center gap-2">
                <Image src="/result.png" alt="" width={16} height={16} />
                <span className="text-sm font-medium">Total Results</span>
              </div>
              <span className="text-lg font-bold text-lamaPurple">{student._count.results}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-lamaSkyLight rounded-md">
              <div className="flex items-center gap-2">
                <Image src="/singleAttendance.png" alt="" width={16} height={16} />
                <span className="text-sm font-medium">Attendance Records</span>
              </div>
              <span className="text-lg font-bold text-lamaSky">{student._count.attendances}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
              <div className="flex items-center gap-2">
                <Image src="/exam.png" alt="" width={16} height={16} />
                <span className="text-sm font-medium">Exams Taken</span>
              </div>
              <span className="text-lg font-bold text-green-600">{totalExams}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-md">
              <div className="flex items-center gap-2">
                <Image src="/assignment.png" alt="" width={16} height={16} />
                <span className="text-sm font-medium">Assignments</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{totalAssignments}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2">
                <Image src="/lesson.png" alt="" width={16} height={16} />
                <span className="text-sm font-medium">Lessons Attended</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{totalLessons}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
              <div className="flex items-center gap-2">
                <Image src="/class.png" alt="" width={16} height={16} />
                <span className="text-sm font-medium">Current Grade</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">Grade {student.grade.level}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              className="flex items-center gap-3 p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
              href={`/list/results?studentId=${student.id}`}
            >
              <Image src="/result.png" alt="" width={16} height={16} />
              <span className="text-sm font-medium">View Results</span>
            </Link>
            <Link
              className="flex items-center gap-3 p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky transition-colors"
              href={`/list/attendance?studentId=${student.id}`}
            >
              <Image src="/singleAttendance.png" alt="" width={16} height={16} />
              <span className="text-sm font-medium">View Attendance</span>
            </Link>
            <Link
              className="flex items-center gap-3 p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow transition-colors"
              href={`/list/classes/${student.classId}`}
            >
              <Image src="/class.png" alt="" width={16} height={16} />
              <span className="text-sm font-medium">View Class</span>
            </Link>
            <Link
              className="flex items-center gap-3 p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href={`/list/parents/${student.parentId}`}
            >
              <Image src="/parent.png" alt="" width={16} height={16} />
              <span className="text-sm font-medium">View Parent</span>
            </Link>
            <Link
              className="flex items-center gap-3 p-3 rounded-md bg-green-50 hover:bg-green-100 transition-colors"
              href={`/list/exams?studentId=${student.id}`}
            >
              <Image src="/exam.png" alt="" width={16} height={16} />
              <span className="text-sm font-medium">View Exams</span>
            </Link>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2">
              <Image src="/mail.png" alt="" width={16} height={16} />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{student.email || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2">
              <Image src="/phone.png" alt="" width={16} height={16} />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{student.phone || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2">
              <Image src="/profile.png" alt="" width={16} height={16} />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm font-medium">{student.address}</p>
              </div>
            </div>
          </div>
        </div>

        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;
