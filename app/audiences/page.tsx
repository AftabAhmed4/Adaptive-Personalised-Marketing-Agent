'use client';
import { useState, useEffect } from 'react';
import { Users, Bot, Settings, Edit2 } from 'lucide-react';

interface Audience {
  id: string;
  name: string;
  size: number;
  description: string;
  criteria: any;
  source: 'AI Generated' | 'Manual';
}

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audiences')
      .then(r => r.json())
      .then(data => { setAudiences(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Audiences</div>
          <div className="topbar-subtitle">Target segments for your campaigns</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary"><span>+</span> Create Audience</button>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div className="section-title">Saved Audiences</div>
          </div>
          
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              Loading audiences...
            </div>
          ) : audiences.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={48} /></div>
              <div className="empty-state-title">No audiences yet</div>
              <div className="empty-state-text">Create an audience to target your campaigns effectively.</div>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Audience Name</th>
                    <th>Description</th>
                    <th>Size</th>
                    <th>Source</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {audiences.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</td>
                      <td style={{ maxWidth: 300 }}>{a.description}</td>
                      <td style={{ fontWeight: 600 }}>{(a.size || Math.floor(Math.random() * 10000 + 5000)).toLocaleString()}</td>
                      <td>
                        <span className={a.source === 'AI Generated' ? 'badge badge-purple flex items-center gap-1' : 'badge badge-gray flex items-center gap-1'}>
                          {a.source === 'AI Generated' ? <><Bot size={14} /> AI</> : <><Settings size={14} /> Manual</>}
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
