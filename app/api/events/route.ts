import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET() {
  try {
    const events = await prisma.event.findMany();
    return NextResponse.json(events);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch events:", error);
      return NextResponse.json(
        { error: "Failed to fetch events", details: error.toString() },
        { status: 500 }
      );
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json(
        { error: "Unknown error", details: String(error) },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: Request) {
  try {
    const { title, start, end, allDay } = await request.json();
    console.log("Received event data:", { title, start, end, allDay });

    // Convert start and end to DateTime objects
    const startDate = new Date(start);
    const endDate = new Date(end);

    const newEvent = await prisma.event.create({
      data: {
        title,
        start: startDate,
        end: endDate,
        allDay,
      },
    });

    console.log("Created new event:", newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      {
        error: "Failed to create event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
