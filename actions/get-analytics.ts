import { db } from "@/lib/db";
import { Course, Chapter, UserProgress } from "@prisma/client";

type CourseWithChaptersAndProgress = Course & {
    chapters: (Chapter & {
        userProgress: UserProgress[];
    })[];
};

const groupByCompletion = (courses: CourseWithChaptersAndProgress[]) => {
    const grouped: { [courseTitle: string]: { total: number; completed: number } } = {};

    courses.forEach((course) => {
        const courseTitle = course.title;
        const totalUsers = new Set();
        let completedUsers = new Set();

        course.chapters.forEach((chapter) => {
            chapter.userProgress.forEach((progress) => {
                totalUsers.add(progress.userId);
                if (progress.isCompleted) {
                    completedUsers.add(progress.userId);
                }
            });
        });

        grouped[courseTitle] = {
            total: totalUsers.size,
            completed: completedUsers.size,
        };
    });

    return grouped;
};

export const getAnalytics = async (userId: string) => {
    try {
        const courses = await db.course.findMany({
            where: {
                userId: userId
            },
            include: {
                chapters: {
                    include: {
                        userProgress: true
                    }
                }
            }
        });

        const groupedData = groupByCompletion(courses);
        const data = Object.entries(groupedData).map(([courseTitle, { total, completed }]) => ({
            name: courseTitle,
            total,
            completed,
        }));

        const totalUsers = data.reduce((acc, curr) => acc + curr.total, 0);
        const totalCompleted = data.reduce((acc, curr) => acc + curr.completed, 0);

        return {
            data,
            totalUsers,
            totalCompleted,
        }
    } catch (error) {
        console.log("[GET_ANALYTICS]", error);
        return {
            data: [],
            totalUsers: 0,
            totalCompleted: 0,
        }
    }
}