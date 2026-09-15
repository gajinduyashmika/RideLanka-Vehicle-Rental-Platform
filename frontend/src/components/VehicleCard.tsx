'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VehicleResponse } from '@/lib/api';

interface VehicleCardProps {
  vehicle: VehicleResponse;
  showStatus?: boolean;
}

// ─── Modern Category SVG Icons ──────────────────────────────────────────────
export const CarIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/>
    <path d="M9 17h6"/>
    <circle cx="17" cy="17" r="2"/>
  </svg>
);

export const ScooterIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="17" r="3"/>
    <circle cx="18" cy="17" r="3"/>
    <path d="M6 14h5l3-6h4"/>
    <path d="M14 8h3"/>
    <path d="M10 17h5"/>
  </svg>
);

export const VanIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="15" height="11" rx="2"/>
    <path d="M17 9l4 2v5h-4"/>
    <circle cx="6" cy="17" r="2"/>
    <circle cx="17" cy="17" r="2"/>
  </svg>
);

const categoryMeta: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  SCOOTER: { label: 'Scooter', badge: 'badge-scooter', icon: <ScooterIcon size={44} /> },
  CAR:     { label: 'Car',     badge: 'badge-car',     icon: <CarIcon size={44} /> },
  VAN:     { label: 'Van',     badge: 'badge-van',     icon: <VanIcon size={44} /> },
};

const transmissionLabel: Record<string, string> = {
  AUTOMATIC: 'Auto',
  MANUAL: 'Manual',
};

function StarRating({ rating = 4.5 }: { rating?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <svg
            key={i}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={i <= Math.round(rating) ? 'var(--amber)' : '#333'}
            stroke="none"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
      </div>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{rating}</span>
    </div>
  );
}

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const GearIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41-1.41M18.66 18.66l1.41-1.41M4.93 4.93l1.41 1.41"/>
    <circle cx="12" cy="12" r="7" strokeDasharray="3 3"/>
  </svg>
);

export default function VehicleCard({ vehicle, showStatus = false }: VehicleCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const meta = categoryMeta[vehicle.category] || categoryMeta.CAR;
  const isAvailable = vehicle.status === 'AVAILABLE';

  // Deterministic stable rating per vehicle
  const rating = (4 + ((parseInt(vehicle.id?.slice(-2) || '0', 16) % 10) / 10)).toFixed(1);
  const reviews = 8 + (parseInt(vehicle.id?.slice(-4, -2) || '0', 16) % 47);

  return (
    <Link href={`/vehicles/${vehicle.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        className="card card-hover"
        style={{
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          transition: 'all var(--t-base)',
        }}
      >
        {/* Image section */}
        <div style={{
          position: 'relative',
          height: '210px',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#141414',
        }}>
          {vehicle.imageUrl && !imgError ? (
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
              }}
              className="vehicle-img"
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at center, rgba(232,160,32,0.06) 0%, rgba(20,20,20,0.95) 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: 'var(--amber)',
            }}>
              <div style={{ opacity: 0.85 }}>
                {meta.icon}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                {vehicle.make} {vehicle.model}
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(12,12,12,0.65) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />

          {/* Top badges row */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
          }}>
            <span className={`badge ${meta.badge}`} style={{ fontSize: '11px', fontWeight: 600 }}>
              {meta.label}
            </span>
            {showStatus && (
              <span className={`badge badge-${vehicle.status.toLowerCase()}`} style={{ fontSize: '11px' }}>
                {vehicle.status}
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(v => !v); }}
            title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(12,12,12,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--t-fast)',
              color: wishlisted ? 'transparent' : 'var(--text-secondary)',
              zIndex: 2,
            }}
          >
            <HeartIcon filled={wishlisted} />
          </button>

          {/* Not available overlay */}
          {!isAvailable && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(12,12,12,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
            }}>
              <span style={{
                padding: '6px 14px',
                background: 'rgba(239,68,68,0.2)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: 'var(--r-full)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--red)',
                backdropFilter: 'blur(8px)',
                letterSpacing: '0.05em',
              }}>
                {vehicle.status}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{
          padding: '18px 20px 20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {/* Title + rating row */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                lineHeight: 1.25,
              }}>
                {vehicle.make} {vehicle.model}
              </h3>
              <span style={{
                fontSize: '12.5px',
                color: 'var(--text-muted)',
                fontWeight: 500,
                flexShrink: 0,
              }}>
                {vehicle.year}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StarRating rating={parseFloat(rating)} />
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>({reviews})</span>
            </div>
          </div>

          {/* Specs pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              fontSize: '11.5px',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}>
              <GearIcon />
              {transmissionLabel[vehicle.transmission] || vehicle.transmission}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              fontSize: '11.5px',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}>
              <MapPinIcon />
              {vehicle.branch}
            </span>
          </div>

          {/* Footer: price + CTA */}
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                ${vehicle.dailyRate}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '3px' }}>/day</span>
            </div>

            <span
              style={{
                padding: '7px 15px',
                background: isAvailable ? 'var(--amber)' : 'rgba(255,255,255,0.05)',
                color: isAvailable ? '#0C0C0C' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: 'var(--r-md)',
                letterSpacing: '0.01em',
                transition: 'all var(--t-fast)',
                flexShrink: 0,
              }}
            >
              {isAvailable ? 'Reserve' : 'Unavailable'}
            </span>
          </div>
        </div>

        <style>{`
          .card-hover:hover .vehicle-img {
            transform: scale(1.05);
          }
          .card-hover:hover {
            border-color: var(--border-strong) !important;
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    </Link>
  );
}
