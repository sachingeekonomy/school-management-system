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
import { getUserSession } from "./auth";

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
    
    // Generate a unique ID for the teacher
    const teacherId = `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare teacher data
    const teacherData: any = {
      id: teacherId,
      username: data.username,
      password: data.password || "defaultPassword123", // In a real app, this should be hashed
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

    // Also create user in User table for authentication
    await prisma.user.create({
      data: {
        id: teacherId,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        role: 'TEACHER'
      }
    });

    console.log("Teacher created successfully");
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error creating teacher:", err);
    
    // Handle other types of errors
    if (err.message) {
      return { success: false, error: true, message: err.message };
    }
    
    return { success: false, error: true, message: "Failed to create teacher" };
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

    // Update in Prisma
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
  } catch (err: any) {
    console.error("Error updating teacher:", err);
    
    // Handle specific Clerk errors
    if (err.errors && err.errors.length > 0) {
      const errorMessage = err.errors[0].message;
      return { success: false, error: true, message: errorMessage };
    }
    
    // Handle other types of errors
    if (err.message) {
      return { success: false, error: true, message: err.message };
    }
    
    return { success: false, error: true, message: "Failed to update teacher" };
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
    
    // Finally delete the teacher from Prisma
    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // Also delete from User table
    await prisma.user.delete({
      where: { id: id },
    });

    console.log("Teacher deleted successfully");
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error deleting teacher:", err);
    
    // Handle other types of errors
    if (err.message) {
      return { success: false, error: true, message: err.message };
    }
    
    return { success: false, error: true, message: "Failed to delete teacher" };
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

    // Generate a unique ID for the student
    const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await prisma.student.create({
      data: {
        id: studentId,
        username: data.username,
        password: data.password || "defaultPassword123", // In a real app, this should be hashed
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

    // Also create user in User table for authentication
    await prisma.user.create({
      data: {
        id: studentId,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        role: 'STUDENT'
      }
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    
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
    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        ...(data.password && data.password !== "" && { password: data.password }),
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

    // Also update user in User table if it exists
    try {
      await prisma.user.update({
        where: { id: data.id },
        data: {
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
        }
      });
    } catch (userError) {
      // If user doesn't exist, create it
      console.log("User record not found, creating new user record");
      await prisma.user.create({
        data: {
          id: data.id,
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          role: 'STUDENT'
        }
      });
    }

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    
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
    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // Also delete from User table
    await prisma.user.delete({
      where: { id: id },
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
    
    // Generate a unique ID for the parent
    const userId = `parent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log("Generated parent ID:", userId);

    // Prepare parent data
    const parentData: any = {
      id: userId,
      username: data.username || `${data.name.toLowerCase()}_${data.surname.toLowerCase()}_${Date.now()}`,
      password: data.password || "defaultPassword123", // In a real app, this should be hashed
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
    };

    await prisma.parent.create({
      data: parentData,
    });

    // Also create user in User table for authentication
    await prisma.user.create({
      data: {
        id: userId,
        username: parentData.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        role: 'PARENT'
      }
    });

    console.log("Parent created successfully");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    
    // Handle other types of errors
    if (err.message) {
      return { success: false, error: true, message: err.message };
    }
    
    return { success: false, error: true, message: "Failed to create parent" };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: "Parent ID is required" };
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
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    console.error("Error updating parent:", err);
    return { success: false, error: true, message: err.message || "Failed to update parent" };
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

