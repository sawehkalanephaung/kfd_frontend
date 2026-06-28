'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import loginBg from '@/assets/login_bg.png';

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
      <div className="absolute inset-0 z-0 bg-[#0f172a]">
        <Image
          src={loginBg}
          alt="Mountains Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-90"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-slate-900/20" />
      </div>

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/65 backdrop-blur-[30px] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl p-8 md:p-10">

          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-inter">
              Admin Login
            </h1>
            <p className="text-slate-700 mt-2 text-center text-sm">
              Secure access to the administration portal
            </p>
          </div>

          {/* Server Error Message */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm text-center font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                  className={`w-full pl-11 pr-4 py-3 bg-white/20 border rounded-xl text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-md ${
                    emailError 
                      ? 'border-red-500/50 focus:ring-red-500' 
                      : 'border-white/40 focus:ring-emerald-500'
                  }`}
                  placeholder="admin@kfd.org"
                />
              </div>
              {emailError && <p className="text-red-600 text-xs font-medium ml-1 mt-1 animate-in slide-in-from-top-1">{emailError}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${passwordError ? 'text-red-500' : 'text-slate-600'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                    if (error) setError('');
                  }}
                  className={`w-full pl-11 pr-12 py-3 bg-white/20 border rounded-xl text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-md ${
                    passwordError 
                      ? 'border-red-500/50 focus:ring-red-500' 
                      : 'border-white/40 focus:ring-emerald-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordError && <p className="text-red-600 text-xs font-medium ml-1 mt-1 animate-in slide-in-from-top-1">{passwordError}</p>}
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border border-white/50 rounded-md bg-white/20 checked:bg-emerald-500 checked:border-emerald-500 transition-colors cursor-pointer"
                  />
                  <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-slate-800 font-medium select-none">Remember Me</span>
              </label>

              <a href="/forgot-password" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-white/80 text-sm font-medium drop-shadow-md">
          &copy; {new Date().getFullYear()} KFD Organization. All rights reserved.
        </div>
      </div>
    </div>
  );
}
