'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchForm from '@/components/SearchForm';
import VehicleCard from '@/components/VehicleCard';
import SkeletonCard from '@/components/SkeletonCard';
import { vehiclesApi, VehicleResponse } from '@/lib/api';

// ─── Icon helpers ────────────────────────────────────────────────────────────
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const CheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const Star = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#E8A020" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const categoryFilters = [
  { value: '', label: 'All Vehicles' },
  { value: 'CAR', label: 'Cars' },
  { value: 'SCOOTER', label: 'Scooters' },
  { value: 'VAN', label: 'Vans' },
];

const stats = [
  { number: '50+', label: 'Vehicles' },
  { number: '5', label: 'Locations' },
  { number: '4.9 / 5', label: 'Rating' },
  { number: '2k+', label: 'Customers' },
];

const testimonials = [
  { name: 'Sarah M.', country: 'UK', rating: 5, text: 'Seamless booking, perfect car. Best rental experience I have had anywhere in Asia.', init: 'SM', bg: '#1A3A3A' },
  { name: 'James K.', country: 'Japan', rating: 5, text: 'Spotless van, helpful staff at Galle. The whole trip was made better by this service.', init: 'JK', bg: '#2A1A3A' },
  { name: 'Priya R.', country: 'India', rating: 5, text: 'Transparent pricing, no surprises. The scooter was in perfect condition for Mirissa.', init: 'PR', bg: '#3A2A1A' },
];