// Helper function to ensure user exists in User table
const ensureUserExists = async (userId: string, role: string) => {
  try {
    // Check if user already exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (existingUser) {
      return existingUser;
    }

    // Get user data from role-specific table
    let userData: any = null;
    
    if (role === "teacher") {
      userData = await prisma.teacher.findUnique({
        where: { id: userId },
        select: { id: true, username: true, name: true, surname: true, email: true, phone: true }
      });
    } else if (role === "student") {
      userData = await prisma.student.findUnique({
        where: { id: userId },
        select: { id: true, username: true, name: true, surname: true, email: true, phone: true }
      });
    } else if (role === "parent") {
      userData = await prisma.parent.findUnique({
        where: { id: userId },
        select: { id: true, username: true, name: true, surname: true, email: true, phone: true }
      });
    } else if (role === "admin") {
      userData = await prisma.admin.findUnique({
        where: { id: userId },
        select: { id: true, username: true }
      });
    }

    // If user not found in role-specific tables, create a fallback user entry
    if (!userData) {
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          username: `user_${userId.slice(-8)}`,
          name: "User",
          surname: "Unknown",
          email: null,
          phone: null,
          role: role.toUpperCase() as any,
        }
      });
      
      return newUser;
    }

    // Create user in User table
    const newUser = await prisma.user.create({
      data: {
        id: userData.id,
        username: userData.username,
        name: userData.name || "Admin",
        surname: userData.surname || userData.username,
        email: userData.email || null,
        phone: userData.phone || null,
        role: role.toUpperCase() as any,
      }
    });

    return newUser;
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    throw error;
  }
};

export const createMessage = async (
  currentState: CurrentState,
  data: MessageSchema
) => {
  try {
    console.log("Creating message with data:", data);
    
    // Get the current user ID from session
    const session = await getUserSession();
    const userId = session?.id;
    
    if (!userId) {
      console.error("No authenticated user found");
      return { success: false, error: true, message: "Authentication required" };
    }

    // Get current user's role
    const { getUserRoleSync } = await import("@/lib/getUserRole");
    const senderRole = await getUserRoleSync();
    
    if (!senderRole) {
      console.error("Could not determine sender role");
      return { success: false, error: true, message: "Could not determine user role" };
    }

    // Ensure sender exists in User table
    await ensureUserExists(userId, senderRole);

    // Use recipientIds if available, otherwise fall back to receiverId
    const recipientIds = data.recipientIds || [data.receiverId];
    
    // Ensure all recipients exist in User table
    for (const recipientId of recipientIds) {
      let receiverRole = "admin"; // default
      if (recipientId.startsWith("teacher_")) {
        receiverRole = "teacher";
      } else if (recipientId.startsWith("parent_")) {
        receiverRole = "parent";
      } else if (recipientId.includes("admin")) {
        receiverRole = "admin";
      } else {
        // Check if it's a student (Clerk ID)
        const student = await prisma.student.findUnique({
          where: { id: recipientId },
          select: { id: true }
        });
        if (student) {
          receiverRole = "student";
        }
      }
      await ensureUserExists(recipientId, receiverRole);
    }
    
    // Create message with multiple recipients
    await prisma.message.create({
      data: {
        title: data.title,
        content: data.content,
        senderId: userId,
        recipients: {
          create: recipientIds.map(recipientId => ({
            recipientId: recipientId,
          }))
        }
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
    
    // Use recipientIds if available, otherwise fall back to receiverId
    const recipientIds = data.recipientIds || [data.receiverId];
    
    // Update message content
    await prisma.message.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        content: data.content,
      },
    });

    // Update recipients
    if (recipientIds.length > 0) {
      // Delete existing recipients
      await prisma.messageRecipient.deleteMany({
        where: {
          messageId: data.id,
        },
      });

      // Create new recipients
      await prisma.messageRecipient.createMany({
        data: recipientIds.map(recipientId => ({
          messageId: data.id!,
          recipientId: recipientId,
        })),
      });
    }

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

export const markMessageAsRead = async (
  currentState: CurrentState,
  data: { messageId: number }
) => {
  try {
    console.log("Marking message as read:", data.messageId);
    
    // Get the current user ID from session
    const session = await getUserSession();
    const userId = session?.id;
    
    if (!userId) {
      console.error("No authenticated user found");
      return { success: false, error: true, message: "Authentication required" };
    }
    
    await prisma.messageRecipient.updateMany({
      where: {
        messageId: data.messageId,
        recipientId: userId, // Only allow marking messages as read if user is the recipient
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    console.log("Message marked as read successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error marking message as read:", err);
    return { success: false, error: true };
  }
};

 export const deletePayment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting payment with ID:", id);
    
    await prisma.payment.delete({
      where: {
        id: id,
      },
    });

    console.log("Payment deleted successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting payment:", err);
    return { success: false, error: true };
  }
};
