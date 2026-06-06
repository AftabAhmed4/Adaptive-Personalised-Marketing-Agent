'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Inbox, Zap } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  audienceName: string;
  strategyName: string;
  templateName: string;
  ctr: number;
  conversion: number;
  status: string;
  userCount: number;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  'Completed': 'badge-emerald',
  'Active': 'badge-cyan',
  'In Progress': 'badge-amber',
  'Draft': 'badge-gray',
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('/api/campaigns')
      .then(r => r.json())
      .then(data => { setCampaigns(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statuses = ['All', 'Active', 'Completed', 'In Progress', 'Draft'];
  const filtered = filter === 'All' ? campaigns : campaigns.filter(c => c.status === filter);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Campaigns</div>
          <div className="topbar-subtitle">{campaigns.length} campaigns total</div>
        </div>
        <div className="topbar-actions">
          <Link href="/campaigns/create" className="btn btn-primary flex items-center gap-1">
            <Zap size={16} /> Create Campaign
          </Link>
        </div>
      </div>

      <div className="page-content">
        {/* Filter tabs */}
        <div className="tabs">
          {statuses.map(s => (
            <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s}
              {s !== 'All' && (
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                  ({campaigns.filter(c => c.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              Loading campaigns...
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Inbox size={48} /></div>
              <div className="empty-state-title">No campaigns found</div>
              <div className="empty-state-text">
                {filter === 'All'
                  ? 'Create your first AI-powered campaign to get started.'
                  : `No campaigns with status "${filter}".`}
              </div>
              <Link href="/campaigns/create" className="btn btn-primary flex items-center gap-1" style={{ marginTop: 20 }}>
                <Zap size={16} /> Create Campaign
              </Link>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Campaign Name</th>
                    <th>Type</th>
                    <th>Audience</th>
                    <th>Strategy</th>
                    <th>Template</th>
                    <th>Reach</th>
                    <th>CTR</th>
                    <th>Conversion</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.id}</div>
                      </td>
                      <td><span className="badge badge-purple">{c.type}</span></td>
                      <td style={{ maxWidth: 160 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{c.audienceName}</div>
                      </td>
                      <td>{c.strategyName}</td>
                      <td style={{ maxWidth: 130 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{c.templateName}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.userCount.toLocaleString()}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--brand-emerald)' }}>{c.ctr}%</div>
                        <div className="progress-bar" style={{ marginTop: 4, width: 60 }}>
                          <div className="progress-fill emerald" style={{ width: `${Math.min(c.ctr * 5, 100)}%` }}></div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--brand-cyan)' }}>{c.conversion}%</div>
                        <div className="progress-bar" style={{ marginTop: 4, width: 60 }}>
                          <div className="progress-fill purple" style={{ width: `${Math.min(c.conversion * 10, 100)}%` }}></div>
                        </div>
                      </td>
                      <td><span className={`badge ${statusColor[c.status] || 'badge-gray'}`}>● {c.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Link href={`/campaigns/${c.id}`} className="btn btn-secondary btn-sm">View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
