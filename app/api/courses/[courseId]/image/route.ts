import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import path from 'path';
import fs from 'fs/promises';

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth(); // Get the userId from auth

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId, // Match the userId from session
      },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replace(/\s/g, '-');
    const ext = path.extname(filename);
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm'];

    if (!allowedExtensions.includes(ext.toLowerCase())) {
      return new NextResponse("Invalid file type", { status: 400 });
    }

    const uniqueFilename = `${Date.now()}-${filename}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, uniqueFilename);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    const imageUrl = `/uploads/${uniqueFilename}`;

    const updatedCourse = await db.course.update({
      where: { id: params.courseId },
      data: { imageUrl: imageUrl },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('[COURSE_ID_IMAGE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
