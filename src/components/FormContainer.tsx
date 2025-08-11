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
    | "announcement"
    | "message"
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
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
        // Only teachers and admins can send messages
        if (finalRole !== "admin" && finalRole !== "teacher") {
          relatedData = { users: [] };
          break;
        }

        // Filter users based on current user's role for messaging
        let allowedRoles: string[] = [];
        
        switch (finalRole) {
          case "admin":
            // Admin can message everyone
            allowedRoles = ["admin", "teacher", "student", "parent"];
            break;
          case "teacher":
            // Teachers can message students, parents, and other teachers
            allowedRoles = ["teacher", "student", "parent"];
            break;
          default:
            // Default to admin permissions
            allowedRoles = ["admin", "teacher", "student", "parent"];
        }

        // Fetch users from different tables based on allowed roles
        const messageUsers: any[] = [];

        // Fetch teachers if allowed
        if (allowedRoles.includes("teacher")) {
          const teachers = await prisma.teacher.findMany({
            where: {
              id: {
                not: currentUserId!,
              },
            },
            select: {
              id: true,
              name: true,
              surname: true,
            },
            orderBy: [
              { name: 'asc' },
              { surname: 'asc' }
            ],
          });
          messageUsers.push(...teachers.map((teacher: any) => ({ ...teacher, role: "TEACHER" })));
        }

        // Fetch students if allowed
        if (allowedRoles.includes("student")) {
          const students = await prisma.student.findMany({
            where: {
              id: {
                not: currentUserId!,
              },
            },
            select: {
              id: true,
              name: true,
              surname: true,
            },
            orderBy: [
              { name: 'asc' },
              { surname: 'asc' }
            ],
          });
          messageUsers.push(...students.map((student: any) => ({ ...student, role: "STUDENT" })));
        }

        // Fetch parents if allowed
        if (allowedRoles.includes("parent")) {
          const parents = await prisma.parent.findMany({
            where: {
              id: {
                not: currentUserId!,
              },
            },
            select: {
              id: true,
              name: true,
              surname: true,
            },
            orderBy: [
              { name: 'asc' },
              { surname: 'asc' }
            ],
          });
          messageUsers.push(...parents.map((parent: any) => ({ ...parent, role: "PARENT" })));
        }

        // Fetch admins if allowed (for now, we'll use a placeholder since admin table is minimal)
        if (allowedRoles.includes("admin")) {
          const admins = await prisma.admin.findMany({
            where: {
              id: {
                not: currentUserId!,
              },
            },
            select: {
              id: true,
              username: true,
            },
            orderBy: {
              username: 'asc'
            },
          });
          messageUsers.push(...admins.map((admin: any) => ({ 
            id: admin.id, 
            name: "Admin", 
            surname: admin.username, 
            role: "ADMIN" 
          })));
        }

        // Sort all users by role, then by name
        messageUsers.sort((a, b) => {
          if (a.role !== b.role) {
            return a.role.localeCompare(b.role);
          }
          if (a.name !== b.name) {
            return a.name.localeCompare(b.name);
          }
          return a.surname.localeCompare(b.surname);
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
