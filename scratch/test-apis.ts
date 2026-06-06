// Using global native fetch
async function testAPIs() {
  console.log("=== Testing API Route Handlers ===");
  const baseUrl = "http://localhost:3000";

  // 1. Fetch campaigns
  try {
    console.log("Testing GET /api/campaigns...");
    const res = await fetch(`${baseUrl}/api/campaigns`);
    if (res.ok) {
      const data = await res.json() as any[];
      console.log(`Success! Fetched ${data.length} campaigns. First campaign: "${data[0]?.name}"`);
    } else {
      console.log(`Failed with status: ${res.status}`);
    }
  } catch (err: any) {
    console.error("GET /api/campaigns request failed:", err.message);
  }

  // 2. Fetch audiences
  try {
    console.log("\nTesting GET /api/audiences...");
    const res = await fetch(`${baseUrl}/api/audiences`);
    if (res.ok) {
      const data = await res.json() as any[];
      console.log(`Success! Fetched ${data.length} audiences. First audience: "${data[0]?.name}"`);
    } else {
      console.log(`Failed with status: ${res.status}`);
    }
  } catch (err: any) {
    console.error("GET /api/audiences request failed:", err.message);
  }

  // 3. Trigger new campaign generation
  try {
    console.log("\nTesting POST /api/campaigns (Trigger Orchestration)...");
    const payload = {
      campaignName: "API Test Campaign Run",
      campaignType: "Pakistan Day Sale",
      audienceSelection: "AI Generated",
      strategySelection: "AI Generated",
      templateSelection: "AI Generated"
    };

    const res = await fetch(`${baseUrl}/api/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json() as any;
      console.log("Success! Server Response:", JSON.stringify(data));

      // Let's check events
      console.log("\nWaiting 2 seconds to check events in Event Bus...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      const evtRes = await fetch(`${baseUrl}/api/campaigns/events`);
      if (evtRes.ok) {
        const events = await evtRes.json() as any[];
        console.log(`Successfully fetched Event Bus logs. Count: ${events.length}`);
        const activeEvents = events.filter(e => e.message.includes("API Test Campaign Run") || e.campaignId);
        console.log(`Recent matching events related to orchestration:`);
        activeEvents.slice(-3).forEach(e => {
          console.log(` - [${e.agentName || 'System'}] ${e.message}`);
        });
      }
    } else {
      console.log(`Failed with status: ${res.status}`);
    }
  } catch (err: any) {
    console.error("POST /api/campaigns request failed:", err.message);
  }
}

testAPIs();
