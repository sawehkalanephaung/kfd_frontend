'use client';

import React, { useId, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import loginBg from '@/assets/login_bg.png';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordId = useId();
  const confirmPasswordId = useId();
  const passwordErrorId = useId();
  const confirmPasswordErrorId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let isValid = true;

    if (!newPassword) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    if (!token) {
      setError('Invalid or missing reset token.');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      await api.post('/api/v1/auth/reset-password', { token, newPassword });
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Unable to connect to the server. The backend may be down or offline.');
      } else if (err.response.status >= 500) {
        setError('The server encountered an internal error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to reset password. The token may be expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-slate-800 text-center text-sm font-medium">
          Invalid or missing reset token. Please request a new password reset link.
        </p>
        <Link
          href="/forgot-password"
          className="w-full py-3.5 mt-4 bg-brand-green hover:bg-emerald-400 text-slate-900 font-bold rounded-full shadow-lg shadow-brand-green/20 transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-green flex items-center justify-center gap-2"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-green/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-brand-green-dark" />
          </div>
          <p className="text-slate-800 text-center text-sm font-medium">
            Your password has been successfully reset. You can now login with your new password.
          </p>
        </div>
        <Link
          href="/login"
          className="w-full py-3.5 mt-4 bg-brand-green hover:bg-emerald-400 text-slate-900 font-bold rounded-full shadow-lg shadow-brand-green/20 transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-green flex items-center justify-center gap-2"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Server Error Message */}
      {error && (
        <div role="alert" className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm text-center font-medium animate-in fade-in">
          {error}
        </div>
      )}

      {/* New Password Field */}
      <div className="space-y-1.5">
        <label htmlFor={passwordId} className="text-sm font-semibold text-slate-900 ml-1">New Password</label>
        <div className="relative">
          <div className="absolute z-10 inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className={`h-5 w-5 ${passwordError ? 'text-red-500' : 'text-slate-600'}`} aria-hidden="true" />
          </div>
          <input
            id={passwordId}
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (passwordError) setPasswordError('');
              if (error) setError('');
            }}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? passwordErrorId : undefined}
            className={`w-full pl-11 pr-12 py-3 bg-canvas/20 border rounded-xl text-slate-900 placeholder:text-slate-500/70 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-md ${
              passwordError
                ? 'border-red-500/50 focus:ring-red-500'
                : 'border-white/40 focus:ring-brand-green'
            }`}
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-slate-900 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded"
          >
            {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {passwordError && <p id={passwordErrorId} role="alert" className="text-red-600 text-xs font-medium ml-1 mt-1 animate-in slide-in-from-top-1">{passwordError}</p>}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <label htmlFor={confirmPasswordId} className="text-sm font-semibold text-slate-900 ml-1">Confirm New Password</label>
        <div className="relative">
          <div className="absolute z-10 inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className={`h-5 w-5 ${confirmPasswordError ? 'text-red-500' : 'text-slate-600'}`} aria-hidden="true" />
          </div>
          <input
            id={confirmPasswordId}
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmPasswordError) setConfirmPasswordError('');
              if (error) setError('');
            }}
            aria-invalid={!!confirmPasswordError}
            aria-describedby={confirmPasswordError ? confirmPasswordErrorId : undefined}
            className={`w-full pl-11 pr-12 py-3 bg-canvas/20 border rounded-xl text-slate-900 placeholder:text-slate-500/70 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-md ${
              confirmPasswordError
                ? 'border-red-500/50 focus:ring-red-500'
                : 'border-white/40 focus:ring-brand-green'
            }`}
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showConfirmPassword}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-slate-900 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {confirmPasswordError && <p id={confirmPasswordErrorId} role="alert" className="text-red-600 text-xs font-medium ml-1 mt-1 animate-in slide-in-from-top-1">{confirmPasswordError}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 mt-4 bg-brand-green hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed text-slate-900 font-bold rounded-full shadow-lg shadow-brand-green/20 transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {loading ? 'Resetting Password...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPassword() {
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
              Reset Password
            </h1>
            <p className="text-slate-700 mt-2 text-center text-sm">
              Create a new secure password for your account
            </p>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-brand-green-dark" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <div className="mt-6 text-center text-white/80 text-sm font-medium drop-shadow-md">
          &copy; {new Date().getFullYear()} KFD Organization. All rights reserved.
        </div>
      </div>
    </div>
  );
}
