import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import FilterDropdown from "@/components/FilterDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Class, Prisma } from "@prisma/client";
import Image from "next/image";
import { getUserSession } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type AnnouncementList = Announcement & { class: Class & { grade: { level: number } } };
const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  
  // Get user session using our custom authentication
  const session = await getUserSession();
  const role = session?.role;
  const currentUserId = session?.id;

  console.log("User role determined:", role);
  console.log("Current user ID:", currentUserId);
  
  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];
  
  const renderRow = (item: AnnouncementList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
          
        </div>
      </td>
      <td>
        <div className="flex flex-col">
          <span className="font-medium">{item.class?.name || "All Classes"}</span>
          {item.class?.grade && (
            <span className="text-xs text-gray-500">Grade {item.class.grade.level}</span>
          )}
        </div>
      </td>
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
          {role === "admin" && (
            <>
              <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // Build the base query
  const query: Prisma.AnnouncementWhereInput = {};

  // Add search functionality
  if (queryParams.search) {
    query.OR = [
      { title: { contains: queryParams.search, mode: "insensitive" } },
      { description: { contains: queryParams.search, mode: "insensitive" } },
      { class: { name: { contains: queryParams.search, mode: "insensitive" } } },
    ];
  }

  // Role-based filtering
  if (role === "admin") {
    // Admin can see all announcements
    // No additional filtering needed
  } else if (role === "teacher" && currentUserId) {
    // Teachers can see announcements for their classes or general announcements
    query.OR = [
      { classId: null }, // General announcements
      {
        class: {
          OR: [
            { supervisorId: currentUserId }, // Classes they supervise
            { lessons: { some: { teacherId: currentUserId } } } // Classes they teach
          ]
        }
      }
    ];
  } else if (role === "student" && currentUserId) {
    // Students can see announcements for their class or general announcements
    const student = await prisma.student.findUnique({
      where: { id: currentUserId },
      select: { classId: true }
    });
    
    if (student) {
      query.OR = [
        { classId: null }, // General announcements
        { classId: student.classId } // Their specific class
      ];
    }
  } else if (role === "parent" && currentUserId) {
    // Parents can see announcements for their children's classes or general announcements
    const parentStudents = await prisma.student.findMany({
      where: { parentId: currentUserId },
      select: { classId: true }
    });
    
    if (parentStudents.length > 0) {
      const classIds = parentStudents.map(s => s.classId);
      query.OR = [
        { classId: null }, // General announcements
        { classId: { in: classIds } } // Their children's classes
      ];
    }
  }

  console.log("Final query:", JSON.stringify(query, null, 2));

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: {
        class: {
          include: {
            grade: true,
          },
        },
      },
      orderBy: {
        date: 'desc'
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

  console.log("Found announcements:", data.length);
  console.log("Total count:", count);

  return (
    <div className="bg-white p-4 flex-1  w-full h-full">
      {/* TOP */}
      <div className="flex items-center justify-between " >
        <h1 className="hidden md:block text-lg font-semibold">
          All Announcements
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
            {role === "admin" ? (
              <div className="flex items-center gap-2">
                <FormContainer table="announcement" type="create" />
                <span className="text-sm font-medium text-green-600">Click + to create announcement</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Create Announcement (Admin Only)
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

export default AnnouncementListPage;
