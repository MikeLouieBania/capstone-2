import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PUT(
    req: Request,
    { params }: { params: { courseId: string; chapterId: string } }
) {
    try {
        const { userId } = auth();
        const { isCompleted } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userProgress = await db.userProgress.findFirst({
            where: {
                userId: userId,
                chapterId: params.chapterId,
            }
        });

        if (userProgress) {
            // Update existing record
            await db.userProgress.update({
                where: {
                    id: userProgress.id
                },
                data: {
                    isCompleted
                }
            });
        } else {
            // Create new record
            await db.userProgress.create({
                data: {
                    userId,
                    chapterId: params.chapterId,
                    isCompleted
                }
            });
        }

        return NextResponse.json({ message: "Progress updated" });
    } catch (error) {
        console.log("[CHAPTER_ID_PROGRESS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}