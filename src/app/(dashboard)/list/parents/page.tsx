import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import FilterDropdown from "@/components/FilterDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import { getUserSession } from "@/lib/auth";

type ParentList = Parent & { students: Student[] };

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const session = await getUserSession();
const role = session?.role;

// Debug logging
console.log("Session:", session);
console.log("Role from metadata:", role);

// Fallback: if role is undefined, try to get from user data
let finalRole = role;
if (!finalRole) {
  // Default to admin for now since we don't have a specific admin table
  finalRole = 'admin';
}

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student Names",
    accessor: "students",
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

const renderRow = (item: ParentList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-xs text-gray-500">{item?.email}</p>
      </div>
    </td>
    <td className="hidden md:table-cell">
      {item.students.map((student) => student.name).join(", ")}
    </td>
    <td className="hidden lg:table-cell">{item.phone}</td>
    <td className="hidden lg:table-cell">{item.address}</td>
    <td>
      <div className="flex items-center gap-2">
        {finalRole === "admin" && (
          <>
            <FormContainer table="parent" type="update" data={item} />
            <FormContainer table="parent" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ParentWhereInput = {};

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
          case "studentCount":
            if (value === "0") {
              query.students = { none: {} };
            } else if (value === "1") {
              query.students = { some: {} };
            }
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { surname: { contains: value, mode: "insensitive" } },
              { email: { contains: value, mode: "insensitive" } },
              { phone: { contains: value, mode: "insensitive" } },
              { address: { contains: value, mode: "insensitive" } },
              { students: { some: { name: { contains: value, mode: "insensitive" } } } },
              { students: { some: { surname: { contains: value, mode: "insensitive" } } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: {
        students: {
          include: {
            class: true,
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
  ]);

  // Sort options for parents
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

  // Filter options for parents
  const filterGroups = [
    {
      title: "Student Count",
      param: "studentCount",
      options: [
        { value: "0", label: "No Students", param: "studentCount" },
        { value: "1", label: "Has Students", param: "studentCount" }
      ]
    }
  ];

  return (
    <div className="bg-white p-4 flex-1  w-full h-full">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterDropdown groups={filterGroups} />
            <SortDropdown options={sortOptions} />
            {finalRole === "admin" ? (
              <div className="flex items-center gap-2">
                <FormContainer table="parent" type="create" />
                <span className="text-sm font-medium text-green-600">Click + to add parent</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Add Parent (Admin Only)
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

export default ParentListPage;
