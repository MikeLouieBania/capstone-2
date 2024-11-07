import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CalendarComponent from "./_components/calendar-page";

export default function CalendarPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div>
      <CalendarComponent userId={userId} />
    </div>
  );
}
