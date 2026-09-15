'use client';

import React from 'react';

interface SkeletonCardProps {
  count?: number;
}

function SingleSkeleton() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Image skeleton */}
      <div className="skeleton" style={{ height: '210px', borderRadius: 0 }} />

      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="skeleton" style={{ height: '18px', width: '55%', borderRadius: 'var(--r-sm)' }} />
          <div className="skeleton" style={{ height: '14px', width: '15%', borderRadius: 'var(--r-sm)' }} />
        </div>

        {/* Stars */}
        <div className="skeleton" style={{ height: '14px', width: '35%', borderRadius: 'var(--r-sm)' }} />

        {/* Spec pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="skeleton" style={{ height: '24px', width: '72px', borderRadius: 'var(--r-full)' }} />
          <div className="skeleton" style={{ height: '24px', width: '90px', borderRadius: 'var(--r-full)' }} />
        </div>

        {/* Price + button */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: '14px', borderTop: '1px solid var(--border-subtle)',
        }}>
          <div className="skeleton" style={{ height: '26px', width: '80px', borderRadius: 'var(--r-sm)' }} />
          <div className="skeleton" style={{ height: '32px', width: '90px', borderRadius: 'var(--r-full)' }} />
        </div>
      </div>
    </div>
  );
}

export default function SkeletonCard({ count = 6 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeleton key={i} />
      ))}
    </>
  );
}
