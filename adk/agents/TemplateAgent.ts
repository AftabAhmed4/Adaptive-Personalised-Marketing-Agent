import { Gemini, LlmAgent, InMemoryRunner, stringifyContent } from '@google/adk';
import { mockTemplates, Template } from '../../mock/templates';

export interface GeneratedTemplate extends Template {
  discountUsed: string;
  offerUsed: string;
  ctaUsed: string;
}

export async function execute(campaignType: string, strategyName: string, strategyDescription: string): Promise<GeneratedTemplate> {
  console.log(`[TemplateAgent] Generating template copy for ${campaignType} with strategy "${strategyName}"...`);
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  
  // Default values depending on campaign type
  let discount = "20% OFF";
  let offer = "Exclusive seasonal deals";
  let ctaText = "Shop Now";
  let baseTemplate: Template = mockTemplates[0]; // 11.11

  if (campaignType === "11.11 Sale") {
    discount = "50% OFF";
    offer = "11.11 Mega Deals Blitz";
    ctaText = "Unlock 11.11 Discounts";
    baseTemplate = mockTemplates.find(t => t.id === "temp_11_11") || mockTemplates[0];
  } else if (campaignType === "Pakistan Day Sale") {
    discount = "23% Flat Discount";
    offer = "Pakistan Day Resolution Savings";
    ctaText = "Celebrate & Shop";
    baseTemplate = mockTemplates.find(t => t.id === "temp_pakistan_day") || mockTemplates[0];
  } else if (campaignType === "Summer Sale") {
    discount = "30% OFF";
    offer = "Summer Launch Collections Bundle";
    ctaText = "Beat the Heat";
    baseTemplate = mockTemplates.find(t => t.id === "temp_summer_sale") || mockTemplates[0];
  } else if (campaignType === "Black Friday") {
    discount = "Flat 40% OFF";
    offer = "Black Friday VIP Early Access";
    ctaText = "Get VIP Access";
    baseTemplate = mockTemplates.find(t => t.id === "temp_black_friday") || mockTemplates[0];
  }

  let fallback: GeneratedTemplate = {
    ...baseTemplate,
    discountUsed: discount,
    offerUsed: offer,
    ctaUsed: ctaText
  };

  let resultStr = "";

  if (apiKey) {
    try {
      const model = new Gemini({
        model: 'gemini-2.5-flash',
        apiKey: apiKey
      });

      const prompt = `You are a Creative Copywriting Agent.
Given:
- Campaign Type: "${campaignType}"
- Marketing Strategy: "${strategyName}" ("${strategyDescription}")
- Base template model name: "${baseTemplate.name}"

Generate high-converting personalized copy that uses placeholders: {{name}}, {{discount}}, {{offer}}, {{cta}}.
Determine:
1. The values to populate the placeholders:
   - "discount" (e.g. "Flat 25% OFF")
   - "offer" (e.g. "Winter Clearance Collection")
   - "cta" (e.g. "Claim Your Discount Now")
2. The subject line (with emojis).
3. The body copywriting, incorporating the strategy details. Use standard paragraph formatting, and make it engaging. Keep the actual bracketed placeholders {{name}}, {{discount}}, {{offer}}, and {{cta}} exactly inside your body text so the engine can replace them dynamically per user.

Return a JSON object:
{
  "name": "Custom Tailored Template Name",
  "subject": "Email Subject Line with {{offer}} or {{discount}}",
  "body": "Hi {{name}},\\n\\nCopy text here... enjoy {{discount}}... on {{offer}}... Click here: {{cta}}",
  "discountUsed": "Flat 25% OFF",
  "offerUsed": "Pakistan Resolution Deals",
  "ctaUsed": "Shop the Collection"
}`;

      const agent = new LlmAgent({
        name: 'template_agent',
        model: model,
        instruction: 'You write high-converting copy that matches corporate style guides and marketing objectives. Return ONLY raw JSON.'
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
      
      if (parsed && parsed.subject && parsed.body) {
        fallback = {
          id: `temp_custom_${Date.now()}`,
          name: parsed.name || fallback.name,
          subject: parsed.subject,
          body: parsed.body,
          placeholders: ["name", "discount", "offer", "cta"],
          discountUsed: parsed.discountUsed || fallback.discountUsed,
          offerUsed: parsed.offerUsed || fallback.offerUsed,
          ctaUsed: parsed.ctaUsed || fallback.ctaUsed
        };
      }
    } catch (err) {
      console.error("[TemplateAgent] API run failed, using fallback:", err);
    }
  } else {
    console.log("[TemplateAgent] Running in Mock Demo Mode (No API key).");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI execution time
  }

  console.log(`[TemplateAgent] Template copywriting finalized: "${fallback.name}"`);
  return fallback;
}
export function populatePlaceholders(body: string, user: { name: string }, discount: string, offer: string, cta: string): string {
  return body
    .replace(/\{\{name\}\}/g, user.name)
    .replace(/\{\{discount\}\}/g, discount)
    .replace(/\{\{offer\}\}/g, offer)
    .replace(/\{\{cta\}\}/g, cta);
}

export function populateSubject(subject: string, discount: string, offer: string): string {
  return subject
    .replace(/\{\{discount\}\}/g, discount)
    .replace(/\{\{offer\}\}/g, offer);
}
