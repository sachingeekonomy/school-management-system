import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async () => {
  const { userId } = auth();

  // First, get the student record to find their class
  const student = await prisma.student.findUnique({
    where: { id: userId! },
    include: { class: true }
  });

  console.log('Student:', student);
  console.log('Student class:', student?.class);

  // If student doesn't exist or has no class, show a message
  if (!student || !student.class) {
    return (
      <div className="p-4">
        <div className="bg-white p-8 rounded-md shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Student Dashboard</h1>
          <p className="text-gray-600">
            {!student 
              ? "Student record not found. Please contact your administrator." 
              : "No class assigned. Please contact your administrator."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule ({student.class.name})</h1>
          <BigCalendarContainer type="classId" id={student.class.id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
