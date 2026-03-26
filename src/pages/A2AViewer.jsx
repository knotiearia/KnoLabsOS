import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Users, 
  Download, 
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  Search,
  X,
  Share2
} from 'lucide-react';

import { AGENTS_OBJ, getAgentConfig } from '../config/agents.config';

// Create AGENT_CONFIG for backward compatibility
const AGENT_CONFIG = Object.fromEntries(
  Object.values(AGENTS_OBJ).map(agent => [agent.id, agent])
);

// Generate mock conversation data using agent config
function generateMockConversations() {
  const agents = Object.values(AGENTS_OBJ).filter(a => a.id !== 'system');
  const conversations = [];
  const now = Date.now();
  
  // Get agent references dynamically
  const orchestrator = agents.find(a => a.role.includes('Orchestrator')) || agents[0];
  const engineer = agents.find(a => a.role.includes('Engineer')) || agents[1];
  const researcher = agents.find(a => a.role.includes('Research')) || agents[2];
  const content = agents.find(a => a.role.includes('Content')) || agents[3];
  const devops = agents.find(a => a.role.includes('DevOps')) || agents[4];
  const security = agents.find(a => a.role.includes('Security')) || agents[5];
  
  // Create several conversation threads
  const threads = [
    {
      id: 'thread-1',
      title: 'Frontend Dashboard Implementation',
      participants: [orchestrator.id, engineer.id],
      messages: [
        { id: 1, agent: orchestrator.id, content: `${engineer.name}, I need you to implement the Organization Tree component for the dashboard. It should show agent hierarchy with expandable nodes.`, timestamp: now - 3600000 },
        { id: 2, agent: engineer.id, content: `Got it! I'll create a tree visualization with ${orchestrator.name} at the root and all other agents as children. Each node will expand to show tools, capabilities, and metrics.`, timestamp: now - 3500000 },
        { id: 3, agent: orchestrator.id, content: 'Perfect. Make sure to include smooth animations and the color coding we discussed.', timestamp: now - 3400000 },
        { id: 4, agent: engineer.id, content: 'Component created! It has expand/collapse animations, hover effects, and shows all agent details including tools from the registry.', timestamp: now - 3300000 },
        { id: 5, agent: orchestrator.id, content: 'Excellent work. The build passed successfully.', timestamp: now - 3200000 }
      ]
    },
    {
      id: 'thread-2',
      title: 'Security Audit Planning',
      participants: [orchestrator.id, security.id, engineer.id],
      messages: [
        { id: 6, agent: security.id, content: `${orchestrator.name}, I've completed the initial security assessment. We need to review SSH configurations and firewall rules.`, timestamp: now - 7200000 },
        { id: 7, agent: orchestrator.id, content: `Good catch. Can you coordinate with ${engineer.name} to ensure the deployment scripts follow security best practices?`, timestamp: now - 7100000 },
        { id: 8, agent: engineer.id, content: `I'm updating the deployment automation to include security hardening steps. ${security.name}, can you review the changes?`, timestamp: now - 7000000 },
        { id: 9, agent: security.id, content: `Reviewing now. I'll add compliance checks to the CI pipeline as well.`, timestamp: now - 6900000 },
        { id: 10, agent: orchestrator.id, content: 'Schedule a follow-up review for next week.', timestamp: now - 6800000 }
      ]
    },
    {
      id: 'thread-3',
      title: 'Research Task: AI Trends',
      participants: [orchestrator.id, researcher.id, content.id],
      messages: [
        { id: 11, agent: orchestrator.id, content: `${researcher.name}, we need a research report on current AI trends for the quarterly review.`, timestamp: now - 86400000 },
        { id: 12, agent: researcher.id, content: "I'll gather the latest information on LLM developments, multi-agent systems, and industry adoption.", timestamp: now - 86000000 },
        { id: 13, agent: content.id, content: `I can help format the findings into a professional report. ${researcher.name}, share your sources and I'll create the document.`, timestamp: now - 85000000 },
        { id: 14, agent: researcher.id, content: 'Sources compiled. Key trends: 1) Multi-agent orchestration 2) Tool-augmented LLMs 3) Local deployment optimization', timestamp: now - 84000000 },
        { id: 15, agent: content.id, content: 'Report drafted and saved to the shared workspace. Ready for review.', timestamp: now - 83000000 },
        { id: 16, agent: orchestrator.id, content: 'Reviewed and approved. Excellent collaboration.', timestamp: now - 82000000 }
      ]
    },
    {
      id: 'thread-4',
      title: 'Infrastructure Scaling',
      participants: [devops.id, orchestrator.id, engineer.id],
      messages: [
        { id: 17, agent: devops.id, content: 'We need to scale the infrastructure. Current load is approaching 80% capacity.', timestamp: now - 172800000 },
        { id: 18, agent: orchestrator.id, content: 'What are our options? Can we optimize before scaling hardware?', timestamp: now - 172600000 },
        { id: 19, agent: devops.id, content: `I've identified several optimization opportunities. ${engineer.name}, can you help with the database query optimization?`, timestamp: now - 172400000 },
        { id: 20, agent: engineer.id, content: 'On it. I see some N+1 queries in the task queue that we can batch.', timestamp: now - 172200000 },
        { id: 21, agent: devops.id, content: 'Optimizations deployed. Load reduced to 45%. We can delay hardware scaling for now.', timestamp: now - 171000000 },
        { id: 22, agent: orchestrator.id, content: 'Great teamwork. Monitor the metrics and alert if we hit 70% again.', timestamp: now - 170800000 }
      ]
    }
  ];
  
  return threads;
}

