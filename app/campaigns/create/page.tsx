'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Target, Mail, Brain, Megaphone, Zap, Bot, Settings, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const CAMPAIGN_TYPES = ['11.11 Sale', 'Pakistan Day Sale', 'Summer Sale', 'Black Friday'];

interface EventLog {
  id: string;
  type: string;
  campaignId: string;
  message: string;
  agentName?: string;
  timestamp: string;
  details?: any;
}

const agentSteps = [
  { key: 'AudienceAgent', label: 'Audience Agent', icon: <Users size={18} />, desc: 'Analyzing user behavior & selecting target segment' },
  { key: 'StrategyAgent', label: 'Strategy Agent', icon: <Target size={18} />, desc: 'Formulating optimal marketing strategy' },
  { key: 'TemplateAgent', label: 'Template Agent', icon: <Mail size={18} />, desc: 'Writing high-converting copy & content' },
  { key: 'LearningAgent', label: 'Learning Agent', icon: <Brain size={18} />, desc: 'Analyzing simulated metrics & generating insights' },
];

function getStepStatus(agentKey: string, events: EventLog[]) {
  const runningMsg = events.find(e => e.message.includes(agentKey.replace('Agent', ' Agent') + ' Running'));
  const doneMsg = events.find(e => e.agentName === agentKey && (e.message.includes('matched') || e.message.includes('formulated') || e.message.includes('generated') || e.message.includes('Recommendations generated') || e.message.includes('copywriting')));
  if (doneMsg) return 'done';
  if (runningMsg) return 'active';
  return 'pending';
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'running' | 'done'>('form');
  const [campaignId, setCampaignId] = useState('');
  const [events, setEvents] = useState<EventLog[]>([]);
  const [form, setForm] = useState({
    campaignName: '',
    campaignType: 'Pakistan Day Sale',
    audienceSelection: 'AI Generated',
    strategySelection: 'AI Generated',
    templateSelection: 'AI Generated',
  });
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  const isComplete = events.some(e => e.type === 'campaign.completed');

  // Poll events while running
  useEffect(() => {
    if (step !== 'running') return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/campaigns/events?campaignId=${campaignId}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
          if (data.some((e: EventLog) => e.type === 'campaign.completed')) {
            clearInterval(pollingRef.current!);
            setStep('done');
          }
        }
      } catch {}
    };

    poll();
    pollingRef.current = setInterval(poll, 1500);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [step, campaignId]);

  // Auto-scroll event log
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.campaignName.trim()) return;

    // Clear old events first
    await fetch('/api/campaigns/events', { method: 'DELETE' });

    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      // The campaign ID will appear in events; use timestamp-based ID matching
      const ts = Date.now();
      setCampaignId(`camp_${ts}`);
      setStep('running');
    }
  };

  const handleViewCampaign = () => {
    // Find created campaign ID from events
    const createdEvt = events.find(e => e.type === 'campaign.created' || e.type === 'campaign.completed');
    if (createdEvt?.campaignId) {
      router.push(`/campaigns/${createdEvt.campaignId}`);
    } else {
      router.push('/campaigns');
    }
  };

  if (step === 'form') {
    return (
      <div>
        <div className="topbar">
          <div>
            <div className="topbar-title">Create Campaign</div>
            <div className="topbar-subtitle">Configure your AI-powered marketing campaign</div>
          </div>
        </div>

        <div className="page-content">
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <form onSubmit={handleSubmit}>
              {/* Campaign Info */}
              <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--brand-purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-purple-light)' }}><Megaphone size={18} /></div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Campaign Details</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Basic campaign configuration</div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Campaign Name</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Pakistan Day Mega Sale 2026"
                    value={form.campaignName}
                    onChange={e => setForm(f => ({ ...f, campaignName: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Campaign Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {CAMPAIGN_TYPES.map(t => (
                      <div
                        key={t}
                        className={`option-card ${form.campaignType === t ? 'selected' : ''}`}
                        onClick={() => setForm(f => ({ ...f, campaignType: t }))}
                      >
                        <div className="option-card-indicator"></div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>{t}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI vs Manual selection */}
              {[
                { field: 'audienceSelection', label: 'Audience Selection', icon: <Users size={16} />, desc: 'Who receives this campaign?' },
                { field: 'strategySelection', label: 'Strategy Selection', icon: <Target size={16} />, desc: 'How do we reach them?' },
                { field: 'templateSelection', label: 'Template Selection', icon: <Mail size={16} />, desc: 'What do we send?' },
              ].map(({ field, label, icon, desc }) => (
                <div key={field} className="card" style={{ padding: 24, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-purple-light)' }}>{icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div
                      className={`option-card ${(form as any)[field] === 'AI Generated' ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, [field]: 'AI Generated' }))}
                    >
                      <div className="option-card-indicator"></div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}><Bot size={14} /> AI Generated</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Agents decide automatically</div>
                      </div>
                    </div>
                    <div
                      className={`option-card ${(form as any)[field] === 'Manual' ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, [field]: 'Manual' }))}
                    >
                      <div className="option-card-indicator"></div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}><Settings size={14} /> Manual</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Use predefined options</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button type="submit" className="btn btn-primary btn-lg flex items-center justify-center gap-2" style={{ width: '100%', marginTop: 8 }}>
                <Zap size={18} /> Generate Campaign
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Running / Done states
  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title flex items-center gap-2">
            {step === 'done' ? <><CheckCircle2 size={20} className="text-emerald-500" /> Campaign Generated</> : <><Zap size={20} className="text-amber-500" /> Generating Campaign...</>}
          </div>
          <div className="topbar-subtitle">
            {step === 'done' ? 'All agents completed successfully' : 'AI agents are orchestrating your campaign'}
          </div>
        </div>
        {step === 'done' && (
          <div className="topbar-actions">
            <button className="btn btn-primary flex items-center gap-2" onClick={handleViewCampaign}>View Campaign <ArrowRight size={16} /></button>
          </div>
        )}
      </div>

      <div className="page-content">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Agent Steps */}
          <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Agent Execution Pipeline</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Sequential multi-agent orchestration</div>
            </div>
            <div className="agent-progress">
              {agentSteps.map(agent => {
                const status = step === 'done' ? 'done' : getStepStatus(agent.key, events);
                return (
                  <div key={agent.key} className={`agent-step ${status}`}>
                    <div className="agent-step-icon">{agent.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div className="agent-step-name">{agent.label}</div>
                      <div className="agent-step-status">{agent.desc}</div>
                    </div>
                    <div>
                      {status === 'active' && <div className="spinner"></div>}
                      {status === 'done' && <CheckCircle2 size={18} color="var(--brand-emerald)" />}
                      {status === 'pending' && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Waiting</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Event Log */}
          <div className="card">
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Live Agent Log</div>
              {!isComplete && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--brand-purple-light)' }}>
                <div className="spinner" style={{ width: 12, height: 12 }}></div>
                Streaming events...
              </div>}
            </div>
            <div style={{ padding: 16, maxHeight: 360, overflowY: 'auto' }}>
              {events.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto 8px' }}></div>
                  Initializing agents...
                </div>
              ) : (
                events.map((evt, i) => (
                  <div key={evt.id || i} className="fade-in" style={{
                    display: 'flex', gap: 12, marginBottom: 10,
                    padding: '10px 12px',
                    background: 'var(--bg-primary)',
                    borderRadius: 8,
                    borderLeft: `3px solid ${
                      evt.type === 'campaign.completed' ? 'var(--brand-emerald)' :
                      evt.type === 'campaign.created' ? 'var(--brand-cyan)' :
                      evt.agentName === 'AudienceAgent' ? 'var(--brand-purple)' :
                      evt.agentName === 'StrategyAgent' ? 'var(--brand-amber)' :
                      evt.agentName === 'TemplateAgent' ? 'var(--brand-pink)' :
                      evt.agentName === 'LearningAgent' ? 'var(--brand-emerald)' :
                      'var(--border-bright)'
                    }`
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 1 }}>
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>
                        [{evt.agentName || 'System'}]
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{evt.message}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={eventsEndRef}></div>
            </div>
          </div>

          {isComplete && (
            <div className="ai-result fade-in-up" style={{ marginTop: 16 }}>
              <div className="ai-result-header flex items-center gap-2"><Sparkles size={14} /> Orchestration Complete</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
                Your campaign has been successfully generated by the AI agents. All metrics have been simulated and learning recommendations are ready.
              </p>
              <button className="btn btn-primary flex items-center gap-2" style={{ marginTop: 14 }} onClick={handleViewCampaign}>
                View Campaign Details <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
