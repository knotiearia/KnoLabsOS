// API module for reading ACC (Agent Control Center) data from live API
const API_BASE = 'http://100.76.226.43:3001/api';

/**
 * Fetch agent registry data from live API
 */
export async function fetchAgentRegistry() {
  try {
    const response = await fetch(`${API_BASE}/agents`);
    if (!response.ok) throw new Error('Failed to fetch agent registry');
    const data = await response.json();
    // API returns { agents: {...} }, we need to match old format
    return data;
  } catch (error) {
    console.error('Error fetching agent registry:', error);
    return null;
  }
}

/**
 * Fetch task queue data from live API
 */
export async function fetchTaskQueue() {
  try {
    const response = await fetch(`${API_BASE}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch task queue');
    const data = await response.json();
    // API returns { queues: {...}, timestamp: ... }
    // Map to expected format
    return {
      queues: data.queues || {},
      routing_rules: data.routing_rules || {},
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Error fetching task queue:', error);
    return null;
  }
}

/**
 * Fetch alerts from API (fallback to static if API not available)
 */
export async function fetchAlerts() {
  try {
    // Try API first
    const response = await fetch(`${API_BASE}/alerts`);
    if (response.ok) {
      const data = await response.json();
      return data.alerts || [];
    }
  } catch (error) {
    console.warn('API alerts not available, falling back to static');
  }
  
  // Fallback to static alerts.md
  try {
    const response = await fetch(`${API_BASE}/alerts`);
    if (!response.ok) return [];
    const text = await response.text();
    // Parse simple markdown alerts
    const alerts = [];
    const lines = text.split('\n');
    let currentAlert = null;
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentAlert) alerts.push(currentAlert);
        currentAlert = {
          title: line.replace('## ', '').trim(),
          content: [],
          severity: 'info'
        };
        // Check for severity indicators
        if (line.includes('🔴') || line.toLowerCase().includes('critical')) {
          currentAlert.severity = 'critical';
        } else if (line.includes('🟡') || line.toLowerCase().includes('warning')) {
          currentAlert.severity = 'warning';
        }
      } else if (currentAlert && line.trim()) {
        currentAlert.content.push(line.trim());
      }
    }
    if (currentAlert) alerts.push(currentAlert);
    return alerts;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

/**
 * Fetch all ACC data at once
 */
export async function fetchAllACCData() {
  const [registry, tasks, alerts] = await Promise.all([
    fetchAgentRegistry(),
    fetchTaskQueue(),
    fetchAlerts()
  ]);
  
  return {
    registry,
    tasks,
    alerts,
    lastUpdated: new Date().toISOString()
  };
}
