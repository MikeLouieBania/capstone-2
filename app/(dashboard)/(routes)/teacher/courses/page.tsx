
import { auth } from "@clerk/nextjs/server";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
 
//VIDEO @67:01npm:02

const CoursesPage = async () => {
    const  { userId } = auth();

    if (!userId) {
        return redirect("/");
    }

    const courses = await db.course.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="container mx-auto py-10 max-w-6xl">
      <DataTable columns={columns} data={courses} />
    </div>
    );
}

export default CoursesPage;