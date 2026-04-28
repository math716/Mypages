-- CreateTable
CREATE TABLE "MediaPost" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "platformPostId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "permalink" TEXT,
    "caption" TEXT,
    "publishedAt" TIMESTAMP(3),
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaPost_pageId_platformPostId_key" ON "MediaPost"("pageId", "platformPostId");

-- CreateIndex
CREATE INDEX "MediaPost_pageId_idx" ON "MediaPost"("pageId");

-- CreateIndex
CREATE INDEX "MediaPost_publishedAt_idx" ON "MediaPost"("publishedAt");

-- AddForeignKey
ALTER TABLE "MediaPost" ADD CONSTRAINT "MediaPost_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "InstagramPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
