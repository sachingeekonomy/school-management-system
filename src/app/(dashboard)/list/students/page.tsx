import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import FilterDropdown from "@/components/FilterDropdown";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { getUserSession } from "@/lib/auth";

type StudentList = Student & { class: Class };

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await getUserSession();
  const role = session?.role;
  const userId = session?.id;

  // Debug logging
  console.log("Session:", session);
  console.log("Role:", role);

  // Fallback: if role is undefined, try to get from user data
  let finalRole = role;
  if (!finalRole) {
    finalRole = 'admin'; // Default to admin for now
  }

  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
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

  const renderRow = (item: StudentList) => (
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
          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.class.name[0]}</td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {finalRole === "admin" && (
            <>
              <FormContainer key={`student-update-${item.id}`} table="student" type="update" data={item} />
              <FormContainer key={`student-delete-${item.id}`} table="student" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.StudentWhereInput = {};

  // If user is a teacher, filter students to only show their students
  if (finalRole === 'teacher' && userId ) {
    query.class = {
      supervisorId: userId,
    };
  }
  
  // If user is a parent, filter students to only show their children
  if (finalRole === 'parent' && userId ) {
    query.parentId = userId;
  }

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

  // Handle filters and search
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "teacherId":
            query.class = {
              lessons: {
                some: {
                  teacherId: value,
                },
              },
            };
            break;
          case "classId":
            query.classId = parseInt(value);
            break;
          case "gradeId":
            query.gradeId = parseInt(value);
            break;
          case "sex":
            query.sex = value as any;
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
              { class: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count, classes, grades] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        class: {
          include: {
            grade: true,
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: query }),
    prisma.class.findMany({
      include: {
        grade: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.grade.findMany({
      orderBy: { level: 'asc' },
    }),
  ]);

  console.log("data>>",data);
  // Sort options for students
  const sortOptions = [
    { value: "name-asc", label: "Name (A-Z)", field: "name", direction: "asc" as const },
    { value: "name-desc", label: "Name (Z-A)", field: "name", direction: "desc" as const },
    { value: "email-asc", label: "Email (A-Z)", field: "email", direction: "asc" as const },
    { value: "email-desc", label: "Email (Z-A)", field: "email", direction: "desc" as const },
    { value: "createdAt-asc", label: "Oldest First", field: "createdAt", direction: "asc" as const },
    { value: "createdAt-desc", label: "Newest First", field: "createdAt", direction: "desc" as const },
  ];

  // Filter options for students
  const filterGroups = [
    {
      title: "Class",
      param: "classId",
      options: (() => {
        if (finalRole === 'teacher' && userId) {
          return classes.filter(cls => cls.supervisorId === userId);
        } else if (finalRole === 'parent' && userId) {
          // For parents, get classes where their children are enrolled
          const parentStudentClasses = data.map(student => student.class.id);
          return classes.filter(cls => parentStudentClasses.includes(cls.id));
        }
        return classes;
      })().map(cls => ({
        value: cls.id.toString(),
        label: `${cls.name} (Grade ${cls.grade.level})`,
        param: "classId"
      }))
    },
    {
      title: "Grade",
      param: "gradeId",
      options: grades.map(grade => ({
        value: grade.id.toString(),
        label: `Grade ${grade.level}`,
        param: "gradeId"
      }))
    },
    {
      title: "Gender",
      param: "sex",
      options: [
        { value: "MALE", label: "Male", param: "sex" },
        { value: "FEMALE", label: "Female", param: "sex" }
      ]
    },
    {
      title: "Blood Type",
      param: "bloodType",
      options: [
        { value: "A+", label: "A+", param: "bloodType" },
        { value: "A-", label: "A-", param: "bloodType" },
        { value: "B+", label: "B+", param: "bloodType" },
        { value: "B-", label: "B-", param: "bloodType" },
        { value: "AB+", label: "AB+", param: "bloodType" },
        { value: "AB-", label: "AB-", param: "bloodType" },
        { value: "O+", label: "O+", param: "bloodType" },
        { value: "O-", label: "O-", param: "bloodType" }
      ]
    }
  ];

  return (
    <div className="bg-white p-4 flex-1  w-full h-full">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="hidden md:block text-lg font-semibold">
            {finalRole === 'teacher' ? 'My Students' : 
             finalRole === 'parent' ? 'My Children' : 'All Students'}
          </h1>
          {(finalRole === 'teacher' || finalRole === 'parent') && (
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Filtered View
            </span>
          )}
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterDropdown groups={filterGroups} />
            <SortDropdown options={sortOptions} />
            {finalRole === "admin" ? (
              <div className="flex items-center gap-2">
                <FormContainer table="student" type="create" />
                <span className="text-sm font-medium text-green-600">Click + to add student</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Add Student (Admin Only)
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

export default StudentListPage;
