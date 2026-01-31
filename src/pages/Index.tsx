import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { PlansSection } from "@/components/PlansSection";
import { PlanQuiz } from "@/components/PlanQuiz";
import { CoverageSection } from "@/components/CoverageSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { BusinessSection } from "@/components/BusinessSection";
import { SupportSection } from "@/components/SupportSection";
import { ReferralSection } from "@/components/ReferralSection";
import { FloatingChat } from "@/components/FloatingChat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PlansSection />
        <PlanQuiz />
        <TestimonialsSection />
        <CoverageSection />
        <BusinessSection />
        <SupportSection />
        <ReferralSection />
      </main>
      <Footer />
      <FloatingChat />
    </div>
  );
};

export default Index;
