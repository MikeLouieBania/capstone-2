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

        // First, try to find an existing progress record
        let userProgress = await db.userProgress.findUnique({
            where: {
                userId_chapterId: { 
                    userId,
                    chapterId: params.chapterId,
                }    
            }
        });

        if (userProgress) {
            // If a record exists, update it
            userProgress = await db.userProgress.update({
                where: {
                    userId_chapterId: { 
                        userId,
                        chapterId: params.chapterId,
                    }    
                },
                data: {
                    isCompleted
                }
            });
        } else {
            // If no record exists, create a new one
            userProgress = await db.userProgress.create({
                data: {
                    userId,
                    chapterId: params.chapterId,
                    isCompleted,
                }
            });
        }

        // Calculate the updated progress for the course
        const publishedChapters = await db.chapter.findMany({
            where: {
                courseId: params.courseId,
                isPublished: true
            }
        });

        const completedChapters = await db.userProgress.count({
            where: {
                userId,
                chapterId: {
                    in: publishedChapters.map(chapter => chapter.id)
                },
                isCompleted: true
            }
        });

        const progressPercentage = (completedChapters / publishedChapters.length) * 100;

        return NextResponse.json({ userProgress, progress: progressPercentage });
    } catch (error) {
        console.log("[CHAPTER_ID_PROGRESS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}