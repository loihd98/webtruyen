const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateAudioLinks() {
  console.log("🔄 Updating audio links...");

  try {
    // Find all AUDIO stories
    const audioStories = await prisma.story.findMany({
      where: { type: "AUDIO" },
      include: { chapters: true },
    });

    console.log(`Found ${audioStories.length} audio stories`);

    // Update all chapters of audio stories to use the actual uploaded file
    for (const story of audioStories) {
      console.log(`Updating chapters for: ${story.title}`);

      await prisma.chapter.updateMany({
        where: { storyId: story.id },
        data: {
          audioUrl: "/uploads/audio/0acd3d2f-729a-4f6f-a38a-0050977821b0.mp3",
        },
      });

      console.log(
        `✅ Updated ${story.chapters.length} chapters for ${story.title}`
      );
    }

    console.log("✅ All audio links updated successfully!");
  } catch (error) {
    console.error("❌ Error updating audio links:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAudioLinks();
