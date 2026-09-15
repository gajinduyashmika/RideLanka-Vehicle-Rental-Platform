'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { bookingsApi, BookingResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/Toast';
import { useCurrency } from '@/lib/currency-context';
import ReceiptModal from '@/components/ReceiptModal';

// ─── Icons ────────────────────────────────────────────────────────────────
const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/>
  </svg>
);
const CalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const CategoryIcon = ({ cat }: { cat: string }) => {
  if (cat === 'SCOOTER') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/>
        <path d="M6 14h5l3-6h4"/><path d="M14 8h3"/><path d="M10 17h5"/>
      </svg>
    );
  }
  if (cat === 'VAN') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="15" height="11" rx="2"/><path d="M17 9l4 2v5h-4"/>
        <circle cx="6" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
    </svg>
  );
};

const statusConfig: Record<string, { badge: string; label: string; color: string }> = {
  CONFIRMED:  { badge: 'badge-confirmed',  label: 'Active',    color: '#22c55e' },
  COMPLETED:  { badge: 'badge-completed',  label: 'Completed', color: '#3b82f6' },
  CANCELLED:  { badge: 'badge-cancelled',  label: 'Cancelled', color: '#ef4444' },
};

const tabs = [
  { id: 'all',       label: 'All Bookings' },
  { id: 'CONFIRMED', label: 'Active' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

function BookingCard({
  booking,
  onCancel,
  onViewReceipt,
}: {
  booking: BookingResponse;
  onCancel: (id: string) => void;
  onViewReceipt: (b: BookingResponse) => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const { formatPrice } = useCurrency();
  const sc = statusConfig[booking.status] ?? { badge: '', label: booking.status, color: 'var(--text-muted)' };

  const startFmt = new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endFmt   = new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const diff = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
  const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));

  const handleCancel = async () => {
    setCancelling(true);
    await onCancel(booking.id);
    setCancelling(false);
  };

  return (
    <div className="card" style={{
      overflow: 'hidden',
      transition: 'all var(--t-base)',
    }}>
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Left colour stripe */}
        <div style={{
          width: '4px', flexShrink: 0,
          background: sc.color,
          borderRadius: '0 0 0 0',
        }} />

        {/* Vehicle icon panel */}
        <div style={{
          width: '120px', flexShrink: 0,
          background: 'rgba(232,160,32,0.04)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '8px', padding: '20px 12px',
          borderRight: '1px solid var(--border-subtle)',
          color: 'var(--amber)',
        }}>
          <CategoryIcon cat={booking.vehicleCategory} />
          <span className={`badge badge-${booking.vehicleCategory.toLowerCase()}`} style={{ fontSize: '10px' }}>
            {booking.vehicleCategory}
          </span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '2px' }}>
                {booking.vehicleName}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--teal-400)', fontWeight: 600 }}>
                  #{booking.id.slice(0, 8).toUpperCase()}
                </span>
                <span style={{ color: 'var(--border-default)' }}>·</span>
                <span className={`badge ${sc.badge}`} style={{ fontSize: '10px' }}>
                  {sc.label}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em',
                background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {formatPrice(booking.totalCost)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                {days} day{days !== 1 ? 's' : ''} · {formatPrice(booking.totalCost / days)}/day
              </div>
            </div>
          </div>

          {/* Info row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <CalIcon />
              <span>{startFmt} → {endFmt}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <MapPinIcon />
              <span>{booking.branch}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '4px' }}>
            <Link href={`/vehicles/${booking.vehicleId}`} className="btn btn-secondary btn-sm">
              View Vehicle <ArrowRightIcon />
            </Link>
            <button
              onClick={() => onViewReceipt(booking)}
              className="btn btn-ghost btn-sm"
              title="View & Print Official Receipt"
            >
              <DownloadIcon /> Receipt
            </button>
            {booking.status === 'CONFIRMED' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn btn-danger btn-sm"
                style={{ marginLeft: 'auto' }}
              >
                {cancelling ? <span className="spinner spinner-sm" /> : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [receiptBooking, setReceiptBooking] = useState<BookingResponse | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) loadBookings();
  }, [isAuthenticated, authLoading, router]);

  const loadBookings = async () => {
    try {
      const data = await bookingsApi.getAll();
      setBookings(data);
    } catch {
      toast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await bookingsApi.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
      toast('Booking cancelled successfully', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Cancellation failed', 'error');
    }
  };

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);

  const counts = {
    all: bookings.length,
    CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
    COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="spinner" />
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading your bookings…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '36px 0 0',
      }}>
        <div className="page-container">
          <div style={{ marginBottom: '28px' }}>
            <div className="section-eyebrow" style={{ marginBottom: '10px' }}>My Account</div>
            <h1 className="heading-2" style={{ marginBottom: '6px' }}>
              My <span className="grad-text">Bookings</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
              Track your rentals, view history, and manage reservations
            </p>
          </div>

          {/* Stats row */}
          {bookings.length > 0 && (
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {[
                { label: 'Total Bookings', value: counts.all, color: 'var(--text-primary)' },
                { label: 'Active', value: counts.CONFIRMED, color: 'var(--green-400)' },
                { label: 'Completed', value: counts.COMPLETED, color: 'var(--blue-400)' },
                { label: 'Cancelled', value: counts.CANCELLED, color: 'var(--red-400)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
                {counts[tab.id as keyof typeof counts] > 0 && (
                  <span style={{
                    marginLeft: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: activeTab === tab.id ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.06)',
                    fontSize: '10px', fontWeight: 700,
                    color: activeTab === tab.id ? 'var(--teal-400)' : 'var(--text-muted)',
                  }}>
                    {counts[tab.id as keyof typeof counts]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="page-container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        {bookings.length === 0 ? (
          <div className="card animate-fade-in" style={{ padding: '80px 48px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: 'var(--r-xl)', background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
              <CarIcon />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No bookings yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px', maxWidth: '380px', margin: '0 auto 28px' }}>
              Browse our fleet and make your first reservation to see it here.
            </p>
            <Link href="/vehicles" className="btn btn-primary btn-lg">
              Browse Vehicles <ArrowRightIcon />
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '64px', textAlign: 'center' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--text-muted)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              No {activeTab.toLowerCase()} bookings
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              You don&apos;t have any {activeTab.toLowerCase() === 'all' ? '' : activeTab.toLowerCase() + ' '}bookings.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((b, i) => (
              <div key={b.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <BookingCard
                  booking={b}
                  onCancel={handleCancel}
                  onViewReceipt={setReceiptBooking}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Receipt & Tax Invoice Modal */}
      <ReceiptModal
        booking={receiptBooking}
        onClose={() => setReceiptBooking(null)}
      />
    </div>
  );
}
