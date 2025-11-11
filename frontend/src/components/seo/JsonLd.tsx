import Script from "next/script";

interface JsonLdProps {
  data: any;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Schema for Organization
export function getOrganizationSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "khotruyen.vn",
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    description:
      "Kho truyện online miễn phí với hàng ngàn truyện chữ và truyện audio hấp dẫn",
    founder: {
      "@type": "Person",
      name: "Evanloi9x",
    },
    sameAs: [
      // Thêm các social media links của bạn
      // "https://facebook.com/yourpage",
      // "https://twitter.com/yourhandle",
      // "https://instagram.com/yourhandle",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["Vietnamese"],
    },
  };
}

// Schema for Website
export function getWebsiteSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "khotruyen.vn",
    url: siteUrl,
    description:
      "Kho truyện online miễn phí - Đọc và nghe truyện mọi lúc mọi nơi",
    publisher: {
      "@type": "Organization",
      name: "khotruyen.vn",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.svg`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/stories?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "vi-VN",
  };
}

// Schema for Book (Story)
export function getBookSchema(story: any, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: story.title,
    description: story.description,
    url: `${siteUrl}/stories/${story.slug}`,
    image: story.coverImage || `${siteUrl}/og-image.svg`,
    author: {
      "@type": "Person",
      name: story.author || "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: "khotruyen.vn",
    },
    datePublished: story.createdAt,
    dateModified: story.updatedAt,
    inLanguage: "vi-VN",
    genre: story.genres?.join(", ") || "Fiction",
    aggregateRating: story.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: story.rating.average,
          reviewCount: story.rating.count,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}

// Schema for Article (Chapter)
export function getArticleSchema(chapter: any, story: any, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: chapter.title,
    description: story.description,
    url: `${siteUrl}/stories/${story.slug}/${chapter.slug}`,
    image: story.coverImage || `${siteUrl}/og-image.svg`,
    author: {
      "@type": "Person",
      name: story.author || "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: "khotruyen.vn",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.svg`,
      },
    },
    datePublished: chapter.createdAt,
    dateModified: chapter.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/stories/${story.slug}/${chapter.slug}`,
    },
    isPartOf: {
      "@type": "Book",
      name: story.title,
      url: `${siteUrl}/stories/${story.slug}`,
    },
    inLanguage: "vi-VN",
  };
}

// Schema for AudioBook
export function getAudioBookSchema(story: any, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    name: story.title,
    description: story.description,
    url: `${siteUrl}/stories/${story.slug}`,
    thumbnail: story.coverImage || `${siteUrl}/og-image.svg`,
    contentUrl: story.audioUrl,
    encodingFormat: "audio/mpeg",
    author: {
      "@type": "Person",
      name: story.author || "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: "khotruyen.vn",
    },
    datePublished: story.createdAt,
    inLanguage: "vi-VN",
  };
}

// Schema for BreadcrumbList
export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}
