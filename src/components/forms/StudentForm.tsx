"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  studentSchema,
  StudentSchema,
  teacherSchema,
  TeacherSchema,
} from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import {
  createStudent,
  createTeacher,
  updateStudent,
  updateTeacher,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";


const StudentForm = ({
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
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [img, setImg] = useState<string>("");

  const [state, formAction] = useFormState(
    type === "create" ? createStudent : updateStudent,
    {
      success: false,
      error: false,
      message: "",
    }
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImg(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = handleSubmit((data) => {
    console.log("hello");
    console.log(data);
    formAction({ ...data, img: img });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { grades, classes, parents } = relatedData;

  return (
    <form className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto px-6 py-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b -mx-6 px-6">
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create a new student" : "Update the student"}
        </h1>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Image src="/close.png" alt="Close" width={16} height={16} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <InputField
              label="Username"
              name="username"
              defaultValue={data?.username}
              register={register}
              error={errors?.username}
            />
            <InputField
              label="Email"
              name="email"
              defaultValue={data?.email}
              register={register}
              error={errors?.email}
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              defaultValue={data?.password}
              register={register}
              error={errors?.password}
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-medium">Personal Information</span>
          <div className="mt-2">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs text-gray-500">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-lamaSky file:text-white hover:file:bg-lamaSky/90 file:cursor-pointer"
                />
              </div>
              {img && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image src={img} alt="Preview" width={64} height={64} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
              <div>
          <span className="text-xs text-gray-400 font-medium">Basic Information</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <InputField
              label="First Name"
              name="name"
              defaultValue={data?.name}
              register={register}
              error={errors.name}
            />
            <InputField
              label="Last Name"
              name="surname"
              defaultValue={data?.surname}
              register={register}
              error={errors.surname}
            />
          </div>
        </div>
        
        <div>
          <span className="text-xs text-gray-400 font-medium">Contact Information</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <InputField
              label="Phone"
              name="phone"
              defaultValue={data?.phone}
              register={register}
              error={errors.phone}
            />
            <InputField
              label="Address"
              name="address"
              defaultValue={data?.address}
              register={register}
              error={errors.address}
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-medium">Additional Details</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <InputField
              label="Blood Type"
              name="bloodType"
              defaultValue={data?.bloodType}
              register={register}
              error={errors.bloodType}
            />
            <InputField
              label="Birthday"
              name="birthday"
              defaultValue={data?.birthday.toISOString().split("T")[0]}
              register={register}
              error={errors.birthday}
              type="date"
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-medium">Relationships</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs text-gray-500">Parent</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full"
                {...register("parentId")}
                defaultValue={data?.parentId}
              >
                <option value="">Select a parent</option>
                {parents?.map((parent: { id: string; name: string; surname: string }) => (
                  <option value={parent.id} key={parent.id}>
                    {parent.name} {parent.surname}
                  </option>
                ))}
              </select>
              {errors.parentId?.message && (
                <p className="text-xs text-red-400">
                  {errors.parentId.message.toString()}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs text-gray-500">Sex</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full"
                {...register("sex")}
                defaultValue={data?.sex}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {errors.sex?.message && (
                <p className="text-xs text-red-400">
                  {errors.sex.message.toString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-medium">Academic Information</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs text-gray-500">Grade</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full"
                {...register("gradeId")}
                defaultValue={data?.gradeId}
              >
                <option value="">Select a grade</option>
                {grades.map((grade: { id: number; level: number }) => (
                  <option value={grade.id} key={grade.id}>
                    Grade {grade.level}
                  </option>
                ))}
              </select>
              {errors.gradeId?.message && (
                <p className="text-xs text-red-400">
                  {errors.gradeId.message.toString()}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs text-gray-500">Class</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full"
                {...register("classId")}
                defaultValue={data?.classId}
              >
                <option value="">Select a class</option>
                {classes.map(
                  (classItem: {
                    id: number;
                    name: string;
                    capacity: number;
                    _count: { students: number };
                  }) => (
                    <option value={classItem.id} key={classItem.id}>
                      {classItem.name} ({classItem._count.students}/{classItem.capacity} students)
                    </option>
                  )
                )}
              </select>
              {errors.classId?.message && (
                <p className="text-xs text-red-400">
                  {errors.classId.message.toString()}
                </p>
              )}
            </div>
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
          {type === "create" ? "Create Student" : "Update Student"}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
