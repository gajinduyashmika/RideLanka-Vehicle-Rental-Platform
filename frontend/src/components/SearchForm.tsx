'use client';

import React, { useState } from 'react';

interface SearchFormProps {
  onSearch: (params: { startDate: string; endDate: string; category: string; branch: string }) => void;
  loading?: boolean;
  compact?: boolean;
}

const branches = [
  'Matara Central',
  'Coastal Hub',
  'Galle Fort',
  'Mirissa Beach',
  'Tangalle Bay',
];

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const CarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const categoryOptions = [
  { value: '', label: 'All Types' },
  { value: 'CAR', label: 'Cars & Sedans' },
  { value: 'SCOOTER', label: 'Scooters & Bikes' },
  { value: 'VAN', label: 'Vans & People Movers' },
];

export default function SearchForm({ onSearch, loading, compact = false }: SearchFormProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [branch, setBranch] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ startDate, endDate, category, branch });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 14px 13px 42px',
    background: 'rgba(6,9,18,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--r-md)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all var(--t-fast)',
    appearance: 'none',
    fontFamily: 'inherit',
    colorScheme: 'dark',
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        background: 'rgba(6,9,18,0.6)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: compact ? 'var(--r-xl)' : 'var(--r-2xl)',
        padding: compact ? '16px' : '24px',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      }}>
        {!compact && (
          <div style={{ marginBottom: '20px' }}>
            <p className="label-upper" style={{ fontSize: '10px', color: 'var(--teal-500)' }}>
              Quick Search
            </p>
          </div>
        )}

        <div className={`search-form-grid ${compact ? 'compact' : ''}`} style={{
          display: 'grid',
          gridTemplateColumns: compact
            ? 'repeat(auto-fit, minmax(160px, 1fr))'
            : undefined,
          gap: '12px',
          alignItems: 'end',
        }}>

          {/* Pick-up Date */}
          <div>
            <label className="field-label">
              <CalendarIcon /> Pick-up Date
            </label>
            <div className="field-wrap">
              <span className="field-icon" style={{ left: '12px' }}>
                <CalendarIcon />
              </span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingLeft: '40px',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--teal-500)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
                required
                min={today}
              />
            </div>
          </div>

          {/* Drop-off Date */}
          <div>
            <label className="field-label">
              <CalendarIcon /> Drop-off Date
            </label>
            <div className="field-wrap">
              <span className="field-icon" style={{ left: '12px' }}>
                <CalendarIcon />
              </span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingLeft: '40px',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--teal-500)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
                required
                min={startDate || today}
              />
            </div>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="field-label">
              <CarIcon /> Vehicle Type
            </label>
            <div className="field-wrap">
              <span className="field-icon" style={{ left: '12px' }}>
                <CarIcon />
              </span>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingLeft: '40px',
                  paddingRight: '36px',
                  cursor: 'pointer',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--teal-500)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value} style={{ background: '#111827' }}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="field-label">
              <MapPinIcon /> Pick-up Location
            </label>
            <div className="field-wrap">
              <span className="field-icon" style={{ left: '12px' }}>
                <MapPinIcon />
              </span>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingLeft: '40px',
                  paddingRight: '36px',
                  cursor: 'pointer',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--teal-500)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="" style={{ background: '#111827' }}>All Locations</option>
                {branches.map(b => (
                  <option key={b} value={b} style={{ background: '#111827' }}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px 28px',
              background: loading ? 'rgba(20,184,166,0.5)' : 'var(--grad-brand)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              borderRadius: 'var(--r-md)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all var(--t-base)',
              boxShadow: '0 2px 16px rgba(20,184,166,0.35)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}
            onMouseOver={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            {loading ? (
              <span className="spinner spinner-sm" />
            ) : (
              <>
                <SearchIcon />
                Search
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
