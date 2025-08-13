import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/auth";
import Link from "next/link";

const ViewAllButton = () => {
  return (
    <Link href="/list/announcements">
      <span className="text-xs text-orange-200 hover:text-white cursor-pointer transition-colors">View All</span>
    </Link>
  );
};

const Announcements = async () => {
  const session = await getUserSession();
  const userId = session?.id;
  const role = session?.role;

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  return (
    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Announcements</h1>
        <ViewAllButton />
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data[0] && (
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-white">{data[0].title}</h2>
              <span className="text-xs text-orange-100 bg-white/20 rounded-lg px-2 py-1 font-medium">
                {new Intl.DateTimeFormat("en-GB").format(data[0].date)}
              </span>
            </div>
            <p className="text-sm text-orange-100 mt-2 opacity-90">{data[0].description}</p>
          </div>
        )}
        {data[1] && (
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-white">{data[1].title}</h2>
              <span className="text-xs text-orange-100 bg-white/20 rounded-lg px-2 py-1 font-medium">
                {new Intl.DateTimeFormat("en-GB").format(data[1].date)}
              </span>
            </div>
            <p className="text-sm text-orange-100 mt-2 opacity-90">{data[1].description}</p>
          </div>
        )}
        {data[2] && (
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-white">{data[2].title}</h2>
              <span className="text-xs text-orange-100 bg-white/20 rounded-lg px-2 py-1 font-medium">
                {new Intl.DateTimeFormat("en-GB").format(data[2].date)}
              </span>
            </div>
            <p className="text-sm text-orange-100 mt-2 opacity-90">{data[2].description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
