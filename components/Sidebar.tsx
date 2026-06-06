'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: '▦', label: 'Dashboard' },
  { href: '/campaigns', icon: '📣', label: 'Campaigns' },
  { href: '/audiences', icon: '👥', label: 'Audiences' },
  { href: '/strategies', icon: '🎯', label: 'Strategies' },
  { href: '/templates', icon: '✉️', label: 'Templates' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✦</div>
        <div>
          <div className="sidebar-logo-text">MarketAI</div>
          <div className="sidebar-logo-sub">AI Marketing Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <div className="nav-section-label" style={{ marginTop: 16 }}>Quick Actions</div>
        <Link href="/campaigns/create" className="nav-item">
          <span style={{ fontSize: 16 }}>⚡</span>
          Create Campaign
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item" style={{ cursor: 'default' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0
          }}>A</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Admin User</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>admin@marketai.io</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
