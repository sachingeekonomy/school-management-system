import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type AssignmentList = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const AssignmentListPage = async ({
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
      header: "Assignment",
      accessor: "assignment",
    },
    {
      header: "Subject",
      accessor: "subject",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden lg:table-cell",
    },
    {
      header: "Start Date",
      accessor: "startDate",
      className: "hidden lg:table-cell",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
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
  
  const renderRow = (item: AssignmentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.title}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.lesson.subject.name}</td>
      <td className="hidden md:table-cell">{item.lesson.class.name}</td>
      <td className="hidden lg:table-cell">
        {item.lesson.teacher.name + " " + item.lesson.teacher.surname}
      </td>
      <td className="hidden lg:table-cell">
        {new Intl.DateTimeFormat("en-US", { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(item.startDate)}
      </td>
      <td className="hidden md:table-cell">
        <div className="flex flex-col">
          <span className="font-medium">
            {new Intl.DateTimeFormat("en-US", { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric'
            }).format(item.dueDate)}
          </span>
          <span className="text-xs text-gray-500">
            {new Intl.DateTimeFormat("en-US", { 
              hour: '2-digit',
              minute: '2-digit'
            }).format(item.dueDate)}
          </span>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(finalRole === "admin" || finalRole === "teacher") && (
            <>
              <FormContainer table="assignment" type="update" data={item} />
              <FormContainer table="assignment" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.AssignmentWhereInput = {};

  query.lesson = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lesson.classId = parseInt(value);
            break;
          case "teacherId":
            query.lesson.teacherId = value;
            break;
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { lesson: { subject: { name: { contains: value, mode: "insensitive" } } } },
              { lesson: { class: { name: { contains: value, mode: "insensitive" } } } },
              { lesson: { teacher: { name: { contains: value, mode: "insensitive" } } } },
              { lesson: { teacher: { surname: { contains: value, mode: "insensitive" } } } },
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
      query.lesson.teacherId = currentUserId!;
      break;
    case "student":
      query.lesson.class = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;
    case "parent":
      query.lesson.class = {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      };
      break;
    default:
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.assignment.count({ where: query }),
  ]);
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Assignments
        </h1>
    
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
                <FormContainer table="assignment" type="create" />
                <span className="text-sm font-medium text-green-600">Click + to add assignment</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Add Assignment (Admin/Teacher Only)
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

export default AssignmentListPage;
