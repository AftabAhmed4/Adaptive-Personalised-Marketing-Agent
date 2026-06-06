import fs from 'fs';
import path from 'path';

export interface EventLog {
  id: string;
  type: 'campaign.created' | 'campaign.started' | 'campaign.completed' | 'campaign.updated';
  campaignId: string;
  message: string;
  agentName?: 'AudienceAgent' | 'StrategyAgent' | 'TemplateAgent' | 'LearningAgent' | 'OrchestratorAgent' | 'System';
  timestamp: string;
  details?: any;
}

const FILE_PATH = path.join(process.cwd(), 'mock', 'events.json');

function ensureFileExists() {
  const dir = path.dirname(FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getEvents(): EventLog[] {
  ensureFileExists();
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading event bus:", error);
    return [];
  }
}

export function emitEvent(
  type: EventLog['type'],
  campaignId: string,
  message: string,
  agentName?: EventLog['agentName'],
  details?: any
): EventLog {
  ensureFileExists();
  const events = getEvents();
  
  const newEvent: EventLog = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    campaignId,
    message,
    agentName,
    timestamp: new Date().toISOString(),
    details
  };
  
  events.push(newEvent);
  fs.writeFileSync(FILE_PATH, JSON.stringify(events, null, 2), 'utf-8');
  return newEvent;
}

export function clearEvents(): void {
  ensureFileExists();
  fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
}

export function getEventsForCampaign(campaignId: string): EventLog[] {
  const events = getEvents();
  return events.filter(e => e.campaignId === campaignId);
}
