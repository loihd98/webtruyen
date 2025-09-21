import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import FeaturedStories from "../components/home/FeaturedStories";

export default function HomePage() {
  return (
    <Layout>
      <Hero />
      <FeaturedStories />
    </Layout>
  );
}
