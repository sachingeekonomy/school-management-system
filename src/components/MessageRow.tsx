"use client";

import { useState } from "react";
import MessageActions from "./MessageActions";

type MessageRowProps = {
  item: {
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
    recipients: Array<{
      recipientId: string;
      isRead: boolean;
    }>;
  };
  role: string;
  currentUserId: string;
};

const MessageRow = ({ item, role, currentUserId }: MessageRowProps) => {

  return (
    <tr
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
        }).format(new Date(item.date))}
      </td>
      <td className="hidden md:table-cell">
        <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
          item.isRead ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {item.isRead ? "✓ Read" : "● Unread"}
        </div>
      </td>
      <td>
        <MessageActions 
          item={item} 
          role={role} 
          currentUserId={currentUserId} 
        />
      </td>
    </tr>
  );
};

export default MessageRow;
