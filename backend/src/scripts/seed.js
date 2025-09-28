const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@webtruyen.com" },
    update: {},
    create: {
      email: "admin@webtruyen.com",
      passwordHash: adminPassword,
      name: "Administrator",
      role: "ADMIN",
    },
  });

  // Create demo user
  const userPassword = await bcrypt.hash("user123456", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      passwordHash: userPassword,
      name: "Demo User",
      role: "USER",
    },
  });

  // Create genres
  const genres = [
    "Tiên Hiệp",
    "Đô Thị",
    "Huyền Huyễn",
    "Kiếm Hiệp",
    "Ngôn Tình",
    "Quan Trường",
    "Lịch Sử",
    "Khoa Huyễn",
    "Trinh Thám",
    "Võng Du",
  ];

  const createdGenres = [];
  for (const genreName of genres) {
    const genre = await prisma.genre.upsert({
      where: { slug: slugify(genreName, { lower: true }) },
      update: {},
      create: {
        name: genreName,
        slug: slugify(genreName, { lower: true }),
      },
    });
    createdGenres.push(genre);
  }

  // Create affiliate links
  const affiliateLinks = [
    {
      provider: "Google Drive",
      targetUrl: "https://drive.google.com/drive/folders/example1",
      label: "Tải từ Google Drive",
    },
    {
      provider: "Fshare",
      targetUrl: "https://www.fshare.vn/file/example2",
      label: "Tải từ Fshare",
    },
    {
      provider: "Mega",
      targetUrl: "https://mega.nz/file/example3",
      label: "Tải từ Mega",
    },
  ];

  const createdAffiliateLinks = [];
  for (const linkData of affiliateLinks) {
    const link = await prisma.affiliateLink.create({
      data: linkData,
    });
    createdAffiliateLinks.push(link);
  }

  // Create sample stories
  const stories = [
    {
      title: "Đấu Phá Thương Khung",
      description:
        "Thiếu niên tài ba, đánh mất đấu khí bỗng chốc trở thành phế vật của gia tộc...",
      type: "TEXT",
      thumbnailUrl: "/uploads/image/toan-chuc-phap-su.jpg",
      genreIds: [createdGenres[0].id, createdGenres[2].id], // Tiên Hiệp, Huyền Huyễn
    },
    {
      title: "Tôi Là Đại Thần Tiên",
      description:
        "Trọng sinh về thời đại tu tiên, với kiến thức hiện đại chinh phục thế giới tu tiên...",
      type: "AUDIO",
      thumbnailUrl: "uploads/image/toan-chuc-phap-su.jpgg",
      genreIds: [createdGenres[0].id], // Tiên Hiệp
    },
    {
      title: "Toàn Chức Pháp Sư",
      description:
        "Phép thuật và công nghệ kết hợp, mở ra một thế giới hoàn toàn mới...",
      type: "TEXT",
      thumbnailUrl: "/uploads/image/toan-chuc-phap-su.jpg",
      genreIds: [createdGenres[2].id, createdGenres[7].id], // Huyền Huyễn, Khoa Huyễn
    },
    {
      title: "Thần Hôn",
      description: "Câu chuyện tình yêu giữa thần tiên và con người...",
      type: "AUDIO",
      thumbnailUrl: "/uploads/image/toan-chuc-phap-su.jpg",
      genreIds: [createdGenres[0].id, createdGenres[4].id], // Tiên Hiệp, Ngôn Tình
    },
  ];

  const createdStories = [];
  for (const storyData of stories) {
    const slug = slugify(storyData.title, { lower: true });
    const story = await prisma.story.upsert({
      where: { slug },
      update: {
        description: storyData.description,
        type: storyData.type,
        thumbnailUrl: storyData.thumbnailUrl,
      },
      create: {
        title: storyData.title,
        slug,
        description: storyData.description,
        type: storyData.type,
        thumbnailUrl: storyData.thumbnailUrl,
        authorId: admin.id,
        affiliateId:
          createdAffiliateLinks[
            Math.floor(Math.random() * createdAffiliateLinks.length)
          ].id,
        genres: {
          connect: storyData.genreIds.map((id) => ({ id })),
        },
        viewCount: Math.floor(Math.random() * 10000),
      },
    });
    createdStories.push(story);
  }

  // Create chapters for each story
  for (const story of createdStories) {
    const chapterCount = Math.floor(Math.random() * 50) + 10; // 10-60 chapters

    for (let i = 1; i <= chapterCount; i++) {
      const isLocked = i > 3; // First 3 chapters are free
      const chapterTitle = `Chương ${i}: ${generateChapterTitle()}`;

      // Use actual uploaded audio file for AUDIO stories
      let audioUrl = null;
      if (story.type === "AUDIO") {
        // Use the actual uploaded MP3 file
        audioUrl = `/uploads/audio/0acd3d2f-729a-4f6f-a38a-0050977821b0.mp3`;
      }

      await prisma.chapter.upsert({
        where: {
          storyId_number: {
            storyId: story.id,
            number: i,
          },
        },
        update: {
          title: chapterTitle,
          audioUrl,
        },
        create: {
          number: i,
          title: chapterTitle,
          content:
            story.type === "TEXT" ? generateTextContent(chapterTitle) : null,
          audioUrl,
          isLocked,
          storyId: story.id,
        },
      });
    }
  }

  // Create some sample comments
  for (const story of createdStories) {
    const chapters = await prisma.chapter.findMany({
      where: { storyId: story.id },
      take: 3,
    });

    for (const chapter of chapters) {
      // Main comments
      await prisma.comment.create({
        data: {
          content: generateComment(),
          isApproved: true,
          userId: user.id,
          chapterId: chapter.id,
        },
      });

      // Admin comment
      await prisma.comment.create({
        data: {
          content:
            "Cảm ơn bạn đã đọc! Chúc bạn có những giây phút thư giãn tuyệt vời.",
          isApproved: true,
          userId: admin.id,
          chapterId: chapter.id,
        },
      });
    }
  }

  // Create some bookmarks
  await prisma.bookmark.create({
    data: {
      userId: user.id,
      storyId: createdStories[0].id,
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: user.id,
      storyId: createdStories[1].id,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`👤 Admin: admin@webtruyen.com / admin123456`);
  console.log(`👤 User: user@example.com / user123456`);
  console.log(`📚 Created ${createdStories.length} stories`);
  console.log(`🏷️ Created ${createdGenres.length} genres`);
  console.log(`🔗 Created ${createdAffiliateLinks.length} affiliate links`);
}

function generateChapterTitle() {
  const titles = [
    "Khởi Đầu Hành Trình",
    "Gặp Gỡ Định Mệnh",
    "Thử Thách Đầu Tiên",
    "Bí Mật Được Hé Lộ",
    "Cuộc Chiến Khốc Liệt",
    "Đột Phá Giới Hạn",
    "Người Bạn Mới",
    "Kẻ Thù Nguy Hiểm",
    "Lựa Chọn Khó Khăn",
    "Chiến Thắng Vẻ Vang",
    "Sự Thật Đau Lòng",
    "Hy Vọng Mới",
    "Phục Thù",
    "Tình Bạn Thắt Chặt",
    "Thành Công Rực Rỡ",
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateTextContent(title) {
  return `# ${title}

Đây là nội dung của chương truyện. Trong chương này, nhân vật chính sẽ trải qua những thử thách mới và khám phá ra những bí mật thú vị.

## Phần 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Phần 2

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

---

*Hẹn gặp lại trong chương tiếp theo!*`;
}

function generateComment() {
  const comments = [
    "Chương này hay quá! Mong tác giả cập nhật sớm!",
    "Cảm ơn tác giả đã mang đến câu chuyện tuyệt vời.",
    "Không thể chờ đợi chương tiếp theo được!",
    "Nhân vật chính thật tuyệt vời!",
    "Cốt truyện rất hấp dẫn và cuốn hút.",
    "Tôi đã đọc suốt đêm, không thể ngừng được!",
    "Rất mong được đọc tiếp phần sau.",
    "Câu chuyện ngày càng thú vị!",
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
