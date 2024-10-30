import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import path from 'path';
import fs from 'fs/promises';
import { isTeacher } from '@/lib/teacher';

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId || isTeacher(userId)) {
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
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    const attachment = await db.attachment.create({
      data: {
        name: file.name,
        url: `/uploads/${filename}`,
        courseId: params.courseId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error('[ATTACHMENT_UPLOAD]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Add this to handle GET requests if needed
export async function GET() {
  return new NextResponse("Method not allowed", { status: 405 });
}