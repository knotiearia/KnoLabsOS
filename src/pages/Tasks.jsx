import { useState, useMemo } from 'react';
import { 
  Plus, 
  Filter, 
  RefreshCw, 
  Flag,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowUpDown,
  MoreHorizontal,
  CheckSquare,
  X
} from 'lucide-react';
import { getAgentsList } from '../config/agents.config';
import { KanbanBoard } from '../components/TaskCard.jsx';

const PRIORITY_CONFIG = {
  urgent: { color: '#ef4444', label: 'Urgent', icon: AlertCircle, value: 4 },
  high: { color: '#f59e0b', label: 'High', icon: AlertCircle, value: 3 },
  medium: { color: '#3b82f6', label: 'Medium', icon: Circle, value: 2 },
  low: { color: '#10b981', label: 'Low', icon: CheckCircle2, value: 1 },
};

const SORT_OPTIONS = [
  { id: 'priority', label: 'Priority', icon: Flag },
  { id: 'created', label: 'Created Date', icon: Clock },
  { id: 'agent', label: 'Agent', icon: User },
];

export function Tasks({ data, onRefresh }) {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [filterAgent, setFilterAgent] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  
  // New task form state
  const [newTaskForm, setNewTaskForm] = useState({
    agent: 'pixel',
    type: 'coding',
    priority: 'medium',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  if (!data?.tasks) {
    return <div className="loading">Loading tasks...</div>;
  }

  const { queues, routing_rules } = data.tasks;

  // Get all unique task types from routing rules
  const taskTypes = Object.keys(routing_rules || {});

  // Get all tasks for counting
  const allTasks = useMemo(() => {
    return [
      ...(queues?.pending || []),
      ...(queues?.in_progress || []),
      ...(queues?.review || []),
      ...(queues?.completed || []),
      ...(queues?.failed || []),
    ];
  }, [queues]);

  // Count tasks by priority
  const priorityCounts = useMemo(() => {
    const counts = { urgent: 0, high: 0, medium: 0, low: 0 };
    allTasks.forEach(task => {
      if (task.priority && counts[task.priority] !== undefined) {
        counts[task.priority]++;
      } else {
        counts.medium++;
      }
    });
    return counts;
  }, [allTasks]);

  // Sort function
  const sortTasks = (taskList) => {
    if (!taskList) return [];
    
    return [...taskList].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'priority':
          const priorityA = PRIORITY_CONFIG[a.priority]?.value || 0;
          const priorityB = PRIORITY_CONFIG[b.priority]?.value || 0;
          comparison = priorityA - priorityB;
          break;
        case 'created':
          comparison = (a.created_at || 0) - (b.created_at || 0);
          break;
        case 'agent':
          comparison = (a.agent || '').localeCompare(b.agent || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  // Filter and sort tasks
  const filterAndSortTasks = (taskList) => {
    if (!taskList) return [];
    
    let filtered = taskList.filter(task => {
      if (filterAgent && task.agent !== filterAgent) return false;
      if (filterType && task.type !== filterType) return false;
      if (filterPriority && task.priority !== filterPriority) return false;
      return true;
    });
    
    return sortTasks(filtered);
  };

  const filteredQueues = {
    pending: filterAndSortTasks(queues?.pending),
    in_progress: filterAndSortTasks(queues?.in_progress),
    review: filterAndSortTasks(queues?.review),
    completed: filterAndSortTasks(queues?.completed),
    failed: filterAndSortTasks(queues?.failed),
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
    setShowBatchActions(newSelected.size > 0);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedTasks(new Set());
    setShowBatchActions(false);
  };

  // Batch update priority
  const batchUpdatePriority = (priority) => {
    console.log('Batch updating priority:', priority, 'for tasks:', Array.from(selectedTasks));
    // In production: call API to update priorities
    // await fetch('/api/tasks/batch-update', {
    //   method: 'POST',
    //   body: JSON.stringify({ taskIds: Array.from(selectedTasks), priority })
    // });
    clearSelection();
    setShowPriorityDropdown(false);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterAgent('');
    setFilterType('');
    setFilterPriority('');
  };

  // New task form handlers
  const handleFormChange = (field, value) => {
    setNewTaskForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newTaskForm.agent) {
      errors.agent = 'Please select an agent';
    }
    if (!newTaskForm.type) {
      errors.type = 'Please select a task type';
    }
    if (!newTaskForm.description || newTaskForm.description.trim() === '') {
      errors.description = 'Description is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTask = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitMessage(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/tasks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaskForm)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create task');
      }
      
      // Show success message
      setSubmitMessage({
        type: 'success',
        text: `Task ${result.taskId} created successfully!`
      });
      
      // Reset form
      setNewTaskForm({
        agent: 'pixel',
        type: 'coding',
        priority: 'medium',
        description: ''
      });
      
      // Refresh task list
      if (onRefresh) {
        await onRefresh();
      }
      
      // Close modal after short delay
      setTimeout(() => {
        setShowNewTaskModal(false);
        setSubmitMessage(null);
      }, 1500);
      
    } catch (err) {
      console.error('Error creating task:', err);
      setSubmitMessage({
        type: 'error',
        text: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowNewTaskModal(false);
    setFormErrors({});
    setSubmitMessage(null);
    setNewTaskForm({
      agent: 'pixel',
      type: 'coding',
      priority: 'medium',
      description: ''
    });
  };

  const hasActiveFilters = filterAgent || filterType || filterPriority;

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>📋 Task Management</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onRefresh}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewTaskModal(true)}
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Priority Filter Bar */}
      <div className="priority-filter-bar">
        <div className="priority-filters">
          <button
            className={`priority-filter-btn ${filterPriority === '' ? 'active' : ''}`}
            onClick={() => setFilterPriority('')}
          >
            <span className="priority-dot all" />
            All Tasks
            <span className="priority-count">{allTasks.length}</span>
          </button>
          
          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                className={`priority-filter-btn ${filterPriority === key ? 'active' : ''}`}
                onClick={() => setFilterPriority(filterPriority === key ? '' : key)}
                style={filterPriority === key ? {
                  backgroundColor: `${config.color}20`,
                  borderColor: config.color,
                  color: config.color
                } : {}}
              >
                <Icon size={14} style={{ color: config.color }} />
                {config.label}
                <span 
                  className="priority-count"
                  style={filterPriority === key ? { backgroundColor: config.color, color: 'white' } : {}}
                >
                  {priorityCounts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters & Sorting Bar */}
      <div className="filters-bar">
        <div className="filter-group">
          <Filter size={16} className="filter-icon" />
          <select 
            value={filterAgent} 
            onChange={(e) => setFilterAgent(e.target.value)}
            className="filter-select"
          >
            <option value="">All Agents</option>
            {getAgentsList().map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            {taskTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          {hasActiveFilters && (
            <button 
              className="btn btn-ghost"
              onClick={clearAllFilters}
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        <div className="sort-controls">
          <span className="sort-label">Sort by:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="priority">Priority</option>
            <option value="created">Created Date</option>
            <option value="agent">Agent</option>
          </select>
          <button 
            className="btn btn-ghost sort-order-btn"
            onClick={toggleSortOrder}
            title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
          >
            <ArrowUpDown size={14} className={sortOrder === 'asc' ? 'asc' : 'desc'} />
          </button>
        </div>

        <div className="task-stats-summary">
          <span>{queues?.pending?.length || 0} pending</span>
          <span>{queues?.in_progress?.length || 0} in progress</span>
          <span>{queues?.completed?.length || 0} completed</span>
        </div>
      </div>

      {/* Batch Actions Bar */}
      {showBatchActions && (
        <div className="batch-actions-bar">
          <div className="batch-info">
            <CheckSquare size={18} />
            <span>{selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected</span>
          </div>
          <div className="batch-actions">
            <div className="priority-dropdown-wrapper">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
              >
                <Flag size={14} /> Set Priority
              </button>
              
              {showPriorityDropdown && (
                <div className="priority-dropdown">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        className="priority-option"
                        onClick={() => batchUpdatePriority(key)}
                      >
                        <Icon size={14} style={{ color: config.color }} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <button className="btn btn-ghost" onClick={clearSelection}>
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <KanbanBoard 
        queues={filteredQueues} 
        selectedTasks={selectedTasks}
        onTaskSelect={toggleTaskSelection}
      />

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button onClick={handleCloseModal} className="btn-close">×</button>
            </div>
            
            <div className="modal-body">
              {submitMessage && (
                <div className={`alert alert-${submitMessage.type}`}>
                  {submitMessage.type === 'success' ? '✓ ' : '✗ '}
                  {submitMessage.text}
                </div>
              )}
              
              <div className="form-group">
                <label>Agent <span className="required">*</span></label>
                <select 
                  className={`form-control ${formErrors.agent ? 'error' : ''}`}
                  value={newTaskForm.agent}
                  onChange={(e) => handleFormChange('agent', e.target.value)}
                >
                  <option value="">Select an agent...</option>
                  {getAgentsList().map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.emoji} {agent.name} ({agent.role})</option>
                  ))}
                </select>
                {formErrors.agent && <span className="error-text">{formErrors.agent}</span>}
              </div>
              
              <div className="form-group">
                <label>Priority</label>
                <div className="priority-selector-modal">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button 
                        key={key} 
                        className={`priority-btn-modal ${newTaskForm.priority === key ? 'active' : ''}`}
                        type="button"
                        onClick={() => handleFormChange('priority', key)}
                        style={newTaskForm.priority === key ? {
                          borderColor: config.color,
                          backgroundColor: `${config.color}20`
                        } : {}}
                      >
                        <Icon size={14} style={{ color: config.color }} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="form-group">
                <label>Type <span className="required">*</span></label>
                <select 
                  className={`form-control ${formErrors.type ? 'error' : ''}`}
                  value={newTaskForm.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  <option value="">Select a type...</option>
                  <option value="coding">coding</option>
                  <option value="research">research</option>
                  <option value="content">content</option>
                  <option value="infrastructure">infrastructure</option>
                  <option value="security_audit">security_audit</option>
                </select>
                {formErrors.type && <span className="error-text">{formErrors.type}</span>}
              </div>
              
              <div className="form-group">
                <label>Description <span className="required">*</span></label>
                <textarea 
                  className={`form-control ${formErrors.description ? 'error' : ''}`}
                  rows="3"
                  placeholder="Describe the task..."
                  value={newTaskForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateTask}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Import missing icon
import { Clock, User } from 'lucide-react';

export default Tasks;
