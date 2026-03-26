import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Cpu, 
  Terminal, 
  Search, 
  PenTool, 
  Zap, 
  Shield,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  User,
  BarChart3,
  Layers
} from 'lucide-react';

const AGENT_CONFIG = {
  aria: { 
    emoji: '🎪', 
    color: '#9333ea',
    icon: Cpu,
    description: 'Chief Orchestrator - Coordinates all agency operations and manages agent workflows',
    fullRole: 'Chief Orchestrator'
  },
  pixel: { 
    emoji: '👨‍💻', 
    color: '#3b82f6',
    icon: Terminal,
    description: 'Lead Engineer - Software development, debugging, code review, and technical implementation',
    fullRole: 'Lead Engineer'
  },
  curio: { 
    emoji: '🔍', 
    color: '#6366f1',
    icon: Search,
    description: 'Research Lead - Information gathering, fact-checking, and documentation',
    fullRole: 'Research Lead'
  },
  scribe: { 
    emoji: '✍️', 
    color: '#10b981',
    icon: PenTool,
    description: 'Content Lead - Content creation, copywriting, documentation, and editing',
    fullRole: 'Content Lead'
  },
  flux: { 
    emoji: '⚡', 
    color: '#f59e0b',
    icon: Zap,
    description: 'DevOps Lead - Infrastructure, deployment, automation, and system monitoring',
    fullRole: 'DevOps Lead'
  },
  vault: { 
    emoji: '🛡️', 
    color: '#ef4444',
    icon: Shield,
    description: 'Security Auditor - Security audits, compliance, and vulnerability scanning',
    fullRole: 'Security Auditor'
  },
};

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'status-active', icon: Activity },
  idle: { label: 'Idle', className: 'status-idle', icon: Clock },
  blocked: { label: 'Blocked', className: 'status-blocked', icon: AlertCircle },
  standby: { label: 'Standby', className: 'status-standby', icon: Clock },
};

function ToolBadge({ tool, color }) {
  return (
    <span 
      className="tool-badge" 
      style={{ 
        backgroundColor: `${color}15`,
        borderColor: `${color}30`,
        color: color 
      }}
    >
      <Wrench size={10} />
      {tool}
    </span>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <div className="metric-mini-card" style={{ borderLeftColor: color }}>
      <div className="metric-mini-header">
        <Icon size={14} style={{ color }} />
        <span className="metric-mini-label">{label}</span>
      </div>
      <span className="metric-mini-value">{value}</span>
    </div>
  );
}

