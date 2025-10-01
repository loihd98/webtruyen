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
      description: "Link tải chính từ Google Drive với tốc độ cao",
      isActive: true,
    },
    {
      provider: "Fshare",
      targetUrl: "https://www.fshare.vn/file/example2",
      label: "Tải từ Fshare",
      description: "Link tải dự phòng từ Fshare",
      isActive: true,
    },
    {
      provider: "Mega",
      targetUrl: "https://mega.nz/file/example3",
      label: "Tải từ Mega",
      description: "Link tải từ Mega.nz an toàn",
      isActive: true,
    },
    {
      provider: "MediaFire",
      targetUrl: "https://www.mediafire.com/file/example4",
      label: "Tải từ MediaFire",
      description: "Link tải từ MediaFire tốc độ ổn định",
      isActive: true,
    },
    {
      provider: "Dropbox",
      targetUrl: "https://www.dropbox.com/s/example5",
      label: "Tải từ Dropbox",
      description: "Link tải từ Dropbox bảo mật cao",
      isActive: false, // One inactive for testing
    },
  ];

  const createdAffiliateLinks = [];
  for (const linkData of affiliateLinks) {
    const link = await prisma.affiliateLink.create({
      data: linkData,
    });
    createdAffiliateLinks.push(link);
  }

  // Create sample media files
  const mediaFiles = [
    {
      filename: "sample-image-1.jpg",
      originalName: "Ảnh bìa truyện 1.jpg",
      mimeType: "image/jpeg",
      size: 245760, // ~240KB
      url: "/uploads/images/sample-image-1.jpg",
      type: "image",
      isActive: true,
    },
    {
      filename: "sample-image-2.png",
      originalName: "Ảnh bìa truyện 2.png",
      mimeType: "image/png",
      size: 512000, // ~500KB
      url: "/uploads/images/sample-image-2.png",
      type: "image",
      isActive: true,
    },
    {
      filename: "sample-audio-1.mp3",
      originalName: "Chương 1 - Khởi đầu.mp3",
      mimeType: "audio/mpeg",
      size: 5242880, // ~5MB
      url: "/uploads/audio/sample-audio-1.mp3",
      type: "audio",
      isActive: true,
    },
    {
      filename: "sample-audio-2.mp3",
      originalName: "Chương 2 - Gặp gỡ.mp3",
      mimeType: "audio/mpeg",
      size: 4718592, // ~4.5MB
      url: "/uploads/audio/sample-audio-2.mp3",
      type: "audio",
      isActive: true,
    },
    {
      filename: "old-image.jpg",
      originalName: "Ảnh cũ không dùng.jpg",
      mimeType: "image/jpeg",
      size: 102400, // ~100KB
      url: "/uploads/images/old-image.jpg",
      type: "image",
      isActive: false, // Inactive for testing
    },
  ];

  const createdMediaFiles = [];
  for (const mediaData of mediaFiles) {
    const media = await prisma.media.create({
      data: mediaData,
    });
    createdMediaFiles.push(media);
  }

  // Create sample stories
  const stories = [
    {
      title: "Đấu Phá Thương Khung",
      description:
        "Thiếu niên tài ba, đánh mất đấu khí bỗng chốc trở thành phế vật của gia tộc. Nhưng với sự giúp đỡ của Dược Lão, cậu bắt đầu con đường tu luyện gian khó nhưng đầy hào hùng...",
      type: "TEXT",
      thumbnailUrl: "/uploads/images/sample-image-1.jpg",
      genreIds: [createdGenres[0].id, createdGenres[2].id], // Tiên Hiệp, Huyền Huyễn
    },
    {
      title: "Tôi Là Đại Thần Tiên",
      description:
        "Trọng sinh về thời đại tu tiên, với kiến thức hiện đại chinh phục thế giới tu tiên. Từ một kẻ phế vật trở thành đại thần tiên làm chấn động ba giới...",
      type: "AUDIO",
      thumbnailUrl: "/uploads/images/sample-image-2.png",
      genreIds: [createdGenres[0].id], // Tiên Hiệp
    },
    {
      title: "Toàn Chức Pháp Sư",
      description:
        "Phép thuật và công nghệ kết hợp, mở ra một thế giới hoàn toàn mới. Trong thế giới mà ma pháp là tất cả, làm thế nào để trở thành pháp sư mạnh nhất?",
      type: "TEXT",
      thumbnailUrl: "/uploads/images/sample-image-1.jpg",
      genreIds: [createdGenres[2].id, createdGenres[7].id], // Huyền Huyễn, Khoa Huyễn
    },
    {
      title: "Thần Hôn",
      description:
        "Câu chuyện tình yêu giữa thần tiên và con người, vượt qua mọi thử thách của số phận để đến với nhau. Một cuộc tình bất diệt xuyên suốt ba sinh ba thế...",
      type: "AUDIO",
      thumbnailUrl: "/uploads/images/sample-image-2.png",
      genreIds: [createdGenres[0].id, createdGenres[4].id], // Tiên Hiệp, Ngôn Tình
    },
    {
      title: "Đô Thị Tu Tiên",
      description:
        "Tu tiên trong thời đại hiện đại, khi thần thông gặp gỡ công nghệ. Liệu có thể tu luyện thành tiên trong thế giới đầy ô nhiễm này?",
      type: "TEXT",
      thumbnailUrl: "/uploads/images/sample-image-1.jpg",
      genreIds: [createdGenres[1].id, createdGenres[0].id], // Đô Thì, Tiên Hiệp
    },
    {
      title: "Thiên Tài Lập Trình Viên",
      description:
        "Từ một lập trình viên bình thường trở thành thiên tài công nghệ, xây dựng đế chế kinh doanh và chinh phục thế giới số...",
      type: "TEXT",
      thumbnailUrl: "/uploads/images/sample-image-2.png",
      genreIds: [createdGenres[1].id, createdGenres[7].id], // Đô Thị, Khoa Huyễn
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
    const chapterCount = Math.floor(Math.random() * 30) + 15; // 15-45 chapters

    for (let i = 1; i <= chapterCount; i++) {
      const isLocked = i > 3; // First 3 chapters are free
      const chapterTitle = `Chương ${i}: ${generateChapterTitle()}`;

      // Use sample audio files for AUDIO stories
      let audioUrl = null;
      if (story.type === "AUDIO") {
        // Randomly choose between sample audio files
        const audioFiles = createdMediaFiles.filter(
          (media) => media.type === "audio" && media.isActive
        );
        if (audioFiles.length > 0) {
          audioUrl = audioFiles[i % audioFiles.length].url;
        }
      }

      // Randomly assign affiliate links to some chapters (60% chance)
      const affiliateId =
        Math.random() > 0.4 && createdAffiliateLinks.length > 0
          ? createdAffiliateLinks[
              Math.floor(Math.random() * createdAffiliateLinks.length)
            ].id
          : null;

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
          affiliateId,
        },
        create: {
          number: i,
          title: chapterTitle,
          content:
            story.type === "TEXT" ? generateTextContent(chapterTitle) : null,
          audioUrl,
          isLocked,
          storyId: story.id,
          affiliateId,
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
  console.log(`📁 Created ${createdMediaFiles.length} media files`);

  // Count chapters for summary
  const totalChapters = await prisma.chapter.count();
  const chaptersWithAffiliates = await prisma.chapter.count({
    where: { affiliateId: { not: null } },
  });

  console.log(`📖 Created ${totalChapters} chapters`);
  console.log(`🔗 ${chaptersWithAffiliates} chapters have affiliate links`);
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
    "Tỉnh Ngộ Thần Thông",
    "Gặp Gỡ Cao Nhân",
    "Tranh Đo탈 Bảo Vật",
    "Sinh Tử Một Mình",
    "Báo Thù Ân Oán",
    "Tình Duyên Lận Đận",
    "Tiến Vào Tuyệt Địa",
    "Phát Hiện Âm Mưu",
    "Quyết Chiến Sinh Tử",
    "Đại Thắng Mỹ Mãn",
    "Chia Tay Bạn Bè",
    "Khám Phá Thế Giới Mới",
    "Thần Bí Sư Phụ",
    "Tranh Giành Ngôi Vị",
    "Tình Yêu Đầu Đời",
    "Thảm Kịch Gia Tộc",
    "Hồi Sinh Từ Tro Tàn",
    "Chinh Phục Thiên Hạ",
    "Đại Kết Cục",
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
