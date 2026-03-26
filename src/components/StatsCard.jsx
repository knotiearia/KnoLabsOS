import { Activity, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export function StatsCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const colorClasses = {
    blue: 'border-l-blue-500 text-blue-400',
    green: 'border-l-green-500 text-green-400',
    amber: 'border-l-amber-500 text-amber-400',
    purple: 'border-l-purple-500 text-purple-400',
    red: 'border-l-red-500 text-red-400',
  };

  return (
    <div className={`stat-card border-l-4 ${colorClasses[color] || colorClasses.blue}`}>
      <div className="stat-header">
        <span className="stat-label">{title}</span>
        {Icon && <Icon size={18} className="stat-icon" />}
      </div>
      <div className="stat-value">
        {value}
        {trend && (
          <span className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
}

export function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  const severityConfig = {
    critical: { icon: AlertTriangle, className: 'alert-critical' },
    warning: { icon: AlertCircle, className: 'alert-warning' },
    info: { icon: Info, className: 'alert-info' },
  };

  return (
    <div className="alert-banner-container">
      {alerts.map((alert, index) => {
        const config = severityConfig[alert.severity] || severityConfig.info;
        const Icon = config.icon;
        
        return (
          <div key={index} className={`alert-banner ${config.className}`}>
            <Icon size={20} />
            <div className="alert-content">
              <strong>{alert.title}</strong>
              {alert.content.length > 0 && (
                <p>{alert.content[0]}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
