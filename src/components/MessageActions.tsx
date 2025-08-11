"use client";

import { useState } from "react";

type MessageActionsProps = {
  item: {
    id: number;
    isRead: boolean;
    receiverId: string;
  };
  role: string;
  currentUserId: string;
};

const MessageActions = ({ item, role, currentUserId }: MessageActionsProps) => {
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkAsRead = async () => {
    if (isMarking) return;
    
    setIsMarking(true);
    try {
      const response = await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: item.id })
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Failed to mark message as read');
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {(role === "student" || role === "parent") && !item.isRead && item.receiverId === currentUserId && (
        <button
          onClick={handleMarkAsRead}
          disabled={isMarking}
          className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMarking ? "Marking..." : "Mark as Read"}
        </button>
      )}
    </div>
  );
};

export default MessageActions;
