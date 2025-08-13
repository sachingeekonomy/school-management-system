"use client";

import { useState, useEffect, memo } from "react";
import FormModal from "./FormModal";
import PaymentForm from "./forms/PaymentForm";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "message"
    | "payment"
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = memo(({ table, type, data, id }: FormContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [relatedData, setRelatedData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Fetch related data when form opens
  useEffect(() => {
    if (isOpen && (type === "create" || type === "update")) {
      fetchRelatedData();
    }
  }, [isOpen, table, type]);

  const fetchRelatedData = async () => {
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
            fetchedData.lessons = await lessonsResponse.json();
          } else {
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
            fetchedData.students = await studentsResponse.json();
          } else {
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

      setRelatedData(fetchedData);
    } catch (error) {
      console.error("Error fetching related data:", error);
      setRelatedData({});
    } finally {
      setIsLoading(false);
    }
  };

  // For payment forms, render directly without modal
  if (table === "payment") {
    return (
      <div className="inline-block">
        <button
          onClick={handleClick}
          className={`w-7 h-7 flex items-center justify-center rounded-full ${
            type === "create"
              ? "bg-green-500 hover:bg-green-600"
              : type === "update"
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          <img
            src={
              type === "create"
                ? "/create.png"
                : type === "update"
                ? "/update.png"
                : "/delete.png"
            }
            alt=""
            width={16}
            height={16}
          />
        </button>
        {isOpen && (
          <PaymentForm type={type} data={data} onClose={handleClose} />
        )}
      </div>
    );
  }

  // For all other forms, use the existing FormModal
  return (
    <div className="inline-block">
      <button
        onClick={handleClick}
        className={`w-7 h-7 flex items-center justify-center rounded-full ${
          type === "create"
            ? "bg-green-500 hover:bg-green-600"
            : type === "update"
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-red-500 hover:bg-red-600"
        }`}
      >
        <img
          src={
            type === "create"
              ? "/create.png"
              : type === "update"
              ? "/update.png"
              : "/delete.png"
          }
          alt=""
          width={16}
          height={16}
        />
      </button>
      {isOpen && (
        <FormModal
          table={table}
          type={type}
          data={data}
          id={id}
          relatedData={relatedData}
        />
      )}
    </div>
  );
});

FormContainer.displayName = 'FormContainer';

export default FormContainer;
