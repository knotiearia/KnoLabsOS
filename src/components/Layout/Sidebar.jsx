import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Settings,
  Activity,
  RefreshCw,
  MessageCircle,
  Inbox,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'a2a', label: 'A2A Chat', icon: MessageCircle },
  { id: 'system', label: 'System', icon: Settings },
  { id: 'system-monitor', label: 'Monitor', icon: Activity },
];

export function Sidebar({ activeTab, onTabChange, collapsed, onToggle, lastRefresh, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={onMobileClose} />
      )}
      
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-emoji">🎪</span>
            {!collapsed && <span className="logo-text">Knolabs</span>}
          </div>
          
          {/* Desktop collapse button */}
          <button className="collapse-btn desktop-only" onClick={onToggle}>
            {collapsed ? '→' : '←'}
          </button>
          
          {/* Mobile close button */}
          <button className="mobile-close-btn mobile-only" onClick={onMobileClose}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        
        <div className="sidebar-footer">
          {!collapsed && (
            <>
              <p className="version">Mission Control v2.0</p>
              <p className="company">Knolabs AI Agency</p>
              {lastRefresh && (
                <p className="last-refresh">
                  <RefreshCw size={10} />
                  {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
