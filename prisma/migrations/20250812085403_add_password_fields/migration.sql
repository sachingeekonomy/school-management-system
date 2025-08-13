/*
  Warnings:

  - Added the required column `password` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Parent" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Teacher" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."_SubjectToTeacher" ADD CONSTRAINT "_SubjectToTeacher_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_SubjectToTeacher_AB_unique";
