'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone, Activity, TrendingUp, DollarSign, Bot, Inbox, Zap, ArrowRight } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

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

const ctrTrendData = [
  { month: 'Jan', ctr: 4.2, conv: 1.8 },
  { month: 'Feb', ctr: 5.1, conv: 2.1 },
  { month: 'Mar', ctr: 6.8, conv: 2.9 },
  { month: 'Apr', ctr: 5.5, conv: 2.3 },
  { month: 'May', ctr: 8.4, conv: 3.7 },
  { month: 'Jun', ctr: 11.2, conv: 5.1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}{p.name.includes('CTR') || p.name.includes('Conv') ? '%' : ''}</strong>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/campaigns')
      .then(r => r.json())
      .then(data => { setCampaigns(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active' || c.status === 'In Progress').length;
  const avgCtr = campaigns.length
    ? (campaigns.reduce((a, c) => a + c.ctr, 0) / campaigns.length).toFixed(1)
    : '0.0';
  const avgConv = campaigns.length
    ? (campaigns.reduce((a, c) => a + c.conversion, 0) / campaigns.length).toFixed(1)
    : '0.0';

  const perfData = campaigns.slice(0, 6).map(c => ({
    name: c.name.length > 16 ? c.name.slice(0, 16) + '…' : c.name,
    CTR: c.ctr,
    Conv: c.conversion,
  }));

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-subtitle">Welcome back — your AI agents are ready</div>
        </div>
        <div className="topbar-actions">
          <Link href="/campaigns/create" className="btn btn-primary flex items-center gap-1">
            <Zap size={16} /> New Campaign
          </Link>
        </div>
      </div>

      <div className="page-content">
        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card purple fade-in-up">
            <div className="kpi-icon purple"><Megaphone size={20} /></div>
            <div className="kpi-value">{loading ? '—' : totalCampaigns}</div>
            <div className="kpi-label">Total Campaigns</div>
            <div className="kpi-change up">↑ All time</div>
          </div>
          <div className="kpi-card cyan fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div className="kpi-icon cyan"><Activity size={20} /></div>
            <div className="kpi-value">{loading ? '—' : activeCampaigns}</div>
            <div className="kpi-label">Active Campaigns</div>
            <div className="kpi-change up">↑ Running now</div>
          </div>
          <div className="kpi-card emerald fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="kpi-icon emerald"><TrendingUp size={20} /></div>
            <div className="kpi-value">{loading ? '—' : avgCtr}%</div>
            <div className="kpi-label">Avg. CTR</div>
            <div className="kpi-change up">↑ vs. industry 3.2%</div>
          </div>
          <div className="kpi-card amber fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="kpi-icon amber"><DollarSign size={20} /></div>
            <div className="kpi-value">{loading ? '—' : avgConv}%</div>
            <div className="kpi-label">Conversion Rate</div>
            <div className="kpi-change up">↑ vs. baseline</div>
          </div>
          <div className="kpi-card pink fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="kpi-icon pink"><Bot size={20} /></div>
            <div className="kpi-value">{loading ? '—' : totalCampaigns * 4}</div>
            <div className="kpi-label">AI Agent Runs</div>
            <div className="kpi-change up">↑ Autonomous</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid-2" style={{ marginBottom: 28 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div>
                <div className="section-title">Campaign Performance</div>
                <div className="section-subtitle">CTR vs Conversion Rate by campaign</div>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perfData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#52556a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#52556a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8b8fa8', paddingTop: 12 }} />
                  <Bar dataKey="CTR" fill="#7c3aed" radius={[4,4,0,0]} name="CTR %" />
                  <Bar dataKey="Conv" fill="#06b6d4" radius={[4,4,0,0]} name="Conv %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div>
                <div className="section-title">CTR Trends</div>
                <div className="section-subtitle">Monthly click-through performance</div>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ctrTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#52556a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#52556a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8b8fa8', paddingTop: 12 }} />
                  <Line type="monotone" dataKey="ctr" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 4 }} name="CTR %" />
                  <Line type="monotone" dataKey="conv" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Conv %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="section-title">Recent Campaigns</div>
              <div className="section-subtitle">All AI-generated and manual campaigns</div>
            </div>
            <Link href="/campaigns" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                Loading campaigns...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Inbox size={48} /></div>
                <div className="empty-state-title">No campaigns yet</div>
                <div className="empty-state-text">Create your first AI-powered campaign to get started.</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Type</th>
                    <th>Audience</th>
                    <th>Strategy</th>
                    <th>CTR</th>
                    <th>Conversion</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.slice(0, 8).map(c => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.name}</td>
                      <td><span className="badge badge-purple">{c.type}</span></td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.audienceName}</td>
                      <td>{c.strategyName}</td>
                      <td style={{ fontWeight: 700, color: 'var(--brand-emerald)' }}>{c.ctr}%</td>
                      <td style={{ fontWeight: 700, color: 'var(--brand-cyan)' }}>{c.conversion}%</td>
                      <td><span className={`badge ${statusColor[c.status] || 'badge-gray'}`}>● {c.status}</span></td>
                      <td>
                        <Link href={`/campaigns/${c.id}`} className="btn btn-ghost btn-sm flex items-center gap-1">View <ArrowRight size={14} /></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
