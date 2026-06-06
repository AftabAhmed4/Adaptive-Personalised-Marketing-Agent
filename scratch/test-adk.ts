import { Gemini, LlmAgent, InMemoryRunner, stringifyContent, isFinalResponse } from '@google/adk';

async function testADK() {
  console.log("Initializing Gemini model...");
  const model = new Gemini({
    model: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY || 'MOCK_KEY_FOR_TESTING'
  });

  console.log("Creating LlmAgent...");
  const agent = new LlmAgent({
    name: 'test_agent',
    model: model,
    instruction: 'You are a friendly assistant. Reply with a short message.'
  });

  console.log("Creating InMemoryRunner...");
  const runner = new InMemoryRunner({ agent });

  console.log("Running agent...");
  try {
    for await (const event of runner.runEphemeral({
      userId: 'test_user',
      newMessage: { parts: [{ text: 'Hello, who are you?' }] }
    })) {
      const isFinal = isFinalResponse(event);
      const content = stringifyContent(event);
      console.log(`Event ID: ${event.id} | Is Final: ${isFinal} | Content: ${content}`);
    }
  } catch (err) {
    console.error("Execution failed:", err);
  }
}

testADK();

