# Task Routing & Assignment Guide

## How Tasks Get Assigned

### Current Model: Role-Based Assignment

```
You Request
    │
    ▼
┌─────────────┐
│    ARIA     │ ← I analyze the request
│  (You/Me)   │
└──────┬──────┘
       │
       │ Match task to agent role
       ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Code/Engineering    →   PIXEL (Lead Engineer)         │
│   Research/Data       →   CURIO (Research Lead)         │
│   Content/Writing     →   SCRIBE (Content Lead)         │
│   Infrastructure      →   FLUX (DevOps Lead)            │
│   Security/Audit      →   VAULT (Security Auditor)      │
│                                                         │
└─────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│ Redis Queue │
│ {agent}:pending
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Agent Daemon│ ← Specific agent claims it
└─────────────┘
```

## Agent Roles & Capabilities

| Agent | Role | Best For | Tools |
|-------|------|----------|-------|
| **PIXEL** | Lead Engineer | Code changes, debugging, builds | read, write, edit, exec, git |
| **CURIO** | Research Lead | Info gathering, fact-checking | web_search, web_fetch, kimi_search |
| **SCRIBE** | Content Lead | Documentation, copywriting | read, write, edit |
| **FLUX** | DevOps Lead | Infrastructure, deployment, cron | exec, process, systemctl |
| **VAULT** | Security Auditor | Security reviews, audits | read, exec (scanning tools) |

## Example Task Routing

### Example 1: "Fix CSS bug in dashboard"
```
You → ARIA → PIXEL (engineering task)
```

### Example 2: "Research latest AI trends"
```
You → ARIA → CURIO (research task)
```

### Example 3: "Write blog post about multi-agent systems"
```
You → ARIA → SCRIBE (content task)
```

### Example 4: "Set up nginx reverse proxy"
```
You → ARIA → FLUX (infrastructure task)
```

### Example 5: "Audit codebase for vulnerabilities"
```
You → ARIA → VAULT (security task)
```

## Multi-Agent Collaboration

Some tasks need multiple agents:

```
"Build a new landing page"
    │
    ▼
┌─────────────┐
│    ARIA     │ ← Orchestrates
└──────┬──────┘
       │
       ├──────▶ CURIO: Research competitor sites
       │
       ├──────▶ PIXEL: Build the page code
       │
       ├──────▶ SCRIBE: Write the copy
       │
       └──────▶ FLUX: Deploy to production
```

## Future: Auto-Routing (Not Yet Implemented)

Could add automatic assignment based on task keywords:

```javascript
// Task: "Research WhisperX vs Deepgram"
// Keywords detected: "research", "vs", "compare"
// Auto-route to: CURIO

// Task: "Fix API JSON parsing error"
// Keywords detected: "fix", "API", "JSON", "error"
// Auto-route to: PIXEL
```

## Task Priority Levels

| Priority | Use For | Response Time |
|----------|---------|---------------|
| **critical** | Production down, security breach | Immediate |
| **high** | Blocking other work, urgent feature | < 1 hour |
| **normal** | Standard work, enhancements | < 4 hours |
| **low** | Nice-to-have, refactoring | < 24 hours |

## How to Create Tasks (For Reference)

### Method 1: Markdown Spec (Recommended)

```bash
# 1. Create spec file
cat > /workspace/agents/pixel/inbox/TASK-EXAMPLE.md << 'EOF'
# Task: Fix Navigation Bug

## Description
Dashboard navigation doesn't work when clicking sidebar links.

## Acceptance Criteria
- [ ] Hash-based routing implemented
- [ ] All navigation buttons work
- [ ] Browser back/forward works

## Priority
high

## Git Workflow
- Branch: fix/navigation-routing
- Do not merge - create PR
EOF

# 2. Add to Redis queue
cd /workspace/acc && node -e "
const TaskQueue = require('./task-queue.js');
const tq = new TaskQueue();
tq.addTask('pixel', {
  id: 'TASK-EXAMPLE',
  title: 'Fix Navigation Bug',
  type: 'bug',
  priority: 'high',
  spec_file: '/workspace/agents/pixel/inbox/TASK-EXAMPLE.md'
});
console.log('Task queued');
process.exit(0);
"
```

### Method 2: ARIA Delegates (What I Do)

When you ask me to do something, I:
1. Figure out which agent should handle it
2. Create the Markdown spec
3. Add to their Redis queue
4. Monitor progress
5. Report back to you

## Monitoring Tasks

### Dashboard
http://100.76.226.43:3000/#tasks

### CLI
```bash
# Check all queues
curl http://localhost:3001/api/tasks | jq

# Check specific agent
curl http://localhost:3001/api/tasks/pixel | jq

# View logs
journalctl -u pixel-agent -f
journalctl -u curio-agent -f
```

## Task States

```
CREATED (Markdown in inbox)
    │
    ▼
PENDING (In Redis queue)
    │
    ▼ (Agent claims)
ACTIVE (Agent working)
    │
    ├──────▶ COMPLETED (Success)
    │
    └──────▶ FAILED (Error)
```

## Current Limitations

1. **No auto-routing yet** - I manually assign based on role
2. **No load balancing** - If PIXEL has 10 tasks, he works through them one by one
3. **No task stealing** - Agents can't take work from each other's queues
4. **Simple priority** - Just high/normal/low, no complex scheduling

## Future Improvements

- [ ] Auto-assignment based on task content analysis
- [ ] Workload balancing (idle agents pick up overflow)
- [ ] Task dependencies (Task B waits for Task A)
- [ ] Estimated time tracking
- [ ] Automatic escalation if stuck too long
