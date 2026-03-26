import { useState, useEffect, useCallback } from 'react';
import { fetchAllACCData } from '../api/acc.js';

const REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Hook for fetching and auto-refreshing ACC data
 */
export function useACCData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const accData = await fetchAllACCData();
      setData(accData);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('ACC data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    refresh();

    // Set up auto-refresh interval
    const intervalId = setInterval(refresh, REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [refresh]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh
  };
}

/**
 * Hook for agent-specific data
 */
export function useAgentData(agentId) {
  const { data, loading, error, refresh } = useACCData();
  
  const agent = data?.registry?.agents?.[agentId] || null;
  
  return {
    agent,
    loading,
    error,
    refresh
  };
}

/**
 * Hook for task queue data
 */
export function useTaskQueue() {
  const { data, loading, error, refresh } = useACCData();
  
  return {
    queue: data?.tasks?.queues || null,
    templates: data?.tasks?.task_templates || null,
    routingRules: data?.tasks?.routing_rules || null,
    loading,
    error,
    refresh
  };
}
