import { checkRole } from "@/utils/roles"; // Import the checkRole function from utils/roles
import { NextResponse } from "next/server"; // Import NextResponse for server-side response handling

export async function handler(req: any) {
  // Assuming the userId is part of the request (for example, from session or JWT)
  const { userId } = req; // Modify according to your setup for accessing the userId from the request

  // Use the checkRole function to verify if the user has the 'teacher' role
  const isUserTeacher = await checkRole("teacher");

  if (!isUserTeacher) {
    // If the user is not a teacher, return an Unauthorized response
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // If the user is a teacher, allow access to the requested resource
  return new NextResponse("Welcome, Teacher!");
}
