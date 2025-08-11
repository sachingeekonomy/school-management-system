"use client";

import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import InputField from "@/components/InputField";
import Image from "next/image";

const ResultForm = ({
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
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((data) => {
    console.log("Submitting result data:", data);
    formAction(data);
  });

  const { students, exams, assignments } = relatedData || { students: [], exams: [], assignments: [] };

  return (
    <form className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto px-6 py-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b -mx-6 px-6">
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create a new result" : "Update the result"}
        </h1>
      </div>
      <div className="space-y-6">
        <div>
          <span className="text-xs text-gray-400 font-medium">Result Information</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <InputField 
              label="Score (%)" 
              name="score" 
              type="number"
              min="0"
              max="100"
              defaultValue={data?.score} 
              register={register} 
              error={errors.score} 
            />
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
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-medium">Assessment Selection</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs text-gray-500">Exam (Optional)</label>
              <select 
                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full" 
                {...register("examId")} 
                defaultValue={data?.examId || ""}
              >
                <option value="">Select an exam (optional)</option>
                {exams?.map((exam: { id: number; title: string; lesson: { subject: { name: string }; class: { name: string } } }) => (
                  <option value={exam.id} key={exam.id}>
                    {exam.title} - {exam.lesson.subject.name} - {exam.lesson.class.name}
                  </option>
                ))}
              </select>
              {errors.examId?.message && (
                <p className="text-xs text-red-400">{errors.examId.message.toString()}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs text-gray-500">Assignment (Optional)</label>
              <select 
                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full" 
                {...register("assignmentId")} 
                defaultValue={data?.assignmentId || ""}
              >
                <option value="">Select an assignment (optional)</option>
                {assignments?.map((assignment: { id: number; title: string; lesson: { subject: { name: string }; class: { name: string } } }) => (
                  <option value={assignment.id} key={assignment.id}>
                    {assignment.title} - {assignment.lesson.subject.name} - {assignment.lesson.class.name}
                  </option>
                ))}
              </select>
              {errors.assignmentId?.message && (
                <p className="text-xs text-red-400">{errors.assignmentId.message.toString()}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Note: You must select either an exam or an assignment, but not both.
          </p>
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
          {type === "create" ? "Create Result" : "Update Result"}
        </button>
      </div>
    </form>
  );
};

export default ResultForm;

