"use client";

import { announcementSchema, AnnouncementSchema } from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import InputField from "@/components/InputField";
import Image from "next/image";

const AnnouncementForm = ({
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
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Announcement has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((data) => {
    console.log("Submitting announcement data:", data);
    formAction(data);
  });

  const { classes } = relatedData || { classes: [] };

  return (
    <form className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto px-6 py-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b -mx-6 px-6">
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create a new announcement" : "Update the announcement"}
        </h1>
      
      </div>

      <div className="space-y-6">
        <div>
          <span className="text-xs text-gray-400 font-medium">Announcement Information</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <InputField 
              label="Title" 
              name="title" 
              defaultValue={data?.title} 
              register={register} 
              error={errors.title} 
            />
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs text-gray-500">Class (Optional)</label>
              <select 
                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full" 
                {...register("classId")} 
                defaultValue={data?.classId || ""}
              >
                <option value="">Select a class (optional)</option>
                {classes?.map((classItem: { id: number; name: string; grade: { level: number } }) => (
                  <option value={classItem.id} key={classItem.id}>
                    {classItem.name} - Grade {classItem.grade.level}
                  </option>
                ))}
              </select>
              {errors.classId?.message && (
                <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-medium">Announcement Details</span>
          <div className="mt-2">
            <InputField 
              label="Description" 
              name="description" 
              defaultValue={data?.description} 
              register={register} 
              error={errors.description}
              textarea
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-medium">Announcement Date</span>
          <div className="mt-2">
            <InputField 
              label="Date" 
              name="date" 
              type="datetime-local"
              defaultValue={data?.date ? new Date(data.date).toISOString().slice(0, 16) : ""} 
              register={register} 
              error={errors.date} 
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
          {type === "create" ? "Create Announcement" : "Update Announcement"}
        </button>
      </div>
    </form>
  );
};

export default AnnouncementForm;

