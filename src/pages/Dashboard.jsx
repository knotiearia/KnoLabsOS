import { useState, useEffect } from 'react';
import { 
  Users, 
  CheckSquare, 
  Activity, 
  Cpu,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { StatsCard, AlertBanner } from '../components/StatsCard.jsx';
import { AgentCard } from '../components/AgentCard.jsx';
import { OrganizationTree } from '../components/OrganizationTree.jsx';

const API_BASE = 'http://localhost:3001';

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      const [registryRes, tasksRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE}/api/agents`),
        fetch(`${API_BASE}/api/tasks`),
        fetch(`${API_BASE}/api/alerts`)
      ]);

      const [registry, tasks, alerts] = await Promise.all([
        registryRes.json(),
        tasksRes.json(),
        alertsRes.json()
      ]);

      setData({ registry, tasks, alerts });
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and polling
  useEffect(() => {
    fetchData(); // Initial load
    
    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error || !data?.registry) {
    return (
      <div className="error-state">
        <p>{error || 'Failed to load dashboard'}</p>
        <button onClick={fetchData} className="btn-primary">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const { registry, tasks, alerts } = data;
  const { system, agents } = registry;
  
  // Calculate stats
  const totalAgents = system?.total_agents || 0;
  const activeAgents = system?.active_agents || 0;
  const idleAgents = system?.idle_agents || 0;
  
  const pendingTasks = tasks?.queues?.pending?.length || 0;
  const inProgressTasks = tasks?.queues?.in_progress?.length || 0;
  const completedTasks = tasks?.queues?.completed?.length || 0;
  const failedTasks = tasks?.queues?.failed?.length || 0;
  
  // Calculate system health (percentage of non-failed tasks)
  const totalTasks = pendingTasks + inProgressTasks + completedTasks + failedTasks;
  const healthPercent = totalTasks > 0 
    ? Math.round(((totalTasks - failedTasks) / totalTasks) * 100) 
    : 100;

  // Get recent activity (combine recent tasks and agent updates)
  const recentActivity = [
    ...(tasks?.queues?.completed || []).slice(-5).map(t => ({
      type: 'task_completed',
      time: t.completed_at,
      message: `Task ${t.id?.split('-').pop()} completed`,
      agent: t.agent
    })),
    ...(tasks?.queues?.failed || []).slice(-3).map(t => ({
      type: 'task_failed',
      time: t.failed_at || t.created_at,
      message: `Task ${t.id?.split('-').pop()} failed`,
      agent: t.agent
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <AlertBanner alerts={alerts} />
        {lastUpdate && (
          <div className="last-update">
            <RefreshCw size={12} className="update-icon" />
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>
      
      {/* Stats Row */}
      <div className="stats-grid">
        <StatsCard
          title="Total Agents"
          value={totalAgents}
          subtitle={`${activeAgents} active, ${idleAgents} idle`}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Tasks"
          value={inProgressTasks}
          subtitle={`${pendingTasks} pending`}
          icon={CheckSquare}
          color="amber"
        />
        <StatsCard
          title="Completed Today"
          value={completedTasks}
          subtitle={`${failedTasks} failed`}
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="System Health"
          value={`${healthPercent}%`}
          subtitle={healthPercent >= 95 ? 'All systems operational' : 'Issues detected'}
          icon={healthPercent >= 95 ? Cpu : AlertTriangle}
          color={healthPercent >= 95 ? 'purple' : 'red'}
        />
      </div>

      <div className="dashboard-grid">
        {/* Agent Status Grid */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>🤖 Agent Status</h2>
            <span className="agent-summary">
              {activeAgents} active / {totalAgents} total
            </span>
          </div>
          
          <div className="agent-grid">
            {Object.entries(agents || {}).map(([agentId, agent]) => (
              <AgentCard 
                key={agentId} 
                agent={agent} 
                agentId={agentId}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="dashboard-section activity-section">
          <div className="section-header">
            <h2>📋 Recent Activity</h2>
          </div>
          
          <div className="activity-feed">
            {recentActivity.length === 0 ? (
              <p className="empty-state">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className={`activity-item ${activity.type}`}
                >
                  <div className="activity-icon">
                    {activity.type === 'task_completed' ? '✅' : '❌'}
                  </div>
                  <div className="activity-content">
                    <p>{activity.message}</p>
                    <div className="activity-meta">
                      <span className="activity-agent">
                        {activity.agent?.toUpperCase()}
                      </span>
                      <span className="activity-time">
                        <Clock size={12} />
                        {new Date(activity.time).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Organization Tree */}
      <div className="dashboard-section">
        <OrganizationTree data={data} />
      </div>
    </div>
  );
}
