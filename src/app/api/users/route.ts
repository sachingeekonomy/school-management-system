import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    let users: any[] = [];

    if (role === "student") {
      // Fetch students
      users = await prisma.student.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { surname: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          surname: true,
          username: true,
          email: true,
          phone: true,
        },
        take: limit,
        orderBy: { name: "asc" },
      });

      // Transform to match User model structure
      users = users.map(user => ({
        ...user,
        role: "STUDENT",
      }));
    } else if (role === "teacher") {
      // Fetch teachers
      users = await prisma.teacher.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { surname: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          surname: true,
          username: true,
          email: true,
          phone: true,
        },
        take: limit,
        orderBy: { name: "asc" },
      });

      // Transform to match User model structure
      users = users.map(user => ({
        ...user,
        role: "TEACHER",
      }));
    } else if (role === "parent") {
      // Fetch parents
      users = await prisma.parent.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { surname: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          surname: true,
          username: true,
          email: true,
          phone: true,
        },
        take: limit,
        orderBy: { name: "asc" },
      });

      // Transform to match User model structure
      users = users.map(user => ({
        ...user,
        role: "PARENT",
      }));
    } else {
      // Fetch all users from User table
      users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { surname: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          surname: true,
          username: true,
          email: true,
          phone: true,
          role: true,
        },
        take: limit,
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
