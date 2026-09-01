'use client';

import React, { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import loginBg from '@/assets/login_bg.png';
import { Button } from '@/components/ui/button';

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const emailId = useId();
  const passwordId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    let isValid = true;

    // Client-side Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      const { token, firstName, lastName, roles } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('kfd_user', JSON.stringify({ firstName, lastName, roles }));
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Unable to connect to the server. The backend may be down or offline.');
      } else if (err.response.status >= 500) {
        setError('The server encountered an internal error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtle-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-subtle-gradient {
          background-size: 400% 400%;
          animation: subtle-gradient 10s ease infinite;
        }
      `}} />
      <div className="absolute inset-0 z-0 bg-linear-to-r from-green-100 via-teal-50 to-emerald-200 dark:from-forest-900 dark:via-emerald-950 dark:to-[#0a1f16] animate-subtle-gradient" />

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-canvas/65 dark:bg-canvas/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl rounded-2xl p-8 md:p-10">

          <div className="flex flex-col items-center mb-8">

            <h1 className="text-3xl font-bold text-ink dark:text-white tracking-tight font-inter">
              Login
            </h1>
            <p className="text-slate-700 dark:text-slate-300 mt-2 text-center text-sm">
              Secure access to the administration portal
            </p>
          </div>

          {/* Server Error Message */}
          {error && (
            <div role="alert" className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm text-center font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor={emailId} className="text-sm font-semibold text-ink dark:text-slate-200 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute z-10 inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${emailError ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`} aria-hidden="true" />
                </div>
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
                  className={`w-full pl-11 pr-4 py-3 bg-canvas/20 border rounded-xl text-ink dark:text-white placeholder:text-slate-500/70 dark:placeholder:text-slate-400/70 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-md ${emailError
                    ? 'border-red-500/50 focus:ring-red-500'
                    : 'border-white/40 focus:ring-brand-green'
                    }`}
                  placeholder="e.g. name@company.com"
                />
              </div>
              {emailError && <p id={emailErrorId} role="alert" className="text-red-600 text-xs font-medium ml-1 mt-1 animate-in slide-in-from-top-1">{emailError}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor={passwordId} className="text-sm font-semibold text-ink dark:text-slate-200 ml-1">Password</label>
              <div className="relative">
                <div className="absolute z-10 inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${passwordError ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`} aria-hidden="true" />
                </div>
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                    if (error) setError('');
                  }}
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? passwordErrorId : undefined}
                  className={`w-full pl-11 pr-12 py-3 bg-canvas/20 border rounded-xl text-ink dark:text-white placeholder:text-slate-500/70 dark:placeholder:text-slate-400/70 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-md ${passwordError
                    ? 'border-red-500/50 focus:ring-red-500'
                    : 'border-white/40 focus:ring-brand-green'
                    }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {passwordError && <p id={passwordErrorId} role="alert" className="text-red-600 text-xs font-medium ml-1 mt-1 animate-in slide-in-from-top-1">{passwordError}</p>}
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border border-white/50 rounded-md bg-canvas/20 checked:bg-brand-green checked:border-emerald-500 transition-colors cursor-pointer"
                  />
                  <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-slate-800 dark:text-slate-200 font-medium select-none">Remember Me</span>
              </label>

              <a href="/forgot-password" className="text-sm font-semibold text-brand-green-dark dark:text-brand-green hover:text-emerald-900 dark:hover:text-emerald-400 transition-colors">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center text-slate-800 dark:text-white/80 text-sm font-medium drop-shadow-md">
          &copy; {new Date().getFullYear()} KFD Organization. All rights reserved.
        </div>
      </div>
    </div>
  );
}
