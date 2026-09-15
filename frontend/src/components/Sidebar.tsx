'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const OverviewIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const FleetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/>
  </svg>
);

const AddIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const BookingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
  </svg>
);

const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <OverviewIcon /> },
    ],
  },
  {
    title: 'Fleet Management',
    items: [
      { href: '/dashboard/vehicles', label: 'All Vehicles', icon: <FleetIcon /> },
      { href: '/dashboard/vehicles/new', label: 'Add Vehicle', icon: <AddIcon /> },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/dashboard/bookings', label: 'All Bookings', icon: <BookingsIcon /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  };

  return (
    <aside className="dashboard-sidebar" style={{
      width: 'var(--sidebar-w)',
      minHeight: 'calc(100vh - var(--nav-h))',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Admin info pill */}
      <div className="dashboard-admin-pill" style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px',
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 'var(--r-md)',
        }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '50%',
            background: 'var(--grad-amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user?.fullName?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--amber-400)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Administrator
            </div>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="dashboard-sidebar-nav" style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {navSections.map(section => (
          <div key={section.title} className="dashboard-sidebar-section" style={{ marginBottom: '24px' }}>
            <div className="label-upper dashboard-sidebar-section-title" style={{ padding: '0 8px', marginBottom: '8px', fontSize: '10px' }}>
              {section.title}
            </div>
            <div className="dashboard-sidebar-links" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${active ? 'active' : ''}`}
                  >
                    <span style={{
                      color: active ? 'var(--teal-400)' : 'var(--text-muted)',
                      transition: 'color var(--t-fast)',
                      display: 'flex', alignItems: 'center',
                    }}>
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span className="badge badge-new" style={{ fontSize: '9px', padding: '2px 7px' }}>
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <span style={{
                        width: '4px', height: '4px',
                        borderRadius: '50%',
                        background: 'var(--teal-400)',
                        flexShrink: 0,
                      }} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom links */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 14px',
          borderRadius: 'var(--r-md)',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-muted)',
          transition: 'all var(--t-fast)',
          border: '1px solid transparent',
        }}
          onMouseOver={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
          }}
        >
          <ExternalIcon />
          View Public Site
        </Link>
      </div>
    </aside>
  );
}
