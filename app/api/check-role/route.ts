import { NextResponse } from "next/server";
import { checkRole } from "@/utils/roles";

export async function GET() {
  const isTeacher = await checkRole("teacher");
  return NextResponse.json({ isTeacher });
}
