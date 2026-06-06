import { Gemini, LlmAgent, InMemoryRunner, stringifyContent } from '@google/adk';

export interface CampaignAnalyticsInput {
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  ctr: number;
  conversionRate: number;
}

export async function execute(metrics: CampaignAnalyticsInput): Promise<string[]> {
  console.log(`[LearningAgent] Analyzing performance metrics: CTR=${metrics.ctr}%, Conv=${metrics.conversionRate}%...`);
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  
  // Rule-based fallbacks based on performance ratios
  const recommendations: string[] = [];
  const openRate = metrics.sent > 0 ? (metrics.opened / metrics.sent) * 100 : 0;
  
  // Analyze open rates
  if (openRate < 30) {
    recommendations.push("Subject line open rate is low. Optimize subject copy by writing shorter hooks, incorporating target audience names, or testing new seasonal emojis.");
  } else {
    recommendations.push("Open rates are strong (above 30%). Subject line format is effective. A/B test minor emoji variations to squeeze out more performance.");
  }

  // Analyze CTR
  if (metrics.ctr < 5) {
    recommendations.push("Click-through-rate is low (below 5%). Improve inner-body layout by putting the call-to-action (CTA) link higher up in the message, adding bullet points, or highlighting a clearer discount value proposition.");
  } else {
    recommendations.push("CTR is performing well. Maintain standard paragraph length and test personalizing the greeting style to build stronger user connection.");
  }

  // Analyze Conversion
  if (metrics.conversionRate < 2) {
    recommendations.push("Conversion rate is lagging behind CTR. Ensure that the checkout flow offers local payment options, displays free shipping thresholds, or adds a sense of urgency like 'Valid for next 2 hours only'.");
  } else {
    recommendations.push("Conversion to clicks ratio is high. Consider expanding this target segment size in the next run, as the offer-market fit is highly optimized.");
  }

  let resultStr = "";

  if (apiKey) {
    try {
      const model = new Gemini({
        model: 'gemini-2.5-flash',
        apiKey: apiKey
      });

      const prompt = `You are a Marketing Learning & Analytics Agent.
Analyze the following campaign performance metrics:
- Total Sent: ${metrics.sent}
- Opened: ${metrics.opened} (Open Rate: ${openRate.toFixed(1)}%)
- Clicked: ${metrics.clicked} (CTR: ${metrics.ctr.toFixed(1)}%)
- Converted: ${metrics.converted} (Conversion Rate: ${metrics.conversionRate.toFixed(1)}%)

Based on these numbers, write 3 highly specific, actionable recommendations for our marketing team to improve future runs.
Focus on:
1. Subject line copy / Open rate optimization.
2. Email layout and CTA buttons / CTR optimization.
3. Offer, landing page, or audience targeting / Conversion Rate optimization.

Return a JSON object with:
{
  "recommendations": [
    "First recommendation details...",
    "Second recommendation details...",
    "Third recommendation details..."
  ]
}`;

      const agent = new LlmAgent({
        name: 'learning_agent',
        model: model,
        instruction: 'You analyze raw campaign numbers and generate clear marketing copywriting and technical recommendations. Return ONLY raw JSON.'
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
      
      if (parsed && parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        return parsed.recommendations;
      }
    } catch (err) {
      console.error("[LearningAgent] API run failed, using fallback:", err);
    }
  } else {
    console.log("[LearningAgent] Running in Mock Demo Mode (No API key).");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI execution time
  }

  console.log(`[LearningAgent] Generated ${recommendations.length} recommendations.`);
  return recommendations;
}