// Format timestamp to readable time
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Message bubble component
function MessageBubble({ message, isConsecutive }) {
  const agent = AGENT_CONFIG[message.agent] || AGENT_CONFIG.system;
  const isSystem = message.agent === 'system';
  
  return (
    <div className={`message-bubble ${isConsecutive ? 'consecutive' : ''} ${isSystem ? 'system' : ''}`}>
      {!isConsecutive && (
        <div className="message-avatar" style={{ backgroundColor: `${agent.color}20` }}>
          <span>{agent.emoji}</span>
        </div>
      )}
      <div className="message-content-wrapper">
        {!isConsecutive && (
          <div className="message-header">
            <span className="message-author" style={{ color: agent.color }}>{agent.name}</span>
            <span className="message-time">
              <Clock size={10} />
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
        <div 
          className="message-content"
          style={!isConsecutive ? { borderLeftColor: agent.color } : {}}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

// Thread card component
function ThreadCard({ thread, isActive, onClick, unreadCount }) {
  const participantEmojis = thread.participants.map(p => AGENT_CONFIG[p]?.emoji || '🤖');
  const lastMessage = thread.messages[thread.messages.length - 1];
  
  return (
    <div 
      className={`thread-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="thread-participants">
        {participantEmojis.map((emoji, i) => (
          <span key={i} className="thread-avatar">{emoji}</span>
        ))}
        {thread.participants.length > 3 && (
          <span className="thread-avatar more">+{thread.participants.length - 3}</span>
        )}
      </div>
      
      <div className="thread-info">
        <h4 className="thread-title">{thread.title}</h4>
        <p className="thread-preview">{lastMessage?.content.substring(0, 60)}...</p>
      </div>
      
      <div className="thread-meta">
        <span className="thread-time">{formatTime(lastMessage?.timestamp)}</span>
        {unreadCount > 0 && (
          <span className="thread-unread">{unreadCount}</span>
        )}
      </div>
    </div>
  );
}

export function A2AViewer() {
  const [conversations, setConversations] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [filterAgents, setFilterAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Load conversations
  const loadConversations = () => {
    const data = generateMockConversations();
    setConversations(data);
    if (!activeThread && data.length > 0) {
      setActiveThread(data[0]);
    }
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  // Initial load and polling
  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when thread changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread]);

  // Filter threads
  const filteredThreads = conversations.filter(thread => {
    // Filter by participants
    if (filterAgents.length > 0) {
      const hasFilteredAgent = filterAgents.some(agent => 
        thread.participants.includes(agent)
      );
      if (!hasFilteredAgent) return false;
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = thread.title.toLowerCase().includes(query);
      const matchesContent = thread.messages.some(m => 
        m.content.toLowerCase().includes(query)
      );
      if (!matchesTitle && !matchesContent) return false;
    }
    
    return true;
  });

  // Toggle agent filter
  const toggleAgentFilter = (agent) => {
    setFilterAgents(prev => 
      prev.includes(agent) 
        ? prev.filter(a => a !== agent)
        : [...prev, agent]
    );
  };

  // Export conversation log
  const exportConversation = () => {
    if (!activeThread) return;
    
    const logData = {
      thread: activeThread,
      exportedAt: new Date().toISOString(),
      format: 'json'
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${activeThread.id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export all conversations
  const exportAllConversations = () => {
    const logData = {
      conversations: conversations,
      exportedAt: new Date().toISOString(),
      format: 'json'
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-conversations-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="a2a-viewer-page">
        <div className="loading-a2a">
          <MessageSquare size={48} className="loading-icon" />
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="a2a-viewer-page">
      {/* Header */}
      <div className="a2a-header">
        <div className="a2a-title">
          <Share2 size={24} />
          <h1>A2A Conversation Viewer</h1>
        </div>
        <div className="a2a-actions">
          {lastUpdate && (
            <span className="last-sync">
              Last sync: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button className="btn btn-secondary" onClick={loadConversations}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={exportAllConversations}>
            <Download size={14} /> Export All
          </button>
        </div>
      </div>

      <div className="a2a-layout">
        {/* Thread List Sidebar */}
        <div className="thread-sidebar">
          {/* Search and Filter */}
          <div className="thread-filters">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>
            
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} />
              Filter
              {filterAgents.length > 0 && (
                <span className="filter-count">{filterAgents.length}</span>
              )}
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {showFilters && (
              <div className="agent-filters">
                <span className="filter-label">Filter by agent:</span>
                <div className="filter-chips">
                  {Object.entries(AGENTS_OBJ)
                    .filter(([id]) => id !== 'system')
                    .map(([id, config]) => (
                      <button
                        key={id}
                        className={`filter-chip ${filterAgents.includes(id) ? 'active' : ''}`}
                        onClick={() => toggleAgentFilter(id)}
                        style={filterAgents.includes(id) ? {
                          backgroundColor: `${config.color}20`,
                          borderColor: config.color,
                          color: config.color
                        } : {}}
                      >
                        {config.emoji} {config.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Thread List */}
          <div className="thread-list">
            {filteredThreads.length === 0 ? (
              <div className="no-threads">
                <MessageSquare size={32} />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredThreads.map(thread => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  isActive={activeThread?.id === thread.id}
                  onClick={() => setActiveThread(thread)}
                  unreadCount={0}
                />
              ))
            )}
          </div>
        </div>

        {/* Message Thread View */}
        <div className="message-thread">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="thread-view-header">
                <div className="thread-view-info">
                  <h2>{activeThread.title}</h2>
                  <div className="thread-view-participants">
                    <Users size={14} />
                    {activeThread.participants.map(p => AGENTS[p]?.name || p).join(', ')}
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={exportConversation}>
                  <Download size={14} /> Export
                </button>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {activeThread.messages.map((message, index) => {
                  const prevMessage = activeThread.messages[index - 1];
                  const isConsecutive = prevMessage?.agent === message.agent;
                  
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isConsecutive={isConsecutive}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div className="no-thread-selected">
              <MessageSquare size={48} />
              <p>Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default A2AViewer;
