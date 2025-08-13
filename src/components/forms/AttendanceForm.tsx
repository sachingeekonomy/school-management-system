"use client";

import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import InputField from "@/components/InputField";
import Image from "next/image";

const AttendanceForm = ({
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
    reset,
    setValue,
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      id: data?.id,
      studentId: data?.studentId || "",
      lessonId: data?.lessonId,
      present: data?.present,
    },
  });

  // Watch the present value to make radio buttons controlled
  const presentValue = watch("present");

  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Attendance has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Reset form when data changes (for updates)
  useEffect(() => {
    if (data && type === "update") {
      reset({
        id: data.id,
        studentId: data.studentId,
        lessonId: data.lessonId,
        present: data.present,
      });
    }
  }, [data, type, reset]);

  const onSubmit = handleSubmit((data) => {
    console.log("Submitting attendance data:", data);
    // Convert present from string to boolean
    const formData = {
      ...data,
      present: String(data.present) === "true"
    };
    console.log("Processed form data:", formData);
    formAction(formData);
  });

  const { students = [], lessons = [] } = relatedData || {};

  // Debug logging
  console.log("AttendanceForm - type:", type);
  console.log("AttendanceForm - data:", data);
  console.log("AttendanceForm - relatedData:", relatedData);

  // Show loading state if data is not yet loaded
  if (!relatedData || Object.keys(relatedData).length === 0) {
    return (
      <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b -mx-6 px-6">
          <h1 className="text-xl font-semibold">
            {type === "create" ? "Create a new attendance record" : "Update the attendance record"}
          </h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading form data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto px-6 py-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b -mx-6 px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">
            {type === "create" ? "Create a new attendance record" : "Update the attendance record"}
          </h1>
          {/* Show filtered indicator for teachers */}
          {students.length > 0 && students.length < 100 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Filtered View
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <span className="text-xs text-gray-400 font-medium">Attendance Information</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs text-gray-500">Student</label>
              <select 
                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full" 
                {...register("studentId")} 
              >
                <option value="">Select a student</option>
                {students?.map((student: { id: string; name: string; surname: string; class: { name: string } }) => (
                  <option value={student.id} key={student.id}>
                    {student.name} {student.surname} - {student.class.name}
                  </option>
                ))}
              </select>
              {errors.studentId?.message && (
                <p className="text-xs text-red-400">{errors.studentId.message.toString()}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs text-gray-500">Lesson</label>
              <select 
                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full" 
                {...register("lessonId")} 
              >
                <option value="">Select a lesson</option>
                {lessons?.map((lesson: { id: number; name: string; day: string; subject: { name: string }; class: { name: string } }) => (
                  <option value={lesson.id} key={lesson.id}>
                    {lesson.name} - {lesson.subject.name} - {lesson.class.name} ({lesson.day})
                  </option>
                ))}
              </select>
              {errors.lessonId?.message && (
                <p className="text-xs text-red-400">{errors.lessonId.message.toString()}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-medium">Attendance Status</span>
                     <div className="mt-2">
             <div className="flex items-center gap-4">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input
                   type="radio"
                   value="true"
                   checked={String(presentValue) === "true"}
                   onChange={(e) => setValue("present", e.target.value === "true")}
                   className="w-4 h-4 text-lamaSky bg-gray-100 border-gray-300 focus:ring-lamaSky"
                 />
                 <span className="text-sm font-medium text-green-700">Present</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input
                   type="radio"
                   value="false"
                   checked={String(presentValue) === "false"}
                   onChange={(e) => setValue("present", e.target.value === "true")}
                   className="w-4 h-4 text-lamaSky bg-gray-100 border-gray-300 focus:ring-lamaSky"
                 />
                 <span className="text-sm font-medium text-red-700">Absent</span>
               </label>
             </div>
            {errors.present?.message && (
              <p className="text-xs text-red-400 mt-1">{errors.present.message.toString()}</p>
            )}
          </div>
        </div>

        {/* Hidden field for ID when updating */}
        {data && (
          <input type="hidden" {...register("id")} />
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
          {type === "create" ? "Create Attendance" : "Update Attendance"}
        </button>
      </div>
    </form>
  );
};

export default AttendanceForm;
