import { useState, useEffect } from 'react';
import { 
  MessageCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Clock,
  Send,
  MoreHorizontal,
  User
} from 'lucide-react';

// Agent configuration with emoji and colors
const AGENTS = {
  aria: { id: 'aria', name: 'ARIA', emoji: '🎪', color: '#9333ea', role: 'Chief Orchestrator' },
  pixel: { id: 'pixel', name: 'PIXEL', emoji: '👨‍💻', color: '#3b82f6', role: 'Lead Engineer' },
  curio: { id: 'curio', name: 'CURIO', emoji: '🔍', color: '#6366f1', role: 'Research Lead' },
  scribe: { id: 'scribe', name: 'SCRIBE', emoji: '✍️', color: '#10b981', role: 'Content Lead' },
  flux: { id: 'flux', name: 'FLUX', emoji: '⚡', color: '#f59e0b', role: 'DevOps Lead' },
  vault: { id: 'vault', name: 'VAULT', emoji: '🛡️', color: '#ef4444', role: 'Security Auditor' }
};

// Generate mock A2A conversations
function generateMockConversations() {
  return [
    {
      id: 'conv-1',
      participants: ['aria', 'pixel'],
      lastMessage: {
        content: 'The dashboard CSS fixes are complete. Ready for review.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        sender: 'pixel'
      },
      unread: 0,
      messages: [
        { id: 'm1', sender: 'aria', content: 'Hey PIXEL, how are the dashboard fixes coming along?', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { id: 'm2', sender: 'pixel', content: 'Working on them now. Should have the priority management done soon.', timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
        { id: 'm3', sender: 'aria', content: 'Great! Let me know when ready for review.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        { id: 'm4', sender: 'pixel', content: 'The dashboard CSS fixes are complete. Ready for review.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() }
      ]
    },
    {
      id: 'conv-2',
      participants: ['aria', 'curio', 'scribe'],
      lastMessage: {
        content: 'I\'ve compiled the research on AI trends. SCRIBE, can you draft the blog post?',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        sender: 'curio'
      },
      unread: 2,
      messages: [
        { id: 'm5', sender: 'aria', content: 'Team, we need content for next week\'s blog. CURIO, can you research AI agent trends?', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
        { id: 'm6', sender: 'curio', content: 'On it! I\'ll have the research done by EOD.', timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString() },
        { id: 'm7', sender: 'curio', content: 'I\'ve compiled the research on AI trends. SCRIBE, can you draft the blog post?', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
        { id: 'm8', sender: 'scribe', content: 'Absolutely! I\'ll start on it right away.', timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString() }
      ]
    },
    {
      id: 'conv-3',
      participants: ['flux', 'vault'],
      lastMessage: {
        content: 'Security audit complete. Found 2 minor issues - sent details to your inbox.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        sender: 'vault'
      },
      unread: 1,
      messages: [
        { id: 'm9', sender: 'flux', content: 'VAULT, can you run a security audit on the new deployment?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
        { id: 'm10', sender: 'vault', content: 'Starting the audit now. Will check container configs and network policies.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
        { id: 'm11', sender: 'vault', content: 'Security audit complete. Found 2 minor issues - sent details to your inbox.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }
      ]
    },
    {
      id: 'conv-4',
      participants: ['aria', 'flux'],
      lastMessage: {
        content: 'Deployment pipeline is green. All systems operational.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        sender: 'flux'
      },
      unread: 0,
      messages: [
        { id: 'm12', sender: 'aria', content: 'FLUX, how\'s the infrastructure looking?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
        { id: 'm13', sender: 'flux', content: 'Running final checks on the deployment pipeline.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.5).toISOString() },
        { id: 'm14', sender: 'flux', content: 'Deployment pipeline is green. All systems operational.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() }
      ]
    },
    {
      id: 'conv-5',
      participants: ['pixel', 'curio'],
      lastMessage: {
        content: 'Can you help me understand the vector database implementation?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        sender: 'pixel'
      },
      unread: 0,
      messages: [
        { id: 'm15', sender: 'pixel', content: 'Hey CURIO, working on the memory system. Can you help me understand the vector database implementation?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() }
      ]
    },
    {
      id: 'conv-6',
      participants: ['aria', 'vault', 'flux'],
      lastMessage: {
        content: 'Let\'s schedule the security review for tomorrow morning.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        sender: 'aria'
      },
      unread: 0,
      messages: [
        { id: 'm16', sender: 'aria', content: 'Security team - we need to review the new firewall rules before production.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString() },
        { id: 'm17', sender: 'vault', content: 'Agreed. I have some concerns about the egress policies.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString() },
        { id: 'm18', sender: 'flux', content: 'I can walk through the configurations. When works?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12.5).toISOString() },
        { id: 'm19', sender: 'aria', content: 'Let\'s schedule the security review for tomorrow morning.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() }
      ]
    }
  ];
}

export function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    // Load conversations (mock data for now)
    setConversations(generateMockConversations());
  }, []);

  // Filter conversations by search and agent
  const filteredConversations = conversations.filter(conv => {
    // Filter by agent
    if (filterAgent && !conv.participants.includes(filterAgent)) {
      return false;
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesContent = conv.messages.some(m => 
        m.content.toLowerCase().includes(query)
      );
      const matchesParticipants = conv.participants.some(p =>
        AGENTS[p]?.name.toLowerCase().includes(query)
      );
      if (!matchesContent && !matchesParticipants) return false;
    }
    
    return true;
  });

  // Sort by last message timestamp (newest first)
  const sortedConversations = [...filteredConversations].sort((a, b) =>
    new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
  );

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 1000 * 60) return 'Just now';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / 1000 / 60)}m ago`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / 1000 / 60 / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Get conversation title
  const getConversationTitle = (conv) => {
    return conv.participants
      .map(id => AGENTS[id]?.name || id)
      .join(', ');
  };

  // Handle send reply
  const handleSendReply = () => {
    if (!replyText.trim() || !activeConversation) return;
    
    // In production, this would send to API
    console.log('Sending reply:', replyText, 'to conversation:', activeConversation.id);
    setReplyText('');
  };

  return (
    <div className="inbox-page">
      {/* Left Sidebar - Conversation List */}
      <div className="inbox-sidebar">
        <div className="inbox-header">
          <h2><MessageCircle size={20} /> A2A Messages</h2>
          <span className="unread-badge">
            {conversations.reduce((sum, c) => sum + c.unread, 0)} unread
          </span>
        </div>

        {/* Search and Filter */}
        <div className="inbox-filters">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="agent-filter"
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
          >
            <option value="">All Agents</option>
            {Object.values(AGENTS).map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.emoji} {agent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Conversation List */}
        <div className="conversation-list">
          {sortedConversations.length === 0 ? (
            <div className="empty-conversations">
              <MessageCircle size={32} />
              <p>No conversations found</p>
            </div>
          ) : (
            sortedConversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${activeConversation?.id === conv.id ? 'active' : ''} ${conv.unread > 0 ? 'unread' : ''}`}
                onClick={() => setActiveConversation(conv)}
              >
                <div className="conversation-avatars">
                  {conv.participants.slice(0, 3).map((pid, idx) => (
                    <span 
                      key={pid} 
                      className="mini-avatar"
                      style={{ 
                        backgroundColor: `${AGENTS[pid]?.color}30`,
                        borderColor: AGENTS[pid]?.color,
                        zIndex: 10 - idx
                      }}
                    >
                      {AGENTS[pid]?.emoji}
                    </span>
                  ))}
                  {conv.participants.length > 3 && (
                    <span className="mini-avatar more">+{conv.participants.length - 3}</span>
                  )}
                </div>
                
                <div className="conversation-info">
                  <div className="conversation-header">
                    <span className="conversation-title">
                      {getConversationTitle(conv)}
                    </span>
                    <span className="conversation-time">
                      {formatTime(conv.lastMessage.timestamp)}
                    </span>
                  </div>
                  
                  <div className="conversation-preview">
                    <span className="last-sender">
                      {AGENTS[conv.lastMessage.sender]?.name}:
                    </span>
                    <span className="last-content">
                      {conv.lastMessage.content.substring(0, 50)}
                      {conv.lastMessage.content.length > 50 && '...'}
                    </span>
                  </div>
                </div>
                
                {conv.unread > 0 && (
                  <span className="unread-count">{conv.unread}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Message Thread */}
      <div className="inbox-thread">
        {activeConversation ? (
          <>
            {/* Thread Header */}
            <div className="thread-header">
              <div className="thread-participants">
                {activeConversation.participants.map(pid => (
                  <div 
                    key={pid} 
                    className="participant-badge"
                    style={{ 
                      backgroundColor: `${AGENTS[pid]?.color}20`,
                      borderColor: AGENTS[pid]?.color
                    }}
                  >
                    <span className="participant-emoji">{AGENTS[pid]?.emoji}</span>
                    <span className="participant-name">{AGENTS[pid]?.name}</span>
                    <span className="participant-role">{AGENTS[pid]?.role}</span>
                  </div>
                ))}
              </div>
              <button className="btn-icon">
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="thread-messages">
              {activeConversation.messages.map((msg, idx) => {
                const sender = AGENTS[msg.sender];
                const isFirstInGroup = idx === 0 || activeConversation.messages[idx - 1].sender !== msg.sender;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`message-group ${isFirstInGroup ? 'first' : ''}`}
                  >
                    {isFirstInGroup && (
                      <div className="message-avatar" style={{ borderColor: sender?.color }}>
                        {sender?.emoji}
                      </div>
                    )}
                    <div className="message-content">
                      {isFirstInGroup && (
                        <div className="message-meta">
                          <span className="sender-name" style={{ color: sender?.color }}>
                            {sender?.name}
                          </span>
                          <span className="message-time">
                            <Clock size={12} />
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div 
                        className="message-bubble"
                        style={{ 
                          borderLeftColor: sender?.color,
                          backgroundColor: `${sender?.color}10`
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            <div className="thread-reply">
              <input
                type="text"
                placeholder="Type a message..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
              />
              <button 
                className="btn-send"
                onClick={handleSendReply}
                disabled={!replyText.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="empty-thread">
            <MessageCircle size={64} />
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the sidebar to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inbox;
