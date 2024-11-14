import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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

    console.log("Saving video to database");
    await db.video.upsert({
      where: { chapterId: params.chapterId },
      update: {
        filename,
        data: buffer,
        mimeType: file.type,
      },
      create: {
        chapterId: params.chapterId,
        filename,
        data: buffer,
        mimeType: file.type,
      },
    });

    console.log("Updating chapter with video URL");
    await db.chapter.update({
      where: {
        id: params.chapterId,
      },
      data: {
        videoUrl: `/api/courses/${params.courseId}/chapters/${params.chapterId}/video`,
      },
    });

    console.log("Video upload process completed successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CHAPTER_VIDEO_UPLOAD]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const video = await db.video.findUnique({
      where: { chapterId: params.chapterId },
    });

    if (!video) {
      return new NextResponse("Video not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', video.mimeType);
    headers.set('Content-Disposition', `inline; filename="${video.filename}"`);

    return new NextResponse(video.data, { headers });
  } catch (error) {
    console.error('[CHAPTER_VIDEO_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}