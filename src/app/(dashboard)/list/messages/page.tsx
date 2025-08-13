import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import FilterDropdown from "@/components/FilterDropdown";
import MessageActions from "@/components/MessageActions";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";

import Image from "next/image";
import { getUserRoleSync } from "@/lib/getUserRole";
import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";

type MessageList = {
  id: number;
  title: string;
  content: string;
  date: Date;
  isRead: boolean;
  senderId: string;
  senderName: string;
  senderSurname: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverSurname: string;
  receiverRole: string;
};

const MessageListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Get user role using the new robust function
  const role = await getUserRoleSync();
  
  // Still need userId for role-based filtering
  const session = await getUserSession();
  const currentUserId = session?.id;

  // Redirect if user is not authenticated
  if (!currentUserId) {
    redirect("/sign-in");
  }

  console.log("User role determined:", role);

  const columns = [
    {
      header: "Message",
      accessor: "message",
    },
    {
      header: "From",
      accessor: "sender",
      className: "hidden md:table-cell",
    },
    {
      header: "To",
      accessor: "receiver",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden lg:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];



  const renderRow = (item: MessageList) => (
    <tr
      key={item.id}
      className={`border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight ${
        !item.isRead && item.receiverId === currentUserId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{item.title}</h3>
            {!item.isRead && item.receiverId === currentUserId && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
            )}
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        <div className="flex flex-col">
          <span className="font-medium">{item.senderName + " " + item.senderSurname}</span>
          <span className="text-xs text-gray-500">{item.senderRole}</span>
        </div>
      </td>
      <td className="hidden md:table-cell">
        <div className="flex flex-col">
          <span className="font-medium">{item.receiverName + " " + item.receiverSurname}</span>
          <span className="text-xs text-gray-500">{item.receiverRole}</span>
        </div>
      </td>
      <td className="hidden lg:table-cell">
        {new Intl.DateTimeFormat("en-US", { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(item.date)}
      </td>
      <td className="hidden md:table-cell">
        <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
          item.isRead ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {item.isRead ? "✓ Read" : "● Unread"}
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="message" type="update" data={item} />
              <FormContainer table="message" type="delete" id={item.id} />
            </>
          )}
                     {(role === "student" || role === "parent") && (
             <MessageActions 
               item={item} 
               role={role} 
               currentUserId={currentUserId!} 
             />
           )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: any = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { content: { contains: value, mode: "insensitive" } },
              { sender: { name: { contains: value, mode: "insensitive" } } },
              { sender: { surname: { contains: value, mode: "insensitive" } } },
              { receiver: { name: { contains: value, mode: "insensitive" } } },
              { receiver: { surname: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS - Users can see messages they sent or received
  query.OR = [
    { senderId: currentUserId! },
    { receiverId: currentUserId! },
  ];

  const [dataRes, count] = await prisma.$transaction([
    prisma.message.findMany({
      where: query,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            surname: true,
            role: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { id: 'desc' },
    }),
    prisma.message.count({ where: query }),
  ]);

  const data = dataRes.map((item: any) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    date: item.date,
    isRead: item.isRead,
    senderId: item.sender.id,
    senderName: item.sender.name,
    senderSurname: item.sender.surname,
    senderRole: item.sender.role,
    receiverId: item.receiver.id,
    receiverName: item.receiver.name,
    receiverSurname: item.receiver.surname,
    receiverRole: item.receiver.role,
  }));

  // Calculate unread count for current user
  const unreadCount = data.filter((item: any) => !item.isRead && item.receiverId === currentUserId).length;

  return (
    <div className="bg-white p-4 flex-1  w-full h-full">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          {role === "admin" || role === "teacher" ? "All Messages" : "My Messages"}
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </h1>
        {/* Debug info - remove this after testing */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterDropdown groups={[]} />
            <SortDropdown options={[
              { value: "date-desc", label: "Newest First", field: "date", direction: "desc" },
              { value: "date-asc", label: "Oldest First", field: "date", direction: "asc" },
              { value: "title-asc", label: "Title (A-Z)", field: "title", direction: "asc" },
              { value: "title-desc", label: "Title (Z-A)", field: "title", direction: "desc" }
            ]} />
            {role === "admin" || role === "teacher" ? (
              <div className="flex items-center gap-2">
                <FormContainer table="message" type="create" />
                <span className="text-sm font-medium text-green-600">Click + to send message</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Send Message (Teachers & Admins Only)
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

export default MessageListPage;
