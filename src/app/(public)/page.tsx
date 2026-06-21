import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight font-inter">
          Karen Forest Department
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Welcome to the public portal for KFD. This site is currently under development.
        </p>
        
        <div className="pt-8">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95"
          >
            Go to Admin Portal
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
