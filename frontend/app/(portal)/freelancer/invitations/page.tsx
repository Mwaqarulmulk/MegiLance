'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface Invitation {
  project_id: number;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  skills: string[];
  client_name: string;
  client_avatar: string | null;
  created_at: string;
  fit_score: number;
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);

  const fetchInvitations = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/ai/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      }
    } catch (e) {
      console.error('Failed to fetch invitations:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  const handleRespond = async (projectId: number, accept: boolean) => {
    setResponding(projectId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/ai/invitations/${projectId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ accept, message: null }),
      });
      if (res.ok) {
        setInvitations(prev => prev.filter(i => i.project_id !== projectId));
      }
    } catch (e) {
      console.error('Response failed:', e);
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📬</div>
          Loading your invitations...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Project Invitations</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>
        AI has matched these projects with your skills. Accept to start working.
      </p>

      {invitations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#f9fafb', borderRadius: 12 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No pending invitations</h3>
          <p style={{ color: '#6b7280' }}>When clients create projects matching your skills, you&apos;ll see them here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {invitations.map(inv => (
            <div key={inv.project_id} style={{
              padding: 24, borderRadius: 12, border: '1px solid #e5e7eb', background: 'white',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{inv.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: 14 }}>
                    by {inv.client_name} · {inv.category}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  background: inv.fit_score >= 80 ? '#dcfce7' : inv.fit_score >= 60 ? '#fef3c7' : '#fee2e2',
                  color: inv.fit_score >= 80 ? '#166534' : inv.fit_score >= 60 ? '#92400e' : '#991b1b',
                }}>
                  {Math.round(inv.fit_score)}% Match
                </span>
              </div>

              <p style={{ color: '#374151', lineHeight: 1.6, marginBottom: 16 }}>
                {inv.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {inv.skills.map(skill => (
                  <span key={skill} style={{
                    padding: '4px 10px', borderRadius: 12, background: '#f3f4f6', color: '#374151', fontSize: 13,
                  }}>
                    {skill}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  Budget: <strong>${inv.budget_min?.toLocaleString() || '0'} - ${inv.budget_max?.toLocaleString() || '0'}</strong>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleRespond(inv.project_id, false)}
                    disabled={responding === inv.project_id}
                    style={{
                      padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white',
                      cursor: responding === inv.project_id ? 'not-allowed' : 'pointer', fontSize: 14,
                    }}>
                    Decline
                  </button>
                  <button
                    onClick={() => handleRespond(inv.project_id, true)}
                    disabled={responding === inv.project_id}
                    style={{
                      padding: '8px 20px', borderRadius: 8, background: '#6366f1', color: 'white', border: 'none',
                      cursor: responding === inv.project_id ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14,
                    }}>
                    {responding === inv.project_id ? 'Processing...' : 'Accept'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
