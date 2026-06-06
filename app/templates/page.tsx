'use client';
import { useState, useEffect } from 'react';
import { Mail, Bot, Settings, Edit2, Plus } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  source: 'AI Generated' | 'Manual';
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(data => { setTemplates(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Templates</div>
          <div className="topbar-subtitle">Copywriting and email templates</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary flex items-center gap-1"><Plus size={16} /> Create Template</button>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div className="section-title">Saved Templates</div>
          </div>
          
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Mail size={48} /></div>
              <div className="empty-state-title">No templates yet</div>
              <div className="empty-state-text">Create a template to use in your campaigns.</div>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Template Name</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Source</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</td>
                      <td style={{ maxWidth: 300 }}>{t.subject}</td>
                      <td><span className="badge badge-gray">{t.type}</span></td>
                      <td>
                        <span className={t.source === 'AI Generated' ? 'badge badge-purple flex items-center gap-1' : 'badge badge-gray flex items-center gap-1'}>
                          {t.source === 'AI Generated' ? <><Bot size={14} /> AI</> : <><Settings size={14} /> Manual</>}
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
