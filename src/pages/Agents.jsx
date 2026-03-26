import { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  CheckCircle,
  Cpu,
  Shield,
  Terminal,
  Search,
  PenTool,
  Zap
} from 'lucide-react';
import { AgentCard, AgentListItem } from '../components/AgentCard.jsx';

const AGENT_DETAILS = {
  aria: {
    emoji: '🎪',
    color: '#9333ea',
    icon: Cpu,
    fullDescription: 'Chief Orchestrator responsible for coordinating all agency operations, managing agent workflows, and ensuring system stability.',
    responsibilities: [
      'Agent orchestration and delegation',
      'Resource monitoring and management',
      'Security policy enforcement',
      'Task routing and prioritization'
    ]
  },
  pixel: {
    emoji: '👨‍💻',
    color: '#3b82f6',
    icon: Terminal,
    fullDescription: 'Lead Engineer focused on software development, debugging, code review, and technical implementation.',
    responsibilities: [
      'Software development and coding',
      'Code review and quality assurance',
      'Git operations and version control',
      'Docker container management'
    ]
  },
  curio: {
    emoji: '🔍',
    color: '#6366f1',
    icon: Search,
    fullDescription: 'Research Lead specializing in information gathering, fact-checking, and documentation.',
    responsibilities: [
      'Web research and information gathering',
      'Fact-checking and verification',
      'Documentation review',
      'Knowledge base maintenance'
    ]
  },
  scribe: {
    emoji: '✍️',
    color: '#10b981',
    icon: PenTool,
    fullDescription: 'Content Lead responsible for content creation, copywriting, documentation, and editing.',
    responsibilities: [
      'Content creation and copywriting',
      'Technical documentation',
      'Editing and proofreading',
      'Markdown to PDF conversion'
    ]
  },
  flux: {
    emoji: '⚡',
    color: '#f59e0b',
    icon: Zap,
    fullDescription: 'DevOps Lead handling infrastructure, deployment, automation, and system monitoring.',
    responsibilities: [
      'Infrastructure management',
      'Deployment automation',
      'System monitoring',
      'Docker and systemd operations'
    ]
  },
  vault: {
    emoji: '🛡️',
    color: '#ef4444',
    icon: Shield,
    fullDescription: 'Security Auditor focused on security audits, compliance, and vulnerability scanning.',
    responsibilities: [
      'Security audits and assessments',
      'Compliance monitoring',
      'Vulnerability scanning',
      'Security policy review'
    ]
  }
};

export function Agents({ data }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  if (!data?.registry) {
    return <div className="loading">Loading agents...</div>;
  }

  const { agents, system } = data.registry;
  const agentList = Object.entries(agents || {});

  const handleMessage = (agentId) => {
    alert(`Message ${agentId.toUpperCase()}: Use the ACC messaging system or inbox directory.`);
  };

  const handleAssign = (agentId) => {
    alert(`Assign task to ${agentId.toUpperCase()}: Use the Tasks page or ACC CLI.`);
  };

  return (
    <div className="agents-page">
      <div className="page-header">
        <h1>🤖 Agent Directory</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`btn btn-ghost ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={`btn btn-ghost ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div className="agents-layout">
        {/* Agent List */}
        <div className={`agents-list-container ${selectedAgent ? 'with-detail' : ''}`}>
          <div className="agents-summary">
            <span>{system?.total_agents} agents</span>
            <span className="dot">•</span>
            <span className="active">{system?.active_agents} active</span>
            <span className="dot">•</span>
            <span className="idle">{system?.idle_agents} idle</span>
          </div>

          {viewMode === 'grid' ? (
            <div className="agents-grid-detailed">
              {agentList.map(([agentId, agent]) => (
                <AgentCard
                  key={agentId}
                  agent={agent}
                  agentId={agentId}
                  detailed={true}
                  onMessage={handleMessage}
                  onAssign={handleAssign}
                />
              ))}
            </div>
          ) : (
            <div className="agents-list">
              {agentList.map(([agentId, agent]) => (
                <AgentListItem
                  key={agentId}
                  agent={agent}
                  agentId={agentId}
                  onClick={() => setSelectedAgent(agentId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Agent Detail Panel (for list view) */}
        {selectedAgent && viewMode === 'list' && (
          <div className="agent-detail-panel">
            <div className="detail-panel-header">
              <button 
                className="btn-close"
                onClick={() => setSelectedAgent(null)}
              >
                ×
              </button>
            </div>
            
            {(() => {
              const agent = agents[selectedAgent];
              const details = AGENT_DETAILS[selectedAgent];
              
              return (
                <>
                  <div className="detail-hero" style={{ backgroundColor: `${details?.color}15` }}>
                    <span className="detail-emoji">{details?.emoji}</span>
                    <h2>{agent.name}</h2>
                    <p className="detail-role">{agent.role}</p>
                    <span 
                      className={`detail-status ${agent.status}`}
                      style={{ color: details?.color }}
                    >
                      {agent.status}
                    </span>
                  </div>
                  
                  <div className="detail-section">
                    <h3>About</h3>
                    <p>{details?.fullDescription}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h3>Responsibilities</h3>
                    <ul>
                      {details?.responsibilities.map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="detail-section">
                    <h3>Capabilities</h3>
                    <div className="capabilities-list">
                      {(agent.capabilities || []).map((cap, i) => (
                        <span key={i} className="capability-tag">{cap}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h3>Metrics</h3>
                    <div className="metrics-grid">
                      <div className="metric">
                        <span className="metric-value">{agent.task_count?.completed || 0}</span>
                        <span className="metric-label">Completed</span>
                      </div>
                      <div className="metric">
                        <span className="metric-value">{agent.task_count?.failed || 0}</span>
                        <span className="metric-label">Failed</span>
                      </div>
                      <div className="metric">
                        <span className="metric-value">{agent.metrics?.avg_response_time || 0}s</span>
                        <span className="metric-label">Avg Response</span>
                      </div>
                      <div className="metric">
                        <span className="metric-value">{(agent.tools || []).length}</span>
                        <span className="metric-label">Tools</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleMessage(selectedAgent)}
                    >
                      <MessageSquare size={16} /> Message Agent
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleAssign(selectedAgent)}
                    >
                      <CheckCircle size={16} /> Assign Task
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
