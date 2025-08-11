"use client";

import { messageSchema, MessageSchema } from "@/lib/formValidationSchemas";
import { createMessage, updateMessage } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
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

  const { users } = relatedData || { users: [] };

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
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs text-gray-500">To (Recipient)</label>
              <select 
                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full" 
                {...register("receiverId")} 
                defaultValue={data?.receiverId || ""}
              >
                <option value="">Select a recipient</option>
                {users?.map((user: { id: string; name: string; surname: string; role: string }) => (
                  <option value={user.id} key={user.id}>
                    {user.name} {user.surname} - {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              {errors.receiverId?.message && (
                <p className="text-xs text-red-400">{errors.receiverId.message.toString()}</p>
              )}
            </div>
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

