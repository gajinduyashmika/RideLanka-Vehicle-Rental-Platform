'use client';

import React, { useState, useEffect } from 'react';
import { adminUserApi, UserProfileResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/Toast';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<UserProfileResponse | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminUserApi.getAll({
        search: search || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
      });
      setUsers(data);
    } catch {
      toast('Failed to load users list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleRole = async (targetUser: UserProfileResponse) => {
    if (targetUser.id === currentUser?.userId) {
      toast('You cannot change your own administrator role', 'error');
      return;
    }

    const newRole = targetUser.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    if (!confirm(`Change ${targetUser.fullName}'s role to ${newRole}?`)) return;

    setActionLoading(targetUser.id);
    try {
      const updated = await adminUserApi.updateRole(targetUser.id, newRole);
      setUsers(prev => prev.map(u => (u.id === targetUser.id ? updated : u)));
      if (selectedUser?.id === targetUser.id) setSelectedUser(updated);
      toast(`Role updated to ${newRole} for ${targetUser.fullName}`, 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to update role', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (targetUser: UserProfileResponse) => {
    if (targetUser.id === currentUser?.userId) {
      toast('You cannot disable your own account', 'error');
      return;
    }

    const newStatus = !targetUser.enabled;
    const actionName = newStatus ? 'activate' : 'suspend';
    if (!confirm(`Are you sure you want to ${actionName} ${targetUser.fullName}'s account?`)) return;

    setActionLoading(targetUser.id);
    try {
      const updated = await adminUserApi.updateStatus(targetUser.id, newStatus);
      setUsers(prev => prev.map(u => (u.id === targetUser.id ? updated : u)));
      if (selectedUser?.id === targetUser.id) setSelectedUser(updated);
      toast(`Account ${newStatus ? 'activated' : 'suspended'} successfully`, 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (targetUser: UserProfileResponse) => {
    if (targetUser.id === currentUser?.userId) {
      toast('You cannot delete your own account', 'error');
      return;
    }

    if (!confirm(`Permanently delete user ${targetUser.fullName} (${targetUser.email})? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(targetUser.id);
    try {
      await adminUserApi.delete(targetUser.id);
      setUsers(prev => prev.filter(u => u.id !== targetUser.id));
      if (selectedUser?.id === targetUser.id) setSelectedUser(null);
      toast('User deleted successfully', 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to delete user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Local filtering by search and status
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(search.toLowerCase())) ||
      (u.drivingLicenseNumber && u.drivingLicenseNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.enabled) ||
      (statusFilter === 'SUSPENDED' && !u.enabled);

    return matchesSearch && matchesStatus;
  });

  const totalUsers = users.length;
  const customerCount = users.filter(u => u.role === 'CUSTOMER').length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const activeCount = users.filter(u => u.enabled).length;
  const suspendedCount = users.filter(u => !u.enabled).length;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="label-upper" style={{ marginBottom: '6px' }}>Admin Panel</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>
            User <span className="grad-text">Management</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Manage customer profiles, staff privileges, and driving verification status
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="btn btn-secondary btn-sm"
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ─── KPI Cards ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}
      >
        {[
          { label: 'Total Users', value: totalUsers, color: 'var(--text-primary)' },
          { label: 'Customers', value: customerCount, color: 'var(--teal-400)' },
          { label: 'Administrators', value: adminCount, color: 'var(--amber)' },
          { label: 'Active Accounts', value: activeCount, color: 'var(--green-400)' },
          { label: 'Suspended', value: suspendedCount, color: 'var(--red-400)' },
        ].map(kpi => (
          <div
            key={kpi.label}
            style={{
              padding: '18px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-lg)',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 800, color: kpi.color, letterSpacing: '-0.03em', marginBottom: '2px' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1', maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, or license…"
              className="input-field"
              style={{ fontSize: '13px', paddingLeft: '34px', height: '38px' }}
            />
            <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '38px', padding: '0 14px' }}>
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'CUSTOMER', 'ADMIN'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`pill ${roleFilter === r ? 'active' : ''}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                {r === 'ALL' ? 'All Roles' : r}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />

          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'ACTIVE', 'SUSPENDED'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`pill ${statusFilter === s ? 'active' : ''}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                {s === 'ALL' ? 'All Status' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Users Data Table ─── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading system users…</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                color: 'var(--text-muted)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No users found matching your search</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th>License / NIC</th>
                  <th>Rentals</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const isSelf = u.id === currentUser?.userId;
                  const initial = (u.fullName || 'U').charAt(0).toUpperCase();

                  return (
                    <tr key={u.id}>
                      {/* Name & Email */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: u.role === 'ADMIN' ? 'var(--amber)' : 'rgba(20,184,166,0.2)',
                              color: u.role === 'ADMIN' ? '#080C14' : 'var(--teal-400)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '13px',
                              flexShrink: 0,
                            }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {u.fullName}
                              {isSelf && (
                                <span style={{ fontSize: '10px', color: 'var(--amber)', fontWeight: 700 }}>
                                  (You)
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone & City */}
                      <td>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                          {u.phoneNumber || '—'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {u.city || u.address || 'Sri Lanka'}
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--r-full)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            background: u.role === 'ADMIN' ? 'rgba(232,160,32,0.12)' : 'rgba(20,184,166,0.12)',
                            color: u.role === 'ADMIN' ? 'var(--amber)' : 'var(--teal-400)',
                            border: `1px solid ${u.role === 'ADMIN' ? 'rgba(232,160,32,0.25)' : 'rgba(20,184,166,0.25)'}`,
                          }}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Driving License */}
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: u.drivingLicenseNumber ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {u.drivingLicenseNumber || 'Not provided'}
                        </span>
                      </td>

                      {/* Total Rentals */}
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                        {u.totalBookings}
                      </td>

                      {/* Created At */}
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--r-full)',
                            background: u.enabled ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: u.enabled ? 'var(--green-400)' : 'var(--red-400)',
                            border: `1px solid ${u.enabled ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.enabled ? 'var(--green-400)' : 'var(--red-400)' }} />
                          {u.enabled ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="btn btn-secondary btn-sm"
                            title="View User Details"
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            Details
                          </button>

                          <button
                            onClick={() => handleToggleRole(u)}
                            disabled={isSelf || actionLoading === u.id}
                            className="btn btn-ghost btn-sm"
                            title={u.role === 'ADMIN' ? 'Demote to Customer' : 'Promote to Admin'}
                            style={{ fontSize: '11px', padding: '4px 8px', opacity: isSelf ? 0.4 : 1 }}
                          >
                            {u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isSelf || actionLoading === u.id}
                            className={u.enabled ? 'btn btn-danger btn-sm' : 'btn btn-secondary btn-sm'}
                            title={u.enabled ? 'Suspend Account' : 'Activate Account'}
                            style={{ fontSize: '11px', padding: '4px 8px', opacity: isSelf ? 0.4 : 1 }}
                          >
                            {u.enabled ? 'Suspend' : 'Activate'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isSelf || actionLoading === u.id}
                            className="btn btn-ghost btn-sm"
                            title="Delete User"
                            style={{ fontSize: '11px', padding: '4px 6px', color: 'var(--red-400)', opacity: isSelf ? 0.3 : 1 }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
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

      {/* ─── User Details Inspection Modal ─── */}
      {selectedUser && (
        <div
          onClick={() => setSelectedUser(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(5, 8, 16, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '30px',
              border: '1px solid var(--border-default)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: selectedUser.role === 'ADMIN' ? 'var(--amber)' : 'rgba(20,184,166,0.2)',
                    color: selectedUser.role === 'ADMIN' ? '#080C14' : 'var(--teal-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '18px',
                  }}
                >
                  {(selectedUser.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                    {selectedUser.fullName}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    ID: #{selectedUser.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '6px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Information Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                padding: '16px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '24px',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Email</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.email}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Phone</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.phoneNumber || 'Not provided'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Driving License / NIC</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.drivingLicenseNumber || 'Not provided'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Role</span>
                <strong style={{ color: selectedUser.role === 'ADMIN' ? 'var(--amber)' : 'var(--teal-400)' }}>
                  {selectedUser.role}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>City / Location</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.city || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Total Reservations</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.totalBookings} rentals</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Street Address</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.address || '—'}</strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleToggleRole(selectedUser)}
                disabled={selectedUser.id === currentUser?.userId}
                className="btn btn-secondary btn-sm"
              >
                {selectedUser.role === 'ADMIN' ? 'Demote to Customer' : 'Make Administrator'}
              </button>

              <button
                onClick={() => handleToggleStatus(selectedUser)}
                disabled={selectedUser.id === currentUser?.userId}
                className={selectedUser.enabled ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm'}
              >
                {selectedUser.enabled ? 'Suspend Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
