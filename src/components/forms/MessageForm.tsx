"use client";

import { messageSchema, MessageSchema } from "@/lib/formValidationSchemas";
import { createMessage, updateMessage } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InputField from "@/components/InputField";
import Image from "next/image";

const MessageForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  relatedData?: any;
}) => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<MessageSchema>({
    resolver: zodResolver(messageSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createMessage : updateMessage,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  // Fetch users based on role and search
  const fetchUsers = async (role: string, search: string = "") => {
    setIsLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (role) params.append("role", role);
      if (search) params.append("search", search);
      
      const response = await fetch(`/api/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch users when role or search changes
  useEffect(() => {
    if (selectedRole) {
      fetchUsers(selectedRole, searchQuery);
    } else {
      setUsers([]);
    }
  }, [selectedRole, searchQuery]);

  // Handle role selection
  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setSelectedUsers([]);
    setValue("receiverId", "");
  };

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      // Remove user if already selected
      const newSelectedUsers = selectedUsers.filter(id => id !== userId);
      setSelectedUsers(newSelectedUsers);
      setValue("recipientIds", newSelectedUsers);
      setValue("receiverId", newSelectedUsers[0] || "");
    } else {
      // Add user to selection
      const newSelectedUsers = [...selectedUsers, userId];
      setSelectedUsers(newSelectedUsers);
      setValue("recipientIds", newSelectedUsers);
      setValue("receiverId", newSelectedUsers[0] || "");
    }
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (state.success) {
      toast(`Message has been ${type === "create" ? "sent" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((data) => {
    console.log("Submitting message data:", data);
    formAction(data);
  });

  return (
    <form className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto px-6 py-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b -mx-6 px-6">
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Send a new message" : "Update the message"}
        </h1>
      </div>

      <div className="space-y-6">
        <div>
          <span className="text-xs text-gray-400 font-medium">Message Information</span>
          <div className="grid grid-cols-1 gap-4 mt-2">
            <InputField 
              label="Title" 
              name="title" 
              defaultValue={data?.title} 
              register={register} 
              error={errors.title} 
            />
            
            {/* Role Selection */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs text-gray-500">Recipient Type</label>
              <select 
                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full" 
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <option value="">Select recipient type</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
              </select>
            </div>

            {/* Search Input */}
            {selectedRole && (
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs text-gray-500">Search {selectedRole}s</label>
                <input
                  type="text"
                  placeholder={`Search ${selectedRole}s by name, surname, or username...`}
                  className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            )}

            {/* Users List */}
            {selectedRole && (
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs text-gray-500">Select Recipients (Click to select/deselect)</label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                  {isLoadingUsers ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                  ) : users.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedUsers.includes(user.id) ? "bg-blue-50 border-l-4 border-blue-500" : ""
                          }`}
                          onClick={() => handleUserSelect(user.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {user.name} {user.surname}
                              </p>
                              <p className="text-xs text-gray-500">
                                @{user.username} • {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                              </p>
                              {user.email && (
                                <p className="text-xs text-gray-400">{user.email}</p>
                              )}
                            </div>
                            {selectedUsers.includes(user.id) && (
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="p-4 text-center text-gray-500">
                      No {selectedRole}s found matching &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Start typing to search {selectedRole}s
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hidden fields */}
            <input
              type="hidden"
              {...register("receiverId")}
              value={selectedUsers[0] || ""}
            />
            <input
              type="hidden"
              {...register("recipientIds")}
              value={selectedUsers}
            />
            {errors.receiverId?.message && (
              <p className="text-xs text-red-400">{errors.receiverId.message.toString()}</p>
            )}
            
            {/* Selected recipients display */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs text-gray-500">Selected Recipients ({selectedUsers.length})</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
                  {users
                    .filter(user => selectedUsers.includes(user.id))
                    .map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        <span>{user.name} {user.surname}</span>
                        <button
                          type="button"
                          onClick={() => handleUserSelect(user.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-medium">Message Content</span>
          <div className="mt-2">
            <InputField 
              label="Content" 
              name="content" 
              defaultValue={data?.content} 
              register={register} 
              error={errors.content}
              textarea
            />
          </div>
        </div>

        {data && (
          <InputField 
            label="Id" 
            name="id" 
            defaultValue={data?.id} 
            register={register} 
            error={errors?.id} 
            hidden 
          />
        )}
      </div>

      {state.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm font-medium">
            Something went wrong!
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-end gap-3 pt-4 border-t -mx-6 px-6">
        <button 
          type="button" 
          onClick={() => setOpen(false)} 
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-6 py-2 bg-lamaSky text-white rounded-md hover:bg-lamaSky/90 transition-colors font-medium"
        >
          {type === "create" ? "Send Message" : "Update Message"}
        </button>
      </div>
    </form>
  );
};

export default MessageForm;

