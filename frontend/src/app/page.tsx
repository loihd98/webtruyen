import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import FeaturedStories from "../components/home/FeaturedStories";
import JsonLd, {
  getOrganizationSchema,
  getWebsiteSchema,
} from "../components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://khotruyen.vn";

export default function HomePage() {
  return (
    <>
      <JsonLd data={getOrganizationSchema(siteUrl)} />
      <JsonLd data={getWebsiteSchema(siteUrl)} />
      <Layout>
        <Hero />
        <FeaturedStories />
      </Layout>
    </>
  );
}
