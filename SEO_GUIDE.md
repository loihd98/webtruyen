# SEO Configuration Guide - khotruyen.vn

## ✅ Đã được cài đặt

### 1. **Meta Tags & Open Graph Protocol (OGP)**

- ✅ Title, Description, Keywords
- ✅ Open Graph tags (Facebook, Instagram)
- ✅ Twitter Cards
- ✅ Author: Evanloi9x
- ✅ Canonical URLs
- ✅ Language & Locale (vi_VN)

### 2. **Icons & Images**

- ✅ Favicon (SVG & ICO)
- ✅ Apple Touch Icon
- ✅ Open Graph Image (1200x630)
- ✅ Logo files
- ✅ Dynamic OG images với Next.js ImageResponse

### 3. **Progressive Web App (PWA)**

- ✅ manifest.json với đầy đủ thông tin
- ✅ Theme color
- ✅ App shortcuts
- ✅ Icons cho mobile

### 4. **SEO Files**

- ✅ robots.txt
- ✅ sitemap.ts (dynamic sitemap)
- ✅ humans.txt

### 5. **Structured Data (Schema.org)**

- ✅ Organization schema
- ✅ Website schema với SearchAction
- ✅ Book schema (cho truyện)
- ✅ Article schema (cho chapters)
- ✅ AudioBook schema
- ✅ BreadcrumbList schema
- ✅ JsonLd component

## 📝 Cần làm thêm

### 1. **Thay thế ảnh placeholder**

Các file SVG hiện tại chỉ là placeholder. Bạn cần:

- Thiết kế logo thực của website
- Tạo favicon.ico từ logo
- Tạo các kích thước icon: 16x16, 32x32, 180x180, 192x192, 512x512
- Tạo ảnh OG thumbnail đẹp hơn (1200x630px)

**Tools đề xuất:**

- Figma/Canva: Thiết kế logo
- favicon.io: Generate favicon từ logo
- squoosh.app: Optimize images

### 2. **Cập nhật biến môi trường**

File `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://khotruyen.vn
NEXT_PUBLIC_FB_APP_ID=your-actual-facebook-app-id
NEXT_PUBLIC_TWITTER_HANDLE=@Evanloi9x
```

### 3. **Facebook App ID**

- Tạo Facebook App tại: https://developers.facebook.com/
- Lấy App ID và thêm vào:
  - `frontend/src/app/layout.tsx` (line ~108)
  - File `.env.local`

### 4. **Google Search Console**

- Đăng ký site tại: https://search.google.com/search-console
- Lấy verification code
- Thêm vào `layout.tsx` trong phần `verification`

### 5. **Google Analytics (Optional)**

```tsx
// Thêm vào layout.tsx
import Script from 'next/script'

// Trong component:
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_TRACKING_ID}');
  `}
</Script>
```

### 6. **Dynamic Sitemap**

Uncomment code trong `sitemap.ts` để fetch stories từ API:

```typescript
// TODO: Fetch dynamic story pages from API
const storiesResponse = await fetch(`${baseUrl}/api/stories?limit=1000`);
const stories = await storiesResponse.json();
const storyPages: MetadataRoute.Sitemap = stories.data.map((story: any) => ({
  url: `${baseUrl}/stories/${story.slug}`,
  lastModified: new Date(story.updatedAt),
  changeFrequency: "weekly",
  priority: 0.8,
}));
```

### 7. **Social Media Links**

Thêm social media links vào `JsonLd.tsx` trong `getOrganizationSchema`:

```typescript
sameAs: [
  "https://facebook.com/khotruyen",
  "https://twitter.com/khotruyen",
  "https://instagram.com/khotruyen",
],
```

### 8. **Thêm structured data cho các trang**

#### Stories Detail Page

```tsx
import JsonLd, { getBookSchema, getBreadcrumbSchema } from '@/components/seo/JsonLd';

// Trong component:
<JsonLd data={getBookSchema(story, siteUrl)} />
<JsonLd data={getBreadcrumbSchema([
  { name: 'Trang chủ', url: '/' },
  { name: 'Truyện', url: '/stories' },
  { name: story.title, url: `/stories/${story.slug}` },
], siteUrl)} />
```

#### Chapter Page

```tsx
import JsonLd, { getArticleSchema, getBreadcrumbSchema } from '@/components/seo/JsonLd';

// Trong component:
<JsonLd data={getArticleSchema(chapter, story, siteUrl)} />
<JsonLd data={getBreadcrumbSchema([
  { name: 'Trang chủ', url: '/' },
  { name: 'Truyện', url: '/stories' },
  { name: story.title, url: `/stories/${story.slug}` },
  { name: chapter.title, url: `/stories/${story.slug}/${chapter.slug}` },
], siteUrl)} />
```

### 9. **Meta Tags cho từng trang động**

#### Story Detail Page

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const story = await fetchStory(params.slug);

  return {
    title: story.title,
    description: story.description,
    authors: [{ name: story.author || "Evanloi9x" }],
    openGraph: {
      title: story.title,
      description: story.description,
      type: "book",
      images: [story.coverImage || "/og-image.svg"],
      authors: [story.author],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.description,
      images: [story.coverImage || "/og-image.svg"],
    },
  };
}
```

## 🚀 Testing SEO

### 1. **Facebook Debugger**

- URL: https://developers.facebook.com/tools/debug/
- Test OG tags và xem preview

### 2. **Twitter Card Validator**

- URL: https://cards-dev.twitter.com/validator
- Test Twitter Cards

### 3. **Google Rich Results Test**

- URL: https://search.google.com/test/rich-results
- Test structured data

### 4. **Lighthouse (Chrome DevTools)**

```bash
# Run audit
npm run build
npm run start
# Open Chrome DevTools > Lighthouse > Run audit
```

### 5. **Schema Markup Validator**

- URL: https://validator.schema.org/
- Paste JSON-LD để validate

## 📊 SEO Checklist

- [x] Title tags (unique cho mỗi page)
- [x] Meta descriptions
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Canonical URLs
- [x] robots.txt
- [x] Sitemap
- [x] Structured data (JSON-LD)
- [x] Favicon & icons
- [x] Manifest.json (PWA)
- [x] Author information
- [ ] Replace placeholder images với logo thực
- [ ] Add Facebook App ID
- [ ] Setup Google Search Console
- [ ] Setup Google Analytics (optional)
- [ ] Add social media links
- [ ] Test với Facebook Debugger
- [ ] Test với Twitter Card Validator
- [ ] Test với Google Rich Results
- [ ] Submit sitemap to Google Search Console
- [ ] Submit to Bing Webmaster Tools

## 🎯 Performance Tips

1. **Optimize images**: Sử dụng WebP format, lazy loading
2. **Minimize JavaScript**: Code splitting, tree shaking
3. **Cache strategy**: CDN, browser caching
4. **Mobile-first**: Responsive design
5. **Core Web Vitals**: LCP, FID, CLS

## 📱 Social Media Preview

Khi share link trên Facebook/Instagram/Twitter, sẽ hiển thị:

- **Image**: og-image.svg (1200x630px)
- **Title**: khotruyen.vn - Đọc truyện online miễn phí
- **Description**: Kho truyện online miễn phí...
- **Author**: Evanloi9x

## 🔗 Useful Links

- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Schema.org](https://schema.org/)
- [Google SEO Guide](https://developers.google.com/search/docs)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

---

**Created by**: Evanloi9x
**Last updated**: 2025-11-12
