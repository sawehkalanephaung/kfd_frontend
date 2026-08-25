'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicLoading() {
  const pathname = usePathname();

  // Show detailed skeleton for home page
  if (pathname === '/') {
    return (
      <div className="flex flex-col min-h-screen animate-in fade-in duration-500">
        {/* Hero Section Skeleton */}
        <section className="relative w-full h-[600px] flex items-center overflow-hidden bg-[#0d1f15]">
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <Skeleton className="h-14 w-full sm:w-3/4 mb-6 !bg-zinc-800/50" />
              <Skeleton className="h-14 w-1/2 mb-6 !bg-zinc-800/50" />

              <Skeleton className="h-6 w-full max-w-xl mb-3 !bg-zinc-800/50" />
              <Skeleton className="h-6 w-4/5 max-w-xl mb-10 !bg-zinc-800/50" />

              <div className="flex flex-wrap items-center gap-4">
                <Skeleton className="h-12 w-40 rounded-full !bg-zinc-800/50" />
                <Skeleton className="h-12 w-32 rounded-full !bg-zinc-800/50" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section Skeleton */}
        <section className="bg-[#132a1c] py-12 border-t border-[#1a3626]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-y-8 lg:gap-y-0 lg:divide-x lg:divide-green-800/50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col px-4 lg:px-12 w-1/2 lg:w-auto items-center lg:items-start">
                  <Skeleton className="h-10 w-24 mb-2 !bg-zinc-800/50" />
                  <Skeleton className="h-4 w-32 mb-1 !bg-zinc-800/50" />
                  <Skeleton className="h-3 w-40 !bg-zinc-800/50" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Departments Section Skeleton */}
        <section className="py-20 bg-surface">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-canvas border border-hairline rounded-lg shadow-sm flex flex-col h-[420px] overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none shrink-0" />
                  <div className="p-8 flex flex-col flex-grow">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-2" />
                    <Skeleton className="h-4 w-4/5 mb-8" />
                    <Skeleton className="h-4 w-20 mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* News Section Skeleton */}
        <section className="py-20 bg-canvas border-t border-hairline">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col h-full">
                      <Skeleton className="w-full h-52 rounded-xl mb-5 shrink-0" />
                      <div className="flex items-center justify-between mb-3">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6 mb-2" />
                      <Skeleton className="h-4 w-4/5 mb-4" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1 flex flex-col">
                <Skeleton className="h-8 w-64 mb-8" />
                <div className="bg-surface border border-hairline rounded-2xl p-6 flex flex-col gap-6 flex-grow">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-4 -mx-4">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      <div className="w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-5 w-full mb-1" />
                        <Skeleton className="h-5 w-3/4" />
                      </div>
                    </div>
                  ))}
                  <div className="mt-auto pt-4 flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Show a generic skeleton for all other pages (About, Contact, etc.)
  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500 bg-canvas">
      {/* Generic Hero Section Skeleton */}
      <section className="relative w-full h-[350px] flex items-center bg-[#0d1f15] mb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <Skeleton className="h-12 w-full max-w-2xl mb-6 !bg-zinc-800/50" />
          <Skeleton className="h-6 w-3/4 max-w-xl !bg-zinc-800/50" />
        </div>
      </section>

      {/* Generic Content Block Skeleton */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="max-w-4xl mx-auto mb-16">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="space-y-4 mb-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Generic Grid Skeleton (looks good for team members, news cards, or gallery) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-hairline rounded-xl overflow-hidden h-[380px] flex flex-col">
              <Skeleton className="h-48 w-full rounded-none shrink-0" />
              <div className="p-6 flex flex-col flex-grow">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
