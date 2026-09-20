'use client';

import React, { useId, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import api, { getMediaUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { validateLoginFields, hasLoginFieldErrors, getLoginErrorMessage, type LoginFieldErrors } from '@/lib/auth-validation';

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const emailId = useId();
  const passwordId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Identity data from API
  const [identity, setIdentity] = useState<{
    footerCopyright?: string;
    organizationName?: string;
    organizationNameKaren?: string;
    resolvedLogoUrl?: string;
  }>({
    footerCopyright: '© 2026 KFD Organization, All rights reserved, Privacy, Accessibility and Terms of use',
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

    const validationErrors = validateLoginFields({ email, password });
    setFieldErrors(validationErrors);

    if (hasLoginFieldErrors(validationErrors)) {
      // Move focus to the first invalid field so keyboard/screen-reader
      // users land directly on what needs fixing instead of re-scanning the form.
      if (validationErrors.email) {
        emailInputRef.current?.focus();
      } else if (validationErrors.password) {
        passwordInputRef.current?.focus();
      }
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/v1/auth/login', { email: email.trim(), password });
      const { token, firstName, lastName, roles } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('kfd_user', JSON.stringify({ firstName, lastName, roles }));
      router.push('/dashboard');
    } catch (err) {
      setError(getLoginErrorMessage(err));
      passwordInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-[#F6F7F5]">
      {/* Left Panel (Dark Green) */}
      <div className="w-full lg:w-[45%] bg-[#183925] p-6 lg:p-12 xl:p-16 flex flex-col justify-between shrink-0 relative overflow-hidden">
        {/* Abstract shapes (optional embellishment based on reference) */}
        <div className="absolute -bottom-[20%] -right-[20%] w-[80%] aspect-square rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] aspect-square rounded-full border border-white/5 pointer-events-none" />
        
        {/* Top: Logo */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
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
            <h1 className="text-white font-bold text-lg leading-tight">{identity.organizationName}</h1>
            <p className="text-[#D5B77A] text-xs font-semibold tracking-wider uppercase">{identity.organizationNameKaren}</p>
          </div>
        </div>

        {/* Middle: Title (Hidden on mobile) */}
        <div className="hidden lg:block relative z-10 mt-20 mb-20">
          <h2 className="text-4xl xl:text-5xl font-serif text-white leading-tight mb-6">
            Secure access for<br/>authorized staff
          </h2>
          <p className="text-white/80 text-base max-w-sm leading-relaxed">
            Manage records, services and organizational settings from one protected workspace.
          </p>
        </div>

        {/* Bottom: Warning Box (Hidden on mobile) */}
        <div className="hidden lg:flex relative z-10 p-5 rounded-xl border border-white/20 bg-white/5 items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-[#D5B77A] shrink-0 mt-0.5" />
          <p className="text-white/90 text-sm leading-relaxed">
            This is an official KFD Organization system. Access is restricted to authorized users, and activity may be monitored and logged.
          </p>
        </div>
      </div>

      {/* Right Panel (Light Beige) */}
      <div className="w-full lg:w-[55%] flex-1 flex flex-col relative px-6 py-12 lg:px-20 lg:py-16">
        
        <div className="flex-1 flex flex-col justify-center max-w-[420px] w-full mx-auto lg:mx-0">
          <h2 className="text-4xl font-serif font-bold text-[#0A1A10] mb-2">Sign in</h2>
          <p className="text-[#4E5C53] mb-10 text-base">Use your KFD staff account to continue.</p>

          {/* Server Error Message */}
          {error && (
            <div role="alert" className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor={emailId} className="block text-sm font-bold text-[#0A1A10]">Email address</label>
              <div className="relative">
                <input
                  ref={emailInputRef}
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    if (error) setError('');
                  }}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? emailErrorId : undefined}
                  className={`w-full bg-white border rounded-lg px-4 py-3.5 text-ink placeholder:text-[#A3AAA4] focus:outline-none focus:ring-2 focus:ring-[#1F5132]/20 focus:border-[#1F5132] transition-colors ${fieldErrors.email ? 'border-red-500' : 'border-[#C9CEC8]'}`}
                  placeholder="name@kfd.org"
                />
              </div>
              {fieldErrors.email && <p id={emailErrorId} role="alert" className="text-red-600 text-xs font-medium animate-in slide-in-from-top-1">{fieldErrors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor={passwordId} className="block text-sm font-bold text-[#0A1A10]">Password</label>
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    if (error) setError('');
                  }}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? passwordErrorId : undefined}
                  className={`w-full bg-white border rounded-lg pl-4 pr-12 py-3.5 text-ink placeholder:text-[#A3AAA4] focus:outline-none focus:ring-2 focus:ring-[#1F5132]/20 focus:border-[#1F5132] transition-colors ${fieldErrors.password ? 'border-red-500' : 'border-[#C9CEC8]'}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A3AAA4] hover:text-[#4E5C53] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {fieldErrors.password && <p id={passwordErrorId} role="alert" className="text-red-600 text-xs font-medium animate-in slide-in-from-top-1">{fieldErrors.password}</p>}
            </div>

            <div className="flex items-center justify-end pt-1">
              <a href="/forgot-password" className="text-sm font-bold text-[#1F5132] hover:text-[#183925] underline decoration-transparent hover:decoration-[#183925] underline-offset-4 transition-all">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F5132] hover:bg-[#183925] text-white rounded-lg py-6 text-[15px] font-bold shadow-none transition-colors"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </form>
        </div>

        {/* Footer Area */}
        <div className="mt-16 border-t border-[#C9CEC8] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 w-full text-[12px] text-[#4E5C53]">
          <p>{identity.footerCopyright}</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="/privacy-policy" className="hover:text-[#183925] underline decoration-transparent hover:decoration-[#183925] underline-offset-2 transition-all">Privacy</a>
            <a href="/accessibility" className="hover:text-[#183925] underline decoration-transparent hover:decoration-[#183925] underline-offset-2 transition-all">Accessibility</a>
            <a href="/terms-of-use" className="hover:text-[#183925] underline decoration-transparent hover:decoration-[#183925] underline-offset-2 transition-all">Terms of use</a>
          </div>
        </div>

      </div>
    </div>
  );
}
