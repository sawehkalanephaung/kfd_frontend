import React from 'react';
import HeroSection from './_components/landing/HeroSection';
import StatsSection from './_components/landing/StatsSection';
import MissionSection from './_components/landing/MissionSection';
import DepartmentsSection from './_components/landing/DepartmentsSection';

export default function PublicHome() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <MissionSection />
      <DepartmentsSection />
    </>
  );
}
