import { Gemini, LlmAgent, InMemoryRunner, stringifyContent } from '@google/adk';
import { mockStrategies, Strategy } from '../../mock/strategies';

export interface StrategySelection extends Strategy {
  reasoning: string;
}

export async function execute(audienceName: string, audienceDescription: string, userCount: number): Promise<StrategySelection> {
  console.log(`[StrategyAgent] Formulating strategy for audience: "${audienceName}" (${userCount} users)...`);
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  
  // Define fallback strategies based on target audience keywords
  let fallback: StrategySelection = {
    id: "strat_email_marketing",
    name: "Standard Email Marketing",
    description: "Traditional email marketing focusing on product catalogues and discounts.",
    type: "Email Marketing",
    channel: "Email",
    reasoning: "General segment targeted via classic email engagement."
  };

  const nameLower = audienceName.toLowerCase();
  const descLower = audienceDescription.toLowerCase();

  if (nameLower.includes("high-spending") || nameLower.includes("loyalty") || nameLower.includes("high value")) {
    fallback = {
      ...mockStrategies.find(s => s.id === "strat_loyalty_campaign")!,
      reasoning: "High-value users show the highest affinity for exclusive loyalty programs, VIP early access, and personalized incentives."
    };
  } else if (nameLower.includes("female") || nameLower.includes("summer") || descLower.includes("apparel")) {
    fallback = {
      ...mockStrategies.find(s => s.id === "strat_bundle_discount")!,
      reasoning: "Summer seasonal launches convert well when visual catalogs are paired with Bundle & Save discounts to raise average order values."
    };
  } else if (nameLower.includes("dormant") || nameLower.includes("re-engage")) {
    fallback = {
      ...mockStrategies.find(s => s.id === "strat_abandoned_cart")!,
      reasoning: "Re-engagement campaigns perform best with transactional reminders, cart recovery strategies, or a small reactivation coupon code."
    };
  } else if (nameLower.includes("youth") || nameLower.includes("tech") || nameLower.includes("holiday")) {
    fallback = {
      ...mockStrategies.find(s => s.id === "strat_flash_sale")!,
      reasoning: "Tech-savvy and younger cohorts respond highly to urgency cues, countdowns, and limited-run Flash Sales over social channels."
    };
  }

  let resultStr = "";

  if (apiKey) {
    try {
      const model = new Gemini({
        model: 'gemini-2.5-flash',
        apiKey: apiKey
      });

      const prompt = `You are a Marketing Strategy Agent.
Given the target audience:
Name: "${audienceName}"
Description: "${audienceDescription}"
Reach: ${userCount} users

Available standard strategies:
${JSON.stringify(mockStrategies)}

Formulate the best marketing strategy. Select one of the predefined strategy IDs (strat_flash_sale, strat_email_marketing, strat_push_notification, strat_loyalty_campaign, strat_bundle_discount, strat_abandoned_cart) and provide a tailored reasoning explaining why this strategy is perfect for this specific audience.

Return a JSON object with:
{
  "id": "chosen_strategy_id",
  "name": "Strategy Name",
  "description": "Customized strategy description for this audience",
  "type": "Strategy Type",
  "channel": "Email" | "Push" | "SMS" | "Multi-Channel",
  "reasoning": "Staff-level analysis of why this fits the audience"
}`;

      const agent = new LlmAgent({
        name: 'strategy_agent',
        model: model,
        instruction: 'You analyze target audiences and select the most cost-effective, high-CTR marketing strategy. Return ONLY raw JSON.'
      });

      const runner = new InMemoryRunner({ agent });
      
      for await (const event of runner.runEphemeral({
        userId: 'system',
        newMessage: { parts: [{ text: prompt }] }
      })) {
        resultStr += stringifyContent(event);
      }

      const cleanJson = resultStr.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (parsed && parsed.id && parsed.reasoning) {
        fallback = {
          id: parsed.id,
          name: parsed.name,
          description: parsed.description || fallback.description,
          type: parsed.type || fallback.type,
          channel: parsed.channel || fallback.channel,
          reasoning: parsed.reasoning
        };
      }
    } catch (err) {
      console.error("[StrategyAgent] API run failed, using fallback:", err);
    }
  } else {
    console.log("[StrategyAgent] Running in Mock Demo Mode (No API key).");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI execution time
  }

  console.log(`[StrategyAgent] Selected strategy: "${fallback.name}" (Channel: ${fallback.channel})`);
  return fallback;
}
