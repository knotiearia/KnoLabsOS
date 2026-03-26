import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Cpu, 
  HardDrive, 
  Network, 
  Activity,
  RefreshCw,
  Server,
  Zap
} from 'lucide-react';

// Mock data generator for system metrics
function generateMockMetrics(historyLength = 60) {
  const now = Date.now();
  const cpuHistory = [];
  const memoryHistory = [];
  
  for (let i = historyLength; i >= 0; i--) {
    const time = now - (i * 5000); // 5 second intervals
    cpuHistory.push({
      time: new Date(time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      usage: Math.round(20 + Math.random() * 50 + Math.sin(i / 10) * 15),
      user: Math.round(15 + Math.random() * 30),
      system: Math.round(5 + Math.random() * 20)
    });
    
    memoryHistory.push({
      time: new Date(time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      used: Math.round(4 + Math.random() * 4),
      cached: Math.round(1 + Math.random() * 2),
      free: Math.round(2 + Math.random() * 2)
    });
  }
  
  return {
    cpu: {
      current: cpuHistory[cpuHistory.length - 1].usage,
      history: cpuHistory,
      cores: [
        { name: 'Core 0', usage: Math.round(30 + Math.random() * 40) },
        { name: 'Core 1', usage: Math.round(25 + Math.random() * 45) },
        { name: 'Core 2', usage: Math.round(35 + Math.random() * 35) },
        { name: 'Core 3', usage: Math.round(20 + Math.random() * 50) }
      ]
    },
    memory: {
      total: 16,
      used: memoryHistory[memoryHistory.length - 1].used,
      free: memoryHistory[memoryHistory.length - 1].free,
      cached: memoryHistory[memoryHistory.length - 1].cached,
      history: memoryHistory
    },
    disk: {
      total: 512,
      used: 342,
      free: 170,
      partitions: [
        { name: '/', used: 180, total: 256, color: '#3b82f6' },
        { name: '/home', used: 120, total: 200, color: '#8b5cf6' },
        { name: '/var', used: 42, total: 56, color: '#f59e0b' }
      ]
    },
    network: {
      download: Math.round(1024 + Math.random() * 5120),
      upload: Math.round(256 + Math.random() * 2048),
      history: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        download: Math.round(1024 + Math.random() * 5120),
        upload: Math.round(256 + Math.random() * 2048)
      }))
    }
  };
}

// Custom tooltip for dark theme
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-time">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {entry.value}{entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function SystemMonitor() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch metrics function
  const fetchMetrics = async () => {
    try {
      // In production, this would call /api/system/metrics
      // For now, use mock data
      const data = generateMockMetrics(60); // Last hour (60 * 5 seconds)
      setMetrics(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  // Initial fetch and 5-second interval
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics) {
    return (
      <div className="system-monitor-page">
        <div className="loading-monitor">
          <Activity size={48} className="loading-icon" />
          <p>Loading system metrics...</p>
        </div>
      </div>
    );
  }

  const { cpu, memory, disk, network } = metrics;

  return (
    <div className="system-monitor-page">
      {/* Page Header */}
      <div className="monitor-header">
        <div className="monitor-title">
          <Server size={24} />
          <h1>System Status Monitor</h1>
        </div>
        <div className="monitor-meta">
          {lastUpdate && (
            <span className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button className="btn btn-secondary" onClick={fetchMetrics}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="monitor-stats-grid">
        <div className="monitor-stat-card cpu">
          <div className="stat-icon-wrapper">
            <Cpu size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">CPU Usage</span>
            <span className="stat-value">{cpu.current}%</span>
          </div>
        </div>

        <div className="monitor-stat-card memory">
          <div className="stat-icon-wrapper">
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Memory</span>
            <span className="stat-value">{memory.used.toFixed(1)} GB</span>
          </div>
        </div>

        <div className="monitor-stat-card disk">
          <div className="stat-icon-wrapper">
            <HardDrive size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Disk Used</span>
            <span className="stat-value">{((disk.used / disk.total) * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="monitor-stat-card network">
          <div className="stat-icon-wrapper">
            <Network size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Network I/O</span>
            <span className="stat-value">{(network.download / 1024).toFixed(1)} MB/s</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* CPU Usage History */}
        <div className="chart-card large">
          <div className="chart-header">
            <Cpu size={18} />
            <h3>CPU Usage History (Last Hour)</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={cpu.history}>
                <defs>
                  <linearGradient id="cpuUserGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="cpuSystemGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis 
                  dataKey="time" 
                  stroke="#606070"
                  tick={{ fill: '#606070', fontSize: 11 }}
                  tickLine={false}
                  interval={9}
                />
                <YAxis 
                  stroke="#606070"
                  tick={{ fill: '#606070', fontSize: 11 }}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="circle"
                />
                <Area 
                  type="monotone" 
                  dataKey="user" 
                  name="User"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#cpuUserGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="system" 
                  name="System"
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#cpuSystemGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CPU Cores */}
        <div className="chart-card">
          <div className="chart-header">
            <Cpu size={18} />
            <h3>CPU Cores</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cpu.cores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" horizontal={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  stroke="#606070"
                  tick={{ fill: '#606070', fontSize: 11 }}
                  tickLine={false}
                  unit="%"
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  stroke="#606070"
                  tick={{ fill: '#a0a0b0', fontSize: 12 }}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="usage" 
                  name="Usage"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="chart-card large">
          <div className="chart-header">
            <Zap size={18} />
            <h3>Memory Consumption (Last Hour)</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={memory.history}>
                <defs>
                  <linearGradient id="memUsedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="memCachedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis 
                  dataKey="time" 
                  stroke="#606070"
                  tick={{ fill: '#606070', fontSize: 11 }}
                  tickLine={false}
                  interval={9}
                />
                <YAxis 
                  stroke="#606070"
                  tick={{ fill: '#606070', fontSize: 11 }}
                  tickLine={false}
                  unit=" GB"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="circle"
                />
                <Area 
                  type="monotone" 
                  dataKey="used" 
                  name="Used"
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#memUsedGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="cached" 
                  name="Cached"
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#memCachedGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disk Usage */}
        <div className="chart-card">
          <div className="chart-header">
            <HardDrive size={18} />
            <h3>Disk Usage by Partition</h3>
          </div>
          <div className="chart-content">
            <div className="disk-stats">
              <div className="disk-total">
                <span className="disk-value">{disk.used} GB</span>
                <span className="disk-label">used of {disk.total} GB</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={disk.partitions}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="used"
                  nameKey="name"
                >
                  {disk.partitions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network I/O */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <Network size={18} />
            <h3>Network I/O (KB/s)</h3>
          </div>
          <div className="chart-content">
            <div className="network-current">
              <div className="network-stat">
                <span className="network-label">Download</span>
                <span className="network-value down">{(network.download / 1024).toFixed(1)} MB/s</span>
              </div>
              <div className="network-stat">
                <span className="network-label">Upload</span>
                <span className="network-value up">{(network.upload / 1024).toFixed(1)} MB/s</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={network.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis 
                  dataKey="time" 
                  hide
                />
                <YAxis 
                  stroke="#606070"
                  tick={{ fill: '#606070', fontSize: 11 }}
                  tickLine={false}
                  unit=" KB"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="download" 
                  name="Download"
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="upload" 
                  name="Upload"
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemMonitor;
