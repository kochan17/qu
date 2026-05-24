import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { Features } from "@/components/sections/features";
import { Certifications } from "@/components/sections/certifications";
import { ContentGrid } from "@/components/sections/content-grid";
import { LearningDesign } from "@/components/sections/learning-design";
import { Pricing } from "@/components/sections/pricing";
import { FAQ } from "@/components/sections/faq";
import { FinalCTA } from "@/components/sections/final-cta";
import { Footer } from "@/components/footer";

export default function Home(): React.ReactElement {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Features />
        <Certifications />
        <ContentGrid />
        <LearningDesign />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
