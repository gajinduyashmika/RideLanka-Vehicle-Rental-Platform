'use client';

import React from 'react';
import { BookingResponse } from '@/lib/api';
import { useCurrency } from '@/lib/currency-context';

interface ReceiptModalProps {
  booking: BookingResponse | null;
  onClose: () => void;
}

export default function ReceiptModal({ booking, onClose }: ReceiptModalProps) {
  const { formatPrice, currency } = useCurrency();

  if (!booking) return null;

  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const dailyRate = booking.totalCost / days;

  const invoiceNo = `RL-INV-${booking.id.slice(0, 8).toUpperCase()}`;
  const issueDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `RideLanka Rental Receipt
Invoice #: ${invoiceNo}
Booking ID: ${booking.id}
Customer: ${booking.customerName}
Vehicle: ${booking.vehicleName} (${booking.vehicleCategory})
Dates: ${booking.startDate} to ${booking.endDate} (${days} days)
Branch: ${booking.branch}
Total Paid: ${formatPrice(booking.totalCost)} (${currency})
Status: ${booking.status}`;
    navigator.clipboard?.writeText(text);
  };

  const isConfirmed = booking.status === 'CONFIRMED';
  const isCompleted = booking.status === 'COMPLETED';
  const isCancelled = booking.status === 'CANCELLED';

  return (
    <>
      {/* Global print style override for print-perfect document */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-modal-backdrop {
            position: static !important;
            background: none !important;
            padding: 0 !important;
            display: block !important;
          }
          #ridelanka-receipt-document,
          #ridelanka-receipt-document * {
            visibility: visible;
          }
          #ridelanka-receipt-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            background: #ffffff !important;
            color: #111827 !important;
            border-radius: 0 !important;
            padding: 24px !important;
          }
          .no-print {
            display: none !important;
          }
          .print-dark-text {
            color: #111827 !important;
          }
          .print-muted-text {
            color: #4b5563 !important;
          }
          .print-border {
            border-color: #e5e7eb !important;
          }
          .print-bg-subtle {
            background: #f9fafb !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        id="receipt-modal-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(5, 8, 16, 0.82)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        {/* Modal Window */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-xl)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Top Action Bar (hidden on print) */}
          <div
            className="no-print"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Official Rental Receipt & Tax Invoice
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
                title="Copy receipt details"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </button>

              <button
                onClick={handlePrint}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print / Save PDF
              </button>

              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm"
                style={{ padding: '6px 10px', color: 'var(--text-muted)' }}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Printable Document Content */}
          <div
            id="ridelanka-receipt-document"
            style={{
              padding: '32px 36px',
              overflowY: 'auto',
              background: 'var(--bg-card)',
              fontFamily: 'inherit',
            }}
          >
            {/* Header: Brand & Invoice Meta */}
            <div
              className="print-border"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                paddingBottom: '24px',
                borderBottom: '1px solid var(--border-subtle)',
                gap: '20px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--amber) 0%, #D97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '16px',
                      color: '#080C14',
                    }}
                  >
                    R
                  </div>
                  <span
                    className="print-dark-text"
                    style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      color: 'var(--text-primary)',
                    }}
                  >
                    RideLanka
                  </span>
                </div>
                <div
                  className="print-muted-text"
                  style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}
                >
                  RideLanka Vehicle Rentals (Pvt) Ltd.<br />
                  Galle Road, Coastal Hub, Southern Province, Sri Lanka<br />
                  Support: +94 (0) 91 224 8899 · help@ridelanka.lk<br />
                  Tax Reg: RL-LK-9481-VAT
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  className="print-dark-text"
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    color: 'var(--amber)',
                    marginBottom: '4px',
                  }}
                >
                  RECEIPT / INVOICE
                </div>
                <div
                  className="print-dark-text"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                  }}
                >
                  {invoiceNo}
                </div>
                <div className="print-muted-text" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Issue Date: {issueDate}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: isConfirmed
                        ? 'rgba(34, 197, 94, 0.12)'
                        : isCompleted
                        ? 'rgba(59, 130, 246, 0.12)'
                        : 'rgba(239, 68, 68, 0.12)',
                      color: isConfirmed
                        ? '#22c55e'
                        : isCompleted
                        ? '#3b82f6'
                        : '#ef4444',
                      border: `1px solid ${
                        isConfirmed
                          ? 'rgba(34, 197, 94, 0.25)'
                          : isCompleted
                          ? 'rgba(59, 130, 246, 0.25)'
                          : 'rgba(239, 68, 68, 0.25)'
                      }`,
                    }}
                  >
                    {isConfirmed ? 'Paid & Confirmed' : isCompleted ? 'Completed' : 'Cancelled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Billed To & Rental Details Grid */}
            <div
              className="print-border"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                padding: '20px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div
                  className="print-muted-text"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  Billed To
                </div>
                <div
                  className="print-dark-text"
                  style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  {booking.customerName || 'Valued Customer'}
                </div>
                <div
                  className="print-muted-text"
                  style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}
                >
                  Customer Ref: #{booking.customerId ? booking.customerId.slice(0, 8).toUpperCase() : 'RL-GUEST'}
                </div>
                <div
                  className="print-muted-text"
                  style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}
                >
                  Station: {booking.branch}
                </div>
              </div>

              <div>
                <div
                  className="print-muted-text"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  Rental Vehicle
                </div>
                <div
                  className="print-dark-text"
                  style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  {booking.vehicleName}
                </div>
                <div
                  className="print-muted-text"
                  style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}
                >
                  Category: {booking.vehicleCategory}
                </div>
                <div
                  className="print-muted-text"
                  style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}
                >
                  Booking ID: <span style={{ fontFamily: 'monospace' }}>#{booking.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              <div>
                <div
                  className="print-muted-text"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  Rental Itinerary
                </div>
                <div
                  className="print-dark-text"
                  style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}
                >
                  {booking.startDate} → {booking.endDate}
                </div>
                <div
                  className="print-muted-text"
                  style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}
                >
                  Duration: <strong className="print-dark-text" style={{ color: 'var(--amber)' }}>{days} Day{days !== 1 ? 's' : ''}</strong>
                </div>
                <div
                  className="print-muted-text"
                  style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}
                >
                  Pick-up / Drop-off: {booking.branch}
                </div>
              </div>
            </div>

            {/* Line Item Statement Table */}
            <div style={{ marginTop: '24px' }}>
              <div
                className="print-muted-text"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  marginBottom: '12px',
                }}
              >
                Itemized Statement
              </div>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                }}
              >
                <thead>
                  <tr
                    className="print-bg-subtle print-border"
                    style={{
                      borderBottom: '1.5px solid var(--border-default)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      textAlign: 'left',
                    }}
                  >
                    <th className="print-muted-text" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)' }}>Description</th>
                    <th className="print-muted-text" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Qty / Days</th>
                    <th className="print-muted-text" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Daily Rate</th>
                    <th className="print-muted-text" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Vehicle Rental */}
                  <tr
                    className="print-border"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div className="print-dark-text" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {booking.vehicleName} Rental
                      </div>
                      <div className="print-muted-text" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Pick-up at {booking.branch} station
                      </div>
                    </td>
                    <td className="print-dark-text" style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {days} {days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="print-dark-text" style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {formatPrice(dailyRate)}
                    </td>
                    <td className="print-dark-text" style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatPrice(booking.totalCost)}
                    </td>
                  </tr>

                  {/* Insurance Package */}
                  <tr
                    className="print-border"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div className="print-dark-text" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        Third-Party Liability & 24/7 Roadside Assistance
                      </div>
                      <div className="print-muted-text" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Standard coverage included with booking
                      </div>
                    </td>
                    <td className="print-dark-text" style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {days} {days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="print-dark-text" style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      Included
                    </td>
                    <td className="print-dark-text" style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatPrice(0)}
                    </td>
                  </tr>

                  {/* Clean Vehicle Sanitization */}
                  <tr
                    className="print-border"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div className="print-dark-text" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        Vehicle Sanitation & Safety Inspection
                      </div>
                      <div className="print-muted-text" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Full multi-point check before handover
                      </div>
                    </td>
                    <td className="print-dark-text" style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      1
                    </td>
                    <td className="print-dark-text" style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      Waived
                    </td>
                    <td className="print-dark-text" style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatPrice(0)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Subtotal & Totals Summary */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '16px',
                  paddingRight: '12px',
                }}
              >
                <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span className="print-muted-text" style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                    <span className="print-dark-text" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatPrice(booking.totalCost)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span className="print-muted-text" style={{ color: 'var(--text-muted)' }}>VAT & Local Tourism Tax:</span>
                    <span className="print-dark-text" style={{ color: 'var(--text-secondary)' }}>Included</span>
                  </div>

                  <div
                    className="print-border"
                    style={{
                      height: '1px',
                      background: 'var(--border-subtle)',
                      margin: '4px 0',
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '16px',
                      fontWeight: 800,
                    }}
                  >
                    <span className="print-dark-text" style={{ color: 'var(--text-primary)' }}>Total Paid:</span>
                    <span
                      style={{
                        background: 'linear-gradient(135deg, var(--amber) 0%, #D97706 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'var(--amber)',
                      }}
                    >
                      {formatPrice(booking.totalCost)}
                    </span>
                  </div>

                  {currency !== 'LKR' && (
                    <div
                      className="print-muted-text"
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        textAlign: 'right',
                        marginTop: '2px',
                      }}
                    >
                      Base Amount: Rs. {Number(booking.totalCost).toLocaleString()} LKR
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Official Seal, Barcode & Footer Notice */}
            <div
              className="print-border"
              style={{
                marginTop: '32px',
                paddingTop: '20px',
                borderTop: '1px dashed var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div
                  className="print-dark-text"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    border: '1.5px dashed var(--border-default)',
                    borderRadius: 'var(--r-md)',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  VERIFIED • RIDELANKA OFFICIAL
                </div>
                <p
                  className="print-muted-text"
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginTop: '8px',
                    maxWidth: '380px',
                    lineHeight: 1.5,
                  }}
                >
                  Please present this receipt along with a valid National ID or Passport and Driving License at vehicle pickup. Thank you for choosing RideLanka!
                </p>
              </div>

              {/* Simulated barcode for verification */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '2px',
                    height: '32px',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    opacity: 0.75,
                  }}
                >
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1].map((w, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${w}px`,
                        height: '100%',
                        background: 'var(--text-primary)',
                      }}
                    />
                  ))}
                </div>
                <span
                  className="print-muted-text"
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    letterSpacing: '0.12em',
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginTop: '4px',
                  }}
                >
                  {booking.id.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
