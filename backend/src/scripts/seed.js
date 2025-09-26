// Tạo thêm users ngẫu nhiên
const extraUsers = [];
for (let i = 1; i <= 10; i++) {
  const password = await bcrypt.hash(`user${i}123456`, 12);
  const u = await prisma.user.upsert({
    where: { email: `user${i}@example.com` },
    update: {},
    create: {
      email: `user${i}@example.com`,
      passwordHash: password,
      name: `User ${i}`,
      avatar: `https://i.pravatar.cc/150?img=${i}`, // random avatar
      role: "USER",
    },
  });
  extraUsers.push(u);
}

// Tạo thêm stories
for (let i = 0; i < 6; i++) {
  const title = `Truyện Demo ${i + 1}`;
  const slug = slugify(title, { lower: true });

  const story = await prisma.story.upsert({
    where: { slug },
    update: {},
    create: {
      title,
      slug,
      description: `Mô tả cho ${title}...`,
      type: Math.random() > 0.5 ? "TEXT" : "AUDIO",
      thumbnailUrl: `/images/stories/demo-${i + 1}.jpg`,
      authorId: extraUsers[Math.floor(Math.random() * extraUsers.length)].id,
      affiliateId:
        createdAffiliateLinks[
          Math.floor(Math.random() * createdAffiliateLinks.length)
        ].id,
      genres: {
        connect: [
          {
            id: createdGenres[Math.floor(Math.random() * createdGenres.length)]
              .id,
          },
        ],
      },
      viewCount: Math.floor(Math.random() * 5000),
    },
  });

  createdStories.push(story);
}

// Comment random từ nhiều users
for (const story of createdStories) {
  const chapters = await prisma.chapter.findMany({
    where: { storyId: story.id },
    take: 2,
  });

  for (const chapter of chapters) {
    for (let i = 0; i < 3; i++) {
      const randomUser =
        extraUsers[Math.floor(Math.random() * extraUsers.length)];
      await prisma.comment.create({
        data: {
          content: generateComment(),
          isApproved: Math.random() > 0.2, // 80% được duyệt
          userId: randomUser.id,
          chapterId: chapter.id,
        },
      });
    }
  }
}

// Random bookmarks
for (const u of extraUsers) {
  const randomStories = createdStories
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  for (const s of randomStories) {
    await prisma.bookmark.create({
      data: {
        userId: u.id,
        storyId: s.id,
      },
    });
  }
}
