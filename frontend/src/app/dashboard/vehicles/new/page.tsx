'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vehiclesApi } from '@/lib/api';

const branches = ['Matara Central', 'Coastal Hub', 'Galle Fort', 'Mirissa Beach', 'Tangalle Bay'];

export default function NewVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    registrationNumber: '',
    category: 'CAR',
    transmission: 'MANUAL',
    dailyRate: 0,
    imageUrl: '',
    branch: branches[0],
  });

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await vehiclesApi.create(form);
      router.push('/dashboard/vehicles');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
        Add New <span className="gradient-text">Vehicle</span>
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '32px' }}>
        Add a vehicle to your fleet
      </p>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#ef4444',
          fontSize: '13px',
          marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label className="input-label">Make</label>
            <input type="text" value={form.make} onChange={e => handleChange('make', e.target.value)}
              className="input-field" placeholder="e.g., Toyota" required />
          </div>
          <div>
            <label className="input-label">Model</label>
            <input type="text" value={form.model} onChange={e => handleChange('model', e.target.value)}
              className="input-field" placeholder="e.g., Corolla" required />
          </div>
          <div>
            <label className="input-label">Year</label>
            <input type="number" value={form.year} onChange={e => handleChange('year', parseInt(e.target.value))}
              className="input-field" min={1990} max={2030} required />
          </div>
          <div>
            <label className="input-label">Registration Number</label>
            <input type="text" value={form.registrationNumber}
              onChange={e => handleChange('registrationNumber', e.target.value)}
              className="input-field" placeholder="e.g., ABC-1234" required />
          </div>
          <div>
            <label className="input-label">Category</label>
            <select value={form.category} onChange={e => handleChange('category', e.target.value)}
              className="select-field">
              <option value="SCOOTER">Scooter</option>
              <option value="CAR">Car</option>
              <option value="VAN">Van</option>
            </select>
          </div>
          <div>
            <label className="input-label">Transmission</label>
            <select value={form.transmission} onChange={e => handleChange('transmission', e.target.value)}
              className="select-field">
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATIC">Automatic</option>
            </select>
          </div>
          <div>
            <label className="input-label">Daily Rate ($)</label>
            <input type="number" value={form.dailyRate}
              onChange={e => handleChange('dailyRate', parseFloat(e.target.value))}
              className="input-field" min={0.01} step={0.01} required />
          </div>
          <div>
            <label className="input-label">Branch</label>
            <select value={form.branch} onChange={e => handleChange('branch', e.target.value)}
              className="select-field">
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Image URL (optional)</label>
            <input type="url" value={form.imageUrl}
              onChange={e => handleChange('imageUrl', e.target.value)}
              className="input-field" placeholder="https://example.com/image.jpg" />
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '28px',
          justifyContent: 'flex-end',
        }}>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
            ) : (
              'Add Vehicle'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
