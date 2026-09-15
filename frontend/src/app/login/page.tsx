'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = await login({ email, password });
      if (auth.role === 'ADMIN') {
        toast('Welcome back, Administrator!', 'success');
        router.push('/dashboard');
      } else {
        toast('Welcome back!', 'success');
        router.push('/');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - var(--nav-h))' }}>

      {/* ─── Left: photo panel ─── */}
      <div style={{ position: 'relative', overflow: 'hidden' }} className="hide-mobile">
        <img
          src="/galle-fort.jpg"
          alt="Galle Fort"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(12,12,12,0.7) 0%, rgba(12,12,12,0.3) 100%)',
        }} />
        <div style={{ position: 'absolute', bottom: '48px', left: '48px', right: '48px' }}>
          <div style={{
            padding: '24px',
            background: 'rgba(12,12,12,0.75)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--r-xl)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#E8A020" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(245,245,245,0.8)', lineHeight: 1.6, marginBottom: '14px' }}>
              &ldquo;Booked a car in two minutes, picked it up at Galle Fort the same afternoon. Absolutely flawless experience.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1A3A3A', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>SM</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Sarah Mitchell</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>United Kingdom</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right: form ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(32px, 6vw, 72px)',
        background: 'var(--bg-base)',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          {/* Wordmark */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '48px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--amber)"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.04em' }}>
              Ride<span style={{ color: 'var(--amber)' }}>Lanka</span>
            </span>
          </Link>

          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '6px' }}>
            Sign in
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '36px' }}>
            Welcome back. Enter your details to continue.
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="password" className="label" style={{ marginBottom: 0 }}>Password</label>
                <a href="#" style={{ fontSize: '12px', color: 'var(--amber)', textDecoration: 'none', fontWeight: 500 }}>Forgot?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                >
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--amber)', width: '15px', height: '15px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Keep me signed in for 30 days</span>
            </label>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
              {loading ? <span className="spinner spinner-sm" /> : 'Continue'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '14px', color: 'var(--text-muted)' }}>
            No account?{' '}
            <Link href="/register" style={{ color: 'var(--amber)', textDecoration: 'none', fontWeight: 600 }}>
              Create one free
            </Link>
          </p>

          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.6 }}>
            By signing in you agree to our{' '}
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
            {' '}and{' '}
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
