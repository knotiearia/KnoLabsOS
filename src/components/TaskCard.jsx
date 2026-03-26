import { Clock, User, AlertCircle, CheckCircle2, Circle, Eye, CheckSquare } from 'lucide-react';

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

export function TaskCard({ task, onClick, isSelected, onSelect }) {
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

  return (
    <div 
      className={`task-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
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
        <span className="task-id">{task.id?.split('-').pop()}</span>
        <span 
          className="task-priority" 
          style={{ backgroundColor: `${priority.color}20`, color: priority.color }}
        >
          <PriorityIcon size={12} /> {priority.label}
        </span>
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
        {tasks.length === 0 ? (
          <div className="empty-column">
            <p>No {status} tasks</p>
          </div>
        ) : (
          tasks.map(task => (
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
  if (!queues) return <div className="loading">Loading tasks...</div>;

  const columns = [
    { 
      id: 'pending', 
      title: 'Pending', 
      status: 'pending',
      icon: Circle,
      color: '#f59e0b',
      tasks: queues.pending || []
    },
    { 
      id: 'in_progress', 
      title: 'In Progress', 
      status: 'in-progress',
      icon: Clock,
      color: '#3b82f6',
      tasks: queues.in_progress || []
    },
    { 
      id: 'review', 
      title: 'Review', 
      status: 'review',
      icon: Eye,
      color: '#8b5cf6',
      tasks: queues.review || []
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      status: 'completed',
      icon: CheckCircle2,
      color: '#10b981',
      tasks: queues.completed || []
    },
  ];

  return (
    <div className="kanban-board">
      {columns.map(column => (
        <KanbanColumn
          key={column.id}
          title={column.title}
          status={column.status}
          tasks={column.tasks}
          count={column.tasks.length}
          icon={column.icon}
          color={column.color}
          selectedTasks={selectedTasks}
          onTaskSelect={onTaskSelect}
        />
      ))}
    </div>
  );
}
