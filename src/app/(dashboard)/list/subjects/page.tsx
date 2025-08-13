import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import FilterDropdown from "@/components/FilterDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { getUserSession } from "@/lib/auth";

type SubjectList = Subject & { teachers: Teacher[] };

const SubjectListPage = async ({
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
    console.warn('No role found in session for subjects page');
    // Default to student for safety - they have minimal access
    finalRole = 'student';
  }

  const columns = [
    {
      header: "Subject Name",
      accessor: "name",
    },
    {
      header: "Teachers",
      accessor: "teachers",
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

  const renderRow = (item: SubjectList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">
        {item.teachers.map((teacher) => teacher.name).join(",")}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {finalRole === "admin" && (
            <>
              <FormContainer table="subject" type="update" data={item} />
              <FormContainer table="subject" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.SubjectWhereInput = {};

  // Handle sorting
  let orderBy: any = { id: 'asc' }; // Default sorting
  
  const { sort, order } = queryParams;
  if (sort && order) {
    switch (sort) {
      case 'name':
        orderBy = { name: order };
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
          case "teacherCount":
            if (value === "0") {
              query.teachers = { none: {} };
            } else if (value === "1") {
              query.teachers = { some: {} };
            }
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { teachers: { some: { name: { contains: value, mode: "insensitive" } } } },
              { teachers: { some: { surname: { contains: value, mode: "insensitive" } } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: {
        teachers: true,
        _count: {
          select: {
            teachers: true,
            lessons: true,
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.subject.count({ where: query }),
  ]);

  // Sort options for subjects
  const sortOptions = [
    { value: "name-asc", label: "Name (A-Z)", field: "name", direction: "asc" as const },
    { value: "name-desc", label: "Name (Z-A)", field: "name", direction: "desc" as const },
  ];

  // Filter options for subjects
  const filterGroups = [
    {
      title: "Teacher Count",
      param: "teacherCount",
      options: [
        { value: "0", label: "No Teachers", param: "teacherCount" },
        { value: "1", label: "Has Teachers", param: "teacherCount" }
      ]
    }
  ];

  return (
    <div className="bg-white p-4 flex-1  w-full h-full">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Subjects</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterDropdown groups={filterGroups} />
            <SortDropdown options={sortOptions} />
            {finalRole === "admin" ? (
              <div className="flex items-center gap-2">
                <FormContainer table="subject" type="create" />
                <span className="text-sm font-medium text-green-600">Click + to add subject</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Add Subject (Admin Only)
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

export default SubjectListPage;
