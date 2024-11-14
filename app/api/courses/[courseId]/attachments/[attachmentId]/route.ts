import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function DELETE(
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

    await db.attachment.delete({
      where: {
        id: params.attachmentId,
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[ATTACHMENT_DELETE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}