const locations = [
  { name: 'Matara', desc: 'City centre hub', vehicles: 12, img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f11?w=400&q=80' },
  { name: 'Galle Fort', desc: 'Heritage & waterfront', vehicles: 10, img: '/galle-fort.jpg' },
  { name: 'Mirissa', desc: 'Beach & surf zone', vehicles: 6, img: '/mirissa-beach.jpg' },
  { name: 'Tangalle', desc: 'Secluded coast', vehicles: 5, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&q=80' },
];

export default function HomePage() {
  const [allVehicles, setAllVehicles] = useState<VehicleResponse[]>([]);
  const [filtered, setFiltered] = useState<VehicleResponse[]>([]);
  const [searchResults, setSearchResults] = useState<VehicleResponse[] | null>(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => { loadVehicles(); }, []);

  useEffect(() => {
    if (!activeCategory) { setFiltered(allVehicles.slice(0, 9)); return; }
    setFiltered(allVehicles.filter(v => v.category === activeCategory).slice(0, 9));
  }, [activeCategory, allVehicles]);

  const loadVehicles = async () => {
    try {
      const all = await vehiclesApi.getAll();
      const avail = all.filter(v => v.status === 'AVAILABLE');
      setAllVehicles(avail);
      setFiltered(avail.slice(0, 9));
    } catch { /* offline */ }
    finally { setLoading(false); }
  };

  const handleSearch = async (params: { startDate: string; endDate: string; category: string; branch: string }) => {
    setSearchLoading(true);
    try {
      const results = await vehiclesApi.search(params);
      setSearchResults(results);
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch { /* offline */ }
    finally { setSearchLoading(false); }
  };

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════
          HERO — full-bleed photo + left-anchored text
      ════════════════════════════════════════════════════════════ */}
      <section className="hero-section" style={{
        position: 'relative',
        minHeight: 'calc(100vh - var(--nav-h))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* Background photo */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
          <img src="/hero-coastal.jpg" alt="Sri Lanka coastal road" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
          {/* Gradient overlay — left-heavier for text legibility */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(12,12,12,0.94) 0%, rgba(12,12,12,0.80) 55%, rgba(12,12,12,0.25) 100%)',
          }} />
          {/* Bottom vignette */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '160px', background: 'linear-gradient(to top, var(--bg-base), transparent)' }} />
        </div>

        {/* Content */}
        <div className="page-container" style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: 'clamp(44px, 7vh, 80px)',
          paddingBottom: 'clamp(36px, 5vh, 60px)',
          width: '100%',
        }}>
          <div style={{ maxWidth: '640px' }}>
            {/* Overline */}
            <div className="fade-in" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: 'var(--r-full)',
              border: '1px solid var(--amber-border)',
              background: 'var(--amber-subtle)',
              marginBottom: '20px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--amber)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--amber)', letterSpacing: '0.04em' }}>LIVE AVAILABILITY - SOUTHERN COAST</span>
            </div>

            {/* Headline */}
            <h1 className="fade-in delay-1" style={{
              fontSize: 'clamp(38px, 5.5vw, 76px)',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.08,
              color: '#FAFAFA',
              marginBottom: '18px',
            }}>
              Explore Sri Lanka<br />
              <em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>on your terms.</em>
            </h1>

            {/* Sub */}
            <p className="fade-in delay-2" style={{
              fontSize: 'clamp(15px, 1.8vw, 17px)',
              color: 'rgba(245,245,245,0.72)',
              lineHeight: 1.65,
              maxWidth: '500px',
              marginBottom: '28px',
              fontWeight: 300,
            }}>
              Cars, scooters, and vans from trusted local shops across Matara, Galle, Mirissa, and beyond. Instant booking — no hidden fees.
            </p>

            {/* CTAs */}
            <div className="fade-in delay-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
              <Link href="/vehicles" className="btn btn-primary btn-lg">
                Browse vehicles <ArrowRight />
              </Link>
              <Link href="/register" className="btn btn-secondary btn-lg">
                Join free
              </Link>
            </div>

            {/* Trust row — fully visible with checkmarks */}
            <div className="fade-in delay-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 24px', alignItems: 'center' }}>
              {['Free cancellation', 'No deposit', '24/7 roadside support'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle />
                  <span style={{ fontSize: '13px', color: 'rgba(245,245,245,0.75)', fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar — placed in normal flex flow at bottom of hero so it never hides content */}
        <div className="hero-stats-bar" style={{
          position: 'relative',
          zIndex: 2,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(12,12,12,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          width: '100%',
        }}>
          <div className="page-container">
            <div className="hero-stats-grid">
              {stats.map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: 'var(--amber)', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.number}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEARCH FORM
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="page-container">
          <SearchForm onSearch={handleSearch} loading={searchLoading} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEARCH RESULTS (conditional)
      ════════════════════════════════════════════════════════════ */}
      {searchResults && (
        <section id="results" style={{ padding: '56px 0' }}>
          <div className="page-container">
            <div className="flex-between" style={{ marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
                  {searchResults.length} vehicle{searchResults.length !== 1 ? 's' : ''} found
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Matching your dates and preferences</p>
              </div>
              <button onClick={() => setSearchResults(null)} className="btn btn-secondary btn-sm">
                ← Clear search
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="card" style={{ padding: '72px', textAlign: 'center' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'var(--amber-subtle)',
                  border: '1px solid var(--amber-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--amber)',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No vehicles available</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Try different dates or another location.</p>
                <button onClick={() => setSearchResults(null)} className="btn btn-primary">Adjust search</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {searchResults.map(v => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          FEATURED VEHICLES
      ════════════════════════════════════════════════════════════ */}
      {!searchResults && (
        <section style={{ padding: '80px 0' }}>
          <div className="page-container">
            {/* Header */}
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
              <div>
                <p className="overline" style={{ marginBottom: '8px' }}>Fleet</p>
                <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
                  Available right now
                </h2>
              </div>
              <Link href="/vehicles" className="btn btn-secondary">
                View all vehicles <ArrowRight />
              </Link>
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
              {categoryFilters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setActiveCategory(f.value)}
                  className={`filter-pill ${activeCategory === f.value ? 'active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                <SkeletonCard count={6} />
              </div>
            ) : filtered.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {filtered.map((v, i) => (
                  <div key={v.id} className="fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <VehicleCard vehicle={v} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '72px', textAlign: 'center' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'var(--amber-subtle)',
                  border: '1px solid var(--amber-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--amber)',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
                    <circle cx="7" cy="17" r="2" />
                    <path d="M9 17h6" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                  {activeCategory ? `No ${activeCategory.toLowerCase()}s available right now` : 'Connect to the backend to see live fleet.'}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — horizontal timeline
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 0' }}>
        <div className="page-container">
          <div style={{ marginBottom: '52px' }}>
            <p className="overline" style={{ marginBottom: '10px' }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
              On the road in minutes
            </h2>
          </div>

          <div className="steps-grid">
            {[
              { n: '01', title: 'Choose your vehicle', body: 'Filter by type, dates, and location. Every listing shows live availability.' },
              { n: '02', title: 'Book instantly', body: 'Confirm your reservation in under 60 seconds. No calls, no waiting.' },
              { n: '03', title: 'Pick up and drive', body: 'Show your booking at the branch and you are on your way. Simple.' },
            ].map((step, i) => (
              <div key={step.n} style={{ background: 'var(--bg-surface)', padding: '40px 36px' }}>
                <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em', marginBottom: '24px', fontFamily: 'monospace' }}>
                  STEP {step.n}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.02em' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LOCATIONS — photo cards
      ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0' }}>
        <div className="page-container">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
            <div>
              <p className="overline" style={{ marginBottom: '10px' }}>Destinations</p>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
                Pick up anywhere
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {locations.map((loc, i) => (
              <div key={loc.name} className="fade-in" style={{ animationDelay: `${i * 80}ms`, position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', aspectRatio: '4/3', cursor: 'pointer' }}
                onMouseOver={e => { const el = e.currentTarget; el.querySelector('img')!.style.transform = 'scale(1.06)'; }}
                onMouseOut={e => { const el = e.currentTarget; el.querySelector('img')!.style.transform = 'scale(1)'; }}
              >
                <img
                  src={loc.img}
                  alt={loc.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onError={e => { (e.target as HTMLImageElement).src = `https://source.unsplash.com/400x300/?${loc.name},srilanka`; }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(12,12,12,0.9) 0%, rgba(12,12,12,0.1) 60%)',
                }} />
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '3px' }}>{loc.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{loc.desc}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)', background: 'rgba(232,160,32,0.15)', padding: '3px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--amber-border)' }}>
                      {loc.vehicles} cars
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '80px 0' }}>
        <div className="page-container">
          <div style={{ marginBottom: '48px' }}>
            <p className="overline" style={{ marginBottom: '10px' }}>Reviews</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
                What our customers say
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} />)}
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '4px' }}>4.9 / 5</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>· 2,400+ reviews</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {testimonials.map((t, i) => (
              <div key={t.name} className="card fade-in" style={{ padding: '28px', animationDelay: `${i * 100}ms` }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(t.rating)].map((_, j) => <Star key={j} />)}
                </div>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: t.bg, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                    {t.init}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.country}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="page-container">
          <div className="cta-banner-grid" style={{
            padding: 'clamp(32px, 6vw, 64px)',
            borderRadius: 'var(--r-2xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}>
            <div>
              <p className="overline" style={{ marginBottom: '12px', color: 'var(--amber)' }}>Start today</p>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '12px' }}>
                Ready to hit the road?
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '460px', lineHeight: 1.7 }}>
                Create a free account and make your first booking in under two minutes. No commitment required.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
              <Link href="/register" className="btn btn-primary btn-lg">
                Create free account <ArrowRight />
              </Link>
              <Link href="/vehicles" className="btn btn-secondary btn-lg" style={{ justifyContent: 'center' }}>
                Browse fleet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════ */}
      <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '56px 0 32px' }}>
        <div className="page-container">
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--amber)" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.03em' }}>
                  Ride<span style={{ color: 'var(--amber)' }}>Lanka</span>
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '260px' }}>
                Sri Lanka&apos;s trusted vehicle rental platform for the Southern Province. Cars, scooters, vans.
              </p>
            </div>
            {[
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Blog'] },
              { title: 'Support', links: ['Help', 'Safety', 'Insurance', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Refunds'] },
            ].map(col => (
              <div key={col.title}>
                <p className="overline" style={{ marginBottom: '16px', fontSize: '10px' }}>{col.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--t-fast)' }}
                      onMouseOver={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>© 2026 RideLanka. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Twitter', 'Instagram', 'Facebook'].map(s => (
                <a key={s} href="#" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--t-fast)' }}
                  onMouseOver={e => (e.currentTarget.style.color = 'var(--amber)')}
                  onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 900px) {
          footer .page-container > div:first-child { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          footer .page-container > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
