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
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
  });

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

  const onSubmit = handleSubmit((data) => {
    console.log("Submitting attendance data:", data);
    formAction(data);
  });

  const { students, lessons } = relatedData || { students: [], lessons: [] };

  return (
    <form className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto px-6 py-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b -mx-6 px-6">
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create a new attendance record" : "Update the attendance record"}
        </h1>
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
                defaultValue={data?.studentId}
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
                defaultValue={data?.lessonId}
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
                   {...register("present", { 
                     setValueAs: (value) => value === "true" 
                   })}
                   defaultChecked={data?.present === true}
                   className="w-4 h-4 text-lamaSky bg-gray-100 border-gray-300 focus:ring-lamaSky"
                 />
                 <span className="text-sm font-medium text-green-700">Present</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input
                   type="radio"
                   value="false"
                   {...register("present", { 
                     setValueAs: (value) => value === "true" 
                   })}
                   defaultChecked={data?.present === false}
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
            {state.message || "Something went wrong!"}
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
