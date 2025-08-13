import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterSortButtons from "@/components/FilterSortButtons";
import SearchResultsIndicator from "@/components/SearchResultsIndicator";
import TagList from "@/components/TagList";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getUserSession } from "@/lib/auth";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await getUserSession();
  const role = session?.role;
  const userId = session?.id;
  
  // Debug logging
  console.log("Session:", session);
  console.log("User ID:", userId);
  console.log("Role:", role);
  
  // Fallback: if role is undefined, try to get from user data
  let finalRole = role;
  if (!finalRole && userId) {
    // Try to get role from database or use admin as fallback
    try {
      const user = await prisma.teacher.findUnique({
        where: { id: userId },
        select: { id: true }
      });
      if (user) {
        finalRole = 'teacher';
      } else {
        // Check if it's an admin (no specific table for admin, so use fallback)
        finalRole = 'admin';
      }
    } catch (error) {
      console.log("Error checking user role:", error);
      finalRole = 'admin'; // Default fallback
    }
  }
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
         {
       header: "Subjects",
       accessor: "subjects",
       className: "hidden lg:table-cell min-w-[150px]",
     },
     {
       header: "Classes",
       accessor: "classes",
       className: "hidden lg:table-cell min-w-[120px]",
     },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(finalRole === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
                    <td className="hidden lg:table-cell">
         <TagList items={item.subjects} color="blue" maxWidth="max-w-[200px]" />
       </td>
       <td className="hidden lg:table-cell">
         <TagList items={item.classes} color="green" maxWidth="max-w-[150px]" />
       </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {finalRole === "admin" && (
            <>
              <FormContainer key={`teacher-update-${item.id}`} table="teacher" type="update" data={item} />
              <FormContainer key={`teacher-delete-${item.id}`} table="teacher" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.TeacherWhereInput = {};

  // Handle additional filters
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classes = {
              some: {
                id: parseInt(value),
              },
            };
            break;
          case "subjectId":
            query.subjects = {
              some: {
                id: parseInt(value),
              },
            };
            break;
          case "gender":
            query.sex = value as "MALE" | "FEMALE";
            break;
          case "bloodType":
            query.bloodType = value;
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { surname: { contains: value, mode: "insensitive" } },
              { username: { contains: value, mode: "insensitive" } },
              { email: { contains: value, mode: "insensitive" } },
              { phone: { contains: value, mode: "insensitive" } },
              { address: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Sort configuration
  const sortBy = queryParams.sortBy || 'name';
  const sortOrder = queryParams.sortOrder || 'asc';
  
  let orderBy: Prisma.TeacherOrderByWithRelationInput = {};
  if (sortBy === 'name') {
    orderBy.name = sortOrder as 'asc' | 'desc';
  } else if (sortBy === 'username') {
    orderBy.username = sortOrder as 'asc' | 'desc';
  } else if (sortBy === 'email') {
    orderBy.email = sortOrder as 'asc' | 'desc';
  } else if (sortBy === 'phone') {
    orderBy.phone = sortOrder as 'asc' | 'desc';
  } else if (sortBy === 'birthday') {
    orderBy.birthday = sortOrder as 'asc' | 'desc';
  } else if (sortBy === 'createdAt') {
    orderBy.createdAt = sortOrder as 'asc' | 'desc';
  } else {
    orderBy.name = 'asc'; // default sort
  }

  // Fetch classes and subjects for filter options
  const [classes, subjects] = await prisma.$transaction([
    prisma.class.findMany({
      select: { id: true, name: true, grade: { select: { level: true } } },
      orderBy: { name: 'asc' }
    }),
    prisma.subject.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ]);

  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.teacher.count({ where: query }),
  ]);

  console.log("Teachers data:", data);
  console.log("Teachers count:", data.length);
  console.log("Unique IDs:", Array.from(new Set(data.map(item => item.id))));

  return (
    <div className="bg-white p-4 flex-1  w-full h-full">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
                 <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
           <TableSearch 
             placeholder="Search teachers..." 
             searchFields={["name", "surname", "username", "email", "phone", "address"]}
           />
          
          <div className="flex items-center gap-4 self-end">
            <FilterSortButtons classes={classes} subjects={subjects} />
            {finalRole === "admin" ? (
              <div className="flex items-center gap-2">
                <FormContainer table="teacher" type="create" />
                <span className="text-sm font-medium text-green-600">Click + to add teacher</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Add Teacher (Admin Only)
                </button>
              </div>
            )}
          </div>
        </div>
             </div>
       
       {/* Search Results Indicator */}
       <SearchResultsIndicator 
         totalResults={count} 
         classes={classes}
         subjects={subjects}
       />
       
       {/* LIST */}
       <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default TeacherListPage;
