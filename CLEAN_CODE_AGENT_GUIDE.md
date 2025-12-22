# 🎯 Clean Code Agent Instructions
## Web Truyen Project - Next.js Frontend + Node.js Backend

**Project Version:** 1.0.0  
**Last Updated:** December 22, 2025  
**Stack:** Next.js 14 (App Router) + TypeScript, Node.js + Express + Prisma

---

## 📁 Project Architecture

```
webtruyen/
├── frontend/          # Next.js 14 (TypeScript, App Router)
│   ├── src/app/      # App Router pages
│   ├── src/components/  # React components
│   ├── src/utils/    # Utilities & API client
│   ├── src/store/    # Redux state management
│   └── src/types/    # TypeScript types
└── backend/          # Node.js Express API
    ├── src/controllers/  # Business logic
    ├── src/routes/   # API routes
    ├── src/middleware/  # Auth & validation
    ├── src/utils/    # Helper functions
    └── prisma/       # Database schema & migrations
```

---

## 🎨 Frontend Guidelines (Next.js + TypeScript)

### 1. **Component Structure**

#### ✅ DO: Use TypeScript with proper interfaces
```typescript
// components/DailyPopup.tsx
interface DailyPopupProps {
  storyId: string;
  affiliateLink?: string;
}

export default function DailyPopup({ storyId, affiliateLink }: DailyPopupProps) {
  // Component logic
}
```

#### ❌ DON'T: Use `any` type or skip interfaces
```typescript
// Bad
export default function DailyPopup({ storyId, affiliateLink }: any) {
  // ...
}
```

### 2. **File Naming Conventions**

- **Components:** PascalCase - `DailyPopup.tsx`, `StoryCard.tsx`
- **Pages (App Router):** lowercase - `page.tsx`, `layout.tsx`
- **Utils/Hooks:** camelCase - `useAuth.ts`, `api.ts`
- **Types:** camelCase - `index.ts`, `admin.ts`

### 3. **Component Organization**

```typescript
'use client'; // Only when needed (client components)

// 1. Imports - grouped logically
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/utils/api';

// 2. Constants - outside component
const STORAGE_KEY_PREFIX = 'dailyPopupShown_';

// 3. Helper functions - outside component if reusable
const isMobileDevice = () => {
  // Logic here
};

// 4. Interface/Types
interface ComponentProps {
  id: string;
  title: string;
}

// 5. Component
export default function Component({ id, title }: ComponentProps) {
  // State declarations
  const [isVisible, setIsVisible] = useState(false);
  
  // Hooks
  const router = useRouter();
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Event handlers
  const handleClose = () => {
    // Handler logic
  };
  
  // Early returns
  if (!isVisible) return null;
  
  // JSX
  return (
    <div>
      {/* Component markup */}
    </div>
  );
}
```

### 4. **State Management**

#### ✅ DO: Use Redux for global state (auth, bookmarks)
```typescript
// store/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    }
  }
});
```

#### ✅ DO: Use local state for component-specific data
```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState<Story | null>(null);
```

### 5. **API Calls**

#### ✅ DO: Use centralized API client
```typescript
// utils/api.ts - Already exists
import apiClient from '@/utils/api';

// In component
const fetchData = async () => {
  try {
    const response = await apiClient.get('/stories/slug');
    setData(response.data.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### ❌ DON'T: Make raw fetch/axios calls
```typescript
// Bad
const response = await fetch('http://localhost:5000/api/stories');
```

### 6. **Error Handling**

#### ✅ DO: Handle errors gracefully
```typescript
const [error, setError] = useState<string | null>(null);

try {
  const response = await apiClient.get('/data');
  setData(response.data.data);
  setError(null);
} catch (err) {
  console.error('Error fetching data:', err);
  setError('Không thể tải dữ liệu');
}
```

### 7. **Styling - Tailwind CSS**

#### ✅ DO: Use Tailwind utility classes
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200">
  Click me
</button>
```

#### ✅ DO: Use responsive classes
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### 8. **Next.js Specific**

#### ✅ DO: Use App Router conventions
```typescript
// app/stories/[slug]/page.tsx
interface PageProps {
  params: { slug: string };
}

export default function StoryPage({ params }: PageProps) {
  const { slug } = params;
  // ...
}
```

