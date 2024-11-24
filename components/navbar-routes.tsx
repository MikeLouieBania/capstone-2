"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "./search-input";

export const NavbarRoutes = () => {
  const [isUserTeacher, setIsUserTeacher] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch("/api/check-role", { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch role");
        const data = await res.json();
        setIsUserTeacher(data.isTeacher);
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchRole();
  }, []);

  const { userId } = useAuth();
  const isTeacherPage = pathname?.startsWith("/teacher");
  const isCoursePage = pathname?.includes("/courses");
  const isSearchPage = pathname === "/search";

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="flex gap-x-2 ml-auto">
        {isTeacherPage || isCoursePage ? (
          <Link href="/">
            <Button size="sm" variant="ghost">
              <LogOut className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </Link>
        ) : isUserTeacher ? (
          <Link href="/teacher/courses">
            <Button size="sm" variant="ghost">
              Teacher Mode
            </Button>
          </Link>
        ) : null}
        <UserButton afterSwitchSessionUrl="/" />
      </div>
    </>
  );
};
