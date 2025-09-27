import { BenefitsSection } from "./sections/BenefitsSection/BenefitsSection";
import { FAQSection } from "./sections/FAQSection/FAQSection";
import  HeaderSection  from "./sections/HeaderSection/HeaderSection";
import { HowItWorksSection } from "./sections/HowItWorksSection/HowItWorksSection";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";
import { TrendingItemsSection } from "./sections/TrendingItemsSection/TrendingItemsSection";
import { TrustedBySection } from "./sections/TrustedBySection/TrustedBySection";
import { WelcomeBannerSection } from "./sections/WelcomeBannerSection/WelcomeBannerSection";

export const Frame = (): JSX.Element => {
  return (
    <div className="bg-[#06100A] overflow-x-hidden scrollbar-y relative">
      <div className="mx-absolute overflow-y">
        <HeaderSection />
        <WelcomeBannerSection />
        <TrendingItemsSection />
        <TrustedBySection />
        <BenefitsSection />
        <HowItWorksSection />
        <FAQSection />
        <MainContentSection />
      </div>
    </div>
  );
};