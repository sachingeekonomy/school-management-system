import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import FilterDropdown from "@/components/FilterDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import { getUserRoleSync } from "@/lib/getUserRole";

type ClassList = Class & { supervisor: Teacher; grade: { level: number } };

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

// Get user role using the new robust function
const role = await getUserRoleSync();

console.log("User role determined:", role);


const columns = [
  {
    header: "Class Name",
    accessor: "name",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden md:table-cell",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Supervisor",
    accessor: "supervisor",
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

const renderRow = (item: ClassList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">{item.name}</td>
    <td className="hidden md:table-cell">{item.capacity}</td>
    <td className="hidden md:table-cell">Grade {item.grade.level}</td>
    <td className="hidden md:table-cell">
      {item.supervisor?.name + " " + item.supervisor?.surname}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" && (
          <>
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ClassWhereInput = {};

  // Handle sorting
  let orderBy: any = { id: 'asc' }; // Default sorting
  
  const { sort, order } = queryParams;
  if (sort && order) {
    switch (sort) {
      case 'name':
        orderBy = { name: order };
        break;
      case 'capacity':
        orderBy = { capacity: order };
        break;
      case 'grade':
        orderBy = { grade: { level: order } };
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
          case "supervisorId":
            query.supervisorId = value;
            break;
          case "gradeId":
            query.gradeId = parseInt(value);
            break;
          case "capacityRange":
            if (value === "small") {
              query.capacity = { lte: 20 };
            } else if (value === "medium") {
              query.capacity = { gte: 21, lte: 30 };
            } else if (value === "large") {
              query.capacity = { gte: 31 };
            }
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { supervisor: { name: { contains: value, mode: "insensitive" } } },
              { supervisor: { surname: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count, teachers, grades] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
        grade: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({ where: query }),
    prisma.teacher.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.grade.findMany({
      orderBy: { level: 'asc' },
    }),
  ]);

  // Sort options for classes
  const sortOptions = [
    { value: "name-asc", label: "Name (A-Z)", field: "name", direction: "asc" as const },
    { value: "name-desc", label: "Name (Z-A)", field: "name", direction: "desc" as const },
    { value: "capacity-asc", label: "Capacity (Low to High)", field: "capacity", direction: "asc" as const },
    { value: "capacity-desc", label: "Capacity (High to Low)", field: "capacity", direction: "desc" as const },
    { value: "grade-asc", label: "Grade (Low to High)", field: "grade", direction: "asc" as const },
    { value: "grade-desc", label: "Grade (High to Low)", field: "grade", direction: "desc" as const },
  ];

  // Filter options for classes
  const filterGroups = [
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
      title: "Supervisor",
      param: "supervisorId",
      options: teachers.map(teacher => ({
        value: teacher.id,
        label: `${teacher.name} ${teacher.surname}`,
        param: "supervisorId"
      }))
    },
    {
      title: "Capacity Range",
      param: "capacityRange",
      options: [
        { value: "small", label: "Small (≤20)", param: "capacityRange" },
        { value: "medium", label: "Medium (21-30)", param: "capacityRange" },
        { value: "large", label: "Large (≥31)", param: "capacityRange" }
      ]
    }
  ];

  return (
    <div className="bg-white p-4 flex-1  w-full h-full">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          
          <div className="flex items-center gap-4 self-end">
            <FilterDropdown groups={filterGroups} />
            <SortDropdown options={sortOptions} />
            {role === "admin" ? (
              <div className="flex items-center gap-2">
                <FormContainer table="class" type="create" />
                <span className="text-sm font-medium text-green-600">Click + to add class</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Add Class (Admin Only)
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

export default ClassListPage;
