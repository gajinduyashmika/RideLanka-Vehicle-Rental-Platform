'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { vehiclesApi, bookingsApi, VehicleResponse, BookingResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/Toast';
import { useCurrency } from '@/lib/currency-context';
import ReceiptModal from '@/components/ReceiptModal';

// ─── Icons ────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const GearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41-1.41M18.66 18.66l1.41-1.41M4.93 4.93l1.41 1.41"/>
    <circle cx="12" cy="12" r="7" strokeDasharray="3 3"/>
  </svg>
);

const CarSpecIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
  </svg>
);

const HashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="4" fill="currentColor"/>
  </svg>
);

const specConfig = [
  { key: 'year',               label: 'Year',             icon: <CalendarIcon /> },
  { key: 'transmission',       label: 'Transmission',     icon: <GearIcon /> },
  { key: 'category',           label: 'Type',             icon: <CarSpecIcon /> },
  { key: 'branch',             label: 'Pick-up Location', icon: <MapPinIcon /> },
  { key: 'registrationNumber', label: 'Reg. Number',      icon: <HashIcon /> },
  { key: 'status',             label: 'Availability',     icon: <ActivityIcon /> },
];

const features = [
  'Comprehensive insurance included',
  'Roadside assistance 24/7',
  'Free cancellation up to 24h before',
  'No hidden fees — price is final',
  'Clean & sanitized before each rental',
  'Unlimited mileage within Southern Province',
];

const policies = [
  { title: 'Cancellation Policy', body: 'Free cancellation up to 24 hours before pick-up. 50% refund within 12 hours. No refund within 6 hours of pick-up.' },
  { title: 'Fuel Policy', body: 'Vehicle is provided with a full tank. Please return with a full tank or a refuelling charge of Rs. 4,500 applies.' },
  { title: 'Damage Policy', body: 'Minor damage covered by included insurance. Major damage or theft requires excess payment as agreed at booking.' },
  { title: 'Late Return', body: 'Returns more than 60 minutes late will be charged at the daily rate pro-rated per hour.' },
];

