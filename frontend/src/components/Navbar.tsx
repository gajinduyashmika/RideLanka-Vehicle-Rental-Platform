'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname?.startsWith(href);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/vehicles', label: 'Vehicles' },
    ...(isAuthenticated && !isAdmin ? [{ href: '/bookings', label: 'Bookings' }] : []),
    ...(isAdmin ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
  ];

  const initial = user?.fullName?.[0]?.toUpperCase() ?? 'U';

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 'var(--nav-h)',
        background: scrolled ? 'rgba(12,12,12,0.95)' : 'rgba(12,12,12,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        transition: 'background 0.25s, border-color 0.25s',
      }}>
        <div className="page-container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--amber)" opacity="0.9"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
              Ride<span style={{ color: 'var(--amber)' }}>Lanka</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {isAuthenticated ? (
              <div className="dropdown" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '5px 10px 5px 5px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${dropdownOpen ? 'var(--border-strong)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-full)',
                    cursor: 'pointer',
                    transition: 'all var(--t-fast)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--amber)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 800, color: '#0C0C0C',
                  }}>
                    {initial}
                  </div>
                  <span className="hide-mobile" style={{ fontSize: '13px', fontWeight: 500, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <svg className="hide-mobile" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform var(--t-fast)', transform: dropdownOpen ? 'rotate(180deg)' : '' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu" style={{ minWidth: '210px' }}>
                    <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{user?.fullName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email}</div>
                    </div>
                    {!isAdmin && (
                      <Link href="/bookings" className="dropdown-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        My Bookings
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href="/dashboard" className="dropdown-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Dashboard
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-item danger">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm hide-mobile">Sign in</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Get started</Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="show-mobile btn btn-ghost btn-icon"
              style={{ border: '1px solid var(--border)' }}
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 98, backdropFilter: 'blur(4px)' }} />
      )}

      {/* Mobile drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '280px',
        background: 'var(--bg-elevated)',
        borderLeft: '1px solid var(--border)',
        zIndex: 99,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        overflow: 'auto',
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.03em' }}>
            Ride<span style={{ color: 'var(--amber)' }}>Lanka</span>
          </span>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {isAuthenticated && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(232,160,32,0.03)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#0C0C0C', flexShrink: 0 }}>
              {initial}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.fullName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, padding: '12px' }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} style={{
              display: 'block', padding: '12px 14px', borderRadius: 'var(--r-md)',
              textDecoration: 'none', fontSize: '15px',
              fontWeight: isActive(link.href) ? 600 : 400,
              color: isActive(link.href) ? 'var(--amber)' : 'var(--text-secondary)',
              background: isActive(link.href) ? 'var(--amber-subtle)' : 'transparent',
              marginBottom: '2px',
              transition: 'all var(--t-fast)',
            }}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Sign out
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/login" className="btn btn-secondary" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'center' }}>Sign in</Link>
              <Link href="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'center' }}>Get started</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
