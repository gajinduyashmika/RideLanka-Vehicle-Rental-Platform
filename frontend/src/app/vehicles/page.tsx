'use client';

import React, { useState, useEffect, useCallback } from 'react';
import VehicleCard from '@/components/VehicleCard';
import SkeletonCard from '@/components/SkeletonCard';
import { vehiclesApi, VehicleResponse } from '@/lib/api';

// ─── Icons ────────────────────────────────────────────────────────────────
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const branches = ['Matara Central', 'Coastal Hub', 'Galle Fort', 'Mirissa Beach', 'Tangalle Bay'];
const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name A–Z' },
];

interface Filters {
  categories: string[];
  transmissions: string[];
  branches: string[];
  maxPrice: number;
  status: string;
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '4px' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '12px 0', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600,
        }}
      >
        {title}
        <span style={{ color: 'var(--text-muted)', transition: 'transform var(--t-fast)', transform: open ? 'rotate(180deg)' : '' }}>
          <ChevronDown />
        </span>
      </button>
      {open && <div style={{ paddingBottom: '4px' }}>{children}</div>}
    </div>
  );
}

function CheckOption({
  label, checked, onChange, color,
}: { label: string; checked: boolean; onChange: () => void; color?: string }) {
  const activeColor = color || 'var(--amber)';
  return (
    <div
      onClick={onChange}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '6px 8px', borderRadius: 'var(--r-md)',
        cursor: 'pointer', transition: 'background var(--t-fast)',
        userSelect: 'none',
      }}
      onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div
        style={{
          width: '18px', height: '18px', borderRadius: '4px',
          border: `1.5px solid ${checked ? activeColor : 'rgba(255,255,255,0.2)'}`,
          background: checked ? activeColor : 'rgba(255,255,255,0.02)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all var(--t-fast)', flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0C0C0C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      <span style={{ fontSize: '13px', color: checked ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1, fontWeight: checked ? 600 : 400 }}>
        {label}
      </span>
    </div>
  );
}

