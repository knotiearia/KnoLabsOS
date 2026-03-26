/** Agent Configuration
 * 
 * This file defines all agents that appear in the dashboard.
 * Edit this file to customize agent names, emojis, colors, and roles.
 * 
 * The dashboard will automatically reflect these changes.
 */

export const AGENTS_OBJ = {
  // Chief Orchestrator - The main agent that coordinates others
  orchestrator: {
    id: 'aria',
    name: 'ARIA',
    emoji: '🎪',
    color: '#9333ea',
    role: 'Chief Orchestrator',
    description: 'Executive coordination, strategic oversight, security enforcement'
  },
  
  // Engineer Agent - Handles coding and technical tasks
  engineer: {
    id: 'pixel',
    name: 'PIXEL',
    emoji: '👨‍💻',
    color: '#3b82f6',
    role: 'Lead Engineer',
    description: 'Software development, debugging, code review'
  },
  
  // Research Agent - Gathers information and does research
  researcher: {
    id: 'curio',
    name: 'CURIO',
    emoji: '🔍',
    color: '#6366f1',
    role: 'Research Lead',
    description: 'Information gathering, fact-checking, documentation'
  },
  
  // Content Agent - Handles writing and content creation
  content: {
    id: 'scribe',
    name: 'SCRIBE',
    emoji: '✍️',
    color: '#10b981',
    role: 'Content Lead',
    description: 'Content creation, documentation, reports'
  },
  
  // DevOps Agent - Handles operations and automation
  devops: {
    id: 'flux',
    name: 'FLUX',
    emoji: '⚡',
    color: '#f59e0b',
    role: 'DevOps Lead',
    description: 'Task execution, automation, scheduling'
  },
  
  // Security Agent - Handles security and compliance
  security: {
    id: 'vault',
    name: 'VAULT',
    emoji: '🛡️',
    color: '#ef4444',
    role: 'Security Auditor',
    description: 'Security hardening, compliance, access control'
  },
  
  // System - For system messages
  system: {
    id: 'system',
    name: 'SYSTEM',
    emoji: '🔧',
    color: '#6b7280',
    role: 'System',
    description: 'System notifications and alerts'
  }
};

/** Array format for backward compatibility */
export const AGENTS = Object.values(AGENTS_OBJ).filter(a => a.id !== 'system');

/** Helper function to get agent config by ID */
export const getAgentConfig = (agentId) => {
  return Object.values(AGENTS_OBJ).find(a => a.id === agentId) || AGENTS_OBJ.system;
};

/** Get all agent IDs except system */
export const getAgentIds = () => {
  return AGENTS.map(a => a.id);
};

/** Get all agent entries as array */
export const getAgentsList = () => {
  return AGENTS;
};
