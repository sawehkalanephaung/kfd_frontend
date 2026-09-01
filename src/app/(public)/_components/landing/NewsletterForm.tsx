'use client';

import React, { useState } from 'react';
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div role="status" className="flex items-center gap-2 text-sm text-brand-green bg-brand-green-soft p-2.5 rounded-full border border-brand-green/30">
          <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />
          <span className="leading-tight">{message}</span>
        </div>
      )}
      {status === 'error' && (
        <div role="alert" className="flex items-center gap-2 text-sm text-danger-text bg-danger-bg p-2.5 rounded-md border border-danger/20">
          <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
          <span className="leading-tight">{message}</span>
        </div>
      )}
      <input
        type="email"
        aria-label="Email address"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-canvas/10 border border-white/20 rounded-md px-4 py-2.5 text-sm text-white placeholder:text-on-dark-muted focus:outline-none focus:ring-2 focus:ring-white/50 transition-all disabled:opacity-50"
        required
        disabled={loading}
      />
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
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
      </Button>
    </form>
  );
}
