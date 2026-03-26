import { useState, useEffect } from 'react';
import { 
  Inbox, 
  Send, 
  Plus,
  X,
  ChevronLeft,
  Calendar,
  Flag,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Reply,
  ArrowRight,
  MessageSquare,
  FileText,
  Bug,
  Sparkles,
  MoreVertical
} from 'lucide-react';

import { AGENTS, getAgentsList } from '../config/agents.config';

const TASK_TYPES = [
  { id: 'feature', label: 'Feature', icon: Sparkles, color: '#3b82f6' },
  { id: 'bug', label: 'Bug Fix', icon: Bug, color: '#ef4444' },
  { id: 'research', label: 'Research', icon: Search, color: '#8b5cf6' },
  { id: 'documentation', label: 'Documentation', icon: FileText, color: '#10b981' }
];

const PRIORITIES = [
  { id: 'low', label: 'Low', color: '#6b7280' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'high', label: 'High', color: '#ef4444' },
  { id: 'urgent', label: 'Urgent', color: '#dc2626' }
];

// Generate mock inbox messages
function generateMockInbox() {
  const now = Date.now();
  return [
    {
      id: 'msg-1',
      from: 'aria',
      to: 'pixel',
      subject: 'Task: Build System Monitor Dashboard',
      content: 'Hi PIXEL, we need a new System Status Monitor page with real-time charts showing CPU, memory, disk, and network usage. Use recharts for visualizations and update every 5 seconds. Dark theme styling required.',
      timestamp: now - 1800000,
      read: true,
      type: 'task',
      priority: 'high',
      thread: [
        { id: 'msg-1-1', from: 'pixel', content: 'On it! I\'ll create the component with all the charts.', timestamp: now - 1700000, read: true }
      ]
    },
    {
      id: 'msg-2',
      from: 'vault',
      to: 'aria',
      subject: 'Security Alert: SSH Configuration',
      content: 'ARIA, I\'ve detected some SSH configurations that need tightening. We should disable root login and enforce key-based authentication across all nodes.',
      timestamp: now - 3600000,
      read: false,
      type: 'alert',
      priority: 'urgent',
      thread: []
    },
    {
      id: 'msg-3',
      from: 'curio',
      to: 'scribe',
      subject: 'Research Report: AI Agent Trends 2026',
      content: 'SCRIBE, I\'ve compiled the research on multi-agent orchestration systems. The findings are ready for your review and formatting into the quarterly report.',
      timestamp: now - 7200000,
      read: false,
      type: 'message',
      priority: 'medium',
      thread: [
        { id: 'msg-3-1', from: 'scribe', content: 'Thanks CURIO! I\'ll start formatting this into a professional document.', timestamp: now - 7000000, read: true },
        { id: 'msg-3-2', from: 'curio', content: 'Let me know if you need any clarifications on the technical sections.', timestamp: now - 6900000, read: false }
      ]
    },
    {
      id: 'msg-4',
      from: 'flux',
      to: 'pixel',
      subject: 'Docker Build Optimization',
      content: 'PIXEL, the frontend builds are taking too long. Can we implement multi-stage builds and layer caching? The current 25s build time is impacting deployment frequency.',
      timestamp: now - 14400000,
      read: true,
      type: 'task',
      priority: 'medium',
      thread: []
    },
    {
      id: 'msg-5',
      from: 'system',
      to: 'aria',
      subject: 'Daily System Report',
      content: 'Daily system health check completed. All agents operational. CPU: 45%, Memory: 6.2GB, Disk: 67%. No critical issues detected.',
      timestamp: now - 86400000,
      read: true,
      type: 'system',
      priority: 'low',
      thread: []
    },
    {
      id: 'msg-6',
      from: 'aria',
      to: 'flux',
      subject: 'Infrastructure Scaling Request',
      content: 'FLUX, we need to scale the ACC infrastructure to handle increased load. Current capacity at 80%. Please evaluate options and implement optimizations where possible.',
      timestamp: now - 172800000,
      read: true,
      type: 'task',
      priority: 'high',
      thread: [
        { id: 'msg-6-1', from: 'flux', content: 'I\'ve identified several optimization opportunities. Will coordinate with PIXEL on database improvements.', timestamp: now - 170000000, read: true },
        { id: 'msg-6-2', from: 'pixel', content: 'Found some N+1 queries in the task queue that we can batch. Should reduce load significantly.', timestamp: now - 168000000, read: true },
        { id: 'msg-6-3', from: 'flux', content: 'Optimizations deployed! Load reduced to 45%.', timestamp: now - 160000000, read: true }
      ]
    }
  ];
}

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

