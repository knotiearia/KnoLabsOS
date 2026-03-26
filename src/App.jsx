import { useState } from 'react';
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

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data, loading, error, lastRefresh, refresh } = useACCData();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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
