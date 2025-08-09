import prisma from "@/lib/prisma";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  const date = dateParam ? new Date(dateParam) : new Date();

  const data = await prisma.event.findMany({
    where: {
      startTime: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
  });

  return data.map((event) => (
    <div
      className="p-5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 border-t-4 odd:border-t-blue-300 even:border-t-purple-300 hover:bg-white/15 transition-all duration-200"
      key={event.id}
    >
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-white">{event.title}</h1>
        <span className="text-blue-100 text-xs font-medium">
          {event.startTime.toLocaleTimeString("en-UK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      </div>
      <p className="mt-2 text-blue-100 text-sm opacity-90">{event.description}</p>
    </div>
  ));
};

export default EventList;
