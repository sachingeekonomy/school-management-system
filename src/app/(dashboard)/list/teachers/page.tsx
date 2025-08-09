import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import FilterDropdown from "@/components/FilterDropdown";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims, userId } = auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  
  // Debug logging
  console.log("Session claims:", sessionClaims);
  console.log("User ID:", userId);
  console.log("Role from metadata:", role);
  
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
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
      className: "hidden md:table-cell",
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
      <td className="hidden md:table-cell">
        {item.subjects.map((subject) => subject.name).join(",")}
      </td>
      <td className="hidden md:table-cell">
        {item.classes.map((classItem) => classItem.name).join(",")}
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
              <FormContainer table="teacher" type="update" data={item} />
              <FormContainer table="teacher" type="delete" id={item.id} />
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

  // Handle sorting
  let orderBy: any = { id: 'asc' }; // Default sorting
  
  const { sort, order } = queryParams;
  if (sort && order) {
    switch (sort) {
      case 'name':
        orderBy = { name: order };
        break;
      case 'email':
        orderBy = { email: order };
        break;
      case 'phone':
        orderBy = { phone: order };
        break;
      case 'address':
        orderBy = { address: order };
        break;
      case 'createdAt':
        orderBy = { createdAt: order };
        break;
      default:
        orderBy = { id: order };
        break;
    }
  }

  // Handle additional filters
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lessons = {
              some: {
                classId: parseInt(value),
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
          case "sex":
            query.sex = value as any;
            break;
          case "supervisorClass":
            query.classes = {
              some: {
                id: parseInt(value),
              },
            };
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

  const [data, count, subjects, classes] = await prisma.$transaction([
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
    prisma.subject.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.class.findMany({
      include: {
        grade: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Sort options for teachers
  const sortOptions = [
    { value: "name-asc", label: "Name (A-Z)", field: "name", direction: "asc" as const },
    { value: "name-desc", label: "Name (Z-A)", field: "name", direction: "desc" as const },
    { value: "email-asc", label: "Email (A-Z)", field: "email", direction: "asc" as const },
    { value: "email-desc", label: "Email (Z-A)", field: "email", direction: "desc" as const },
    { value: "phone-asc", label: "Phone (A-Z)", field: "phone", direction: "asc" as const },
    { value: "phone-desc", label: "Phone (Z-A)", field: "phone", direction: "desc" as const },
    { value: "createdAt-asc", label: "Oldest First", field: "createdAt", direction: "asc" as const },
    { value: "createdAt-desc", label: "Newest First", field: "createdAt", direction: "desc" as const },
  ];

  // Filter options for teachers
  const filterGroups = [
    {
      title: "Subject",
      param: "subjectId",
      options: subjects.map(subject => ({
        value: subject.id.toString(),
        label: subject.name,
        param: "subjectId"
      }))
    },
    {
      title: "Class (Supervisor)",
      param: "supervisorClass",
      options: classes.map(cls => ({
        value: cls.id.toString(),
        label: `${cls.name} (Grade ${cls.grade.level})`,
        param: "supervisorClass"
      }))
    },
    {
      title: "Gender",
      param: "sex",
      options: [
        { value: "MALE", label: "Male", param: "sex" },
        { value: "FEMALE", label: "Female", param: "sex" }
      ]
    }
  ];

  return (
    <div className="bg-white p-4 flex-1  w-full h-full">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          
          <div className="flex items-center gap-4 self-end">
            <FilterDropdown groups={filterGroups} />
            <SortDropdown options={sortOptions} />
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
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default TeacherListPage;
