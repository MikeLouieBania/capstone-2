import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import path from 'path';
import fs from 'fs/promises';

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    console.log("Starting video upload process");
    const { userId } = auth();

    if (!userId) {
      console.log("Unauthorized: No user ID");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Fetching course");
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
    });

    if (!course) {
      console.log("Course not found");
      return new NextResponse("Not found", { status: 404 });
    }

    console.log("Fetching chapter");
    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
    });

    if (!chapter) {
      console.log("Chapter not found");
      return new NextResponse("Not found", { status: 404 });
    }

    console.log("Processing form data");
    const formData = await req.formData();
    const file = formData.get('videoFile') as File | null;

    if (!file) {
      console.log("No file uploaded");
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);

    console.log("Saving file locally");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    console.log("Updating chapter with video URL");
    await db.chapter.update({
      where: {
        id: params.chapterId,
      },
      data: {
        videoUrl: `/uploads/${filename}`,
      },
    });

    console.log("Video upload process completed successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CHAPTER_VIDEO_UPLOAD]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}