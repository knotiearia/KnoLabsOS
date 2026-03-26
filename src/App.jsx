import { useState, useEffect } from 'react';
import { useACCData } from './hooks/useACCData.js';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Layout/Sidebar.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Tasks } from './pages/Tasks.jsx';
import { Agents } from './pages/Agents.jsx';
import { System } from './pages/System.jsx';
import { SystemMonitor } from './pages/SystemMonitor.jsx';
import { A2AViewer } from './pages/A2AViewer.jsx';
import { InboxPage } from './pages/InboxPage.jsx';
import { Inbox } from './pages/Inbox.jsx';
import './App.css';
import './mobile-inbox.css';

function App() {
  // Read initial tab from URL hash
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['dashboard', 'inbox', 'tasks', 'agents', 'system', 'system-monitor', 'a2a'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data, loading, error, lastRefresh, refresh } = useACCData();

  // Sync URL hash with state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['dashboard', 'inbox', 'tasks', 'agents', 'system', 'system-monitor', 'a2a'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    if (loading && !data) {
      return (
        <div className="loading-screen">
          <div className="loading-spinner">🎪</div>
          <p>Loading Mission Control...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-screen">
          <div className="error-icon">⚠️</div>
          <h2>Failed to load ACC data</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={refresh}>Retry</button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'inbox':
        return <Inbox />;
      case 'tasks':
        return <Tasks data={data} onRefresh={refresh} />;
      case 'agents':
        return <Agents data={data} />;
      case 'system':
        return <System data={data} onRefresh={refresh} lastRefresh={lastRefresh} />;
      case 'system-monitor':
        return <SystemMonitor />;
      case 'a2a':
        return <A2AViewer />;
      default:
        return <Dashboard data={data} />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        lastRefresh={lastRefresh}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="main-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          </div>
          <div className="header-actions">
            {lastRefresh && (
              <span className="refresh-indicator">
                Last sync: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <span className="status-badge">
              <span className="status-dot"></span>
              System Online
            </span>
          </div>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
