import { useState } from 'react';
import { 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  CheckSquare,
  ChevronDown,
  ChevronRight,
  FileText,
  Activity
} from 'lucide-react';

const PRIORITY_CONFIG = {
  urgent: { color: '#ef4444', label: 'Urgent', icon: AlertCircle, value: 4 },
  high: { color: '#f59e0b', label: 'High', icon: AlertCircle, value: 3 },
  medium: { color: '#3b82f6', label: 'Medium', icon: Circle, value: 2 },
  low: { color: '#10b981', label: 'Low', icon: CheckCircle2, value: 1 },
};

const AGENT_COLORS = {
  aria: '#9333ea',
  pixel: '#3b82f6',
  curio: '#6366f1',
  scribe: '#10b981',
  flux: '#f59e0b',
  vault: '#ef4444',
};

const API_BASE = 'http://localhost:3001';

export function TaskCard({ task, onClick, isSelected, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const [spec, setSpec] = useState(null);
  const [loadingSpec, setLoadingSpec] = useState(false);
  
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const PriorityIcon = priority.icon;
  const agentColor = AGENT_COLORS[task.agent] || '#6b7280';

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect?.(task.id);
  };

  const handleExpand = async (e) => {
    e.stopPropagation();
    
    if (!expanded && task.spec_file && !spec) {
      setLoadingSpec(true);
      try {
        const res = await fetch(`${API_BASE}/api/task-spec?path=${encodeURIComponent(task.spec_file)}`);
        if (res.ok) {
          const text = await res.text();
          setSpec(text);
        } else {
          setSpec('Failed to load task specification');
        }
      } catch (err) {
        setSpec('Error loading specification');
      } finally {
        setLoadingSpec(false);
      }
    }
    
    setExpanded(!expanded);
  };

  const handleCardClick = () => {
    onClick?.(task);
  };

  return (
    <div 
      className={`task-card ${isSelected ? 'selected' : ''} ${expanded ? 'expanded' : ''}`}
      onClick={handleCardClick}
    >
      {onSelect && (
        <div 
          className={`task-select-checkbox ${isSelected ? 'checked' : ''}`}
          onClick={handleCheckboxClick}
        >
          {isSelected && <CheckSquare size={14} color="white" />}
        </div>
      )}
      
      <div className="task-card-header">
        <div className="task-header-left">
          <span className="task-id">{task.id?.split('-').pop()}</span>
          <span 
            className="task-priority" 
            style={{ backgroundColor: `${priority.color}20`, color: priority.color }}
          >
            <PriorityIcon size={12} /> {priority.label}
          </span>
        </div>
        <button 
          className="task-expand-btn"
          onClick={handleExpand}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {loadingSpec ? (
            <span className="loading-spinner">⟳</span>
          ) : (
            <>
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <FileText size={14} />
            </>
          )}
        </button>
      </div>
      
      <p className="task-description">
        {task.description?.substring(0, 100)}
        {task.description?.length > 100 && '...'}
      </p>
      
      <div className="task-card-footer">
        <div className="task-agent" style={{ color: agentColor }}>
          <User size={12} />
          <span>{task.agent?.toUpperCase()}</span>
        </div>
        <div className="task-time">
          <Clock size={12} />
          <span>{formatTime(task.created_at)}</span>
        </div>
      </div>
      
      {task.timeout && (
        <div className="task-timeout">
          Timeout: {Math.round(task.timeout / 60)}m
        </div>
      )}
      
      {/* Expanded Spec View */}
      {expanded && (
        <div className="task-spec-panel" onClick={(e) => e.stopPropagation()}>
          <div className="task-spec-header">
            <FileText size={14} />
            <span>Task Specification</span>
          </div>
          <div className="task-spec-content">
            {loadingSpec ? (
              <div className="spec-loading">Loading specification...</div>
            ) : (
              <pre>{spec || 'No specification available'}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function KanbanColumn({ title, status, tasks, count, icon: Icon, color, selectedTasks, onTaskSelect }) {
  return (
    <div className="kanban-column">
      <div className="kanban-column-header" style={{ borderBottomColor: color }}>
        <div className="column-title">
          {Icon && <Icon size={16} style={{ color }} />}
          <span>{title}</span>
          <span className="task-count">{count}</span>
        </div>
      </div>
      
      <div className="kanban-column-content">
        {tasks?.length === 0 ? (
          <p className="empty-column">No tasks</p>
        ) : (
          tasks?.map(task => (
            <TaskCard 
              key={task.id} 
              task={task}
              isSelected={selectedTasks?.has(task.id)}
              onSelect={onTaskSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ queues, selectedTasks, onTaskSelect }) {
  const columns = [
    { id: 'pending', title: 'Pending', status: 'pending', icon: Clock, color: '#f59e0b' },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress', icon: Activity, color: '#3b82f6' },
    { id: 'review', title: 'Review', status: 'review', icon: CheckCircle2, color: '#8b5cf6' },
    { id: 'completed', title: 'Completed', status: 'completed', icon: CheckSquare, color: '#10b981' },
    { id: 'failed', title: 'Failed', status: 'failed', icon: AlertCircle, color: '#ef4444' }
  ];

  return (
    <div className="kanban-board">
      {columns.map(column => (
        <KanbanColumn
          key={column.id}
          title={column.title}
          status={column.status}
          tasks={queues?.[column.id] || []}
          count={queues?.[column.id]?.length || 0}
          icon={column.icon}
          color={column.color}
          selectedTasks={selectedTasks}
          onTaskSelect={onTaskSelect}
        />
      ))}
    </div>
  );
}
