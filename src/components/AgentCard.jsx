import { 
  Terminal, 
  MessageSquare, 
  Play, 
  Pause,
  CheckCircle,
  Clock,
  Cpu,
  Shield,
  Search,
  PenTool,
  Zap
} from 'lucide-react';

const AGENT_CONFIG = {
  aria: { 
    emoji: '🎪', 
    color: '#9333ea',
    icon: Cpu,
    description: 'Chief Orchestrator'
  },
  pixel: { 
    emoji: '👨‍💻', 
    color: '#3b82f6',
    icon: Terminal,
    description: 'Lead Engineer'
  },
  curio: { 
    emoji: '🔍', 
    color: '#6366f1',
    icon: Search,
    description: 'Research Lead'
  },
  scribe: { 
    emoji: '✍️', 
    color: '#10b981',
    icon: PenTool,
    description: 'Content Lead'
  },
  flux: { 
    emoji: '⚡', 
    color: '#f59e0b',
    icon: Zap,
    description: 'DevOps Lead'
  },
  vault: { 
    emoji: '🛡️', 
    color: '#ef4444',
    icon: Shield,
    description: 'Security Auditor'
  },
};

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'status-active', icon: Play },
  idle: { label: 'Idle', className: 'status-idle', icon: Pause },
  blocked: { label: 'Blocked', className: 'status-blocked', icon: Clock },
  standby: { label: 'Standby', className: 'status-standby', icon: Pause },
};

export function AgentCard({ agent, agentId, detailed = false, onMessage, onAssign }) {
  const config = AGENT_CONFIG[agentId] || { 
    emoji: '🤖', 
    color: '#6b7280',
    icon: Cpu,
    description: 'Agent'
  };
  
  const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.idle;
  const StatusIcon = status.icon;
  const AgentIcon = config.icon;

  if (detailed) {
    return (
      <div className="agent-card-detailed" style={{ borderLeftColor: config.color }}>
        <div className="agent-card-header">
          <div className="agent-avatar" style={{ backgroundColor: `${config.color}20` }}>
            <span className="agent-emoji">{config.emoji}</span>
          </div>
          <div className="agent-info">
            <h3>{agent.name}</h3>
            <p className="agent-role">{agent.role}</p>
            <span className={`agent-status-badge ${status.className}`}>
              <StatusIcon size={12} /> {status.label}
            </span>
          </div>
        </div>

        <div className="agent-stats">
          <div className="agent-stat">
            <span className="stat-label">Tasks</span>
            <span className="stat-value">{agent.task_count?.completed || 0}</span>
          </div>
          <div className="agent-stat">
            <span className="stat-label">Failed</span>
            <span className="stat-value">{agent.task_count?.failed || 0}</span>
          </div>
          <div className="agent-stat">
            <span className="stat-label">Avg Time</span>
            <span className="stat-value">{agent.metrics?.avg_response_time || 0}s</span>
          </div>
        </div>

        {agent.current_task && (
          <div className="agent-current-task">
            <span className="current-task-label">Current Task:</span>
            <span className="current-task-value">{agent.current_task}</span>
          </div>
        )}

        <div className="agent-tools">
          <span className="tools-label">Tools:</span>
          <div className="tools-list">
            {(agent.tools || []).slice(0, 4).map((tool, i) => (
              <span key={i} className="tool-tag">{tool}</span>
            ))}
            {(agent.tools || []).length > 4 && (
              <span className="tool-tag">+{(agent.tools || []).length - 4}</span>
            )}
          </div>
        </div>

        <div className="agent-actions">
          <button className="btn btn-primary" onClick={() => onMessage?.(agentId)}>
            <MessageSquare size={14} /> Message
          </button>
          <button className="btn btn-secondary" onClick={() => onAssign?.(agentId)}>
            <CheckCircle size={14} /> Assign Task
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-card-mini" style={{ borderLeftColor: config.color }}>
      <div className="agent-mini-header">
        <span className="agent-emoji">{config.emoji}</span>
        <div className="agent-mini-info">
          <strong>{agent.name}</strong>
          <span className={`status-dot ${status.className}`}></span>
        </div>
      </div>
      <p className="agent-role">{agent.role}</p>
      {agent.current_task && (
        <p className="agent-task">{agent.current_task.substring(0, 40)}...</p>
      )}
    </div>
  );
}

export function AgentListItem({ agent, agentId, onClick }) {
  const config = AGENT_CONFIG[agentId] || { emoji: '🤖', color: '#6b7280' };
  const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.idle;

  return (
    <div className="agent-list-item" onClick={onClick}>
      <div className="agent-list-avatar" style={{ backgroundColor: `${config.color}20` }}>
        <span>{config.emoji}</span>
      </div>
      <div className="agent-list-info">
        <strong>{agent.name}</strong>
        <span className="agent-list-role">{agent.role}</span>
      </div>
      <span className={`agent-list-status ${status.className}`}>{status.label}</span>
      <div className="agent-list-stats">
        <span>{agent.task_count?.completed || 0} done</span>
      </div>
    </div>
  );
}