const insuranceOptions = [
  { id: 'basic', label: 'Basic Coverage', price: 0, desc: 'Included — third party liability' },
  { id: 'standard', label: 'Standard Coverage', price: 2500, desc: 'Collision damage waiver included' },
  { id: 'premium', label: 'Premium Coverage', price: 5000, desc: 'Full coverage, zero excess' },
];

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInsurance, setSelectedInsurance] = useState('basic');
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState<BookingResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await vehiclesApi.getById(params.id as string);
        setVehicle(data);
      } catch {
        setError('Vehicle not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const today = new Date().toISOString().split('T')[0];

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const days = calculateDays();
  const insuranceDaily = insuranceOptions.find(o => o.id === selectedInsurance)?.price ?? 0;
  const baseTotal = days * (vehicle?.dailyRate ?? 0);
  const insuranceTotal = days * insuranceDaily;
  const totalCost = baseTotal + insuranceTotal;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (days === 0) {
      setError('Please select valid pick-up and drop-off dates.');
      return;
    }
    setBookingLoading(true);
    setError('');
    try {
      const booking = await bookingsApi.create({
        vehicleId: params.id as string,
        startDate,
        endDate,
      });
      setReceiptBooking(booking);
      toast(`Booking confirmed! ID: ${booking.id.slice(0, 8).toUpperCase()} · Total: ${formatPrice(booking.totalCost)}`, 'success');
      setStartDate('');
      setEndDate('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading vehicle details…</p>
      </div>
    );
  }

  if (!vehicle || error === 'Vehicle not found') {
    return (
      <div className="page-container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--amber-subtle)',
          border: '1px solid var(--amber-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'var(--amber)',
        }}>
          <CarSpecIcon />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Vehicle Not Found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>This vehicle doesn&apos;t exist or has been removed.</p>
        <Link href="/vehicles" className="btn btn-primary">Browse All Vehicles</Link>
      </div>
    );
  }

  const tabs = ['overview', 'features', 'policies'];

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* ─── Hero Image ─── */}
      <div style={{
        position: 'relative',
        height: '420px',
        background: 'linear-gradient(135deg, rgba(20,184,166,0.06), rgba(14,165,233,0.04), rgba(168,85,247,0.04))',
        overflow: 'hidden',
      }}>
        {vehicle.imageUrl && !imgError ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
            color: 'var(--amber)',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--amber-subtle)',
              border: '1px solid var(--amber-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CarSpecIcon />
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {vehicle.make} {vehicle.model}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(6,9,18,0.3) 0%, transparent 40%, rgba(6,9,18,0.85) 100%)',
        }} />

        {/* Back button */}
        <div style={{ position: 'absolute', top: '24px', left: '0', right: '0' }}>
          <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => router.back()}
              className="btn btn-secondary btn-sm"
              style={{ backdropFilter: 'blur(12px)', background: 'rgba(6,9,18,0.5)' }}
            >
              <BackIcon /> Back
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setWishlisted(v => !v)}
                className="btn btn-secondary btn-sm"
                style={{ backdropFilter: 'blur(12px)', background: 'rgba(6,9,18,0.5)' }}
              >
                <HeartIcon filled={wishlisted} />
                {wishlisted ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); toast('Link copied to clipboard!', 'info'); }}
                className="btn btn-secondary btn-sm"
                style={{ backdropFilter: 'blur(12px)', background: 'rgba(6,9,18,0.5)' }}
              >
                <ShareIcon /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Bottom overlay info */}
        <div style={{ position: 'absolute', bottom: '24px', left: '0', right: '0' }}>
          <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className={`badge badge-${vehicle.category.toLowerCase()}`}>{vehicle.category}</span>
              <span className={`badge badge-${vehicle.status.toLowerCase()}`}>{vehicle.status}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {vehicle.make} {vehicle.model}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
              {vehicle.year} · {vehicle.transmission} · {vehicle.branch}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="page-container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div className="vehicle-detail-layout" style={{
          display: 'grid',
          gap: '36px',
          alignItems: 'flex-start',
        }}>
          {/* Left column */}
          <div>
            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: '32px' }}>
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Vehicle Specifications</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '14px',
                  marginBottom: '36px',
                }}>
                  {specConfig.map(spec => {
                    const rawVal = vehicle[spec.key as keyof VehicleResponse];
                    const val = typeof rawVal === 'string' || typeof rawVal === 'number' ? String(rawVal) : '—';
                    return (
                      <div
                        key={spec.key}
                        style={{
                          padding: '20px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--r-lg)',
                        }}
                      >
                        <div style={{ color: 'var(--amber)', marginBottom: '12px', display: 'flex' }}>{spec.icon}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                          {spec.label}
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {val}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick facts */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Quick Facts</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: 'Daily Rate', value: `${formatPrice(vehicle.dailyRate)} / day` },
                      { label: 'Category', value: vehicle.category },
                      { label: 'Branch', value: vehicle.branch },
                      { label: 'Status', value: vehicle.status },
                    ].map(item => (
                      <div key={item.label} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 'var(--r-md)',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Features tab */}
            {activeTab === 'features' && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>What&apos;s Included</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                  {features.map(f => (
                    <div key={f} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      padding: '14px',
                      background: 'rgba(34,197,94,0.04)',
                      border: '1px solid rgba(34,197,94,0.15)',
                      borderRadius: 'var(--r-md)',
                    }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: 'rgba(34,197,94,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--green-400)', flexShrink: 0, marginTop: '1px',
                      }}>
                        <CheckIcon />
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="alert alert-info" style={{ marginTop: '8px' }}>
                  <ShieldIcon />
                  <span style={{ fontSize: '13px', lineHeight: 1.6 }}>
                    All vehicles are inspected before every rental and come with basic third-party liability insurance. 
                    Upgrade your coverage in the booking form for added peace of mind.
                  </span>
                </div>
              </div>
            )}

            {/* Policies tab */}
            {activeTab === 'policies' && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Rental Policies</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {policies.map(p => (
                    <div key={p.title} className="card" style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--teal-400)' }}>
                        {p.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        {p.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right: Booking sidebar ─── */}
          <div style={{ position: 'sticky', top: '88px' }}>
            <div className="card" style={{ padding: '28px', overflow: 'hidden' }}>
              {/* Price header */}
              <div style={{ marginBottom: '20px' }}>
                <div className="price-display" style={{ alignItems: 'baseline' }}>
                  <span className="price-amount" style={{ fontSize: '32px' }}>{formatPrice(vehicle.dailyRate)}</span>
                  <span className="price-unit" style={{ fontSize: '15px' }}>/day</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>All fees included · No surprises</p>
              </div>

              <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '20px' }} />

              {/* Error alert */}
              {error && error !== 'Vehicle not found' && (
                <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Date pickers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="field-label"><CalIcon /> Pick-up</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => { setStartDate(e.target.value); setError(''); }}
                      className="input-field"
                      required
                      min={today}
                      style={{ fontSize: '13px', padding: '10px 12px', colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label className="field-label"><CalIcon /> Drop-off</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => { setEndDate(e.target.value); setError(''); }}
                      className="input-field"
                      required
                      min={startDate || today}
                      style={{ fontSize: '13px', padding: '10px 12px', colorScheme: 'dark' }}
                    />
                  </div>
                </div>

                {/* Insurance options */}
                <div>
                  <label className="field-label"><ShieldIcon /> Coverage</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {insuranceOptions.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedInsurance(opt.id)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: 'var(--r-md)',
                          border: `1px solid ${selectedInsurance === opt.id ? 'rgba(20,184,166,0.35)' : 'var(--border-subtle)'}`,
                          background: selectedInsurance === opt.id ? 'rgba(20,184,166,0.06)' : 'rgba(255,255,255,0.02)',
                          cursor: 'pointer', textAlign: 'left',
                          transition: 'all var(--t-fast)', width: '100%',
                        }}
                      >
                        <div>
                          <div style={{
                            fontSize: '13px', fontWeight: 600,
                            color: selectedInsurance === opt.id ? 'var(--teal-400)' : 'var(--text-primary)',
                            marginBottom: '2px',
                          }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{opt.desc}</div>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
                          {opt.price === 0 ? 'Free' : `+${formatPrice(opt.price)}/d`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price breakdown */}
                {days > 0 && (
                  <div style={{
                    padding: '14px',
                    background: 'rgba(20,184,166,0.04)',
                    border: '1px solid rgba(20,184,166,0.12)',
                    borderRadius: 'var(--r-md)',
                    fontSize: '13px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      <span>{formatPrice(vehicle.dailyRate)} × {days} day{days !== 1 ? 's' : ''}</span>
                      <span>{formatPrice(baseTotal)}</span>
                    </div>
                    {insuranceDaily > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        <span>Insurance × {days} day{days !== 1 ? 's' : ''}</span>
                        <span>{formatPrice(insuranceTotal)}</span>
                      </div>
                    )}
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0' }} />
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontWeight: 700, fontSize: '15px',
                      color: 'var(--text-primary)',
                    }}>
                      <span>Total</span>
                      <span className="grad-text">{formatPrice(totalCost)}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
                      {days} day{days !== 1 ? 's' : ''} rental · No deposit required
                    </div>
                  </div>
                )}

                {/* Book button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={bookingLoading || vehicle.status !== 'AVAILABLE' || isAdmin}
                  style={{ width: '100%', padding: '15px', fontSize: '15px', fontWeight: 700 }}
                >
                  {bookingLoading ? (
                    <span className="spinner spinner-sm" />
                  ) : vehicle.status !== 'AVAILABLE' ? (
                    'Currently Unavailable'
                  ) : isAdmin ? (
                    'Admin accounts cannot reserve'
                  ) : !isAuthenticated ? (
                    'Sign In to Reserve'
                  ) : (
                    `Reserve Now${days > 0 ? ` · ${formatPrice(totalCost)}` : ''}`
                  )}
                </button>

                {!isAuthenticated && (
                  <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Link href="/login" style={{ color: 'var(--teal-400)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                    {' '}or{' '}
                    <Link href="/register" style={{ color: 'var(--teal-400)', textDecoration: 'none', fontWeight: 600 }}>create account</Link>
                    {' '}to book
                  </p>
                )}

                {/* Trust signals */}
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '16px',
                  paddingTop: '4px',
                }}>
                  {['Instant confirm', 'Free cancel', 'Secure rental'].map(t => (
                    <span key={t} style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckIcon /> {t}
                    </span>
                  ))}
                </div>
              </form>
            </div>

            {/* Similar vehicles hint */}
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <Link href="/vehicles" style={{
                fontSize: '13px', color: 'var(--text-muted)',
                textDecoration: 'none', transition: 'color var(--t-fast)',
              }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--teal-400)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                ← Browse similar vehicles
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 900px) {
          .vehicle-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Official Receipt & Tax Invoice Modal */}
      <ReceiptModal
        booking={receiptBooking}
        onClose={() => setReceiptBooking(null)}
      />
    </div>
  );
}
