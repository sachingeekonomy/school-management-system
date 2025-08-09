import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

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
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Debug logging for role detection
  console.log("Session claims:", sessionClaims);
  console.log("Detected role:", role);
  console.log("User ID:", currentUserId);

  // Fallback role detection - if role is not detected from session, try to get from user metadata
  let finalRole = role;
  if (!finalRole && currentUserId) {
    try {
      const user = await prisma.teacher.findUnique({
        where: { id: currentUserId },
        select: { id: true }
      });
      if (user) {
        finalRole = "teacher";
        console.log("Fallback: User found in teachers table, role set to teacher");
      } else {
        const adminUser = await prisma.student.findUnique({
          where: { id: currentUserId },
          select: { id: true }
        });
        if (!adminUser) {
          finalRole = "admin";
          console.log("Fallback: User not found in teachers/students, role set to admin");
        }
      }
    } catch (error) {
      console.error("Error in fallback role detection:", error);
      finalRole = "admin"; // Default to admin if there's an error
    }
  }

  console.log("Final role:", finalRole);

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
    ...(finalRole === "admin"
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
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>
          <p className="text-xs text-gray-400">Message #{item.id}</p>
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
          item.isRead ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {item.isRead ? "Read" : "Unread"}
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {finalRole === "admin" && (
            <>
              <FormContainer table="message" type="update" data={item} />
              <FormContainer table="message" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.MessageWhereInput = {};

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

  const data = dataRes.map((item) => ({
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

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Messages</h1>
        {/* Debug info - remove this after testing */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {finalRole === "admin" ? (
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
                  Send Message (Admin Only)
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