#### ✅ DO: Use Next.js Image component
```tsx
import Image from 'next/image';

<Image
  src={story.thumbnailUrl}
  alt={story.title}
  width={300}
  height={400}
  className="rounded-lg"
/>
```

#### ✅ DO: Use Next.js Link component
```tsx
import Link from 'next/link';

<Link href={`/stories/${story.slug}`}>
  {story.title}
</Link>
```

### 9. **Performance Optimization**

#### ✅ DO: Implement loading states
```typescript
if (loading) {
  return <div className="animate-pulse">Loading...</div>;
}
```

#### ✅ DO: Use useMemo/useCallback when needed
```typescript
const sortedStories = useMemo(() => {
  return stories.sort((a, b) => b.viewCount - a.viewCount);
}, [stories]);
```

### 10. **Accessibility**

#### ✅ DO: Use semantic HTML
```tsx
<button onClick={handleClick}>Submit</button>
<nav>...</nav>
<main>...</main>
<article>...</article>
```

#### ✅ DO: Add ARIA labels when needed
```tsx
<button aria-label="Close popup" onClick={handleClose}>
  ×
</button>
```

---

## 🚀 Backend Guidelines (Node.js + Express)

### 1. **Controller Structure**

#### ✅ DO: Use class-based controllers
```javascript
// controllers/storiesController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class StoriesController {
  async getStories(req, res) {
    try {
      // Validation
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      
      // Business logic
      const stories = await prisma.story.findMany({
        where: { status: 'PUBLISHED' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: true,
          genres: true
        }
      });
      
      // Success response
      return res.json({
        success: true,
        data: stories,
        pagination: {
          page,
          limit,
          total: await prisma.story.count()
        }
      });
    } catch (error) {
      console.error('Error fetching stories:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Không thể tải danh sách truyện'
      });
    }
  }
}

module.exports = new StoriesController();
```

### 2. **Response Format**

#### ✅ DO: Use consistent response structure
```javascript
// Success
res.json({
  success: true,
  data: result,
  pagination: { page, limit, total }
});

// Error
res.status(404).json({
  success: false,
  error: 'Not Found',
  message: 'Truyện không tồn tại'
});
```

### 3. **Route Structure**

#### ✅ DO: Organize routes logically
```javascript
// routes/stories.js
const express = require('express');
const router = express.Router();
const storiesController = require('../controllers/storiesController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', storiesController.getStories);
router.get('/:slug', optionalAuth, storiesController.getStoryBySlug);

// Protected routes
router.post('/', authenticateToken, storiesController.createStory);
router.put('/:id', authenticateToken, storiesController.updateStory);
router.delete('/:id', authenticateToken, storiesController.deleteStory);

module.exports = router;
```

### 4. **Middleware Pattern**

#### ✅ DO: Create reusable middleware
```javascript
// middleware/auth.js
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token không được cung cấp'
      });
    }
    
    const decoded = tokenService.verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Người dùng không tồn tại'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token không hợp lệ'
    });
  }
};
```

### 5. **Database Queries (Prisma)**

#### ✅ DO: Use Prisma's type-safe queries
```javascript
// Get with relations
const story = await prisma.story.findUnique({
  where: { slug },
  include: {
    author: {
      select: {
        id: true,
        name: true,
        avatar: true
      }
    },
    genres: true,
    chapters: {
      orderBy: { number: 'asc' },
      include: { affiliate: true }
    }
  }
});

// Create with relations
const newStory = await prisma.story.create({
  data: {
    title,
    slug,
    description,
    authorId: req.user.id,
    genres: {
      connect: genreIds.map(id => ({ id }))
    }
  },
  include: { genres: true }
});
```

#### ✅ DO: Use transactions for complex operations
```javascript
const result = await prisma.$transaction(async (tx) => {
  const story = await tx.story.create({ data: storyData });
  await tx.chapter.createMany({
    data: chapters.map(ch => ({ ...ch, storyId: story.id }))
  });
  return story;
});
```

### 6. **Input Validation**

#### ✅ DO: Validate all inputs
```javascript
// utils/validationService.js
class ValidationService {
  validateStoryData(data) {
    const errors = [];
    
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Tiêu đề không được để trống');
    }
    
    if (!data.description || data.description.length < 10) {
      errors.push('Mô tả phải có ít nhất 10 ký tự');
    }
    
    if (!['TEXT', 'AUDIO'].includes(data.type)) {
      errors.push('Loại truyện không hợp lệ');
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

// In controller
const validation = validationService.validateStoryData(req.body);
if (!validation.isValid) {
  return res.status(400).json({
    success: false,
    error: 'Validation Error',
    message: validation.errors.join(', ')
  });
}
```

