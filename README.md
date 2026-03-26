# KnoLabs OS - Mission Control Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

A **real-time mission control dashboard** for managing AI agent teams built on [OpenClaw](https://github.com/openclaw/openclaw). Monitor agents, track tasks, visualize system metrics, and facilitate agent-to-agent communication—all in one place.

![Dashboard Preview](https://via.placeholder.com/800x400/1e1b4b/ffffff?text=KnoLabs+OS+Dashboard)

## ✨ Features

- **🔴 Real-time Agent Monitoring** - Live status, health metrics, and activity tracking
- **📋 Task Management** - Kanban board with drag-and-drop, priority levels, assignments
- **💬 A2A Conversation Viewer** - View agent-to-agent communication threads
- **📊 System Metrics** - Real-time charts for CPU, memory, disk, and network
- **🌳 Organization Tree** - Hierarchical view of your AI agent team
- **🎯 Goal Tracking** - KPI dashboards with progress indicators
- **🌙 Dark Theme** - Professional dark mode UI optimized for operations centers

## 🚀 Quick Start

### Prerequisites

- [OpenClaw](https://github.com/openclaw/openclaw) installed and running
- Node.js 20+ and npm
- ACC (Agent Command Center) API running on port 3001

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/knolabs-os.git
cd knolabs-os

# Install dependencies
npm install

# Configure your agents (see Configuration section)
cp src/config/agents.config.example.js src/config/agents.config.js

# Start development server
npm run dev

# Build for production
npm run build
```

### OpenClaw Integration

1. **Install the dashboard as an OpenClaw skill:**
```bash
# In your OpenClaw installation
openclaw skills add /path/to/knolabs-os
```

2. **Start the ACC API server:** (Required for dashboard data)
```bash
# The dashboard expects the ACC API at http://localhost:3001
# Ensure your ACC API server is running before starting the dashboard
```

3. **Access the dashboard:**
Open http://localhost:5173 (dev) or your deployed URL

## ⚙️ Configuration

### Agent Configuration

Edit `src/config/agents.config.js` to customize your agent team:

```javascript
export const AGENTS_OBJ = {
  // Chief Orchestrator
  orchestrator: {
    id: 'aria',           // Unique identifier
    name: 'ARIA',         // Display name
    emoji: '🎪',          // Avatar emoji
    color: '#9333ea',     // Theme color (hex)
    role: 'Chief Orchestrator',
    description: 'Executive coordination, strategic oversight'
  },
  
  // Add your agents here...
  engineer: {
    id: 'pixel',
    name: 'PIXEL',
    emoji: '👨‍💻',
    color: '#3b82f6',
    role: 'Lead Engineer',
    description: 'Software development, debugging'
  },
  
  // System agent (for notifications)
  system: {
    id: 'system',
    name: 'SYSTEM',
    emoji: '🔧',
    color: '#6b7280',
    role: 'System',
    description: 'System notifications'
  }
};

// Export array format for components
export const AGENTS = Object.values(AGENTS_OBJ).filter(a => a.id !== 'system');
```

### API Configuration

The dashboard connects to the ACC (Agent Command Center) API:

```javascript
// src/config/api.config.js (create if needed)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  agents: `${API_BASE_URL}/api/agents`,
  tasks: `${API_BASE_URL}/api/tasks`,
  metrics: `${API_BASE_URL}/api/metrics`,
  health: `${API_BASE_URL}/api/health`,
};
```

### Environment Variables

Create a `.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Feature Flags
VITE_ENABLE_REALTIME=true
VITE_POLL_INTERVAL=5000
```

## 🏗️ Architecture

```
knolabs-os/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── TaskCard.jsx     # Kanban task card
│   │   ├── AgentCard.jsx    # Agent status card
│   │   └── SystemChart.jsx  # Real-time metrics charts
│   ├── pages/               # Main page views
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── Tasks.jsx        # Task management
│   │   ├── A2AViewer.jsx    # Agent conversations
│   │   ├── InboxPage.jsx    # Message inbox
│   │   └── SystemStatus.jsx # System monitoring
│   ├── config/              # Configuration files
│   │   └── agents.config.js # Agent definitions
│   ├── hooks/               # Custom React hooks
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
└── dist/                    # Production build
```

## 📖 Usage Guide

### Dashboard Overview

The main dashboard shows:
- **Agent Status Cards** - Live status of all agents (active/idle/offline)
- **Task Summary** - Counts of pending/completed tasks
- **System Health** - Overall system status indicator
- **Recent Activity** - Latest agent actions and events

### Task Management

1. **Create Tasks**: Click "+" in the Kanban board or use the Inbox
2. **Assign Agents**: Select from your configured agent team
3. **Set Priorities**: Low, Medium, High, Urgent
4. **Track Progress**: Drag tasks between columns (Todo → In Progress → Review → Done)

### A2A Communication

- View conversation threads between agents
- Filter by participants
- Export conversation logs
- Real-time message updates (when integrated with OpenClaw A2A)

### System Monitoring

- Real-time CPU, Memory, Disk, Network charts
- Historical data (configurable retention)
- Alert thresholds and notifications

## 🔧 Customization

### Theming

The dashboard uses CSS variables for easy theming:

```css
/* src/index.css */
:root {
  --primary: #9333ea;
  --secondary: #6366f1;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --background: #0f0a1e;
  --surface: #1e1b4b;
  --text: #f8fafc;
}
```

### Adding Custom Pages

1. Create a new component in `src/pages/`
2. Add route in `src/App.jsx`:
```javascript
import { MyCustomPage } from './pages/MyCustomPage.jsx';

// In routes array
{ path: '/custom', element: <MyCustomPage /> }
```
3. Add navigation link in the sidebar

### Mock Data vs Real Data

By default, the dashboard uses mock data for demonstration. To connect to real OpenClaw data:

1. Ensure your ACC API is running
2. Update API endpoints in `src/config/api.config.js`
3. Replace mock data calls with real API calls:

```javascript
// Before (mock)
const data = generateMockConversations();

// After (real API)
const response = await fetch(`${API_BASE_URL}/api/conversations`);
const data = await response.json();
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/yourusername/knolabs-os.git
cd knolabs-os

# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Run tests
npm test

# Lint
npm run lint
```

## 📜 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [OpenClaw](https://github.com/openclaw/openclaw) - the AI agent runtime
- Charts powered by [Recharts](https://recharts.org/)
- Icons by [Lucide](https://lucide.dev/)

## 💬 Support

- 📧 Email: support@knolabs.ai
- 💬 Discord: [Join our community](https://discord.gg/knolabs)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/knolabs-os/issues)

---

Made with ❤️ by [Knolabs AI Agency](https://knolabs.ai)
