'use client';

import React, { useState } from 'react';
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/public/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {status === 'success' && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 p-2.5 rounded-md border border-emerald-400/20">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span className="leading-tight">{message}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 p-2.5 rounded-md border border-red-400/20">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="leading-tight">{message}</span>
        </div>
      )}
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2.5 text-sm text-white placeholder:text-green-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all disabled:opacity-50"
        required
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#2a563c] hover:bg-[#326949] text-white font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Subscribing...
          </>
        ) : (
          <>
            Subscribe <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