### 7. **Error Handling**

#### ✅ DO: Use try-catch blocks consistently
```javascript
async getStoryBySlug(req, res) {
  try {
    const { slug } = req.params;
    
    const story = await prisma.story.findUnique({
      where: { slug }
    });
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Truyện không tồn tại'
      });
    }
    
    return res.json({ success: true, data: story });
  } catch (error) {
    console.error(`Error fetching story ${req.params.slug}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Lỗi khi tải truyện'
    });
  }
}
```

### 8. **Security Best Practices**

#### ✅ DO: Sanitize user inputs
```javascript
const slugify = require('slugify');

const slug = slugify(title, {
  lower: true,
  strict: true,
  locale: 'vi'
});
```

#### ✅ DO: Use parameterized queries (Prisma handles this)
```javascript
// Prisma automatically prevents SQL injection
const user = await prisma.user.findUnique({
  where: { email: req.body.email }
});
```

#### ✅ DO: Hash passwords
```javascript
const bcrypt = require('bcryptjs');

const hashedPassword = await bcrypt.hash(password, 10);
```

### 9. **File Organization**

```
backend/src/
├── index.js              # Entry point
├── config/
│   ├── index.js         # Environment config
│   └── passport.js      # OAuth config
├── controllers/         # Business logic (classes)
│   ├── storiesController.js
│   └── authController.js
├── middleware/          # Express middleware
│   └── auth.js
├── routes/              # Route definitions
│   ├── stories.js
│   └── auth.js
├── utils/               # Helper functions (classes)
│   ├── tokenService.js
│   └── validationService.js
└── prisma/              # Database
    └── schema.prisma
```

### 10. **Logging**

#### ✅ DO: Log errors with context
```javascript
console.error('Error creating story:', {
  error: error.message,
  userId: req.user?.id,
  timestamp: new Date().toISOString()
});
```

---

## 🔄 API Communication Pattern

### Frontend → Backend Flow

```typescript
// Frontend (TypeScript)
import apiClient from '@/utils/api';

