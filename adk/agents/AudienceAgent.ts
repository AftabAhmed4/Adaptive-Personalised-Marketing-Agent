import { Gemini, LlmAgent, InMemoryRunner, stringifyContent } from '@google/adk';
import { mockUsers } from '../../mock/users';

export interface AudienceSegment {
  name: string;
  description: string;
  filters: {
    ageMin?: number;
    ageMax?: number;
    gender?: 'Male' | 'Female' | 'Non-binary' | 'All';
    cities?: string[];
    minPurchases?: number;
  };
  matchedUserIds: string[];
}

export async function execute(campaignType: string): Promise<AudienceSegment> {
  console.log(`[AudienceAgent] Running analysis for campaign type: ${campaignType}...`);
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  
  // Define fallback segments
  let fallback: AudienceSegment;
  if (campaignType === "11.11 Sale") {
    fallback = {
      name: "High-Spending Fashion Buyers",
      description: "AI selected high-frequency purchasers (min 5 purchases) across Karachi and Lahore for maximum GMV conversion.",
      filters: { minPurchases: 5, cities: ["Karachi", "Lahore"], gender: "All" },
      matchedUserIds: []
    };
  } else if (campaignType === "Pakistan Day Sale") {
    fallback = {
      name: "National Holiday Active Segment",
      description: "AI targeted young active users (age 18-35) nationwide, focusing on major urban centers.",
      filters: { ageMin: 18, ageMax: 35, minPurchases: 2, gender: "All" },
      matchedUserIds: []
    };
  } else if (campaignType === "Summer Sale") {
    fallback = {
      name: "Urban Female Summer Apparel Segment",
      description: "AI isolated female buyers under 35 in Karachi and Islamabad, aligning with seasonal apparel demand.",
      filters: { ageMin: 18, ageMax: 35, gender: "Female", cities: ["Karachi", "Islamabad"] },
      matchedUserIds: []
    };
  } else {
    // Black Friday or generic
    fallback = {
      name: "Dormant High-Value Loyalty Segment",
      description: "AI selected dormant buyers with high total spending to re-engage them during the clearance event.",
      filters: { minPurchases: 4, gender: "All" },
      matchedUserIds: []
    };
  }

  let resultStr = "";
  
  if (apiKey) {
    try {
      const model = new Gemini({
        model: 'gemini-2.5-flash',
        apiKey: apiKey
      });

      const prompt = `You are an Audience Selection Agent.
Analyze the following mock users data:
${JSON.stringify(mockUsers.slice(0, 30))} (Showing sample of 30 users for context)

Given the campaign type: "${campaignType}"
Identify the most optimal target segment. Choose filters that maximize the probability of high CTR and conversions.

Return a JSON object with:
{
  "name": "Target Audience Name",
  "description": "Why this segment is selected for ${campaignType}",
  "filters": {
    "ageMin": 18, (optional)
    "ageMax": 45, (optional)
    "gender": "Female" | "Male" | "Non-binary" | "All",
    "cities": ["Karachi", "Lahore"], (optional array of cities)
    "minPurchases": 2 (optional number)
  }
}`;

      const agent = new LlmAgent({
        name: 'audience_agent',
        model: model,
        instruction: 'You analyze user demographics and purchase behavior to select high-converting target audiences. Return ONLY raw JSON.'
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
      
      if (parsed && parsed.name && parsed.filters) {
        fallback.name = parsed.name;
        fallback.description = parsed.description || fallback.description;
        fallback.filters = parsed.filters;
      }
    } catch (err) {
      console.error("[AudienceAgent] API run failed, using fallback:", err);
    }
  } else {
    console.log("[AudienceAgent] Running in Mock Demo Mode (No API key).");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI execution time
  }

  // Apply the filters to our full list of 100 users to get the matched list
  const filters = fallback.filters;
  const matchedUsers = mockUsers.filter(user => {
    if (filters.ageMin !== undefined && user.age < filters.ageMin) return false;
    if (filters.ageMax !== undefined && user.age > filters.ageMax) return false;
    if (filters.gender !== undefined && filters.gender !== "All" && user.gender !== filters.gender) return false;
    if (filters.cities !== undefined && filters.cities.length > 0 && !filters.cities.includes(user.city)) return false;
    if (filters.minPurchases !== undefined && user.purchases < filters.minPurchases) return false;
    return true;
  });

  fallback.matchedUserIds = matchedUsers.map(u => u.id);
  console.log(`[AudienceAgent] Matched ${fallback.matchedUserIds.length} users for audience: "${fallback.name}"`);
  return fallback;
}
