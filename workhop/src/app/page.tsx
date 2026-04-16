"use client";

import { Navbar } from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { UseCases } from "@/components/landing/UseCases";
import Features from "@/components/landing/Features";
import DemoFlow from "@/components/landing/DemoFlow";
import CTA from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import PageTransition from "@/components/layout/PageTransition";

export default function RootPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-white selection:bg-primary-500/30">
        <Navbar />
        
        {/* Sections */}
        <Hero />
        
        <div id="problem-solution">
          <ProblemSolution />
        </div>

        <div id="how-it-works">
          <HowItWorks />
        </div>

        <div id="use-cases">
          <UseCases />
        </div>

        <div id="features">
          <Features />
        </div>

        <div id="demo-flow">
          <DemoFlow />
        </div>

        <div id="cta">
          <CTA />
        </div>

        <Footer />
      </main>
    </PageTransition>
  );
}
