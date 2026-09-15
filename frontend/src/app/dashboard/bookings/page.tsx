'use client';

import React, { useState, useEffect } from 'react';
import { bookingsApi, BookingResponse } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useCurrency } from '@/lib/currency-context';
import ReceiptModal from '@/components/ReceiptModal';

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

export default function AdminBookingsPage() {
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [receiptBooking, setReceiptBooking] = useState<BookingResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
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
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingsApi.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
      toast('Booking cancelled successfully', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Cancel failed', 'error');
    }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const counts = {
    ALL:       bookings.length,
    CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
    COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '16px' }}>
        <div className="spinner" />
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading bookings…</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="label-upper" style={{ marginBottom: '6px' }}>Operations</div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>
            All Bookings <span className="grad-text">({bookings.length})</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Manage all customer reservations
          </p>
        </div>
        <button onClick={load} className="btn btn-secondary btn-sm">
          <RefreshIcon /> Refresh
        </button>
      </div>

      {/* Revenue summary */}
      {bookings.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}>
          {[
            { label: 'Total Revenue', value: formatPrice(bookings.filter(b => b.status !== 'CANCELLED').reduce((s, b) => s + Number(b.totalCost), 0)), color: 'var(--amber-400)' },
            { label: 'Active Bookings', value: counts.CONFIRMED, color: 'var(--green-400)' },
            { label: 'Completed', value: counts.COMPLETED, color: 'var(--blue-400)' },
            { label: 'Cancelled', value: counts.CANCELLED, color: 'var(--red-400)' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '18px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-lg)',
            }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', marginBottom: '4px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`pill ${filter === s ? 'active' : ''}`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '18px', height: '18px', borderRadius: '50%',
              background: filter === s ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.06)',
              fontSize: '10px', fontWeight: 700,
              color: filter === s ? 'var(--teal-400)' : 'var(--text-muted)',
            }}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No bookings with this status</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Category</th>
                  <th>Branch</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
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
                    <td>
                      <span className={`badge badge-${b.vehicleCategory.toLowerCase()}`}>
                        {b.vehicleCategory}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.branch}</td>
                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' → '}
                      {new Date(b.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                      {formatPrice(b.totalCost)}
                    </td>
                    <td>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setReceiptBooking(b)}
                          className="btn btn-secondary btn-sm"
                          title="View & Print Official Receipt"
                        >
                          Receipt
                        </button>
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
