import Image from "next/image";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { date } = searchParams;
  return (
    <div className="rounded-md">
      {/* Calendar with dark theme wrapper */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <EventCalendar />
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4 text-white">Events</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} className="filter invert" />
      </div>
      <div className="flex flex-col gap-4">
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