const createStory = async (data: StoryFormData) => {
  try {
    const response = await apiClient.post('/stories', data);
    return response.data; // { success: true, data: story }
  } catch (error) {
    throw error;
  }
};
```

```javascript
// Backend (JavaScript)
async createStory(req, res) {
  try {
    const story = await prisma.story.create({
      data: req.body
    });
    
    return res.status(201).json({
      success: true,
      data: story
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
```

---

## 📝 Naming Conventions

### Variables & Functions
- **Frontend (TS):** camelCase - `isLoading`, `fetchStories`, `handleClick`
- **Backend (JS):** camelCase - `getStories`, `createUser`, `validateData`

### Constants
```typescript
// Frontend
const STORAGE_KEY_PREFIX = 'dailyPopupShown_';
const MAX_RETRIES = 3;

// Backend
const TOKEN_EXPIRY = '7d';
const UPLOAD_DIR = 'uploads/';
```

### Database Models (Prisma)
```prisma
// PascalCase for models
model Story { }
model User { }

// camelCase for fields
model Story {
  id String
  createdAt DateTime
  thumbnailUrl String?
}
```

---

## 🧪 Code Quality Checklist

### Before Committing Code

#### Frontend (Next.js)
- [ ] All TypeScript interfaces defined
- [ ] No `any` types used
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] API calls use centralized client
- [ ] Components use proper naming (PascalCase)
- [ ] Tailwind classes used (no inline styles)
- [ ] Responsive design implemented
- [ ] Next.js Image/Link components used
- [ ] 'use client' directive only when needed

#### Backend (Node.js)
- [ ] Controllers use class pattern
- [ ] All routes have error handling
- [ ] Input validation performed
- [ ] Consistent response format
- [ ] Prisma queries include necessary relations
- [ ] Authentication middleware applied
- [ ] SQL injection prevention (Prisma)
- [ ] Passwords hashed (bcrypt)
- [ ] Proper HTTP status codes
- [ ] Meaningful error messages (Vietnamese)

---

## 🚨 Common Mistakes to Avoid

### Frontend
❌ Mixing `'use client'` unnecessarily  
❌ Direct DOM manipulation (use React state)  
❌ Hardcoded API URLs (use environment variables)  
❌ Missing TypeScript types  
❌ Not handling loading/error states  
❌ Using `<a>` instead of `<Link>`  
❌ Using `<img>` instead of `<Image>`  

### Backend
❌ Missing try-catch blocks  
❌ Inconsistent response formats  
❌ Exposing sensitive data in responses  
❌ Not validating user inputs  
❌ Missing authentication checks  
❌ Not using Prisma transactions for related operations  
❌ Hardcoded configuration (use .env)  

---

## 🎯 Performance Guidelines

### Frontend
1. **Code Splitting**: Use dynamic imports for large components
2. **Image Optimization**: Always use Next.js `<Image>`
3. **Lazy Loading**: Implement for lists and images
4. **Memoization**: Use `useMemo` for expensive calculations
5. **Debouncing**: For search inputs

### Backend
1. **Database Queries**: Select only needed fields
2. **Pagination**: Always paginate large datasets
3. **Caching**: Consider Redis for frequently accessed data
4. **Indexing**: Ensure database indexes on slug, email, etc.
5. **Connection Pooling**: Let Prisma handle it

---

## 📦 Dependencies Management

### When Adding New Dependencies

#### Frontend
```bash
# Production dependencies
npm install <package>

# Dev dependencies
npm install -D <package>
```

#### Backend
```bash
# Production dependencies
npm install <package>

# Dev dependencies (nodemon, prisma, etc.)
npm install -D <package>
```

### Update Dependencies Carefully
```bash
# Check outdated packages
npm outdated

# Update specific package
npm update <package>
```

---

## 🔐 Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/webtruyen
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5000
NODE_ENV=development
```

---

## 🎨 UI/UX Standards

### Tailwind Colors
- Primary: `blue-600`, `purple-600`
- Success: `green-600`
- Warning: `yellow-600`
- Error: `red-600`
- Dark mode: `dark:bg-gray-900`, `dark:text-white`

### Spacing
- Container: `container mx-auto px-4`
- Card padding: `p-6`
- Button padding: `py-2 px-4` or `py-4 px-6`
- Grid gaps: `gap-4` or `gap-6`

### Transitions
```tsx
className="transition-all duration-200 hover:scale-[1.02]"
```

---

## 🐛 Debugging Tips

### Frontend
```typescript
// Use React DevTools
// Check console for errors
console.error('Error:', error);

// Use network tab for API calls
// Check Redux state with Redux DevTools
```

### Backend
```javascript
// Log with context
console.log('Processing request:', {
  method: req.method,
  path: req.path,
  userId: req.user?.id
});

// Use Prisma Studio to inspect database
npm run db:studio
```

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Express.js**: https://expressjs.com/

---

## ✅ Code Review Checklist

When reviewing code or implementing new features:

1. **Functionality**: Does it work as expected?
2. **Code Quality**: Follows conventions in this guide?
3. **Performance**: No unnecessary re-renders/queries?
4. **Security**: Inputs validated, auth checked?
5. **Error Handling**: All error cases covered?
6. **TypeScript**: Proper types, no `any`?
7. **Testing**: Can it be tested easily?
8. **Documentation**: Complex logic commented?
9. **Accessibility**: Semantic HTML, ARIA labels?
10. **Mobile**: Responsive design implemented?

---

## 🚀 Quick Reference

### Create New Feature

1. **Backend First**:
   ```javascript
   // 1. Update Prisma schema
   // 2. Run migration: npm run db:migrate
   // 3. Create controller method
   // 4. Add route
   // 5. Test with Postman/curl
   ```

2. **Frontend**:
   ```typescript
   // 1. Define TypeScript types
   // 2. Add API call in utils/api.ts
   // 3. Create component
   // 4. Add to page
   // 5. Test in browser
   ```

### Git Workflow
```bash
# Feature branch
git checkout -b feature/new-feature

# Commit often
git add .
git commit -m "feat: implement new feature"

# Push to remote
git push origin feature/new-feature
```

---

**End of Clean Code Guide**

*Remember: Clean code is not about being perfect, it's about being consistent, readable, and maintainable.*
