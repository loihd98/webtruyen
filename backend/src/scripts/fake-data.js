const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createFakeData() {
  try {
    console.log('Creating fake data...');

    // Create fake users
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
          name: 'Admin User',
          email: 'admin@example.com',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'ADMIN',
          avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff'
        }
      }),
      prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
          name: 'Regular User',
          email: 'user@example.com',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'USER',
          avatar: 'https://ui-avatars.com/api/?name=Regular+User&background=10b981&color=fff'
        }
      })
    ]);

    console.log('Users created:', users.length);

    // Create fake stories
    const stories = await Promise.all([
      // Audio stories
      prisma.story.create({
        data: {
          title: 'Truyện Audio: Cuộc Phiêu Lưu Kỳ Thú',
          slug: 'truyen-audio-cuoc-phieu-luu-ky-thu',
          description: 'Một câu chuyện phiêu lưu đầy hấp dẫn với những âm thanh sống động.',
          content: 'Đây là nội dung của truyện audio...',
          type: 'AUDIO',
          status: 'PUBLISHED',
          cover: 'https://picsum.photos/400/600?random=1',
          authorId: users[0].id,
          genres: ['ADVENTURE', 'FANTASY'],
          tags: ['phiêu lưu', 'audio', 'fantasy'],
          totalChapters: 10,
          totalViews: 1250,
          totalLikes: 89,
          avgRating: 4.5,
          isCompleted: false,
          isPremium: false
        }
      }),
      prisma.story.create({
        data: {
          title: 'Audio Drama: Tình Yêu Trong Mưa',
          slug: 'audio-drama-tinh-yeu-trong-mua',
          description: 'Một câu chuyện tình yêu lãng mạn với nhạc nền và âm thanh tự nhiên.',
          content: 'Câu chuyện bắt đầu trong một ngày mưa...',
          type: 'AUDIO',
          status: 'PUBLISHED',
          cover: 'https://picsum.photos/400/600?random=2',
          authorId: users[1].id,
          genres: ['ROMANCE', 'DRAMA'],
          tags: ['tình yêu', 'audio drama', 'romance'],
          totalChapters: 15,
          totalViews: 2840,
          totalLikes: 156,
          avgRating: 4.8,
          isCompleted: true,
          isPremium: true
        }
      }),
      // Text stories
      prisma.story.create({
        data: {
          title: 'Tiểu Thuyết: Hành Trình Về Phương Đông',
          slug: 'tieu-thuyet-hanh-trinh-ve-phuong-dong',
          description: 'Một hành trình đầy thử thách và khám phá bản thân.',
          content: 'Chương 1: Khởi hành\n\nNgười ta nói rằng mọi hành trình đều bắt đầu từ một bước chân...',
          type: 'TEXT',
          status: 'PUBLISHED',
          cover: 'https://picsum.photos/400/600?random=3',
          authorId: users[0].id,
          genres: ['ADVENTURE', 'HISTORICAL'],
          tags: ['hành trình', 'phương đông', 'lịch sử'],
          totalChapters: 25,
          totalViews: 5670,
          totalLikes: 234,
          avgRating: 4.3,
          isCompleted: false,
          isPremium: false
        }
      }),
      prisma.story.create({
        data: {
          title: 'Truyện Ngắn: Ký Ức Thành Phố',
          slug: 'truyen-ngan-ky-uc-thanh-pho',
          description: 'Những mảnh ký ức nhỏ về cuộc sống thành phố hiện đại.',
          content: 'Thành phố này luôn tấp nập, nhưng đôi khi trong những khoảnh khắc yên tĩnh...',
          type: 'TEXT',
          status: 'PUBLISHED',
          cover: 'https://picsum.photos/400/600?random=4',
          authorId: users[1].id,
          genres: ['SLICE_OF_LIFE', 'MODERN'],
          tags: ['thành phố', 'ký ức', 'hiện đại'],
          totalChapters: 8,
          totalViews: 1890,
          totalLikes: 67,
          avgRating: 4.1,
          isCompleted: true,
          isPremium: false
        }
      }),
      prisma.story.create({
        data: {
          title: 'Audio Book: Bí Mật Của Rừng Sâu',
          slug: 'audio-book-bi-mat-cua-rung-sau',
          description: 'Khám phá những bí ẩn ẩn giấu trong rừng sâu với âm thanh 3D.',
          content: 'Tiếng lá xào xạc, tiếng chim hót, và những âm thanh bí ẩn khác...',
          type: 'AUDIO',
          status: 'PUBLISHED',
          cover: 'https://picsum.photos/400/600?random=5',
          authorId: users[0].id,
          genres: ['MYSTERY', 'THRILLER'],
          tags: ['bí ẩn', 'rừng sâu', 'audio 3D'],
          totalChapters: 12,
          totalViews: 3420,
          totalLikes: 189,
          avgRating: 4.6,
          isCompleted: false,
          isPremium: true
        }
      })
    ]);

    console.log('Stories created:', stories.length);

    // Create chapters for each story
    for (const story of stories) {
      const chapterCount = Math.min(story.totalChapters, 3); // Create first 3 chapters
      
      for (let i = 1; i <= chapterCount; i++) {
        let chapterContent = '';
        let audioUrl = null;

        if (story.type === 'AUDIO') {
          chapterContent = `Nội dung chương ${i} của ${story.title}. Đây là phần mô tả cho audio.`;
          audioUrl = '/uploads/audio/7e0652ee-62db-4979-8bd1-fcd390549569.mp3'; // Use existing audio file
        } else {
          chapterContent = `Chương ${i}: ${story.title}

Đây là nội dung chi tiết của chương ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;
        }

        await prisma.chapter.create({
          data: {
            title: `Chương ${i}`,
            slug: `chuong-${i}`,
            content: chapterContent,
            chapterNumber: i,
            storyId: story.id,
            isPublished: true,
            isPremium: i > 2, // Chapters after 2 are premium
            audioUrl: audioUrl,
            duration: story.type === 'AUDIO' ? 1800 : null, // 30 minutes for audio
            wordCount: chapterContent.length
          }
        });
      }
    }

    console.log('Chapters created for all stories');

    // Create some bookmarks
    await prisma.bookmark.createMany({
      data: [
        {
          userId: users[1].id,
          storyId: stories[0].id
        },
        {
          userId: users[1].id,
          storyId: stories[2].id
        }
      ]
    });

    console.log('Bookmarks created');

    // Create some comments
    await prisma.comment.createMany({
      data: [
        {
          content: 'Truyện hay quá! Mong tác giả ra chương mới sớm.',
          userId: users[1].id,
          storyId: stories[0].id
        },
        {
          content: 'Audio quality rất tốt, giọng đọc rất hay.',
          userId: users[1].id,
          storyId: stories[1].id
        },
        {
          content: 'Cốt truyện hấp dẫn, đọc không thể rời mắt.',
          userId: users[1].id,
          storyId: stories[2].id
        }
      ]
    });

    console.log('Comments created');

    console.log('✅ Fake data created successfully!');
    console.log('\nCreated:');
    console.log('- 2 users (admin@example.com, user@example.com)');
    console.log('- 5 stories (3 audio, 2 text)');
    console.log('- 15 chapters total');
    console.log('- 2 bookmarks');
    console.log('- 3 comments');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@example.com / password');
    console.log('User: user@example.com / password');

  } catch (error) {
    console.error('Error creating fake data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFakeData();