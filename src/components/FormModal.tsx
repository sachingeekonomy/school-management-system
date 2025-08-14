"use client";

import {
  deleteAnnouncement,
  deleteAssignment,
  deleteAttendance,
  deleteClass,
  deleteEvent,
  deleteExam,
  deleteLesson,
  deleteMessage,
  deleteParent,
  deletePayment,
  deleteResult,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState, useCallback } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  lesson: deleteLesson,
  parent: deleteParent,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteAttendance,
  event: deleteEvent,
  message: deleteMessage,
  announcement: deleteAnnouncement,
  payment: deletePayment,
// TODO: OTHER DELETE ACTIONS
};

// USE LAZY LOADING

// import TeacherForm from "./forms/TeacherForm";
// import StudentForm from "./forms/StudentForm";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
  loading: () => <h1>Loading...</h1>,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <h1>Loading...</h1>,
});
const MessageForm = dynamic(() => import("./forms/MessageForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <h1>Loading...</h1>,
});
// TODO: OTHER FORMS

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}     
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  attendance: (setOpen, type, data, relatedData) => (
    <AttendanceForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  message: (setOpen, type, data, relatedData) => (
    <MessageForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData: initialRelatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-10 h-10" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);
  const [relatedData, setRelatedData] = useState<any>(initialRelatedData || {});
  const [isLoading, setIsLoading] = useState(false);

  const fetchRelatedData = useCallback(async () => {
    setIsLoading(true);
    try {
      const dataMap: { [key: string]: string[] } = {
        student: ["grades", "classes", "parents"],
        subject: ["teachers"],
        class: ["teachers", "grades"],
        lesson: ["subjects", "classes", "teachers"],
        exam: ["lessons"],
        result: ["students", "exams", "assignments"],
        teacher: ["subjects"],
        assignment: ["lessons"],
        attendance: ["students", "lessons"],
        message: ["users"],
      };

      const requiredData = dataMap[table] || [];
      const fetchedData: any = {};

      // Fetch grades
      if (requiredData.includes("grades")) {
        try {
          const gradesResponse = await fetch("/api/grades");
          if (gradesResponse.ok) {
            fetchedData.grades = await gradesResponse.json();
          } else {
            fetchedData.grades = [];
          }
        } catch (error) {
          console.error("Error fetching grades:", error);
          fetchedData.grades = [];
        }
      }

      // Fetch classes
      if (requiredData.includes("classes")) {
        try {
          const classesResponse = await fetch("/api/classes");
          if (classesResponse.ok) {
            fetchedData.classes = await classesResponse.json();
          } else {
            fetchedData.classes = [];
          }
        } catch (error) {
          console.error("Error fetching classes:", error);
          fetchedData.classes = [];
        }
      }

      // Fetch parents
      if (requiredData.includes("parents")) {
        try {
          const parentsResponse = await fetch("/api/parents");
          if (parentsResponse.ok) {
            fetchedData.parents = await parentsResponse.json();
          } else {
            fetchedData.parents = [];
          }
        } catch (error) {
          console.error("Error fetching parents:", error);
          fetchedData.parents = [];
        }
      }

      // Fetch teachers
      if (requiredData.includes("teachers")) {
        try {
          const teachersResponse = await fetch("/api/teachers");
          if (teachersResponse.ok) {
            fetchedData.teachers = await teachersResponse.json();
          } else {
            fetchedData.teachers = [];
          }
        } catch (error) {
          console.error("Error fetching teachers:", error);
          fetchedData.teachers = [];
        }
      }

      // Fetch subjects
      if (requiredData.includes("subjects")) {
        try {
          const subjectsResponse = await fetch("/api/subjects");
          if (subjectsResponse.ok) {
            fetchedData.subjects = await subjectsResponse.json();
          } else {
            fetchedData.subjects = [];
          }
        } catch (error) {
          console.error("Error fetching subjects:", error);
          fetchedData.subjects = [];
        }
      }

      // Fetch lessons
      if (requiredData.includes("lessons")) {
        try {
          const lessonsResponse = await fetch("/api/lessons");
          if (lessonsResponse.ok) {
            const lessonsData = await lessonsResponse.json();
            console.log("Lessons data:", lessonsData);
            fetchedData.lessons = Array.isArray(lessonsData) ? lessonsData : [];
          } else {
            console.error("Lessons API error:", lessonsResponse.status);
            fetchedData.lessons = [];
          }
        } catch (error) {
          console.error("Error fetching lessons:", error);
          fetchedData.lessons = [];
        }
      }

      // Fetch students
      if (requiredData.includes("students")) {
        try {
          const studentsResponse = await fetch("/api/students");
          if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            console.log("Students data:", studentsData);
            fetchedData.students = Array.isArray(studentsData) ? studentsData : [];
          } else {
            console.error("Students API error:", studentsResponse.status);
            fetchedData.students = [];
          }
        } catch (error) {
          console.error("Error fetching students:", error);
          fetchedData.students = [];
        }
      }

      // Fetch exams
      if (requiredData.includes("exams")) {
        try {
          const examsResponse = await fetch("/api/exams");
          if (examsResponse.ok) {
            fetchedData.exams = await examsResponse.json();
          } else {
            fetchedData.exams = [];
          }
        } catch (error) {
          console.error("Error fetching exams:", error);
          fetchedData.exams = [];
        }
      }

      // Fetch assignments
      if (requiredData.includes("assignments")) {
        try {
          const assignmentsResponse = await fetch("/api/assignments");
          if (assignmentsResponse.ok) {
            fetchedData.assignments = await assignmentsResponse.json();
          } else {
            fetchedData.assignments = [];
          }
        } catch (error) {
          console.error("Error fetching assignments:", error);
          fetchedData.assignments = [];
        }
      }

      // Fetch users
      if (requiredData.includes("users")) {
        try {
          const usersResponse = await fetch("/api/users");
          if (usersResponse.ok) {
            fetchedData.users = await usersResponse.json();
          } else {
            fetchedData.users = [];
          }
        } catch (error) {
          console.error("Error fetching users:", error);
          fetchedData.users = [];
        }
      }

      console.log("Final relatedData:", fetchedData);
      setRelatedData(fetchedData);
    } catch (error) {
      console.error("Error fetching related data:", error);
      setRelatedData({});
    } finally {
      setIsLoading(false);
    }
  }, [table]);

  // Fetch related data when form opens
  useEffect(() => {
    if (open && (type === "create" || type === "update")) {
      fetchRelatedData();
    }
  }, [open, table, type, fetchRelatedData]);

  const Form = () => {
    const [state, formAction] = useFormState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast(`${table} has been deleted!`);
        setOpen(false);
        router.refresh();
      }
    }, [state, router]);

    return type === "delete" && id ? (
      <form action={formAction} className="p-4 flex flex-col gap-4">
        <input type="hidden" name="id" value={id} />
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
          Delete
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData)
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
        title={`${type} ${table}`}
      >
        {type === "create" ? (
          <div className="text-white font-bold text-xl">+</div>
        ) : (
          <Image src={`/${type}.png`} alt="" width={16} height={16} />
        )}
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md relative w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">
                {type === "create" ? `Create ${table}` : type === "update" ? `Update ${table}` : `Delete ${table}`}
              </h2>
              <div
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => setOpen(false)}
              >
                <Image src="/close.png" alt="" width={14} height={14} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Form />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
