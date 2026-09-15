'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { vehiclesApi, VehicleResponse } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useCurrency } from '@/lib/currency-context';

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const CategoryIcon = ({ cat }: { cat: string }) => {
  if (cat === 'SCOOTER') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/>
        <path d="M6 14h5l3-6h4"/><path d="M14 8h3"/><path d="M10 17h5"/>
      </svg>
    );
  }
  if (cat === 'VAN') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="15" height="11" rx="2"/><path d="M17 9l4 2v5h-4"/>
        <circle cx="6" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
    </svg>
  );
};

const statusColors: Record<string, { text: string; bg: string; border: string }> = {
  AVAILABLE:   { text: '#4ade80', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)' },
  RENTED:      { text: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)' },
  MAINTENANCE: { text: '#fbbf24', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
};

export default function FleetPage() {
  const { formatPrice } = useCurrency();
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await vehiclesApi.getAll();
      setVehicles(data);
    } catch {
      toast('Failed to load fleet data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await vehiclesApi.updateStatus(id, status);
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v));
      toast(`Status updated to ${status}`, 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Status update failed', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await vehiclesApi.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      toast(`${name} removed from fleet`, 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  const filtered = filter === 'ALL' ? vehicles : vehicles.filter(v => v.status === filter);

  const statusCounts = {
    ALL:         vehicles.length,
    AVAILABLE:   vehicles.filter(v => v.status === 'AVAILABLE').length,
    RENTED:      vehicles.filter(v => v.status === 'RENTED').length,
    MAINTENANCE: vehicles.filter(v => v.status === 'MAINTENANCE').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '16px' }}>
        <div className="spinner" />
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading fleet…</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="label-upper" style={{ marginBottom: '6px' }}>Fleet Management</div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>
            All Vehicles <span className="grad-text">({vehicles.length})</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Manage status, edit details, and track your fleet
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={load} className="btn btn-secondary btn-sm">
            <RefreshIcon /> Refresh
          </button>
          <Link href="/dashboard/vehicles/new" className="btn btn-primary btn-sm">
            <PlusIcon /> Add Vehicle
          </Link>
        </div>
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['ALL', 'AVAILABLE', 'RENTED', 'MAINTENANCE'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`pill ${filter === s ? 'active' : ''}`}
          >
            {s === 'ALL' ? 'All Vehicles' : s.charAt(0) + s.slice(1).toLowerCase()}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '18px', height: '18px', borderRadius: '50%',
              background: filter === s ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.06)',
              fontSize: '10px', fontWeight: 700,
              color: filter === s ? 'var(--teal-400)' : 'var(--text-muted)',
            }}>
              {statusCounts[s]}
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
              <CategoryIcon cat="CAR" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No vehicles with this status</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Registration</th>
                  <th>Category</th>
                  <th>Transmission</th>
                  <th>Daily Rate</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const sc = statusColors[v.status] || statusColors.AVAILABLE;
                  return (
                    <tr key={v.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: 'var(--r-md)',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--amber)', flexShrink: 0,
                          }}>
                            <CategoryIcon cat={v.category} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                              {v.make} {v.model}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{v.year}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--teal-400)', fontWeight: 600 }}>
                          {v.registrationNumber}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${v.category.toLowerCase()}`}>{v.category}</span>
                      </td>
                      <td style={{ fontSize: '13px' }}>{v.transmission}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                        {formatPrice(v.dailyRate)}
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{v.branch}</td>
                      <td>
                        <select
                          value={v.status}
                          onChange={e => handleStatusChange(v.id, e.target.value)}
                          disabled={updating === v.id}
                          style={{
                            padding: '6px 28px 6px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            width: 'auto',
                            minWidth: '120px',
                            background: sc.bg,
                            color: sc.text,
                            border: `1px solid ${sc.border}`,
                            borderRadius: 'var(--r-full)',
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 8px center',
                            backgroundSize: '10px',
                            opacity: updating === v.id ? 0.6 : 1,
                          }}
                        >
                          <option value="AVAILABLE" style={{ background: '#111827', color: '#f1f5f9' }}>Available</option>
                          <option value="RENTED" style={{ background: '#111827', color: '#f1f5f9' }}>Rented</option>
                          <option value="MAINTENANCE" style={{ background: '#111827', color: '#f1f5f9' }}>Maintenance</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Link
                            href={`/dashboard/vehicles/${v.id}/edit`}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: '4px' }}
                          >
                            <EditIcon /> Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(v.id, `${v.make} ${v.model}`)}
                            className="btn btn-danger btn-sm"
                            style={{ gap: '4px' }}
                          >
                            <TrashIcon /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