// Message item component
function MessageItem({ message, isActive, onClick }) {
  const sender = AGENTS.find(a => a.id === message.from) || { emoji: '🔧', color: '#6b7280', name: 'SYSTEM' };
  const PriorityIcon = message.priority === 'urgent' ? AlertCircle : 
                       message.priority === 'high' ? Flag :
                       message.priority === 'medium' ? Clock : CheckCircle;
  
  return (
    <div 
      className={`inbox-message-item ${isActive ? 'active' : ''} ${!message.read ? 'unread' : ''}`}
      onClick={onClick}
    >
      <div className="message-sender-avatar" style={{ backgroundColor: `${sender.color}20` }}>
        <span>{sender.emoji}</span>
        {!message.read && <span className="unread-dot" />}
      </div>
      
      <div className="message-preview">
        <div className="message-preview-header">
          <span className="sender-name" style={{ color: sender.color }}>{sender.name}</span>
          <span className="message-time">{formatTime(message.timestamp)}</span>
        </div>
        
        <h4 className="message-subject">{message.subject}</h4>
        
        <p className="message-excerpt">{message.content.substring(0, 80)}...</p>
        
        <div className="message-meta">
          <span className={`message-type ${message.type}`}>{message.type}</span>
          <span className={`message-priority ${message.priority}`}>
            <PriorityIcon size={10} />
            {message.priority}
          </span>
          {message.thread.length > 0 && (
            <span className="thread-count">
              <MessageSquare size={10} />
              {message.thread.length + 1}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Task creation modal
function TaskModal({ isOpen, onClose, onSubmit, defaultAssignee = null }) {
  const [formData, setFormData] = useState({
    agent: defaultAssignee || '',
    type: 'feature',
    title: '',
    description: '',
    priority: 'medium',
    deadline: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({
      agent: defaultAssignee || '',
      type: 'feature',
      title: '',
      description: '',
      priority: 'medium',
      deadline: ''
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Plus size={20} /> Create New Task</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-row">
            <div className="form-group">
              <label><User size={14} /> Assign to Agent</label>
              <select 
                value={formData.agent} 
                onChange={e => setFormData({...formData, agent: e.target.value})}
                required
              >
                <option value="">Select agent...</option>
                {AGENTS.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.emoji} {agent.name} - {agent.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label><Sparkles size={14} /> Task Type</label>
              <div className="task-type-selector">
                {TASK_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      className={`type-option ${formData.type === type.id ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, type: type.id})}
                      style={formData.type === type.id ? {
                        borderColor: type.color,
                        backgroundColor: `${type.color}15`,
                        color: type.color
                      } : {}}
                    >
                      <Icon size={16} />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              placeholder="Enter a clear, concise task title..."
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={4}
              placeholder="Provide detailed description of the task requirements..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Flag size={14} /> Priority</label>
              <div className="priority-selector">
                {PRIORITIES.map(priority => (
                  <button
                    key={priority.id}
                    type="button"
                    className={`priority-option ${formData.priority === priority.id ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, priority: priority.id})}
                    style={formData.priority === priority.id ? {
                      borderColor: priority.color,
                      backgroundColor: `${priority.color}15`,
                      color: priority.color
                    } : {}}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label><Calendar size={14} /> Deadline</label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={16} /> Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function InboxPage({ data }) {
  const [messages, setMessages] = useState([]);
  const [activeMessage, setActiveMessage] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load messages
  useEffect(() => {
    const inboxData = generateMockInbox();
    setMessages(inboxData);
    setIsLoading(false);
  }, []);

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    if (filterType !== 'all' && msg.type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return msg.subject.toLowerCase().includes(query) ||
             msg.content.toLowerCase().includes(query);
    }
    return true;
  });

  // Handle task creation
  const handleCreateTask = async (taskData) => {
    // In production, this would call the ACC API
    console.log('Creating task:', taskData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add success message
    const newMessage = {
      id: `msg-${Date.now()}`,
      from: 'system',
      to: taskData.agent,
      subject: `Task Created: ${taskData.title}`,
      content: `Task successfully assigned to ${AGENTS.find(a => a.id === taskData.agent)?.name}. Priority: ${taskData.priority}`,
      timestamp: Date.now(),
      read: false,
      type: 'system',
      priority: taskData.priority,
      thread: []
    };
    
    setMessages([newMessage, ...messages]);
  };

  // Handle reply
  const handleReply = () => {
    if (!replyText.trim() || !activeMessage) return;
    
    // In production, this would send via ACC API
    console.log('Replying to:', activeMessage.id, 'with:', replyText);
    
    // Add reply to thread
    const updatedMessages = messages.map(msg => {
      if (msg.id === activeMessage.id) {
        return {
          ...msg,
          thread: [...msg.thread, {
            id: `${msg.id}-reply-${Date.now()}`,
            from: 'aria', // Current user
            content: replyText,
            timestamp: Date.now(),
            read: true
          }]
        };
      }
      return msg;
    });
    
    setMessages(updatedMessages);
    setActiveMessage({
      ...activeMessage,
      thread: [...activeMessage.thread, {
        id: `${activeMessage.id}-reply-${Date.now()}`,
        from: 'aria',
        content: replyText,
        timestamp: Date.now(),
        read: true
      }]
    });
    setReplyText('');
  };

  // Mark as read
  useEffect(() => {
    if (activeMessage && !activeMessage.read) {
      const updatedMessages = messages.map(msg => 
        msg.id === activeMessage.id ? { ...msg, read: true } : msg
      );
      setMessages(updatedMessages);
      setActiveMessage({ ...activeMessage, read: true });
    }
  }, [activeMessage]);

  if (isLoading) {
    return (
      <div className="inbox-page">
        <div className="loading-inbox">
          <Inbox size={48} className="loading-icon" />
          <p>Loading inbox...</p>
        </div>
      </div>
    );
  }

  const activeSender = AGENTS.find(a => a.id === activeMessage?.from) || { emoji: '🔧', color: '#6b7280', name: 'SYSTEM' };

  return (
    <div className="inbox-page">
      {/* Header */}
      <div className="inbox-header">
        <div className="inbox-title">
          <Inbox size={24} />
          <h1>Inbox</h1>
          <span className="inbox-count">{messages.filter(m => !m.read).length} unread</span>
        </div>
        <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)}>
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="inbox-layout">
        {/* Left Panel - Message List */}
        <div className="inbox-sidebar">
          {/* Filters */}
          <div className="inbox-filters">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-tabs">
              {[
                { id: 'all', label: 'All' },
                { id: 'task', label: 'Tasks' },
                { id: 'alert', label: 'Alerts' },
                { id: 'message', label: 'Messages' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`filter-tab ${filterType === tab.id ? 'active' : ''}`}
                  onClick={() => setFilterType(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          <div className="message-list">
            {filteredMessages.length === 0 ? (
              <div className="no-messages">
                <Inbox size={32} />
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map(message => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isActive={activeMessage?.id === message.id}
                  onClick={() => setActiveMessage(message)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Message Detail */}
        <div className="message-detail">
          {activeMessage ? (
            <>
              <div className="detail-header">
                <div className="detail-sender">
                  <div 
                    className="detail-avatar"
                    style={{ backgroundColor: `${activeSender.color}20` }}
                  >
                    <span>{activeSender.emoji}</span>
                  </div>
                  <div className="detail-sender-info">
                    <span className="detail-sender-name" style={{ color: activeSender.color }}>
                      {activeSender.name}
                    </span>
                    <span className="detail-to">to {AGENTS.find(a => a.id === activeMessage.to)?.name || 'You'}</span>
                  </div>
                </div>
                <span className="detail-time">
                  {new Date(activeMessage.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="detail-content">
                <h2>{activeMessage.subject}</h2>
                <div className="detail-badges">
                  <span className={`badge type-${activeMessage.type}`}>{activeMessage.type}</span>
                  <span className={`badge priority-${activeMessage.priority}`}>
                    <Flag size={10} /> {activeMessage.priority}
                  </span>
                </div>
                <p className="detail-body">{activeMessage.content}</p>
              </div>

              {/* Thread Messages */}
              {activeMessage.thread.length > 0 && (
                <div className="thread-messages">
                  <h3>Thread ({activeMessage.thread.length} replies)</h3>
                  {activeMessage.thread.map(reply => {
                    const replySender = AGENTS.find(a => a.id === reply.from) || { emoji: '🔧', color: '#6b7280', name: 'SYSTEM' };
                    return (
                      <div key={reply.id} className="thread-reply">
                        <div className="reply-header">
                          <span style={{ color: replySender.color }}>{replySender.emoji} {replySender.name}</span>
                          <span className="reply-time">{formatTime(reply.timestamp)}</span>
                        </div>
                        <p>{reply.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Reply Area */}
              <div className="reply-area">
                <textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
                <div className="reply-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setIsTaskModalOpen(true)}
                  >
                    <ArrowRight size={14} /> Assign Task
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                  >
                    <Reply size={14} /> Reply
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-message-selected">
              <Inbox size={48} />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        defaultAssignee={activeMessage?.from !== 'system' ? activeMessage?.from : null}
      />
    </div>
  );
}

export default InboxPage;
