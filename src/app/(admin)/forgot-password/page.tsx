'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import loginBg from '@/assets/login_bg.png';
import Link from 'next/link';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[#0f172a]">
        <Image
          src={loginBg}
          alt="Mountains Background"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-90"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-slate-900/20" />
      </div>

      {/* Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-canvas/65 backdrop-blur-[30px] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-lg p-8 md:p-10">

          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-inter">
              Forgot Password
            </h1>
            <p className="text-slate-700 mt-2 text-center text-sm">
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* Server Error Message */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm text-center font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-green/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-brand-green-dark" />
                </div>
                <p className="text-slate-800 text-center text-sm font-medium">
                  If the email exists in our system, a password reset link has been sent. Please check your inbox.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full py-3.5 mt-4 bg-brand-green hover:bg-emerald-400 text-slate-900 font-bold rounded-full shadow-lg shadow-brand-green/20 transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-green flex items-center justify-center gap-2"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute z-10 inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${emailError ? 'text-red-500' : 'text-slate-600'}`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                      if (error) setError('');
                    }}
                    className={`w-full pl-11 pr-4 py-3 bg-canvas/20 border rounded-xl text-slate-900 placeholder:text-slate-500/70 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-md ${
                      emailError
                        ? 'border-red-500/50 focus:ring-red-500'
                        : 'border-white/40 focus:ring-brand-green'
                    }`}
                    placeholder="e.g. name@company.com"
                  />
                </div>
                {emailError && <p className="text-red-600 text-xs font-medium ml-1 mt-1 animate-in slide-in-from-top-1">{emailError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-4 bg-brand-green hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed text-slate-900 font-bold rounded-full shadow-lg shadow-brand-green/20 transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div className="flex items-center justify-center pt-2">
                <Link href="/login" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-white/80 text-sm font-medium drop-shadow-md">
          &copy; {new Date().getFullYear()} KFD Organization. All rights reserved.
        </div>
      </div>
    </div>
  );
}
