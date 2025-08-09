import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type AttendanceList = {
  id: number;
  studentId: string;
  studentName: string;
  studentSurname: string;
  lessonId: number;
  lessonName: string;
  lessonDay: string;
  present: boolean;
  className: string;
  teacherName: string;
  teacherSurname: string;
  date: Date;
};

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Debug logging for role detection
  console.log("Session claims:", sessionClaims);
  console.log("Detected role:", role);
  console.log("User ID:", currentUserId);

  // Fallback role detection - if role is not detected from session, try to get from user metadata
  let finalRole = role;
  if (!finalRole && currentUserId) {
    try {
      const user = await prisma.teacher.findUnique({
        where: { id: currentUserId },
        select: { id: true }
      });
      if (user) {
        finalRole = "teacher";
        console.log("Fallback: User found in teachers table, role set to teacher");
      } else {
        const adminUser = await prisma.student.findUnique({
          where: { id: currentUserId },
          select: { id: true }
        });
        if (!adminUser) {
          finalRole = "admin";
          console.log("Fallback: User not found in teachers/students, role set to admin");
        }
      }
    } catch (error) {
      console.error("Error in fallback role detection:", error);
      finalRole = "admin"; // Default to admin if there's an error
    }
  }

  console.log("Final role:", finalRole);

  const columns = [
    {
      header: "Student",
      accessor: "student",
    },
    {
      header: "Lesson",
      accessor: "lesson",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
      className: "hidden md:table-cell",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden lg:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden lg:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(finalRole === "admin" || finalRole === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: AttendanceList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <span className="font-medium">{item.studentName + " " + item.studentSurname}</span>
          <span className="text-xs text-gray-500">{item.className}</span>
        </div>
      </td>
      <td className="hidden md:table-cell">
        <div className="flex flex-col">
          <span className="font-medium">{item.lessonName}</span>
          <span className="text-xs text-gray-500">{item.lessonDay}</span>
        </div>
      </td>
      <td className="hidden md:table-cell">
        <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
          item.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {item.present ? "Present" : "Absent"}
        </div>
      </td>
      <td className="hidden lg:table-cell">
        {item.teacherName + " " + item.teacherSurname}
      </td>
      <td className="hidden lg:table-cell">{item.className}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US", { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(item.date)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(finalRole === "admin" || finalRole === "teacher") && (
            <>
              <FormContainer table="attendance" type="update" data={item} />
              <FormContainer table="attendance" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.AttendanceWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "lessonId":
            query.lessonId = parseInt(value);
            break;
          case "search":
            query.OR = [
              { student: { name: { contains: value, mode: "insensitive" } } },
              { student: { surname: { contains: value, mode: "insensitive" } } },
              { lesson: { name: { contains: value, mode: "insensitive" } } },
              { student: { class: { name: { contains: value, mode: "insensitive" } } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS

  switch (finalRole) {
    case "admin":
      break;
    case "teacher":
      query.lesson = {
        teacherId: currentUserId!,
      };
      break;
    case "student":
      query.studentId = currentUserId!;
      break;
    case "parent":
      query.student = {
        parentId: currentUserId!,
      };
      break;
    default:
      break;
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: { 
          select: { 
            id: true,
            name: true, 
            surname: true,
            class: { select: { name: true } }
          } 
        },
        lesson: {
          select: {
            id: true,
            name: true,
            day: true,
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { id: 'desc' },
    }),
    prisma.attendance.count({ where: query }),
  ]);

  const data = dataRes.map((item) => ({
    id: item.id,
    studentId: item.student.id,
    studentName: item.student.name,
    studentSurname: item.student.surname,
    lessonId: item.lesson.id,
    lessonName: item.lesson.name,
    lessonDay: item.lesson.day,
    present: item.present,
    className: item.student.class.name,
    teacherName: item.lesson.teacher.name,
    teacherSurname: item.lesson.teacher.surname,
    date: item.date || new Date(),
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Attendance Records</h1>
        {/* Debug info - remove this after testing */}
       
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {finalRole === "admin" || finalRole === "teacher" ? (
              <div className="flex items-center gap-2">
                <FormContainer table="attendance" type="create" />
                <span className="text-sm font-medium text-green-600">Click + to add attendance</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Add Attendance (Admin/Teacher Only)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AttendanceListPage;
