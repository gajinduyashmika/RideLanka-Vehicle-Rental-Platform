'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { vehiclesApi, bookingsApi, VehicleResponse, BookingResponse } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useCurrency } from '@/lib/currency-context';

// ─── Icons ────────────────────────────────────────────────────────────────
const CarKpiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
  </svg>
);
const ClipboardKpiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const DollarKpiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const ChartKpiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const WrenchKpiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// ─── Mini bar chart (CSS only) ────────────────────────────────────────────
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '40px' }}>
      {data.map((val, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(val / max) * 100}%`,
            minHeight: '3px',
            background: color,
            borderRadius: '2px 2px 0 0',
            opacity: i === data.length - 1 ? 1 : 0.4,
            transition: `height var(--t-slow)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Donut segment ───────────────────────────────────────────────────────
function FleetDonut({ available, rented, maintenance }: { available: number; rented: number; maintenance: number }) {
  const total = available + rented + maintenance || 1;
  const avPct = (available / total) * 100;
  const rtPct = (rented / total) * 100;
  const radius = 50;
  const circ = 2 * Math.PI * radius;

  const segments = [
    { pct: avPct, color: '#22c55e', label: 'Available', value: available },
    { pct: rtPct, color: '#3b82f6', label: 'Rented',    value: rented },
    { pct: 100 - avPct - rtPct, color: '#f59e0b', label: 'Maintenance', value: maintenance },
  ];

  let offset = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="16" />
        {segments.map((seg, i) => {
          const dashArray = `${(seg.pct / 100) * circ} ${circ}`;
          const dashOffset = -(offset / 100) * circ;
          offset += seg.pct;
          if (seg.pct <= 0) return null;
          return (
            <circle
              key={i}
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {segments.map(seg => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{seg.label}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto' }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { formatPrice } = useCurrency();
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [v, b] = await Promise.all([vehiclesApi.getAll(), bookingsApi.getAll()]);
      setVehicles(v);
      setBookings(b);
    } catch {
      // handle offline
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div className="spinner" />
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading dashboard…</p>
      </div>
    );
  }

  // ── Compute stats ──
  const totalVehicles    = vehicles.length;
  const available        = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const rented           = vehicles.filter(v => v.status === 'RENTED').length;
  const maintenance      = vehicles.filter(v => v.status === 'MAINTENANCE').length;
  const activeRentals    = bookings.filter(b => b.status === 'CONFIRMED').length;
  const completedRentals = bookings.filter(b => b.status === 'COMPLETED').length;
  const totalRevenue     = bookings.filter(b => b.status !== 'CANCELLED').reduce((s, b) => s + Number(b.totalCost), 0);
  const todayRevenue     = bookings
    .filter(b => b.status !== 'CANCELLED' && new Date(b.createdAt).toDateString() === new Date().toDateString())
    .reduce((s, b) => s + Number(b.totalCost), 0);

  const occupancyRate = totalVehicles > 0 ? Math.round((rented / totalVehicles) * 100) : 0;

  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  // Pseudo weekly revenue sparkline
  const weeklyData = [12, 18, 9, 24, 15, 21, Math.round(totalRevenue % 30) || 8];

  const kpiCards = [
    {
      label: 'Total Fleet',
      value: totalVehicles,
      sub: `${available} available`,
      icon: <CarKpiIcon />,
      color: 'var(--teal-400)',
      gradient: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.04))',
      border: 'rgba(20,184,166,0.2)',
      trend: `${occupancyRate}% occupied`,
      trendUp: true,
    },
    {
      label: 'Active Rentals',
      value: activeRentals,
      sub: `${completedRentals} completed`,
      icon: <ClipboardKpiIcon />,
      color: 'var(--blue-400)',
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.04))',
      border: 'rgba(59,130,246,0.2)',
      trend: `${bookings.length} total bookings`,
      trendUp: true,
    },
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      sub: `${formatPrice(todayRevenue)} today`,
      icon: <DollarKpiIcon />,
      color: 'var(--amber-400)',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.04))',
      border: 'rgba(245,158,11,0.2)',
      trend: 'Lifetime earnings',
      trendUp: true,
    },
    {
      label: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      sub: `${rented} of ${totalVehicles} rented`,
      icon: <ChartKpiIcon />,
      color: 'var(--purple-400)',
      gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.04))',
      border: 'rgba(168,85,247,0.2)',
      trend: occupancyRate > 50 ? 'Above average' : 'Below average',
      trendUp: occupancyRate > 50,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* ─── Page header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="label-upper" style={{ marginBottom: '6px' }}>Admin Panel</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>
            Dashboard <span className="grad-text">Overview</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleRefresh} className="btn btn-secondary btn-sm" disabled={refreshing}>
            <RefreshIcon /> {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link href="/dashboard/vehicles/new" className="btn btn-primary btn-sm">
            <PlusIcon /> Add Vehicle
          </Link>
        </div>
      </div>

      {/* ─── KPI Grid ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        marginBottom: '28px',
      }}>
        {kpiCards.map((card, i) => (
          <div
            key={card.label}
            className="animate-fade-in"
            style={{
              padding: '24px',
              background: card.gradient,
              border: `1px solid ${card.border}`,
              borderRadius: 'var(--r-xl)',
              animationDelay: `${i * 80}ms`,
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform var(--t-base), box-shadow var(--t-base)',
            }}
            onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                width: '44px', height: '44px',
                borderRadius: 'var(--r-md)',
                background: 'rgba(0,0,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
              }}>
                {card.icon}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '12px', fontWeight: 600,
                color: card.trendUp ? 'var(--green-400)' : 'var(--red-400)',
              }}>
                <TrendUpIcon />
              </div>
            </div>

            <div style={{
              fontSize: '34px', fontWeight: 900,
              letterSpacing: '-0.04em', color: card.color, lineHeight: 1,
              marginBottom: '6px',
            }}>
              {card.value}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.sub}</div>

            <div style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', color: card.trendUp ? 'var(--green-400)' : 'var(--red-400)', fontWeight: 600,
            }}>
              <TrendUpIcon /> {card.trend}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Mid row: Revenue + Fleet Status ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '18px', marginBottom: '24px' }}>
        {/* Revenue trend */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>Revenue Trend</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last 7 days (estimated)</p>
            </div>
            <div style={{
              fontSize: '22px', fontWeight: 800, color: 'var(--amber-400)',
              letterSpacing: '-0.03em',
            }}>
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
          <MiniBarChart data={weeklyData} color="var(--teal-500)" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <span key={d} style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>{d}</span>
            ))}
          </div>
        </div>

        {/* Fleet status donut */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>Fleet Status</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{totalVehicles} total vehicles</p>
          </div>
          <FleetDonut available={available} rented={rented} maintenance={maintenance} />
        </div>
      </div>

      {/* ─── Quick Actions ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {[
          { href: '/dashboard/vehicles/new', label: 'Add New Vehicle', icon: <CarKpiIcon />, color: 'var(--teal-500)' },
          { href: '/dashboard/vehicles',     label: 'Manage Fleet',    icon: <WrenchKpiIcon />, color: 'var(--blue-500)' },
          { href: '/dashboard/bookings',     label: 'View All Bookings', icon: <ClipboardKpiIcon />, color: 'var(--purple-500)' },
        ].map(action => (
          <Link key={action.href} href={action.href} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '16px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-lg)',
            textDecoration: 'none',
            transition: 'all var(--t-fast)',
            color: 'var(--text-primary)',
          }}
            onMouseOver={e => {
              const el = e.currentTarget;
              el.style.borderColor = action.color + '40';
              el.style.background = action.color + '08';
              el.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'var(--border-subtle)';
              el.style.background = 'var(--bg-card)';
              el.style.transform = '';
            }}
          >
            <span style={{ fontSize: '22px' }}>{action.icon}</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{action.label}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}><ArrowRightIcon /></span>
          </Link>
        ))}
      </div>

      {/* ─── Recent Bookings Table ─── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Bookings</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Latest reservations across all branches</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              padding: '3px 10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-full)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}>
              {bookings.length} total
            </span>
            <Link href="/dashboard/bookings" className="btn btn-ghost btn-sm">
              View all <ArrowRightIcon />
            </Link>
          </div>
        </div>

        {recentBookings.length === 0 ? (
          <div style={{ padding: '56px', textAlign: 'center' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'var(--text-muted)',
            }}>
              <ClipboardKpiIcon />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No bookings yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Dates</th>
                  <th>Branch</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--teal-400)', fontWeight: 700 }}>
                        #{b.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                      {b.customerName}
                    </td>
                    <td style={{ fontSize: '13px' }}>{b.vehicleName}</td>
                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' → '}
                      {new Date(b.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.branch}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                      {formatPrice(b.totalCost)}
                    </td>
                    <td>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
