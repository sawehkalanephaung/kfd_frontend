'use client';

import React, { useId, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api, { getMediaUrl } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const emailId = useId();
  const emailErrorId = useId();

  // Identity data from API
  const [identity, setIdentity] = useState<{
    footerCopyright?: string;
    organizationName?: string;
    organizationNameKaren?: string;
    resolvedLogoUrl?: string;
  }>({
    footerCopyright: '© 2026 KFD Organization. All rights reserved.',
    organizationName: 'Kawthoolei Forestry Department',
    organizationNameKaren: 'KAREN NATIONAL UNION',
    resolvedLogoUrl: '',
  });

  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const res = await api.get('/api/v1/public/site-identity');
        const data = res.data?.data ?? res.data;
        if (data) {
          setIdentity(prev => ({
            footerCopyright: data.footerCopyright || prev.footerCopyright,
            organizationName: data.organizationName || prev.organizationName,
            organizationNameKaren: data.organizationNameKaren || prev.organizationNameKaren,
            resolvedLogoUrl: data.logoUrl ? getMediaUrl(data.logoUrl) : prev.resolvedLogoUrl,
          }));
        }
      } catch (e) {
        console.error('Failed to load site identity', e);
      }
    };
    fetchIdentity();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    // Client-side Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email address is required.');
      return;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/v1/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Unable to connect to the server. The backend may be down or offline.');
      } else if (err.response.status >= 500) {
        setError('The server encountered an internal error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'An error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex flex-col lg:flex-row overflow-hidden bg-[#F6F7F5]">
      {/* Left Panel (Dark Green) */}
      <div className="w-full lg:w-[45%] bg-[#183925] px-6 py-3 lg:px-12 lg:py-[clamp(1.25rem,5vh,3rem)] xl:px-16 xl:py-[clamp(1.25rem,5vh,4rem)] flex flex-col justify-between shrink-0 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute -bottom-[20%] -right-[20%] w-[80%] aspect-square rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] aspect-square rounded-full border border-white/5 pointer-events-none" />
        
        {/* Top: Logo */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
            {identity.resolvedLogoUrl ? (
              <img src={identity.resolvedLogoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M4 10L12 4L20 10V20H4V10Z" stroke="#D5B77A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M9 20V12H15V20" stroke="#D5B77A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
            )}
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">{identity.organizationName}</p>
            <p className="text-[#D5B77A] text-xs font-semibold tracking-wider uppercase">{identity.organizationNameKaren}</p>
          </div>
        </div>

        {/* Middle: Title (Hidden on mobile) */}
        <div className="hidden lg:block relative z-10 my-[clamp(1rem,6vh,5rem)]">
          <p className="text-[clamp(1.75rem,4.5vh,2.25rem)] xl:text-[clamp(2rem,5.5vh,3rem)] font-serif text-white leading-tight mb-[clamp(0.5rem,2vh,1.5rem)]">
            Recover access to your account
          </p>
          <p className="text-white/80 text-base max-w-sm leading-relaxed">
            Reset links are sent only to the email registered to your staff account.
          </p>
        </div>

        {/* Bottom: Warning Box (Hidden on mobile) */}
        <div className="hidden lg:flex relative z-10 p-[clamp(0.75rem,2.5vh,1.25rem)] rounded-xl border border-white/20 bg-white/5 items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-[#D5B77A] shrink-0 mt-0.5" />
          <p className="text-white/90 text-sm leading-relaxed">
            Staff will never ask for your password by email or phone. If you didn't request a reset, you can ignore the message.
          </p>
        </div>
      </div>

      {/* Right Panel (Light Beige) */}
      <div className="w-full lg:w-[55%] flex-1 grid grid-rows-[1fr_auto_1fr] relative px-6 py-[clamp(0.75rem,5vh,3rem)] lg:px-[clamp(2rem,5vw,5rem)] lg:py-[clamp(1rem,5vh,4rem)]">
        {/* Equal 1fr rows above and below keep the form in the true middle of
            the panel; the footer sits at the bottom of the lower row. */}
        <div aria-hidden="true" />
        
        <main id="main-content" className="max-w-[420px] w-full mx-auto">
          
          <Link href="/login" className="flex items-center gap-2 py-1.5 -my-1.5 pointer-coarse:py-3.5 pointer-coarse:-my-3.5 text-[#1F5132] font-bold text-sm mb-[clamp(0.75rem,4vh,3rem)] hover:text-[#183925] transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          <h1 className="text-[clamp(1.5rem,4.2vh,2.25rem)] font-serif font-bold text-[#0A1A10] mb-2">Reset your password</h1>
          <p className="text-[#4E5C53] mb-[clamp(1rem,3.5vh,2.5rem)] text-sm sm:text-base">Enter the email linked to your staff account and we'll send you a link to set a new password.</p>

          {/* Server Error Message */}
          {error && (
            <div role="alert" className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-6">
              <div className="flex flex-col items-start justify-center space-y-4 bg-brand-green/10 p-6 rounded-xl border border-brand-green/20">
                <div className="w-12 h-12 rounded-full bg-[#1F5132] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <p className="text-[#0A1A10] font-medium leading-relaxed">
                  If the email exists in our system, a password reset link has been sent. Please check your inbox.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-[clamp(0.75rem,2.4vh,1.5rem)]" noValidate>
              
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor={emailId} className="block text-sm font-bold text-[#0A1A10]">Email address</label>
                <div className="relative">
                  <input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                      if (error) setError('');
                    }}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? emailErrorId : undefined}
                    className={`w-full bg-white border rounded-lg px-4 h-[clamp(2.75rem,6vh,3rem)] text-[#0A1A10] placeholder:text-[#667069] focus:outline-none focus:ring-2 focus:ring-[#1F5132]/20 focus:border-[#1F5132] transition-colors ${emailError ? 'border-red-500' : 'border-[#C9CEC8]'}`}
                    placeholder="name@kfd.org"
                  />
                </div>
                {emailError && <p id={emailErrorId} role="alert" className="text-red-600 text-xs font-medium animate-in slide-in-from-top-1">{emailError}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />}
                {loading ? 'Sending...' : 'Send reset link'}
                {!loading && <ArrowRight className="w-5 h-5" aria-hidden="true" />}
              </Button>
            </form>
          )}

          <p className="text-sm text-[#4E5C53] mt-[clamp(0.75rem,3.5vh,2.5rem)] leading-relaxed max-w-[90%] [@media(max-height:620px)]:hidden [@media(max-height:800px)_and_(max-width:480px)]:hidden">
            No longer have access to this email? Contact your system administrator to verify your identity and update it.
          </p>

        </main>

        {/* Footer Area */}
        <div className="self-end mt-[clamp(0.75rem,4vh,4rem)] border-t border-[#C9CEC8] pt-[clamp(0.5rem,2vh,1.5rem)] flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 w-full text-[12px] text-[#4E5C53]">
          <p className="[@media(max-height:800px)_and_(max-width:480px)]:hidden">{identity.footerCopyright}</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="/privacy-policy" className="inline-block py-1.5 -my-1.5 pointer-coarse:py-3.5 pointer-coarse:-my-3.5 hover:text-[#183925] underline decoration-transparent hover:decoration-[#183925] underline-offset-2 transition-all">Privacy</a>
            <a href="/accessibility" className="inline-block py-1.5 -my-1.5 pointer-coarse:py-3.5 pointer-coarse:-my-3.5 hover:text-[#183925] underline decoration-transparent hover:decoration-[#183925] underline-offset-2 transition-all">Accessibility</a>
            <a href="/terms-of-use" className="inline-block py-1.5 -my-1.5 pointer-coarse:py-3.5 pointer-coarse:-my-3.5 hover:text-[#183925] underline decoration-transparent hover:decoration-[#183925] underline-offset-2 transition-all">Terms of use</a>
          </div>
        </div>

      </div>
    </div>
  );
}
