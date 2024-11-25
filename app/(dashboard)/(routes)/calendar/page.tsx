"use client";

import React, { useState, useEffect } from "react";
import { EventInput } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch events. Please try again later.",
          variant: "destructive",
        });
      }
    };
    fetchEvents();
  }, [toast]);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div className="flex flex-col w-full px-10 gap-1">
      <h2 className="py-10 text-2xl font-extrabold">Events</h2>
      <div className="mb-8">
        <FullCalendar
          height={"70vh"}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          initialView="dayGridMonth"
          editable={false}
          selectable={false}
          selectMirror={false}
          dayMaxEvents={true}
          events={events}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Upcoming Events</h3>
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="bg-secondary p-4 rounded-md">
              <h4 className="font-semibold">{event.title}</h4>
              <p className="text-sm text-muted-foreground">
                {formatEventDate(event.start as string)} -{" "}
                {formatEventDate(event.end as string)}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <Toaster />
    </div>
  );
};

export default Calendar;
