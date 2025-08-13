"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
  });

  // AFTER REACT 19 IT'LL BE USEACTIONSTATE

  const [state, formAction] = useFormState(
    type === "create" ? createSubject : updateSubject,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8 p-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new subject" : "Update the subject"}
      </h1>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Subject name"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
          />
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
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Assign Teachers</label>
          <p className="text-xs text-gray-500 mb-2">Select one or more teachers to assign to this subject:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-40 overflow-y-auto p-3 border border-gray-300 rounded-md bg-gray-50">
            {teachers?.map(
              (teacher: { id: string; name: string; surname: string }) => (
                <label key={teacher.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-2 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    value={teacher.id}
                    {...register("teachers")}
                    defaultChecked={data?.teachers?.some((t: any) => t.id === teacher.id || t === teacher.id)}
                    className="form-checkbox h-4 w-4 text-lamaSky rounded focus:ring-2 focus:ring-lamaSky focus:ring-offset-2"
                  />
                  <span className="font-medium">{teacher.name + " " + teacher.surname}</span>
                </label>
              )
            )}
          </div>
          {errors.teachers?.message && (
            <p className="text-xs text-red-400 mt-1">
              {errors.teachers.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-lamaSky text-white p-3 rounded-md font-medium hover:bg-lamaSky/90 transition-colors">
        {type === "create" ? "Create Subject" : "Update Subject"}
      </button>
    </form>
  );
};

export default SubjectForm;
