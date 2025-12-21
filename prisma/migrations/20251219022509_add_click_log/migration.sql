-- CreateTable
CREATE TABLE "ClickLog" (
    "id" SERIAL NOT NULL,
    "affiliateId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "postId" INTEGER,
    "ip" TEXT,
    "userAgent" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClickLog_affiliateId_idx" ON "ClickLog"("affiliateId");

-- CreateIndex
CREATE INDEX "ClickLog_clickedAt_idx" ON "ClickLog"("clickedAt");
