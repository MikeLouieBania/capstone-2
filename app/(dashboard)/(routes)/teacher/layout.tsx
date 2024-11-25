"use client"; // Add this line at the top of the file

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

const TeacherLayout = ({ children }: { children: React.ReactNode }) => {
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/check-role`
      );
      const data = await response.json();
      setIsTeacher(data.isTeacher);
    };

    fetchRole();
  }, []);

  if (isTeacher === null) {
    return <div>Loading...</div>;
  }

  if (!isTeacher) {
    return redirect("/"); // Redirect to homepage if not a teacher
  }

  return <>{children}</>;
};

export default TeacherLayout;
