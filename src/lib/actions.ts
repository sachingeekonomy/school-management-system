"use server";

import { revalidatePath } from "next/cache";
import {
  AnnouncementSchema,
  AssignmentSchema,
  AttendanceSchema,
  ClassSchema,
  EventSchema,
  MessageSchema,
  ExamSchema,
  LessonSchema,
  ParentSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean; message?: string };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    console.log("Creating class with data:", data);
    
    const classData: any = {
      name: data.name,
      capacity: data.capacity,
      gradeId: data.gradeId,
    };
    
    // Add supervisor if provided
    if (data.supervisorId) {
      classData.supervisorId = data.supervisorId;
    }

    await prisma.class.create({
      data: classData,
    });

    console.log("Class created successfully");
    // revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating class:", err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating class with data:", data);
    
    const classData: any = {
      name: data.name,
      capacity: data.capacity,
      gradeId: data.gradeId,
    };
    
    // Add supervisor if provided
    if (data.supervisorId) {
      classData.supervisorId = data.supervisorId;
    } else {
      classData.supervisorId = null;
    }

    await prisma.class.update({
      where: {
        id: data.id,
      },
      data: classData,
    });

    console.log("Class updated successfully");
    // revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating class:", err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting class with ID:", id);
    
    // First, delete all related results (from exams and assignments)
    await prisma.result.deleteMany({
      where: {
        OR: [
          {
            exam: {
              lesson: {
                classId: parseInt(id),
              },
            },
          },
          {
            assignment: {
              lesson: {
                classId: parseInt(id),
              },
            },
          },
        ],
      },
    });
    
    console.log("Related results deleted");
    
    // Delete all exams for this class
    await prisma.exam.deleteMany({
      where: {
        lesson: {
          classId: parseInt(id),
        },
      },
    });
    
    console.log("Related exams deleted");
    
    // Delete all assignments for this class
    await prisma.assignment.deleteMany({
      where: {
        lesson: {
          classId: parseInt(id),
        },
      },
    });
    
    console.log("Related assignments deleted");
    
    // Delete all attendances for this class
    await prisma.attendance.deleteMany({
      where: {
        lesson: {
          classId: parseInt(id),
        },
      },
    });
    
    console.log("Related attendances deleted");
    
    // Delete all lessons for this class
    await prisma.lesson.deleteMany({
      where: {
        classId: parseInt(id),
      },
    });
    
    console.log("Related lessons deleted");
    
    // Delete all events for this class
    await prisma.event.deleteMany({
      where: {
        classId: parseInt(id),
      },
    });
    
    console.log("Related events deleted");
    
    // Delete all announcements for this class
    await prisma.announcement.deleteMany({
      where: {
        classId: parseInt(id),
      },
    });
    
    console.log("Related announcements deleted");
    
    // Finally delete the class
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Class deleted successfully");
    // revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting class:", err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    console.log("Creating teacher with data:", data);
    
    // Generate a unique ID for the teacher (since we're bypassing Clerk)
    const teacherId = `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log("Generated teacher ID:", teacherId);

    // Prepare teacher data
    const teacherData: any = {
      id: teacherId,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: data.birthday,
    };

    // Add subjects if provided
    if (data.subjects && data.subjects.length > 0) {
      const validSubjects = data.subjects.filter(subjectId => subjectId && subjectId !== '');
      console.log("Connecting subjects:", validSubjects);
      teacherData.subjects = {
        connect: validSubjects.map((subjectId: string) => ({
          id: parseInt(subjectId),
        })),
      };
    }

    await prisma.teacher.create({
      data: teacherData,
    });

    console.log("Teacher created successfully");
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating teacher:", err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating teacher with data:", data);

    // Update only in Prisma (since we're bypassing Clerk for teachers)
    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    console.log("Teacher updated successfully");
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating teacher:", err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting teacher with ID:", id);
    
    // First, delete all related results (from exams and assignments)
    await prisma.result.deleteMany({
      where: {
        OR: [
          {
            exam: {
              lesson: {
                teacherId: id,
              },
            },
          },
          {
            assignment: {
              lesson: {
                teacherId: id,
              },
            },
          },
        ],
      },
    });
    
    console.log("Related results deleted");
    
    // Second, delete all related exams
    await prisma.exam.deleteMany({
      where: {
        lesson: {
          teacherId: id,
        },
      },
    });
    
    console.log("Related exams deleted");
    
    // Third, delete all related assignments
    await prisma.assignment.deleteMany({
      where: {
        lesson: {
          teacherId: id,
        },
      },
    });
    
    console.log("Related assignments deleted");
    
    // Fourth, delete all related attendances
    await prisma.attendance.deleteMany({
      where: {
        lesson: {
          teacherId: id,
        },
      },
    });
    
    console.log("Related attendances deleted");
    
    // Fifth, delete all related lessons
    await prisma.lesson.deleteMany({
      where: {
        teacherId: id,
      },
    });
    
    console.log("Related lessons deleted");
    
    // Finally delete the teacher
    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    console.log("Teacher deleted successfully");
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting teacher:", err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true, message: "Class is at full capacity" };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      emailAddress: data.email ? [data.email] : ["test@example.com"],
      phoneNumber: data.phone ? [data.phone] : ["+15551234567"], // Add phone number
      publicMetadata: { role: "student" }
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    
    // Handle specific Clerk errors
    if (err.errors && err.errors.length > 0) {
      const errorMessage = err.errors[0].message;
      return { success: false, error: true, message: errorMessage };
    }
    
    // Handle other types of errors
    if (err.message) {
      return { success: false, error: true, message: err.message };
    }
    
    return { success: false, error: true, message: "Failed to create student" };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: "Student ID is required" };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    
    // Handle specific Clerk errors
    if (err.errors && err.errors.length > 0) {
      const errorMessage = err.errors[0].message;
      return { success: false, error: true, message: errorMessage };
    }
    
    // Handle other types of errors
    if (err.message) {
      return { success: false, error: true, message: err.message };
    }
    
    return { success: false, error: true, message: "Failed to update student" };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    console.log("Creating lesson with data:", data);
    
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    console.log("Lesson created successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating lesson:", err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating lesson with data:", data);
    
    await prisma.lesson.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    console.log("Lesson updated successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating lesson:", err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting lesson with ID:", id);
    
    // First, delete all related results (from exams and assignments)
    await prisma.result.deleteMany({
      where: {
        OR: [
          {
            exam: {
              lessonId: parseInt(id),
            },
          },
          {
            assignment: {
              lessonId: parseInt(id),
            },
          },
        ],
      },
    });
    
    console.log("Related results deleted");
    
    // Delete all exams for this lesson
    await prisma.exam.deleteMany({
      where: {
        lessonId: parseInt(id),
      },
    });
    
    console.log("Related exams deleted");
    
    // Delete all assignments for this lesson
    await prisma.assignment.deleteMany({
      where: {
        lessonId: parseInt(id),
      },
    });
    
    console.log("Related assignments deleted");
    
    // Delete all attendances for this lesson
    await prisma.attendance.deleteMany({
      where: {
        lessonId: parseInt(id),
      },
    });
    
    console.log("Related attendances deleted");
    
    // Finally delete the lesson
    await prisma.lesson.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Lesson deleted successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting lesson:", err);
    return { success: false, error: true };
  }
};

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    console.log("Creating parent with data:", data);
    
    // Generate a unique ID for the parent (since we're bypassing Clerk)
    const parentId = `parent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log("Generated parent ID:", parentId);

    // Prepare parent data
    const parentData: any = {
      id: parentId,
      username: `${data.name.toLowerCase()}_${data.surname.toLowerCase()}_${Date.now()}`,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
    };

    await prisma.parent.create({
      data: parentData,
    });

    console.log("Parent created successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating parent:", err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating parent with data:", data);
    
    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    console.log("Parent updated successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating parent:", err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting parent with ID:", id);
    
    // First, delete all related students
    await prisma.student.deleteMany({
      where: {
        parentId: id,
      },
    });
    
    console.log("Related students deleted");
    
    // Finally delete the parent
    await prisma.parent.delete({
      where: {
        id: id,
      },
    });

    console.log("Parent deleted successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting parent:", err);
    return { success: false, error: true };
  }
};

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    console.log("Creating assignment with data:", data);
    
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    console.log("Assignment created successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating assignment:", err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating assignment with data:", data);
    
    await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    console.log("Assignment updated successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating assignment:", err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting assignment with ID:", id);
    
    // First, delete all related results
    await prisma.result.deleteMany({
      where: {
        assignmentId: parseInt(id),
      },
    });
    
    console.log("Related results deleted");
    
    // Finally delete the assignment
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Assignment deleted successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting assignment:", err);
    return { success: false, error: true };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    console.log("Creating result with data:", data);
    
    // Validate that either examId or assignmentId is provided, but not both
    if (!data.examId && !data.assignmentId) {
      return { success: false, error: true, message: "Either exam or assignment must be selected" };
    }
    
    if (data.examId && data.assignmentId) {
      return { success: false, error: true, message: "Cannot select both exam and assignment" };
    }

    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
      },
    });

    console.log("Result created successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating result:", err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating result with data:", data);
    
    await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
      },
    });

    console.log("Result updated successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating result:", err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting result with ID:", id);
    
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Result deleted successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting result:", err);
    return { success: false, error: true };
  }
};

