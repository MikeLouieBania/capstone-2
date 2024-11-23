/*
  Warnings:

  - You are about to drop the column `conversationId` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KnowledgeBase` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_conversationId_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "conversationId";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "KnowledgeBase";