function AgentNode({ agentId, agent, level = 0, isOrchestrator = false }) {
  const [expanded, setExpanded] = useState(isOrchestrator);
  const config = AGENT_CONFIG[agentId] || { 
    emoji: '🤖', 
    color: '#6b7280',
    icon: User,
    description: 'AI Agent',
    fullRole: 'Agent'
  };
  
  const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.idle;
  const StatusIcon = status.icon;
  const AgentIcon = config.icon;
  
  const hasChildren = isOrchestrator && level === 0;
  const children = hasChildren ? Object.keys(agent).filter(k => AGENT_CONFIG[k] && k !== 'aria') : [];

  return (
    <div className={`org-node level-${level}`}>
      <div 
        className={`org-node-card ${expanded ? 'expanded' : ''}`}
        style={{ 
          borderLeftColor: config.color,
          marginLeft: level * 32
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Node Header */}
        <div className="org-node-header">
          <div className="org-node-identity">
            <div 
              className="org-node-avatar" 
              style={{ backgroundColor: `${config.color}20` }}
            >
              <span className="org-emoji">{config.emoji}</span>
            </div>
            <div className="org-node-info">
              <h4 className="org-node-name">{agent.name}</h4>
              <span className="org-node-role">{config.fullRole}</span>
            </div>
          </div>
          
          <div className="org-node-meta">
            <span 
              className={`org-status-badge ${status.className}`}
              style={{ color: config.color }}
            >
              <StatusIcon size={12} />
              {status.label}
            </span>
            
            {hasChildren && (
              <span className="org-expand-icon">
                {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </span>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        <div className={`org-node-content ${expanded ? 'visible' : ''}`}>
          {/* Role Description */}
          <div className="org-section">
            <h5 className="org-section-title">
              <User size={12} /> About
            </h5>
            <p className="org-description">{config.description}</p>
          </div>

          {/* Current Task */}
          {agent.current_task && (
            <div className="org-section">
              <h5 className="org-section-title">
                <Activity size={12} /> Current Task
              </h5>
              <span 
                className="org-current-task"
                style={{ backgroundColor: `${config.color}15`, color: config.color }}
              >
                {agent.current_task}
              </span>
            </div>
          )}

          {/* Tools */}
          {agent.tools && agent.tools.length > 0 && (
            <div className="org-section">
              <h5 className="org-section-title">
                <Layers size={12} /> Tools ({agent.tools.length})
              </h5>
              <div className="org-tools-grid">
                {agent.tools.map((tool, i) => (
                  <ToolBadge key={i} tool={tool} color={config.color} />
                ))}
              </div>
            </div>
          )}

          {/* Capabilities */}
          {agent.capabilities && agent.capabilities.length > 0 && (
            <div className="org-section">
              <h5 className="org-section-title">
                <CheckCircle size={12} /> Capabilities
              </h5>
              <div className="org-capabilities">
                {agent.capabilities.map((cap, i) => (
                  <span key={i} className="capability-pill">{cap}</span>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="org-section">
            <h5 className="org-section-title">
              <BarChart3 size={12} /> Performance Metrics
            </h5>
            <div className="org-metrics-grid">
              <MetricCard 
                label="Completed" 
                value={agent.task_count?.completed || 0}
                icon={CheckCircle}
                color="#10b981"
              />
              <MetricCard 
                label="Failed" 
                value={agent.task_count?.failed || 0}
                icon={AlertCircle}
                color="#ef4444"
              />
              <MetricCard 
                label="Avg Response" 
                value={`${agent.metrics?.avg_response_time || 0}s`}
                icon={Clock}
                color="#3b82f6"
              />
              <MetricCard 
                label="Token Usage" 
                value={agent.metrics?.token_usage_total?.toLocaleString() || 0}
                icon={Activity}
                color="#8b5cf6"
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="org-section org-tech-details">
            <h5 className="org-section-title">Technical Details</h5>
            <div className="org-tech-grid">
              <div className="org-tech-item">
                <span className="org-tech-label">Model</span>
                <span className="org-tech-value">{agent.model}</span>
              </div>
              <div className="org-tech-item">
                <span className="org-tech-label">Sandbox</span>
                <span className="org-tech-value">{agent.sandbox}</span>
              </div>
              <div className="org-tech-item">
                <span className="org-tech-label">Last Seen</span>
                <span className="org-tech-value">
                  {agent.last_seen ? new Date(agent.last_seen).toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Child Nodes */}
      {hasChildren && expanded && (
        <div className="org-children">
          {Object.entries(agent).map(([childId, childAgent]) => {
            if (AGENT_CONFIG[childId] && childId !== 'aria') {
              return (
                <AgentNode 
                  key={childId}
                  agentId={childId}
                  agent={childAgent}
                  level={level + 1}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

export function OrganizationTree({ data }) {
  if (!data?.registry?.agents) {
    return <div className="loading">Loading organization...</div>;
  }

  const { agents } = data.registry;
  const orchestrator = agents.aria;

  return (
    <div className="org-tree-container">
      <div className="org-tree-header">
        <h2>🏢 AI Organization</h2>
        <p className="org-tree-subtitle">
          Click on any agent to expand and view detailed information
        </p>
      </div>

      <div className="org-tree">
        {/* Root: ARIA (Orchestrator) */}
        {orchestrator && (
          <AgentNode 
            agentId="aria"
            agent={orchestrator}
            level={0}
            isOrchestrator={true}
          />
        )}

        {/* Level 1: All other agents as children of ARIA */}
        <div className="org-children-level-1">
          {Object.entries(agents)
            .filter(([agentId]) => agentId !== 'aria')
            .map(([agentId, agent]) => (
              <AgentNode 
                key={agentId}
                agentId={agentId}
                agent={agent}
                level={1}
              />
            ))}
        </div>
      </div>

      {/* Organization Legend */}
      <div className="org-legend">
        <h4>Agent Color Legend</h4>
        <div className="org-legend-grid">
          {Object.entries(AGENT_CONFIG).map(([id, config]) => (
            <div key={id} className="org-legend-item">
              <span 
                className="org-legend-dot" 
                style={{ backgroundColor: config.color }}
              />
              <span className="org-legend-name">{config.emoji} {id.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrganizationTree;
