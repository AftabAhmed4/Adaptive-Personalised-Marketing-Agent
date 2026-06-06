import { execute } from '../adk/agents/OrchestratorAgent';
import { getEvents, clearEvents } from '../utils/eventBus';

async function testOrchestrator() {
  console.log("=== Testing Orchestrator Workflow ===");
  
  // Clear any old logs
  clearEvents();
  console.log("Cleared prior event bus history.");

  const input = {
    campaignName: "Hackathon Launch Day Special",
    campaignType: "Pakistan Day Sale",
    audienceSelection: "AI Generated",
    strategySelection: "AI Generated",
    templateSelection: "AI Generated"
  };

  try {
    console.log("Executing orchestrator...");
    const campaign = await execute(input);
    console.log("\n=== Campaign Generation Complete ===");
    console.log(`Campaign ID: ${campaign.id}`);
    console.log(`Audience Selected: ${campaign.audienceName}`);
    console.log(`Strategy Selected: ${campaign.strategyName}`);
    console.log(`Template Subject: ${campaign.templateSubject}`);
    console.log(`CTR: ${campaign.ctr}%`);
    console.log(`Conversion Rate: ${campaign.conversion}%`);
    console.log(`Actionable Recommendations:\n  - ${campaign.recommendations.join("\n  - ")}`);

    console.log("\n=== Checking Event Bus Logs ===");
    const events = getEvents();
    console.log(`Fetched ${events.length} events from the Event Bus:`);
    events.forEach((evt, idx) => {
      console.log(`[Event #${idx+1}] [${evt.timestamp}] [${evt.type}] [Agent: ${evt.agentName || 'System'}]`);
      console.log(`  Message: ${evt.message}`);
      if (evt.details) {
        console.log(`  Details: ${JSON.stringify(evt.details)}`);
      }
    });
  } catch (err) {
    console.error("Orchestrator failed during test execution:", err);
  }
}

testOrchestrator();
