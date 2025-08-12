import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import FilterDropdown from "@/components/FilterDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { getUserSession } from "@/lib/auth";

type LessonList = Lesson & { subject: Subject } & { class: Class } & {
  teacher: Teacher;
};


const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const session = await getUserSession();
const role = session?.role;

// Debug logging
console.log("Session:", session);
console.log("Role:", role);

// Fallback: if role is undefined, try to get from user data
let finalRole = role;
if (!finalRole) {
  // Default to admin for now since we don't have a specific admin table
  finalRole = 'admin';
}


const columns = [
  {
    header: "Subject Name",
    accessor: "name",
  },
  {
    header: "Class",
    accessor: "class",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
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

const renderRow = (item: LessonList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
    <td>{item.class.name}</td>
    <td className="hidden md:table-cell">
      {item.teacher.name + " " + item.teacher.surname}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {finalRole === "admin" && (
          <>
            <FormContainer table="lesson" type="update" data={item} />
            <FormContainer table="lesson" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.LessonWhereInput = {};

  // Handle sorting
  let orderBy: any = { id: 'asc' }; // Default sorting
  
  const { sort, order } = queryParams;
  if (sort && order) {
    switch (sort) {
      case 'name':
        orderBy = { name: order };
        break;
      case 'day':
        orderBy = { day: order };
        break;
      case 'startTime':
        orderBy = { startTime: order };
        break;
      case 'subject':
        orderBy = { subject: { name: order } };
        break;
      case 'class':
        orderBy = { class: { name: order } };
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
          case "classId":
            query.classId = parseInt(value);
            break;
          case "teacherId":
            query.teacherId = value;
            break;
          case "subjectId":
            query.subjectId = parseInt(value);
            break;
          case "day":
            query.day = value as any;
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { class: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { surname: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count, subjects, classes, teachers] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { name: true, id: true } },
        class: { select: { name: true, id: true } },
        teacher: { select: { name: true, surname: true, id: true } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
    prisma.subject.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.class.findMany({
      include: { grade: true },
      orderBy: { name: 'asc' },
    }),
    prisma.teacher.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  // Sort options for lessons
  const sortOptions = [
    { value: "name-asc", label: "Name (A-Z)", field: "name", direction: "asc" as const },
    { value: "name-desc", label: "Name (Z-A)", field: "name", direction: "desc" as const },
    { value: "day-asc", label: "Day (Mon-Fri)", field: "day", direction: "asc" as const },
    { value: "day-desc", label: "Day (Fri-Mon)", field: "day", direction: "desc" as const },
    { value: "startTime-asc", label: "Start Time (Early-Late)", field: "startTime", direction: "asc" as const },
    { value: "startTime-desc", label: "Start Time (Late-Early)", field: "startTime", direction: "desc" as const },
    { value: "subject-asc", label: "Subject (A-Z)", field: "subject", direction: "asc" as const },
    { value: "subject-desc", label: "Subject (Z-A)", field: "subject", direction: "desc" as const },
  ];

  // Filter options for lessons
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
      title: "Class",
      param: "classId",
      options: classes.map(cls => ({
        value: cls.id.toString(),
        label: `${cls.name} (Grade ${cls.grade.level})`,
        param: "classId"
      }))
    },
    {
      title: "Teacher",
      param: "teacherId",
      options: teachers.map(teacher => ({
        value: teacher.id,
        label: `${teacher.name} ${teacher.surname}`,
        param: "teacherId"
      }))
    },
    {
      title: "Day",
      param: "day",
      options: [
        { value: "MONDAY", label: "Monday", param: "day" },
        { value: "TUESDAY", label: "Tuesday", param: "day" },
        { value: "WEDNESDAY", label: "Wednesday", param: "day" },
        { value: "THURSDAY", label: "Thursday", param: "day" },
        { value: "FRIDAY", label: "Friday", param: "day" }
      ]
    }
  ];

  return (
    <div className="bg-white p-4 flex-1  w-full h-full">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterDropdown groups={filterGroups} />
            <SortDropdown options={sortOptions} />
            {finalRole === "admin" ? (
              <div className="flex items-center gap-2">
                <FormContainer table="lesson" type="create" />
                <span className="text-sm font-medium text-green-600">Click + to add lesson</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Add Lesson (Admin Only)
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

export default LessonListPage;