export default function VehiclesPage() {
  const [allVehicles, setAllVehicles] = useState<VehicleResponse[]>([]);
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    transmissions: [],
    branches: [],
    maxPrice: 200,
    status: '',
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await vehiclesApi.getAll();
      setAllVehicles(data);
    } catch {
      // Backend may not be running
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = useCallback(() => {
    let result = [...allVehicles];

    if (filters.categories.length > 0) {
      result = result.filter(v => filters.categories.includes(v.category));
    }
    if (filters.transmissions.length > 0) {
      result = result.filter(v => filters.transmissions.includes(v.transmission));
    }
    if (filters.branches.length > 0) {
      result = result.filter(v => filters.branches.includes(v.branch));
    }
    if (filters.status) {
      result = result.filter(v => v.status === filters.status);
    }
    result = result.filter(v => v.dailyRate <= filters.maxPrice);

    switch (sortBy) {
      case 'price-asc':  result.sort((a, b) => a.dailyRate - b.dailyRate); break;
      case 'price-desc': result.sort((a, b) => b.dailyRate - a.dailyRate); break;
      case 'newest':     result.sort((a, b) => b.year - a.year); break;
      case 'name':       result.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`)); break;
    }
    setVehicles(result);
  }, [allVehicles, filters, sortBy]);

  useEffect(() => { applyFiltersAndSort(); }, [applyFiltersAndSort]);

  const toggleCategory = (cat: string) => {
    setFilters(f => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat],
    }));
  };

  const toggleTransmission = (t: string) => {
    setFilters(f => ({
      ...f,
      transmissions: f.transmissions.includes(t) ? f.transmissions.filter(x => x !== t) : [...f.transmissions, t],
    }));
  };

  const toggleBranch = (b: string) => {
    setFilters(f => ({
      ...f,
      branches: f.branches.includes(b) ? f.branches.filter(x => x !== b) : [...f.branches, b],
    }));
  };

  const clearFilters = () => {
    setFilters({ categories: [], transmissions: [], branches: [], maxPrice: 200, status: '' });
    setSortBy('default');
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.transmissions.length > 0 ||
    filters.branches.length > 0 || filters.maxPrice < 200 || filters.status !== '';

  const activeFilterCount = filters.categories.length + filters.transmissions.length +
    filters.branches.length + (filters.maxPrice < 200 ? 1 : 0) + (filters.status ? 1 : 0);

  const maxPriceInFleet = Math.max(200, ...allVehicles.map(v => v.dailyRate));

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)' }}>
      {/* Page header */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '32px 0',
      }}>
        <div className="page-container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="section-eyebrow" style={{ marginBottom: '10px' }}>Fleet</div>
              <h1 className="heading-2" style={{ marginBottom: '6px' }}>
                Browse Our <span className="grad-text">Vehicles</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                {allVehicles.length > 0
                  ? `${allVehicles.filter(v => v.status === 'AVAILABLE').length} available out of ${allVehicles.length} total vehicles`
                  : 'Discover the perfect ride for your journey'}
              </p>
            </div>

            {/* View + Sort controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '9px 36px 9px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--r-md)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
              >
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value} style={{ background: '#111827' }}>{o.label}</option>
                ))}
              </select>

              <div style={{
                display: 'flex',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--r-md)',
                overflow: 'hidden',
              }}>
                {(['grid', 'list'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: '9px 12px',
                      background: viewMode === mode ? 'rgba(20,184,166,0.15)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: viewMode === mode ? 'var(--teal-400)' : 'var(--text-muted)',
                      transition: 'all var(--t-fast)',
                      display: 'flex', alignItems: 'center',
                    }}
                    title={`${mode} view`}
                  >
                    {mode === 'grid' ? <GridIcon /> : <ListIcon />}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSidebarOpen(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 16px',
                  background: sidebarOpen ? 'rgba(20,184,166,0.1)' : 'var(--bg-input)',
                  border: `1px solid ${sidebarOpen ? 'rgba(20,184,166,0.25)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--r-md)',
                  color: sidebarOpen ? 'var(--teal-400)' : 'var(--text-muted)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all var(--t-fast)',
                }}
              >
                <FilterIcon />
                Filters
                {activeFilterCount > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: 'var(--teal-500)', color: 'white',
                    fontSize: '10px', fontWeight: 700,
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Active filters:</span>
              {filters.categories.map(c => (
                <button key={c} onClick={() => toggleCategory(c)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '4px 10px', borderRadius: 'var(--r-full)',
                  background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)',
                  color: 'var(--teal-400)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}>
                  {c} <XIcon />
                </button>
              ))}
              {filters.transmissions.map(t => (
                <button key={t} onClick={() => toggleTransmission(t)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '4px 10px', borderRadius: 'var(--r-full)',
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                  color: 'var(--blue-400)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}>
                  {t} <XIcon />
                </button>
              ))}
              {filters.status && (
                <button onClick={() => setFilters(f => ({ ...f, status: '' }))} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '4px 10px', borderRadius: 'var(--r-full)',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                  color: 'var(--green-400)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}>
                  {filters.status} <XIcon />
                </button>
              )}
              <button onClick={clearFilters} style={{
                padding: '4px 10px', borderRadius: 'var(--r-full)',
                background: 'transparent', border: '1px solid var(--border-default)',
                color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="page-container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <div className="vehicles-layout" style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

          {/* ─── Sidebar ─── */}
          {sidebarOpen && (
            <aside className="vehicles-filter-sidebar" style={{
              width: '260px',
              flexShrink: 0,
              position: 'sticky',
              top: '88px',
              animation: 'slideInLeft 0.25s ease-out',
            }}>
              <div className="card" style={{ padding: '20px', overflow: 'hidden' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '16px',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>Filters</span>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500,
                    }}>
                      <RefreshIcon /> Reset
                    </button>
                  )}
                </div>

                <FilterSection title="Vehicle Type">
                  {[
                    { value: 'CAR', label: 'Car' },
                    { value: 'SCOOTER', label: 'Scooter' },
                    { value: 'VAN', label: 'Van' },
                  ].map(opt => (
                    <CheckOption
                      key={opt.value}
                      label={opt.label}
                      checked={filters.categories.includes(opt.value)}
                      onChange={() => toggleCategory(opt.value)}
                    />
                  ))}
                </FilterSection>

                <FilterSection title="Transmission">
                  {[
                    { value: 'AUTOMATIC', label: 'Automatic' },
                    { value: 'MANUAL', label: 'Manual' },
                  ].map(opt => (
                    <CheckOption
                      key={opt.value}
                      label={opt.label}
                      checked={filters.transmissions.includes(opt.value)}
                      onChange={() => toggleTransmission(opt.value)}
                    />
                  ))}
                </FilterSection>

                <FilterSection title="Availability">
                  {[
                    { value: 'AVAILABLE', label: 'Available now' },
                    { value: 'RENTED', label: 'Currently rented' },
                    { value: 'MAINTENANCE', label: 'In maintenance' },
                  ].map(opt => (
                    <CheckOption
                      key={opt.value}
                      label={opt.label}
                      checked={filters.status === opt.value}
                      onChange={() => setFilters(f => ({ ...f, status: f.status === opt.value ? '' : opt.value }))}
                    />
                  ))}
                </FilterSection>

                <FilterSection title="Max Daily Rate" defaultOpen>
                  <div style={{ paddingTop: '8px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Up to</span>
                      <span style={{
                        fontSize: '16px', fontWeight: 700,
                        color: 'var(--teal-400)',
                      }}>
                        ${filters.maxPrice}/day
                      </span>
                    </div>
                    <input
                      type="range"
                      className="range-slider"
                      min={10}
                      max={maxPriceInFleet}
                      value={filters.maxPrice}
                      onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>$10</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>${maxPriceInFleet}</span>
                    </div>
                  </div>
                </FilterSection>

                <FilterSection title="Pick-up Location" defaultOpen={false}>
                  {branches.map(b => (
                    <CheckOption
                      key={b}
                      label={b}
                      checked={filters.branches.includes(b)}
                      onChange={() => toggleBranch(b)}
                    />
                  ))}
                </FilterSection>
              </div>
            </aside>
          )}

          {/* ─── Vehicle Grid ─── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Result count */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {loading ? 'Loading...' : `Showing ${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: '20px' }}>
                <SkeletonCard count={6} />
              </div>
            ) : vehicles.length === 0 ? (
              <div className="card" style={{ padding: '72px 48px', textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--amber-subtle)',
                  border: '1px solid var(--amber-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--amber)',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No vehicles match your filters</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Try adjusting your filters or resetting to see all vehicles.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button onClick={clearFilters} className="btn btn-primary">
                    Clear All Filters
                  </button>
                  <button onClick={loadAll} className="btn btn-secondary">
                    <RefreshIcon /> Refresh
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid'
                  ? 'repeat(auto-fill, minmax(280px, 1fr))'
                  : '1fr',
                gap: '20px',
              }}>
                {vehicles.map((v, i) => (
                  <div key={v.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <VehicleCard vehicle={v} showStatus />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
