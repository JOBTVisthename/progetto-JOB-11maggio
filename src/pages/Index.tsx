
import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <PageLayout withoutPadding>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </PageLayout>
  );
};

export default Index;
