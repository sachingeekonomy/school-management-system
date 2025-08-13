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
  recipients: Array<{
    recipientId: string;
    recipientName: string;
    recipientSurname: string;
    recipientRole: string;
    isRead: boolean;
  }>;
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
  console.log("Current user ID:", currentUserId);

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
      accessor: "recipients",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden lg:table-cell",
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

  const renderRow = (item: MessageList) => {
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{item.title}</h3>
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
          <div className="flex flex-col gap-1">
            {item.recipients.map((recipient, index) => (
              <div key={recipient.recipientId} className="flex items-center gap-2">
                <span className="font-medium">
                  {recipient.recipientName + " " + recipient.recipientSurname}
                </span>
                <span className="text-xs text-gray-500">({recipient.recipientRole})</span>
              </div>
            ))}
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
  };

  // Get pagination parameters
  const page = parseInt(searchParams.page || "1");
  const limit = ITEM_PER_PAGE;
  const skip = (page - 1) * limit;

  // Fetch messages based on user role
  let data: MessageList[] = [];
  let count = 0;

  try {
    if (role === "admin" || role === "teacher") {
      // Admins and teachers can see all messages
      const [messages, totalCount] = await Promise.all([
        prisma.message.findMany({
          include: {
            sender: true,
            recipients: {
              include: {
                recipient: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
          skip,
          take: limit,
        }),
        prisma.message.count(),
      ]);

      data = messages.map((message) => ({
        id: message.id,
        title: message.title,
        content: message.content,
        date: message.date,
        isRead: false, // This will be calculated per recipient
        senderId: message.senderId,
        senderName: message.sender.name,
        senderSurname: message.sender.surname,
        senderRole: message.sender.role,
        recipients: message.recipients.map((recipient) => ({
          recipientId: recipient.recipientId,
          recipientName: recipient.recipient.name,
          recipientSurname: recipient.recipient.surname,
          recipientRole: recipient.recipient.role,
          isRead: recipient.isRead,
        })),
      }));

             count = totalCount;
    } else {
      // Students and parents can only see messages where they are recipients
      const [userMessages, totalCount] = await Promise.all([
        prisma.messageRecipient.findMany({
          where: {
            recipientId: currentUserId!,
          },
          include: {
            message: {
              include: {
                sender: true,
                recipients: {
                  include: {
                    recipient: true,
                  },
                },
              },
            },
          },
          orderBy: {
            message: {
              date: "desc",
            },
          },
          skip,
          take: limit,
        }),
        prisma.messageRecipient.count({
          where: {
            recipientId: currentUserId!,
          },
        }),
      ]);

      data = userMessages.map((userMessage) => ({
        id: userMessage.message.id,
        title: userMessage.message.title,
        content: userMessage.message.content,
        date: userMessage.message.date,
        isRead: userMessage.isRead,
        senderId: userMessage.message.senderId,
        senderName: userMessage.message.sender.name,
        senderSurname: userMessage.message.sender.surname,
        senderRole: userMessage.message.sender.role,
        recipients: userMessage.message.recipients.map((recipient) => ({
          recipientId: recipient.recipientId,
          recipientName: recipient.recipient.name,
          recipientSurname: recipient.recipient.surname,
          recipientRole: recipient.recipient.role,
          isRead: recipient.isRead,
        })),
      }));

             count = totalCount;
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    // Keep data as empty array if there's an error
  }

  console.log("Fetched messages count:", data.length);
  console.log("Total count:", count);

  return (
    <div className="bg-white p-4 flex-1  w-full h-full">
      {/* TOP */}
      <div className="flex items-center justify-between">
                 <h1 className="hidden md:block text-lg font-semibold">
           {role === "admin" || role === "teacher" ? "All Messages" : "My Messages"}
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
      {data.length > 0 ? (
        <>
          <Table columns={columns} renderRow={renderRow} data={data} />
          <Pagination page={page} count={count} />
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No messages found.</p>
            <p className="text-sm text-gray-400">Try creating a new message to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageListPage;
