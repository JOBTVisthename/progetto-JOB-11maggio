
import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";

const Index = () => {
  return (
    <PageLayout withoutPadding>
      <Hero />
      <Features />
    </PageLayout>
  );
};

export default Index;
