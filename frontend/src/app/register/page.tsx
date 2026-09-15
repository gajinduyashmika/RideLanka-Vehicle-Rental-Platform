'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/Toast';

// ─── Modern SVG Icons ────────────────────────────────────────────────────────
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ShieldLockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 6)  score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const score = getStrength();
  const labels = ['', 'Too short', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  if (!password) return null;

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              background: i <= score ? colors[score] : 'var(--border-strong)',
              transition: 'background var(--t-base)',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: colors[score] || 'var(--text-muted)', fontWeight: 600 }}>
          {labels[score] || ''}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {score >= 4 ? 'Good security' : 'Add uppercase, number & symbol'}
        </span>
      </div>
    </div>
  );
}

const rentalPerks = [
  { title: 'Company Fleet Guarantee', desc: '100% verified, maintained & insured vehicles.' },
  { title: 'Zero Hidden Fees', desc: 'Transparent daily rates with taxes & standard coverage included.' },
  { title: '24/7 Islandwide Assistance', desc: 'Fast on-call road support wherever your journey takes you.' },
  { title: 'Flexible Pick-up & Return', desc: 'Direct branches in Matara, Galle Fort, Mirissa & Tangalle.' },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError('Please accept the Terms of Service & Privacy Policy to register.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Customer registration only — admins are company-managed internally
      await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'CUSTOMER',
      });
      toast('Welcome to RideLanka! Your account is ready.', 'success');
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: 'calc(100vh - var(--nav-h))',
    }}>
      {/* ─── Left: Brand & Fleet Trust Panel ─── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(36px, 5vw, 64px)',
        }}
        className="hide-mobile"
      >
        {/* Background photo */}
        <img
          src="/mirissa-beach.jpg"
          alt="Scenic coastal Sri Lanka"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.55)',
            transform: 'scale(1.03)',
          }}
        />

        {/* Ambient Dark Gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(170deg, rgba(12,12,12,0.85) 0%, rgba(12,12,12,0.65) 50%, rgba(12,12,12,0.95) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Top brand element */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--r-full)',
            background: 'rgba(232, 160, 32, 0.12)',
            border: '1px solid rgba(232, 160, 32, 0.28)',
            marginBottom: '28px',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--amber)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--amber)' }}>
              Direct Vehicle Rental Company
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 3.8vw, 46px)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
          }}>
            Drive Sri Lanka <br />
            <span style={{ fontStyle: 'italic', color: 'var(--amber)' }}>on your own terms.</span>
          </h2>

          <p style={{
            color: 'rgba(245, 245, 245, 0.82)',
            fontSize: '15px',
            lineHeight: 1.65,
            maxWidth: '440px',
          }}>
            Rent company-maintained cars, scooters, and passenger vans across the Southern Coast. No ride-sharing middlemen — just guaranteed, inspected vehicles ready when you are.
          </p>
        </div>

        {/* Middle perks list */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '14px', margin: '36px 0' }}>
          {rentalPerks.map((perk) => (
            <div
              key={perk.title}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '12px 16px',
                background: 'rgba(18, 18, 18, 0.55)',
                backdropFilter: 'blur(12px)',
                borderRadius: 'var(--r-md)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0 }}>
                <CheckCircleIcon />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {perk.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {perk.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Badge */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '16px 20px',
          background: 'rgba(12, 12, 12, 0.75)',
          backdropFilter: 'blur(16px)',
          borderRadius: 'var(--r-lg)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--r-md)',
            background: 'var(--amber-subtle)',
            border: '1px solid var(--amber-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--amber)',
            flexShrink: 0,
          }}>
            <ShieldLockIcon />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Official Fleet Reservation Guarantee
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Direct reservation agreement · Zero cancellation penalties up to 24h
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right: Registration Form ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(32px, 5vw, 64px)',
        background: 'var(--bg-base)',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          {/* Header & Logo */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '36px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--amber)"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
              Ride<span style={{ color: 'var(--amber)' }}>Lanka</span>
            </span>
          </Link>

          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '6px' }}>
              Create your account
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Register as a renter to view live fleet availability, lock guaranteed rates, and manage bookings.
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Full Name */}
            <div>
              <label className="field-label" htmlFor="fullName">
                Full Name
              </label>
              <div className="field-wrap">
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Kasun Perera"
                  required
                  autoComplete="name"
                  style={{ paddingLeft: '40px' }}
                />
                <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
                  <UserIcon />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="field-label" htmlFor="email">
                Email Address
              </label>
              <div className="field-wrap">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="kasun@example.com"
                  required
                  autoComplete="email"
                  style={{ paddingLeft: '40px' }}
                />
                <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
                  <MailIcon />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="field-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  style={{ paddingLeft: '40px', paddingRight: '42px' }}
                />
                <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
                  <LockIcon />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Terms and conditions */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              marginTop: '4px',
            }}>
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                style={{
                  accentColor: 'var(--amber)',
                  width: '16px',
                  height: '16px',
                  flexShrink: 0,
                  marginTop: '2px',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                I agree to the{' '}
                <span style={{ color: 'var(--amber)', fontWeight: 600 }}>Rental Terms</span>
                {' '}and{' '}
                <span style={{ color: 'var(--amber)', fontWeight: 600 }}>Privacy Policy</span>.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '14px',
                fontWeight: 700,
                justifyContent: 'center',
                marginTop: '6px',
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="spinner spinner-sm" style={{ width: '14px', height: '14px' }} />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Renter Account'
              )}
            </button>
          </form>

          {/* Footer note */}
          <div style={{
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Already registered with RideLanka?{' '}
              <Link href="/login" style={{ color: 'var(--amber)', textDecoration: 'none', fontWeight: 600 }}>
                Sign in →
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
