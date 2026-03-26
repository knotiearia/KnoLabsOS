import { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network, 
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api/system/metrics';
const UPDATE_INTERVAL = 5000; // 5 seconds

export function SystemMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch metrics');
        
        const data = await response.json();
        setMetrics(data.current);
        
        // Format history for charts
        const formattedHistory = data.history.map((point, index) => {
          const prevPoint = index > 0 ? data.history[index - 1] : point;
          return {
            time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit',
              hour12: false 
            }),
            cpu: point.cpu.usage,
            memory: point.memory.usage,
            disk: point.disk.usage,
            networkRx: point.network.rx,
            networkTx: point.network.tx,
            networkRxRate: Math.max(0, (point.network.rx - prevPoint.network.rx) / 5),
            networkTxRate: Math.max(0, (point.network.tx - prevPoint.network.tx) / 5)
          };
        });
        
        setHistory(formattedHistory);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchMetrics();
    
    // Set up interval
    const interval = setInterval(fetchMetrics, UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="system-metrics-loading">Loading system metrics...</div>;
  }

  if (error) {
    return (
      <div className="system-metrics-error">
        <Activity size={24} />
        <p>Failed to load metrics: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const current = metrics || {};
  const latestHistory = history[history.length - 1] || {};

  // Calculate trends (compare with 1 minute ago)
  const oneMinuteAgo = history[Math.max(0, history.length - 12)];
  const cpuTrend = oneMinuteAgo ? latestHistory.cpu - oneMinuteAgo.cpu : 0;
  const memTrend = oneMinuteAgo ? latestHistory.memory - oneMinuteAgo.memory : 0;

  return (
    <div className="system-metrics">
      <div className="metrics-header">
        <h2><Activity size={20} /> System Monitor</h2>
        <span className="update-indicator">
          <span className="live-dot" /> Live
        </span>
      </div>

      {/* Current Stats Cards */}
      <div className="metrics-cards">
        <div className="metric-card cpu">
          <div className="metric-icon">
            <Cpu size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">CPU Usage</span>
            <span className="metric-value">{latestHistory.cpu || 0}%</span>
            {cpuTrend !== 0 && (
              <span className={`metric-trend ${cpuTrend > 0 ? 'up' : 'down'}`}>
                {cpuTrend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(cpuTrend).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <div className="metric-card memory">
          <div className="metric-icon">
            <MemoryStick size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Memory</span>
            <span className="metric-value">{latestHistory.memory || 0}%</span>
            <span className="metric-detail">
              {current.memory?.used || 0} MB / {current.memory?.total || 0} MB
            </span>
            {memTrend !== 0 && (
              <span className={`metric-trend ${memTrend > 0 ? 'up' : 'down'}`}>
                {memTrend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(memTrend).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <div className="metric-card disk">
          <div className="metric-icon">
            <HardDrive size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Disk</span>
            <span className="metric-value">{latestHistory.disk || 0}%</span>
            <span className="metric-detail">
              {current.disk?.used || 0} / {current.disk?.total || 0}
            </span>
          </div>
        </div>

        <div className="metric-card network">
          <div className="metric-icon">
            <Network size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Network I/O</span>
            <div className="network-rates">
              <span className="network-rate down">
                <ArrowDown size={10} /> {(latestHistory.networkRxRate || 0).toFixed(1)} KB/s
              </span>
              <span className="network-rate up">
                <ArrowUp size={10} /> {(latestHistory.networkTxRate || 0).toFixed(1)} KB/s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="metrics-charts">
        {/* CPU Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <Cpu size={16} />
            <h3>CPU History (Last Hour)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="time" 
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }}
                formatter={(value) => [`${value}%`, 'CPU']}
              />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#cpuGradient)" 
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Memory Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <MemoryStick size={16} />
            <h3>Memory Usage</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="time" 
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }}
                formatter={(value) => [`${value}%`, 'Memory']}
              />
              <Area 
                type="monotone" 
                dataKey="memory" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#memoryGradient)" 
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Disk Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <HardDrive size={16} />
            <h3>Disk Usage</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="diskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="time" 
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }}
                formatter={(value) => [`${value}%`, 'Disk']}
              />
              <Area 
                type="monotone" 
                dataKey="disk" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#diskGradient)" 
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Network Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <Network size={16} />
            <h3>Network I/O</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="time" 
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                unit=" KB/s"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }}
                formatter={(value, name) => {
                  const label = name === 'networkRxRate' ? 'Download' : 'Upload';
                  return [`${value.toFixed(1)} KB/s`, label];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => value === 'networkRxRate' ? 'Download' : 'Upload'}
              />
              <Line 
                type="monotone" 
                dataKey="networkRxRate" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                animationDuration={300}
              />
              <Line 
                type="monotone" 
                dataKey="networkTxRate" 
                stroke="#ec4899" 
                strokeWidth={2}
                dot={false}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default SystemMetrics;
