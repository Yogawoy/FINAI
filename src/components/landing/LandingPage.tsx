'use client';

import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ValueStrip from './ValueStrip';
import FeaturesSection from './FeaturesSection';
import AISection from './AISection';
import HowItWorksSection from './HowItWorksSection';
import GoalPreviewSection from './GoalPreviewSection';
import AnalyticsPreviewSection from './AnalyticsPreviewSection';
import TrustSection from './TrustSection';
import CTASection from './CTASection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F6F7FB] text-[#242636] relative overflow-x-hidden selection:bg-[#E4E2FB] selection:text-[#7C7CE6]">
      {/* Background Soft Lavender Ambience Layers */}
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#E4E2FB]/40 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 -right-24 w-[600px] h-[600px] rounded-full bg-[#D6E4FA]/35 blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 -left-24 w-[600px] h-[600px] rounded-full bg-[#ECE9FD]/30 blur-[140px] pointer-events-none -z-10" />

      {/* 1. Header & Navigation */}
      <Navbar />

      <main className="pt-20 sm:pt-24">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Value Strip (Catat, Atur, Rencanakan, Pahami) */}
        <ValueStrip />

        {/* 4. Fitur Section (3x2 Grid) */}
        <FeaturesSection />

        {/* 5. AI Assistant Section */}
        <AISection />

        {/* 6. How It Works (01, 02, 03) */}
        <HowItWorksSection />

        {/* 7. Target Section (Goal Card Preview) */}
        <GoalPreviewSection />

        {/* 8. Analytics Section (Interactive Chart Preview) */}
        <AnalyticsPreviewSection />

        {/* 9. Security & Trust Section */}
        <TrustSection />

        {/* 10. Final Call to Action */}
        <CTASection />
      </main>

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}
