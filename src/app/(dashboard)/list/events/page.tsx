import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import FilterDropdown from "@/components/FilterDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import { getUserRoleSync } from "@/lib/getUserRole";
import { getUserSession } from "@/lib/auth";

type EventList = Event & { class: Class & { grade: { level: number } } };

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  // Get user role using the new robust function
  const role = await getUserRoleSync();
  
  // Still need userId for role-based filtering
  const session = await getUserSession();
  const currentUserId = session?.id;

  console.log("User role determined:", role);

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Description",
      accessor: "description",
      className: "hidden lg:table-cell",
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
    {
      header: "Start Time",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "End Time",
      accessor: "endTime",
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

  const renderRow = (item: EventList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.title}</h3>
        </div>
      </td>
      <td className="hidden lg:table-cell">
        <div className="flex flex-col">
          <span className="text-sm text-gray-700 max-w-xs truncate" title={item.description}>
            {item.description}
          </span>
        </div>
      </td>
      <td>
        <div className="flex flex-col">
          <span className="font-medium">{item.class?.name || "All Classes"}</span>
          <span className="text-xs text-gray-500">{item.class?.grade?.level ? `Grade ${item.class.grade.level}` : "General Event"}</span>
        </div>
      </td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US", { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        }).format(item.startTime)}
      </td>
      <td className="hidden md:table-cell">
        <div className="flex flex-col">
          <span className="font-medium">
            {item.startTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
          <span className="text-xs text-gray-500">Start</span>
        </div>
      </td>
      <td className="hidden md:table-cell">
        <div className="flex flex-col">
          <span className="font-medium">
            {item.endTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
          <span className="text-xs text-gray-500">End</span>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="event" type="update" data={item} />
              <FormContainer table="event" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { description: { contains: value, mode: "insensitive" } },
              { class: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS - Only apply filtering for non-admin users
  if (role !== "admin") {
    if (role === "teacher") {
      // Teachers can see events for classes they teach
      query.OR = [
        { classId: null }, // General events
        {
          class: {
            lessons: {
              some: {
                teacherId: currentUserId!
              }
            }
          }
        }
      ];
    } else if (role === "student") {
      // Students can see events for their class and general events
      query.OR = [
        { classId: null }, // General events
        {
          class: {
            students: {
              some: {
                id: currentUserId!
              }
            }
          }
        }
      ];
    } else if (role === "parent") {
      // Parents can see events for classes their children are in
      query.OR = [
        { classId: null }, // General events
        {
          class: {
            students: {
              some: {
                parentId: currentUserId!
              }
            }
          }
        }
      ];
    }
  }

  // Debug logging
  console.log("Event query:", JSON.stringify(query, null, 2));
  console.log("User role:", role);
  console.log("Current user ID:", currentUserId);

  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: {
        class: {
          include: {
            grade: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.event.count({ where: query }),
  ]);

  console.log("Events found:", data.length);
  console.log("Total count:", count);

  return (
    <div className="bg-white p-4 flex-1  w-full h-full">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
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
                <FormContainer table="event" type="create" />
                <span className="text-sm font-medium text-green-600">Click + to add event</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Add Event (Admin Only)
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

export default EventListPage;