export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    console.log("Creating attendance with data:", data);
    
    await prisma.attendance.create({
      data: {
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
        date: new Date(),
      },
    });

    console.log("Attendance created successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating attendance:", err);
    return { success: false, error: true };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating attendance with data:", data);
    
    await prisma.attendance.update({
      where: {
        id: data.id,
      },
      data: {
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
        date: new Date(),
      },
    });

    console.log("Attendance updated successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating attendance:", err);
    return { success: false, error: true };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting attendance with ID:", id);
    
    await prisma.attendance.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Attendance deleted successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting attendance:", err);
    return { success: false, error: true };
  }
};

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    console.log("Creating event with data:", data);
    
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
      },
    });

    console.log("Event created successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating event:", err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating event with data:", data);
    
    await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
      },
    });

    console.log("Event updated successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating event:", err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting event with ID:", id);
    
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Event deleted successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting event:", err);
    return { success: false, error: true };
  }
};

export const createMessage = async (
  currentState: CurrentState,
  data: MessageSchema
) => {
  try {
    console.log("Creating message with data:", data);
    
    // For now, we'll use a placeholder senderId since we need to get it from the current user
    // In a real implementation, you'd get this from the authenticated user
    const senderId = "admin_user_id"; // This should come from auth context
    
    await prisma.message.create({
      data: {
        title: data.title,
        content: data.content,
        senderId: senderId,
        receiverId: data.receiverId,
      },
    });

    console.log("Message created successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating message:", err);
    return { success: false, error: true };
  }
};

export const updateMessage = async (
  currentState: CurrentState,
  data: MessageSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating message with data:", data);
    
    await prisma.message.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        content: data.content,
        receiverId: data.receiverId,
      },
    });

    console.log("Message updated successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating message:", err);
    return { success: false, error: true };
  }
};

export const deleteMessage = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting message with ID:", id);
    
    await prisma.message.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Message deleted successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting message:", err);
    return { success: false, error: true };
  }
};

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    console.log("Creating announcement with data:", data);
    
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId || null,
      },
    });

    console.log("Announcement created successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating announcement:", err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating announcement with data:", data);
    
    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId || null,
      },
    });

    console.log("Announcement updated successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating announcement:", err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting announcement with ID:", id);
    
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Announcement deleted successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting announcement:", err);
    return { success: false, error: true };
  }
};
