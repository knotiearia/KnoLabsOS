# Knolabs Mission Control - Architecture

## System Overview

The Mission Control Dashboard is a real-time monitoring and orchestration interface for the Knolabs AI Agency multi-agent system.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         KNOLABS AI AGENCY                                    │
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │    ARIA      │────▶│  REDIS QUEUE │◀────│    PIXEL     │                │
│  │  (You/Me)    │     │              │     │   (Engineer) │                │
│  │  Orchestrator│     │  - Pending   │     │              │                │
│  └──────────────┘     │  - Active    │     └──────────────┘                │
│         │             │  - Completed │            │                        │
│         │             └──────────────┘            │                        │
│         │                    ▲                    │                        │
│         │                    │                    │                        │
│         ▼                    │                    ▼                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    MISSION CONTROL DASHBOARD                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐  │   │
│  │  │Dashboard │  │  Inbox   │  │  Tasks   │  │  Agents             │  │   │
│  │  │  Page    │  │  Page    │  │  Page    │  │  Page               │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────────────────┘  │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │              ACC API SERVER (Port 3001)                     │   │   │
│  │  │  - GET /api/agents    → Reads agent status from Redis       │   │   │
│  │  │  - GET /api/tasks     → Reads task queues from Redis        │   │   │
│  │  │  - GET /api/metrics   → System health data                  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ▲                                       │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    AGENT DAEMONS (Systemd Services)                 │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│  │  │   PIXEL     │  │   CURIO     │  │   FLUX      │                │   │
│  │  │  Daemon     │  │  Daemon     │  │  Daemon     │                │   │
│  │  │ (Node.js)   │  │ (Node.js)   │  │ (Node.js)   │                │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │   │
│  │       │                │                │                          │   │
│  │       └────────────────┴────────────────┘                          │   │
│  │                        │                                           │   │
│  │                        ▼                                           │   │
│  │               Polls Redis every 60s                                │   │
│  │               Claims tasks → Executes work                         │   │
│  │               Updates status → Commits to git                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Sequence Diagram: Task Execution Flow

```
┌─────┐          ┌──────────┐          ┌──────────────┐          ┌──────────┐          ┌──────────┐
│You  │          │  ARIA    │          │  Redis Queue │          │  PIXEL   │          │  GitHub  │
│(User)│         │(Me)      │          │              │          │  Daemon  │          │          │
└──┬──┘          └────┬─────┘          └──────┬───────┘          └────┬─────┘          └────┬─────┘
   │                   │                       │                       │                     │
   │ "Fix inbox bug"   │                       │                       │                     │
   │──────────────────▶│                       │                       │                     │
   │                   │                       │                       │                     │
   │                   │  1. Write task spec   │                       │                     │
   │                   │  to pixel inbox       │                       │                     │
   │                   │──────────────────────▶│                       │                     │
   │                   │  (Markdown file)      │                       │                     │
   │                   │                       │                       │                     │
   │                   │  2. Add task to queue │                       │                     │
   │                   │──────────────────────▶│                       │                     │
   │                   │  (Redis: LPUSH)       │                       │                     │
   │                   │                       │                       │                     │
   │                   │                       │◀── 3. Poll queue ─────│                     │
   │                   │                       │  (Every 60s)          │                     │
   │                   │                       │                       │                     │
   │                   │                       │  4. Claim task ───────▶│                     │
   │                   │                       │  (Redis: BRPOPLPUSH)   │                     │
   │                   │                       │                       │                     │
   │                   │                       │                       │ 5. Execute code      │
   │                   │                       │                       │ (Edit App.jsx)       │
   │                   │                       │                       │                     │
   │                   │                       │                       │ 6. Git commit ──────▶│
   │                   │                       │                       │                     │
   │                   │                       │                       │◀── 7. Push ─────────│
   │                   │                       │                       │                     │
   │                   │                       │◀── 8. Update status ──│                     │
   │                   │                       │  (Redis: SET)         │                     │
   │                   │                       │                       │                     │
   │  9. Dashboard     │                       │                       │                     │
   │     shows task    │                       │                       │                     │
   │     complete ◀────┼───────────────────────┼───────────────────────│                     │
   │                   │                       │                       │                     │
   │                   │                       │                       │                     │
```

## How It Actually Works (Simple Explanation)

### 1. **You Ask For Something**
   - You tell me (ARIA) what you need: *"Fix the inbox bug"*

### 2. **I Create a Task**
   - I write a detailed task specification as a Markdown file
   - File goes to: `/workspace/agents/pixel/inbox/TASK-NAME.md`
   - Task includes: what to do, why, acceptance criteria, git workflow

### 3. **Task Goes to Redis Queue**
   - I add a lightweight pointer to Redis: `acc:tasks:pixel:pending`
   - Redis acts as the "central nervous system" - all agents check here

### 4. **PIXEL Daemon Watches Queue**
   - PIXEL has a persistent Node.js daemon (systemd service)
   - Every 60 seconds, it polls Redis for new tasks
   - When it finds one, it "claims" it (moves from pending → active)

### 5. **PIXEL Does The Work**
   - Reads the Markdown spec
   - Executes actual code changes (not faked!)
   - Uses git workflow: create branch → make changes → commit → push

### 6. **Status Updates Flow Back**
   - PIXEL updates Redis: `acc:agent:pixel:status` = "idle"
   - Dashboard reads from Redis every 5 seconds
   - You see real-time progress

### 7. **I Review and Report**
   - I check the PR/code changes
   - Report back to you with results

---

## Current Agent Setup Status

| Agent | Status | Role | Daemon | Working? |
|-------|--------|------|--------|----------|
| **ARIA** | 🟢 Active | You (Orchestrator) | N/A | ✅ Yes |
| **PIXEL** | 🟢 Active | Lead Engineer | ✅ Systemd | ✅ Yes |
| **CURIO** | 🟡 Idle | Research Lead | ❌ Not yet | ⏳ Pending |
| **SCRIBE** | 🟡 Idle | Content Lead | ❌ Not yet | ⏳ Pending |
| **FLUX** | 🟡 Idle | DevOps Lead | ❌ Not yet | ⏳ Pending |
| **VAULT** | 🟡 Idle | Security Auditor | ❌ Not yet | ⏳ Pending |

### What's Working Now:
- ✅ Dashboard loads and shows real data from Redis
- ✅ Hash routing works (inbox/tasks/agents pages)
- ✅ PIXEL daemon runs as systemd service, polls queue, executes tasks
- ✅ Git workflow integrated (staging branch, commits, pushes)
- ✅ Redis as central task queue and status store

### What's Next:
- ⏳ Create daemons for CURIO, SCRIBE, FLUX, VAULT
- ⏳ Add A2A (Agent-to-Agent) messaging
- ⏳ Real session spawning for complex tasks

---

## File Locations

| Component | Path |
|-----------|------|
| Dashboard Code | `/root/knolabs-mission-control/frontend/` |
| ACC API Server | `/workspace/acc/api-server.js` |
| PIXEL Daemon | `/workspace/agents/pixel/bin/pixel-daemon.js` |
| Task Queue | Redis `127.0.0.1:6379` |
| Agent Inboxes | `/workspace/agents/{agent}/inbox/` |
| Systemd Services | `/etc/systemd/system/*-agent.service` |

---

## Quick Commands

```bash
# Check PIXEL status
systemctl status pixel-agent

# View PIXEL logs
journalctl -u pixel-agent -f

# Check Redis queues
redis-cli LRANGE acc:tasks:pixel:pending 0 -1

# View all agent statuses
curl http://localhost:3001/api/agents | jq

# Dashboard URL
http://100.76.226.43:3000
```
