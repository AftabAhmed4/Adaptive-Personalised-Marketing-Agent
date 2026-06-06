'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { Search, ArrowLeft, Users, Target, Mail, Radio, Brain, Bot, Activity, BarChart2, Send, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface Campaign {
  id: string; name: string; type: string;
  audienceName: string; strategyName: string; templateName: string;
  templateSubject: string; templateBody: string;
  ctr: number; conversion: number; status: string; userCount: number;
  createdAt: string;
  metrics: { sent: number; opened: number; clicked: number; converted: number; ctr: number; conversionRate: number };
  activities: { email: string; opened: boolean; clicked: boolean; converted: boolean }[];
  recommendations: string[];
}

const statusColor: Record<string, string> = {
  'Completed': 'badge-emerald', 'Active': 'badge-cyan',
  'In Progress': 'badge-amber', 'Draft': 'badge-gray',
};

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <strong style={{ color: 'var(--text-primary)' }}>{payload[0].name}:</strong>{' '}
      <span style={{ color: payload[0].color }}>{payload[0].value.toLocaleString()}</span>
    </div>
  );
};

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'recommendations'>('overview');
  const [showTemplate, setShowTemplate] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailModal, setEmailModal] = useState<{ open: boolean; success: boolean; sentTo?: string; personalizedFor?: string; body?: string; error?: string }>({ open: false, success: false });

  const handleSendEmails = async () => {
    setIsSending(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/send`, { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        setEmailModal({ open: true, success: false, error: data.error || 'Failed to send email. Please check server logs.' });
        return;
      }
      
      setEmailModal({
        open: true,
        success: true,
        sentTo: data.sentTo,
        personalizedFor: data.personalizedFor,
        body: data.personalizedBody,
      });
    } catch (err: any) {
      setEmailModal({ open: true, success: false, error: err.message });
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then(r => r.json())
      .then(data => { setCampaign(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">Loading...</div></div>
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px', width: 32, height: 32, borderWidth: 3 }}></div>
          <div style={{ color: 'var(--text-muted)' }}>Loading campaign details...</div>
        </div>
      </div>
    </div>
  );

  if (!campaign) return (
    <div>
      <div className="topbar"><div className="topbar-title">Not Found</div></div>
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon"><Search size={48} /></div>
          <div className="empty-state-title">Campaign not found</div>
          <Link href="/campaigns" className="btn btn-primary flex items-center gap-2" style={{ marginTop: 16 }}><ArrowLeft size={16} /> Back to Campaigns</Link>
        </div>
      </div>
    </div>
  );

  const m = campaign.metrics;
  const funnelData = [
    { name: 'Sent', value: m.sent },
    { name: 'Opened', value: m.opened },
    { name: 'Clicked', value: m.clicked },
    { name: 'Converted', value: m.converted },
  ];
  const pieData = [
    { name: 'Opened', value: m.opened },
    { name: 'Clicked', value: m.clicked },
    { name: 'Converted', value: m.converted },
    { name: 'Unopened', value: m.sent - m.opened },
  ];

  return (
    <div>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/campaigns" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={14} /> Campaigns</Link>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }}></div>
          <div>
            <div className="topbar-title">{campaign.name}</div>
            <div className="topbar-subtitle">{campaign.type} · Created {new Date(campaign.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge ${statusColor[campaign.status] || 'badge-gray'}`}>● {campaign.status}</span>
          <button 
            className="btn btn-primary flex items-center gap-2" 
            onClick={handleSendEmails}
            disabled={isSending}
          >
            {isSending ? <div className="spinner" style={{ width: 14, height: 14 }}></div> : <Send size={14} />}
            {isSending ? 'Sending...' : 'Launch & Send Emails'}
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Campaign Summary */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            {[
              { label: 'Audience', value: campaign.audienceName, icon: <Users size={16} /> },
              { label: 'Strategy', value: campaign.strategyName, icon: <Target size={16} /> },
              { label: 'Template', value: campaign.templateName, icon: <Mail size={16} /> },
              { label: 'Reach', value: `${campaign.userCount.toLocaleString()} users`, icon: <Radio size={16} /> },
            ].map((item, idx) => (
              <div key={idx} style={{ flex: '1 1 200px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {item.icon} {item.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={16} /> Subject Line</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{campaign.templateSubject}</div>
            </div>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 16 }}
            onClick={() => setShowTemplate(!showTemplate)}
          >
            {showTemplate ? '▾ Hide Template Body' : '▸ Preview Template Body'}
          </button>
          {showTemplate && (
            <div className="template-preview" style={{ marginTop: 12, maxHeight: 'none', borderRadius: 8 }}>
              {campaign.templateBody}
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="metrics-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Sent', value: m.sent, color: 'var(--text-primary)' },
            { label: 'Opened', value: m.opened, color: 'var(--brand-purple-light)' },
            { label: 'Clicked', value: m.clicked, color: 'var(--brand-cyan)' },
            { label: 'Converted', value: m.converted, color: 'var(--brand-emerald)' },
            { label: 'CTR', value: `${m.ctr}%`, color: 'var(--brand-emerald)' },
            { label: 'Conversion Rate', value: `${m.conversionRate}%`, color: 'var(--brand-cyan)' },
          ].map(item => (
            <div key={item.label} className="metric-item">
              <div className="metric-value" style={{ color: item.color }}>{item.value.toLocaleString()}</div>
              <div className="metric-label">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Funnel Breakdown</div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#52556a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#8b8fa8', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#7c3aed" radius={[0,4,4,0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Engagement Distribution</div>
            <div style={{ height: 240, display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8b8fa8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {(['overview', 'activity', 'recommendations'] as const).map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'overview' ? <div className="flex items-center gap-1"><BarChart2 size={14} /> Overview</div> : t === 'activity' ? <div className="flex items-center gap-1"><Users size={14} /> User Activity</div> : <div className="flex items-center gap-1"><Brain size={14} /> Learning Insights</div>}
              {t === 'recommendations' && (
                <span style={{ marginLeft: 6, background: 'var(--brand-purple-dim)', color: 'var(--brand-purple-light)', borderRadius: 99, padding: '1px 7px', fontSize: 11 }}>
                  {campaign.recommendations.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="card fade-in">
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <div className="section-title">Performance Summary</div>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Open Rate', value: m.sent > 0 ? ((m.opened / m.sent) * 100).toFixed(1) : 0, max: 100, color: 'purple' },
                { label: 'Click-Through Rate', value: m.ctr, max: 30, color: 'purple' },
                { label: 'Conversion Rate', value: m.conversionRate, max: 30, color: 'emerald' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${item.color}`} style={{ width: `${Math.min(Number(item.value) / Number(item.max) * 100, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="card fade-in">
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <div className="section-title">User Activity Log</div>
              <div className="section-subtitle">Showing {Math.min(campaign.activities.length, 50)} of {campaign.activities.length} users</div>
            </div>
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Opened</th>
                    <th>Clicked</th>
                    <th>Converted</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.activities.slice(0, 50).map((a, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.email}</td>
                      <td><span className={`activity-dot ${a.opened ? 'yes' : 'no'}`}></span> {a.opened ? 'Yes' : 'No'}</td>
                      <td><span className={`activity-dot ${a.clicked ? 'yes' : 'no'}`}></span> {a.clicked ? 'Yes' : 'No'}</td>
                      <td><span className={`activity-dot ${a.converted ? 'yes' : 'no'}`}></span> {a.converted ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="fade-in">
            <div style={{ marginBottom: 16 }}>
              <div className="section-title flex items-center gap-2"><Brain size={18} /> AI Learning Recommendations</div>
              <div className="section-subtitle">Generated by LearningAgent based on campaign performance metrics</div>
            </div>
            {campaign.recommendations.map((rec, i) => (
              <div key={i} className="recommendation-item fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="recommendation-num">{i + 1}</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{rec}</div>
              </div>
            ))}
            {campaign.recommendations.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><Bot size={48} /></div>
                <div className="empty-state-title">No recommendations yet</div>
                <div className="empty-state-text">Learning Agent will generate insights after campaign data is available.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Result Modal */}
      {emailModal.open && (
        <div
          className="fade-in"
          onClick={() => setEmailModal({ open: false, success: false })}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: 24
          }}
        >
          <div
            className="fade-in-up"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 32,
              maxWidth: 560,
              width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setEmailModal({ open: false, success: false })}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            >
              <X size={20} />
            </button>

            {emailModal.success ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={26} color="var(--brand-emerald)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>Email Sent Successfully!</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      Personalized by AI for <strong style={{ color: 'var(--text-secondary)' }}>{emailModal.personalizedFor}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={14} />
                  Delivered to: <strong style={{ color: 'var(--brand-cyan)', marginLeft: 4 }}>{emailModal.sentTo}</strong>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  AI-Personalized Email Preview
                </div>
                <div style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  maxHeight: 260,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {emailModal.body}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 20 }}
                  onClick={() => setEmailModal({ open: false, success: false })}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={26} color="#ef4444" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>Email Failed to Send</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Check your SMTP credentials or server logs</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: 14, fontSize: 13, color: '#f87171', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {emailModal.error}
                </div>
                <button
                  className="btn btn-ghost"
                  style={{ width: '100%', marginTop: 20 }}
                  onClick={() => setEmailModal({ open: false, success: false })}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

