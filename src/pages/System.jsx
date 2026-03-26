import { 
  Activity,
  Clock,
  Cpu,
  HardDrive,
  Server,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  FileText,
  Terminal,
  Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { SystemMetrics } from '../components/SystemMetrics.jsx';

export function System({ data, onRefresh, lastRefresh }) {
  const [activeLogTab, setActiveLogTab] = useState('heartbeat');
  const [logs, setLogs] = useState({
    heartbeat: [],
    tasks: [],
    agents: []
  });

  // Simulate fetching logs
  useEffect(() => {
    // This would be replaced with actual log fetching
    setLogs({
      heartbeat: [
        { time: '2026-03-26 16:08:00', level: 'info', message: 'ACC heartbeat: All systems operational' },
        { time: '2026-03-26 16:07:00', level: 'info', message: 'Agent statuses updated' },
        { time: '2026-03-26 16:06:00', level: 'info', message: 'Task queue processed' },
        { time: '2026-03-26 16:05:00', level: 'success', message: 'PIXEL task completed' },
        { time: '2026-03-26 16:04:00', level: 'info', message: 'ACC heartbeat: All systems operational' },
      ],
      tasks: [
        { time: '2026-03-26 16:05:00', level: 'success', message: 'TASK-1774512829 completed by PIXEL' },
        { time: '2026-03-26 16:03:00', level: 'warning', message: 'TASK-1774512801 timed out' },
        { time: '2026-03-26 16:00:00', level: 'info', message: 'New task created: TASK-1774513388' },
        { time: '2026-03-26 15:45:00', level: 'info', message: 'Task queue reloaded from disk' },
      ],
      agents: [
        { time: '2026-03-26 16:08:00', level: 'info', message: 'ARIA status: active' },
        { time: '2026-03-26 16:08:00', level: 'info', message: 'PIXEL status: active' },
        { time: '2026-03-26 08:23:00', level: 'info', message: 'PIXEL spawned for task TASK-1774513388' },
        { time: '2026-03-26 08:15:00', level: 'info', message: 'Agent registry updated' },
      ]
    });
  }, [lastRefresh]);

  if (!data?.registry) {
    return <div className="loading">Loading system data...</div>;
  }

  const { system } = data.registry;

  // Calculate time since last heartbeat
  const timeSinceHeartbeat = system?.last_heartbeat 
    ? Math.round((new Date() - new Date(system.last_heartbeat)) / 60000)
    : null;

  const logTabs = [
    { id: 'heartbeat', label: 'Heartbeat', icon: Activity },
    { id: 'tasks', label: 'Task Logs', icon: FileText },
    { id: 'agents', label: 'Agent Logs', icon: Server },
  ];

  return (
    <div className="system-page">
      <div className="page-header">
        <h1>⚙️ System Status</h1>
        <div className="header-actions">
          {lastRefresh && (
            <span className="last-refresh">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button className="btn btn-secondary" onClick={onRefresh}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="system-grid">
        <div className="system-status-card">
          <div className="status-icon online">
            <Server size={24} />
          </div>
          <div className="status-info">
            <h3>ACC System</h3>
            <span className="status-text ok"><CheckCircle size={14} /> Operational</span>
          </div>
        </div>

        <div className="system-status-card">
          <div className="status-icon online">
            <Clock size={24} />
          </div>
          <div className="status-info">
            <h3>Heartbeat</h3>
            <span className="status-text ok">
              {timeSinceHeartbeat !== null 
                ? `${timeSinceHeartbeat}m ago` 
                : 'Unknown'}
            </span>
          </div>
        </div>

        <div className="system-status-card">
          <div className="status-icon online">
            <Cpu size={24} />
          </div>
          <div className="status-info">
            <h3>Agents</h3>
            <span className="status-text ok">
              {system?.active_agents || 0} active
            </span>
          </div>
        </div>

        <div className="system-status-card">
          <div className={`status-icon ${system?.failed_tasks > 0 ? 'warning' : 'online'}`}>
            <HardDrive size={24} />
          </div>
          <div className="status-info">
            <h3>Task Queue</h3>
            <span className={`status-text ${system?.failed_tasks > 0 ? 'warning' : 'ok'}`}>
              {system?.pending_tasks || 0} pending
              {system?.failed_tasks > 0 && `, ${system.failed_tasks} failed`}
            </span>
          </div>
        </div>
      </div>

      {/* System Metrics Charts */}
      <SystemMetrics />

      <div className="system-layout">
        {/* Logs Viewer */}
        <div className="logs-panel">
          <div className="panel-header">
            <h2>📝 System Logs</h2>
            <div className="log-tabs">
              {logTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`log-tab ${activeLogTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveLogTab(tab.id)}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="log-container">
            {(logs[activeLogTab] || []).map((log, index) => (
              <div key={index} className={`log-entry ${log.level}`}>
                <span className="log-time">{log.time}</span>
                <span className={`log-level ${log.level}`}>{log.level.toUpperCase()}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Info Panel */}
        <div className="info-panel">
          <div className="panel-header">
            <h2>ℹ️ System Information</h2>
          </div>

          <div className="info-section">
            <h3>Agency</h3>
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{data.registry?.agency}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Orchestrator:</span>
              <span className="info-value">{data.registry?.orchestrator?.toUpperCase()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Version:</span>
              <span className="info-value">{data.registry?.version}</span>
            </div>
          </div>

          <div className="info-section">
            <h3>Schedule</h3>
            <div className="info-row">
              <span className="info-label">Next Standup:</span>
              <span className="info-value">
                {system?.next_standup 
                  ? new Date(system.next_standup).toLocaleString() 
                  : 'Not scheduled'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Standup:</span>
              <span className="info-value">
                {system?.last_standup 
                  ? new Date(system.last_standup).toLocaleString() 
                  : 'Never'}
              </span>
            </div>
          </div>

          <div className="info-section">
            <h3>Task Statistics</h3>
            <div className="info-row">
              <span className="info-label">Total Completed:</span>
              <span className="info-value">{system?.total_tasks_completed || 0}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Failed:</span>
              <span className="info-value">{system?.total_tasks_failed || 0}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Avg Completion Time:</span>
              <span className="info-value">{system?.avg_completion_time || 0}s</span>
            </div>
          </div>

          <div className="quick-actions">
            <h3>🔧 Quick Actions</h3>
            <div className="action-grid">
              <button className="action-btn" onClick={() => alert('Trigger manual poll via: ./task_poller.sh')}>
                <RefreshCw size={14} /> Trigger Poll
              </button>
              <button className="action-btn" onClick={() => alert('View logs: tail -f /workspace/acc/logs/*.log')}>
                <Terminal size={14} /> View Logs
              </button>
              <button className="action-btn" onClick={() => alert('Security audit via: ./run_security_audit.sh')}>
                <Shield size={14} /> Security Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
