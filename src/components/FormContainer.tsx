import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

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
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;
  
  // Fallback role detection - if role is not detected from session, try to get from user metadata
  let finalRole = role;
  if (!finalRole && currentUserId) {
    try {
      const user = await prisma.teacher.findUnique({
        where: { id: currentUserId },
        select: { id: true }
      });
      if (user) {
        finalRole = "teacher";
      } else {
        const adminUser = await prisma.student.findUnique({
          where: { id: currentUserId },
          select: { id: true }
        });
        if (!adminUser) {
          finalRole = "admin";
        }
      }
    } catch (error) {
      console.error("Error in fallback role detection:", error);
      finalRole = "admin"; // Default to admin if there's an error
    }
  }

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        const studentParents = await prisma.parent.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { classes: studentClasses, grades: studentGrades, parents: studentParents };
        break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(finalRole === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;
      case "lesson":
        const lessonSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const lessonClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        const lessonTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { subjects: lessonSubjects, classes: lessonClasses, teachers: lessonTeachers };
        break;
      case "assignment":
        const assignmentLessons = await prisma.lesson.findMany({
          where: {
            ...(finalRole === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          include: {
            subject: { select: { name: true } },
            class: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
          },
        });
        relatedData = { lessons: assignmentLessons };
        break;
      case "result":
        const resultStudents = await prisma.student.findMany({
          include: {
            class: { select: { name: true } },
          },
        });
        const resultExams = await prisma.exam.findMany({
          include: {
            lesson: {
              include: {
                subject: { select: { name: true } },
                class: { select: { name: true } },
              },
            },
          },
        });
        const resultAssignments = await prisma.assignment.findMany({
          include: {
            lesson: {
              include: {
                subject: { select: { name: true } },
                class: { select: { name: true } },
              },
            },
          },
        });
        relatedData = { students: resultStudents, exams: resultExams, assignments: resultAssignments };
        break;
      case "attendance":
        const attendanceStudents = await prisma.student.findMany({
          include: {
            class: { select: { name: true } },
          },
        });
        const attendanceLessons = await prisma.lesson.findMany({
          include: {
            subject: { select: { name: true } },
            class: { select: { name: true } },
          },
        });
        relatedData = { students: attendanceStudents, lessons: attendanceLessons };
        break;
      case "event":
        const eventClasses = await prisma.class.findMany({
          include: {
            grade: { select: { level: true } },
          },
        });
        relatedData = { classes: eventClasses };
        break;
      case "message":
        const messageUsers = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
            role: true,
          },
        });
        relatedData = { users: messageUsers };
        break;
      case "announcement":
        const announcementClasses = await prisma.class.findMany({
          include: {
            grade: { select: { level: true } },
          },
        });
        relatedData = { classes: announcementClasses };
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
