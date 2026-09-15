'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { userApi, UserProfileResponse } from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile edit form
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadProfile = async () => {
    try {
      const data = await userApi.getProfile();
      setProfile(data);
      setFullName(data.fullName || '');
      setPhoneNumber(data.phoneNumber || '');
      setDrivingLicenseNumber(data.drivingLicenseNumber || '');
      setAddress(data.address || '');
      setCity(data.city || '');
    } catch {
      toast('Failed to load profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast('Full name is required', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await userApi.updateProfile({
        fullName,
        phoneNumber,
        drivingLicenseNumber,
        address,
        city,
      });
      setProfile(updated);
      updateUser({ fullName: updated.fullName });
      toast('Profile updated successfully', 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      toast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password';
      setPasswordError(msg);
      toast(msg, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div className="spinner" />
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading your profile…</p>
      </div>
    );
  }

  const initial = (fullName || user?.fullName || 'U').charAt(0).toUpperCase();
  const memberDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Member';

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', paddingBottom: '80px' }}>
      {/* ─── Hero Header ─── */}
      <div
        style={{
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(12,17,29,0.85) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '48px 0 32px',
        }}
      >
        <div className="page-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Avatar Monogram */}
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--amber) 0%, #D97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                  fontWeight: 800,
                  color: '#080C14',
                  boxShadow: '0 8px 24px -6px rgba(232,160,32,0.4)',
                }}
              >
                {initial}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                    {profile?.fullName || user?.fullName}
                  </h1>
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: 'var(--r-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      background: profile?.role === 'ADMIN' ? 'rgba(232,160,32,0.15)' : 'rgba(20,184,166,0.15)',
                      color: profile?.role === 'ADMIN' ? 'var(--amber)' : 'var(--teal-400)',
                      border: `1px solid ${profile?.role === 'ADMIN' ? 'rgba(232,160,32,0.3)' : 'rgba(20,184,166,0.3)'}`,
                    }}
                  >
                    {profile?.role}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                  {profile?.email} · Member since {memberDate}
                </p>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div
                className="card"
                style={{
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.02)',
                  minWidth: '130px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Total Rentals
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--amber)', marginTop: '2px' }}>
                  {profile?.totalBookings ?? 0}
                </div>
              </div>

              <div
                className="card"
                style={{
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.02)',
                  minWidth: '130px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Account Status
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: profile?.enabled ? 'var(--green-400)' : 'var(--red-400)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: profile?.enabled ? 'var(--green-400)' : 'var(--red-400)' }} />
                  {profile?.enabled ? 'Verified Active' : 'Suspended'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="tabs" style={{ marginTop: '32px' }}>
            <button
              onClick={() => setActiveTab('profile')}
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              Personal & Driver Details
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            >
              Security & Password
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="page-container" style={{ paddingTop: '36px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          {/* Tab 1: Profile & Driver Details */}
          {activeTab === 'profile' && (
            <div className="card animate-fade-in" style={{ padding: '32px 36px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                  Personal & Driver Profile
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Keep your personal contact details and driving credentials up to date for swift vehicle handovers.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                  <div>
                    <label className="field-label">Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="input-field"
                      required
                      placeholder="e.g. Kasun Perera"
                    />
                  </div>

                  <div>
                    <label className="field-label">Email Address (Read-only)</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="input-field"
                      style={{ opacity: 0.65, cursor: 'not-allowed', background: 'rgba(255,255,255,0.03)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                  <div>
                    <label className="field-label">Phone Number (Sri Lanka / International)</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="input-field"
                      placeholder="e.g. +94 77 123 4567"
                    />
                  </div>

                  <div>
                    <label className="field-label">Driving License / NIC Number</label>
                    <input
                      type="text"
                      value={drivingLicenseNumber}
                      onChange={e => setDrivingLicenseNumber(e.target.value)}
                      className="input-field"
                      placeholder="e.g. B2948210 / 921234567V"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '18px' }}>
                  <div>
                    <label className="field-label">Street Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="input-field"
                      placeholder="e.g. 45 Rampart Street, Fort"
                    />
                  </div>

                  <div>
                    <label className="field-label">City / Region</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="input-field"
                      placeholder="e.g. Galle, Matara, Colombo"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingProfile}
                    style={{ minWidth: '160px' }}
                  >
                    {savingProfile ? (
                      <span className="spinner spinner-sm" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Security & Password */}
          {activeTab === 'security' && (
            <div className="card animate-fade-in" style={{ padding: '32px 36px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                  Security & Password
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Ensure your account is protected with a strong, distinct password.
                </p>
              </div>

              {passwordError && (
                <div className="alert alert-error" style={{ marginBottom: '20px', fontSize: '13px' }}>
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label className="field-label">Current Password *</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => { setCurrentPassword(e.target.value); setPasswordError(''); }}
                    className="input-field"
                    required
                    placeholder="Enter current password"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div>
                    <label className="field-label">New Password *</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setPasswordError(''); }}
                      className="input-field"
                      required
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div>
                    <label className="field-label">Confirm New Password *</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                      className="input-field"
                      required
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--r-md)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: 'var(--text-secondary)' }}>Password Requirements:</strong>
                  <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                    <li>Minimum 6 characters in length</li>
                    <li>For maximum security, combine letters, numbers, and symbols</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingPassword}
                    style={{ minWidth: '180px' }}
                  >
                    {savingPassword ? (
                      <span className="spinner spinner-sm" />
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Actions Footer */}
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              background: 'rgba(232,160,32,0.04)',
              border: '1px solid rgba(232,160,32,0.15)',
              borderRadius: 'var(--r-lg)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Looking for your rental history?
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                View all past, current, and upcoming reservations and receipts.
              </div>
            </div>

            <Link href="/bookings" className="btn btn-secondary btn-sm">
              My Bookings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
