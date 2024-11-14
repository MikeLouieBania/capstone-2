import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
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
    const imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;

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

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const course = await db.course.findUnique({
      where: { id: params.courseId },
      select: { imageUrl: true },
    });

    if (!course || !course.imageUrl) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Extract the MIME type and base64 data from the imageUrl
    const [mimeType, base64Data] = course.imageUrl.split(',');
    const buffer = Buffer.from(base64Data, 'base64');

    const headers = new Headers();
    headers.set('Content-Type', mimeType.split(':')[1]);
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('[COURSE_IMAGE_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}