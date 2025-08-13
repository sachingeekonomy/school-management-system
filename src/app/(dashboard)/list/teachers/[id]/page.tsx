import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/auth";
import { Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const session = await getUserSession();
  const role = session?.role;

  const teacher:
    | (Teacher & {
        _count: { subjects: number; lessons: number; classes: number };
        subjects: { id: number; name: string }[];
        classes: { id: number; name: string }[];
        lessons: { id: number; name: string; day: string; startTime: Date; endTime: Date; class: { name: string } }[];
      })
    | null = await prisma.teacher.findUnique({
    where: { id },
    include: {
      subjects: true,
      classes: true,
      lessons: {
        include: {
          class: {
            select: { name: true }
          }
        },
        take: 10,
        orderBy: {
          startTime: 'asc'
        }
      },
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
    },
  });

  // Calculate comprehensive statistics for teacher
  let attendancePercentage = 0;
  let totalStudents = 0;
  let averageScore = 0;
  let totalExams = 0;
  let totalAssignments = 0;
  let totalLessonsThisWeek = 0;
  
  if (teacher) {
    // Get attendance statistics
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['present'],
      where: {
        lesson: {
          teacherId: teacher.id
        }
      },
      _count: {
        present: true
      }
    });

    const totalAttendances = attendanceStats.reduce((sum, stat) => sum + stat._count.present, 0);
    const presentAttendances = attendanceStats.find(stat => stat.present)?._count.present || 0;
    
    attendancePercentage = totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 0;

    // Get total students taught by this teacher
    const studentCount = await prisma.student.count({
      where: {
        class: {
          lessons: {
            some: {
              teacherId: teacher.id
            }
          }
        }
      }
    });
    totalStudents = studentCount;

    // Get average exam/assignment scores
    const resultStats = await prisma.result.aggregate({
      where: {
        OR: [
          {
            exam: {
              lesson: {
                teacherId: teacher.id
              }
            }
          },
          {
            assignment: {
              lesson: {
                teacherId: teacher.id
              }
            }
          }
        ]
      },
      _avg: {
        score: true
      }
    });

    averageScore = resultStats._avg.score ? Math.round(resultStats._avg.score) : 0;

    // Get total exams and assignments
    const examCount = await prisma.exam.count({
      where: {
        lesson: {
          teacherId: teacher.id
        }
      }
    });
    totalExams = examCount;

    const assignmentCount = await prisma.assignment.count({
      where: {
        lesson: {
          teacherId: teacher.id
        }
      }
    });
    totalAssignments = assignmentCount;

    // Get lessons this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const lessonsThisWeek = await prisma.lesson.count({
      where: {
        teacherId: teacher.id,
        startTime: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      }
    });
    totalLessonsThisWeek = lessonsThisWeek;
  }

  if (!teacher) {
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
                src={teacher.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {teacher.name + " " + teacher.surname}
                </h1>
                <span className="text-sm text-gray-500">Teacher ID: {teacher.username}</span>
                <span className="text-sm text-gray-500">Password: {teacher.password}</span>
                {role === "admin" && (
                  <FormContainer table="teacher" type="update" data={teacher} />
                )}
              </div>
              
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Blood Type:</span>
                  <span className="font-semibold">{teacher.bloodType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Birthday:</span>
                  <span className="font-semibold">
                    {new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{teacher.email || "-"}</span>
                </div>
          
                <div className="flex items-center gap-2">
                  <Image src="/maleFemale.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-semibold">{teacher.sex}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{teacher.phone || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/profile.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Address:</span>
                  <span className="font-semibold">{teacher.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TEACHER STATISTICS SECTION */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Image src="/dashboard bg.png" alt="" width={24} height={24} />
            <h2 className="text-xl font-semibold text-gray-800">Teacher Statistics</h2>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Attendance Card */}
            <div className="bg-white p-6 rounded-md flex items-center gap-4 min-h-[100px]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">{attendancePercentage}%</h1>
                <span className="text-sm text-gray-500 block mt-1">Attendance Rate</span>
              </div>
            </div>
            {/* Students Card */}
            <div className="bg-white p-6 rounded-md flex items-center gap-4 min-h-[100px]">
              <Image
                src="/student.png"
                alt=""
                width={24}
                height={24}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">{totalStudents}</h1>
                <span className="text-sm text-gray-500 block mt-1">Students</span>
              </div>
            </div>
            {/* Average Score Card */}
            <div className="bg-white p-6 rounded-md flex items-center gap-4 min-h-[100px]">
              <Image
                src="/result.png"
                alt=""
                width={24}
                height={24}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">{averageScore}%</h1>
                <span className="text-sm text-gray-500 block mt-1">Avg Score</span>
              </div>
            </div>
            {/* Classes Card */}
            <div className="bg-white p-6 rounded-md flex items-center gap-4 min-h-[100px]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {teacher._count.classes}
                </h1>
                <span className="text-sm text-gray-500 block mt-1">Classes</span>
              </div>
            </div>
            {/* Exams Card */}
            <div className="bg-white p-6 rounded-md flex items-center gap-4 min-h-[100px]">
              <Image
                src="/exam.png"
                alt=""
                width={24}
                height={24}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">{totalExams}</h1>
                <span className="text-sm text-gray-500 block mt-1">Exams</span>
              </div>
            </div>
            {/* Assignments Card */}
            <div className="bg-white p-6 rounded-md flex items-center gap-4 min-h-[100px]">
              <Image
                src="/assignment.png"
                alt=""
                width={24}
                height={24}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">{totalAssignments}</h1>
                <span className="text-sm text-gray-500 block mt-1">Assignments</span>
              </div>
            </div>
            {/* Lessons This Week Card */}
            <div className="bg-white p-6 rounded-md flex items-center gap-4 min-h-[100px]">
              <Image
                src="/lesson.png"
                alt=""
                width={24}
                height={24}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">{totalLessonsThisWeek}</h1>
                <span className="text-sm text-gray-500 block mt-1">Lessons This Week</span>
              </div>
            </div>
            {/* Total Lessons Card */}
            <div className="bg-white p-6 rounded-md flex items-center gap-4 min-h-[100px]">
              <Image
                src="/lesson.png"
                alt=""
                width={24}
                height={24}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">{teacher._count.lessons}</h1>
                <span className="text-sm text-gray-500 block mt-1">Total Lessons</span>
              </div>
            </div>
          </div>
        </div>

        {/* TEACHER DETAILS SECTIONS */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subjects Section */}
          <div className="bg-white rounded-md p-4">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/subject.png" alt="" width={20} height={20} />
              <h2 className="text-lg font-semibold">Teaching Subjects</h2>
              <span className="text-sm text-gray-500">({teacher._count.subjects})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.length > 0 ? (
                teacher.subjects.map((subject) => (
                  <span
                    key={subject.id}
                    className="px-3 py-1 bg-lamaSkyLight text-lamaSky rounded-full text-sm font-medium"
                  >
                    {subject.name}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No subjects assigned</p>
              )}
            </div>
          </div>

          {/* Classes Section */}
          <div className="bg-white rounded-md p-4">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/class.png" alt="" width={20} height={20} />
              <h2 className="text-lg font-semibold">Assigned Classes</h2>
              <span className="text-sm text-gray-500">({teacher._count.classes})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {teacher.classes.length > 0 ? (
                teacher.classes.map((classItem) => (
                  <span
                    key={classItem.id}
                    className="px-3 py-1 bg-lamaPurpleLight text-lamaPurple rounded-full text-sm font-medium"
                  >
                    {classItem.name}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No classes assigned</p>
              )}
            </div>
          </div>

          {/* Recent Lessons Section */}
          <div className="bg-white rounded-md p-4 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/lesson.png" alt="" width={20} height={20} />
              <h2 className="text-lg font-semibold">Recent Lessons</h2>
              <span className="text-sm text-gray-500">({teacher._count.lessons} total)</span>
            </div>
            <div className="space-y-2">
              {teacher.lessons.length > 0 ? (
                teacher.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-lamaYellow rounded-full"></div>
                      <div className="flex flex-col">
                        <span className="font-medium">{lesson.name}</span>
                        <span className="text-xs text-gray-500">
                          {lesson.day} • {new Date(lesson.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(lesson.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{lesson.class.name}</span>
                      <div className="px-2 py-1 bg-lamaSkyLight text-lamaSky rounded-full text-xs font-medium">
                        {lesson.day}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No lessons scheduled</p>
              )}
              {teacher._count.lessons > 10 && (
                <div className="text-center mt-3">
                  <Link
                    href={`/list/lessons?teacherId=${teacher.id}`}
                    className="text-lamaSky text-sm font-medium hover:underline"
                  >
                    View all {teacher._count.lessons} lessons →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TEACHER PERFORMANCE SECTION */}
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
                  <p className="text-sm text-green-600">Average Student Score</p>
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
                  <p className="text-sm text-blue-600">Class Attendance Rate</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Image src="/lesson.png" alt="" width={24} height={24} className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-700">{totalLessonsThisWeek}</h3>
                  <p className="text-sm text-purple-600">Lessons This Week</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SCHEDULE SECTION */}
        <div className="mt-4 bg-white rounded-md p-4 h-[600px]">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/calendar.png" alt="" width={20} height={20} />
            <h1 className="text-lg font-semibold">Teacher&apos;s Schedule</h1>
          </div>
          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* Quick Stats */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-lamaSkyLight rounded-md">
              <div className="flex items-center gap-2">
                <Image src="/subject.png" alt="" width={16} height={16} />
                <span className="text-sm font-medium">Subjects</span>
              </div>
              <span className="text-lg font-bold text-lamaSky">{teacher._count.subjects}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-lamaPurpleLight rounded-md">
              <div className="flex items-center gap-2">
                <Image src="/class.png" alt="" width={16} height={16} />
                <span className="text-sm font-medium">Classes</span>
              </div>
              <span className="text-lg font-bold text-lamaPurple">{teacher._count.classes}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-lamaYellowLight rounded-md">
              <div className="flex items-center gap-2">
                <Image src="/lesson.png" alt="" width={16} height={16} />
                <span className="text-sm font-medium">Total Lessons</span>
              </div>
              <span className="text-lg font-bold text-lamaYellow">{teacher._count.lessons}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
              <div className="flex items-center gap-2">
                <Image src="/exam.png" alt="" width={16} height={16} />
                <span className="text-sm font-medium">Exams</span>
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
                <Image src="/student.png" alt="" width={16} height={16} />
                <span className="text-sm font-medium">Students</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{totalStudents}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              className="flex items-center gap-3 p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky transition-colors"
              href={`/list/classes?supervisorId=${teacher.id}`}
            >
              <Image src="/class.png" alt="" width={16} height={16} />
              <span className="text-sm font-medium">View Classes</span>
            </Link>
            <Link
              className="flex items-center gap-3 p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
              href={`/list/students?teacherId=${teacher.id}`}
            >
              <Image src="/student.png" alt="" width={16} height={16} />
              <span className="text-sm font-medium">View Students</span>
            </Link>
            <Link
              className="flex items-center gap-3 p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow transition-colors"
              href={`/list/lessons?teacherId=${teacher.id}`}
            >
              <Image src="/lesson.png" alt="" width={16} height={16} />
              <span className="text-sm font-medium">View Lessons</span>
            </Link>
            <Link
              className="flex items-center gap-3 p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href={`/list/exams?teacherId=${teacher.id}`}
            >
              <Image src="/exam.png" alt="" width={16} height={16} />
              <span className="text-sm font-medium">View Exams</span>
            </Link>
            <Link
              className="flex items-center gap-3 p-3 rounded-md bg-green-50 hover:bg-green-100 transition-colors"
              href={`/list/assignments?teacherId=${teacher.id}`}
            >
              <Image src="/assignment.png" alt="" width={16} height={16} />
              <span className="text-sm font-medium">View Assignments</span>
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
                <p className="text-sm font-medium">{teacher.email || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2">
              <Image src="/phone.png" alt="" width={16} height={16} />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{teacher.phone || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2">
              <Image src="/profile.png" alt="" width={16} height={16} />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm font-medium">{teacher.address}</p>
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

export default SingleTeacherPage;
