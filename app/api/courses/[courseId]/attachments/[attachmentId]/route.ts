import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import path from 'path';
import fs from 'fs/promises';
import { isTeacher } from '@/lib/teacher';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string; attachmentId: string } }
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

    const attachment = await db.attachment.findUnique({
      where: {
        id: params.attachmentId,
        courseId: params.courseId,
      },
    });

    if (!attachment) {
      return new NextResponse("Not found", { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'public', attachment.url);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Error deleting file:", error);
    }

    await db.attachment.delete({
      where: {
        id: params.attachmentId,
      },
    });

    return new NextResponse("Attachment deleted", { status: 200 });
  } catch (error) {
    console.error('[ATTACHMENT_DELETE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string; attachmentId: string } }
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

    const attachment = await db.attachment.findUnique({
      where: {
        id: params.attachmentId,
        courseId: params.courseId,
      },
    });

    if (!attachment) {
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

    // Delete the old file
    const oldFilePath = path.join(process.cwd(), 'public', attachment.url);
    try {
      await fs.unlink(oldFilePath);
    } catch (error) {
      console.error("Error deleting old file:", error);
    }

    const updatedAttachment = await db.attachment.update({
      where: {
        id: params.attachmentId,
      },
      data: {
        name: file.name,
        url: `/uploads/${filename}`,
      },
    });

    return NextResponse.json(updatedAttachment);
  } catch (error) {
    console.error('[ATTACHMENT_REPLACE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}