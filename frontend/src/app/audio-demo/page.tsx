import AudioPlayerDemo from "@/components/audio/AudioPlayerDemo";
import Layout from "@/components/layout/Layout";

export default function AudioDemoPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <AudioPlayerDemo />
      </div>
    </Layout>
  );
}
