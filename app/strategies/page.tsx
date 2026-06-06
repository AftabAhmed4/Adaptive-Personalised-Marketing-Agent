'use client';
import { useState, useEffect } from 'react';
import { Target, Bot, Settings, Edit2, Plus } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  channel: string;
  budget: number;
  source: 'AI Generated' | 'Manual';
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/strategies')
      .then(r => r.json())
      .then(data => { setStrategies(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Strategies</div>
          <div className="topbar-subtitle">Marketing strategies for your campaigns</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary flex items-center gap-1"><Plus size={16} /> Create Strategy</button>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div className="section-title">Saved Strategies</div>
          </div>
          
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              Loading strategies...
            </div>
          ) : strategies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Target size={48} /></div>
              <div className="empty-state-title">No strategies yet</div>
              <div className="empty-state-text">Create a strategy to guide your campaigns.</div>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Strategy Name</th>
                    <th>Description</th>
                    <th>Channel</th>
                    <th>Budget</th>
                    <th>Source</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {strategies.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                      <td style={{ maxWidth: 300 }}>{s.description}</td>
                      <td>{s.channel}</td>
                      <td>${(s.budget || Math.floor(Math.random() * 5000 + 1000)).toLocaleString()}</td>
                      <td>
                        <span className={s.source === 'AI Generated' ? 'badge badge-purple flex items-center gap-1' : 'badge badge-gray flex items-center gap-1'}>
                          {s.source === 'AI Generated' ? <><Bot size={14} /> AI</> : <><Settings size={14} /> Manual</>}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm flex items-center gap-1"><Edit2 size={14} /> Edit</button>
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
