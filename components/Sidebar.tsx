'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LayoutDashboard, Megaphone, Users, Target, Mail, Zap, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/campaigns', icon: <Megaphone size={18} />, label: 'Campaigns' },
  { href: '/audiences', icon: <Users size={18} />, label: 'Audiences' },
  { href: '/strategies', icon: <Target size={18} />, label: 'Strategies' },
  { href: '/templates', icon: <Mail size={18} />, label: 'Templates' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Sparkles size={20} color="white" /></div>
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
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <div className="nav-section-label" style={{ marginTop: 16 }}>Quick Actions</div>
        <Link href="/campaigns/create" className="nav-item">
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24 }}><Zap size={18} /></span>
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
