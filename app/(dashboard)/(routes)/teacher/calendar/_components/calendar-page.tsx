"use client";

import React, { useState, useEffect } from "react";
import { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface CalendarComponentProps {
  userId: string;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ userId }) => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events?userId=${userId}`);
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
  }, [userId, toast]);

  const handleDateClick = (selected: DateSelectArg) => {
    setSelectedDate(selected);
    const clickedDate = new Date(selected.start);

    // Ensure we're working with the local date
    clickedDate.setMinutes(
      clickedDate.getMinutes() - clickedDate.getTimezoneOffset()
    );

    const defaultStartTime = new Date(clickedDate);
    defaultStartTime.setHours(defaultStartTime.getHours() + 1);
    const defaultEndTime = new Date(defaultStartTime);
    defaultEndTime.setHours(defaultEndTime.getHours() + 1);

    setNewEventDate(formatDateForInput(clickedDate));
    setNewEventStartTime(formatTimeForInput(defaultStartTime));
    setNewEventEndTime(formatTimeForInput(defaultEndTime));
    setIsDialogOpen(true);
  };

  const handleEventClick = async (selected: EventClickArg) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${selected.event.title}"?`
      )
    ) {
      try {
        const response = await fetch(`/api/events/${selected.event.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to delete event");
        }
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== selected.event.id)
        );
        toast({
          title: "Success",
          description: "Event deleted successfully.",
        });
      } catch (error) {
        console.error("Error deleting event:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to delete event. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
    setNewEventDate("");
    setNewEventStartTime("");
    setNewEventEndTime("");
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle && newEventDate && newEventStartTime && newEventEndTime) {
      const startDateTime = new Date(`${newEventDate}T${newEventStartTime}`);
      const endDateTime = new Date(`${newEventDate}T${newEventEndTime}`);

      const newEvent = {
        title: newEventTitle,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        allDay: false,
        userId: userId,
      };

      try {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEvent),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to create event");
        }

        const savedEvent = await response.json();
        setEvents((prevEvents) => [...prevEvents, savedEvent]);
        handleCloseDialog();
        toast({
          title: "Success",
          description: "Event created successfully.",
        });
      } catch (error) {
        console.error("Error adding event:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to create event. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

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
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          select={handleDateClick}
          eventClick={handleEventClick}
          events={events}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Enter the details for your new event.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                type="text"
                placeholder="Event Title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                required
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="event-start-time">Start Time</Label>
                <Input
                  id="event-start-time"
                  type="time"
                  value={newEventStartTime}
                  onChange={(e) => setNewEventStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="event-end-time">End Time</Label>
                <Input
                  id="event-end-time"
                  type="time"
                  value={newEventEndTime}
                  onChange={(e) => setNewEventEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

export default CalendarComponent;
