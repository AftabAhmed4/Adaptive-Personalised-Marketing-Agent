import { emitEvent } from '../../utils/eventBus';
import { addCampaign, Campaign, CampaignActivity, CampaignMetrics } from '../../mock/campaigns';
import { mockUsers } from '../../mock/users';
import { mockAudiences } from '../../mock/audiences';
import { mockStrategies } from '../../mock/strategies';
import { mockTemplates } from '../../mock/templates';

import * as AudienceAgent from './AudienceAgent';
import * as StrategyAgent from './StrategyAgent';
import * as TemplateAgent from './TemplateAgent';
import * as LearningAgent from './LearningAgent';

export interface OrchestratorInput {
  campaignName: string;
  campaignType: string;
  audienceSelection: 'AI Generated' | string; // "AI Generated" or manual segment ID
  strategySelection: 'AI Generated' | string; // "AI Generated" or manual strategy ID
  templateSelection: 'AI Generated' | string; // "AI Generated" or manual template ID
  campaignId?: string;
}

export async function execute(input: OrchestratorInput): Promise<Campaign> {
  const campaignId = input.campaignId || `camp_${Date.now()}`;
  console.log(`[OrchestratorAgent] Starting orchestration for campaign: "${input.campaignName}" (${campaignId})...`);

  // 1. Emit campaign.started event
  emitEvent('campaign.started', campaignId, `Starting campaign generation workflow for "${input.campaignName}"`, 'OrchestratorAgent');

  // 2. Audience Selection
  let audienceName = "";
  let audienceFilter: any = {};
  let matchedUserIds: string[] = [];
  let audienceDescription = "";

  emitEvent('campaign.updated', campaignId, 'Audience Agent Running...', 'AudienceAgent');
  
  if (input.audienceSelection === 'AI Generated') {
    // Run Audience Agent
    const audience = await AudienceAgent.execute(input.campaignType);
    audienceName = audience.name;
    audienceFilter = audience.filters;
    matchedUserIds = audience.matchedUserIds;
    audienceDescription = audience.description;
    
    emitEvent('campaign.updated', campaignId, `Audience matched: "${audienceName}" (${matchedUserIds.length} users targetable)`, 'AudienceAgent', {
      audienceName,
      userCount: matchedUserIds.length
    });
  } else {
    // Manual loading of predefined audience
    const predefined = mockAudiences.find(a => a.id === input.audienceSelection);
    if (predefined) {
      audienceName = predefined.name;
      audienceFilter = predefined.filters;
      audienceDescription = predefined.description;
      
      // Filter the users list manually
      const filters = predefined.filters;
      const matched = mockUsers.filter(u => {
        if (filters.ageMin !== undefined && u.age < filters.ageMin) return false;
        if (filters.ageMax !== undefined && u.age > filters.ageMax) return false;
        if (filters.gender !== undefined && filters.gender !== "All" && u.gender !== filters.gender) return false;
        if (filters.cities !== undefined && filters.cities.length > 0 && !filters.cities.includes(u.city)) return false;
        if (filters.minPurchases !== undefined && u.purchases < filters.minPurchases) return false;
        return true;
      });
      matchedUserIds = matched.map(m => m.id);
      
      emitEvent('campaign.updated', campaignId, `Loaded manual audience segment: "${audienceName}" (${matchedUserIds.length} users)`, 'AudienceAgent');
    } else {
      // Fallback if segment not found
      audienceName = "All Users";
      matchedUserIds = mockUsers.map(u => u.id);
      emitEvent('campaign.updated', campaignId, `Audience segment "${input.audienceSelection}" not found, defaulting to All Users`, 'AudienceAgent');
    }
  }

  // 3. Strategy Selection
  let strategyName = "";
  let strategyDescription = "";
  let strategyChannel = "";

  emitEvent('campaign.updated', campaignId, 'Strategy Agent Running...', 'StrategyAgent');

  if (input.strategySelection === 'AI Generated') {
    // Run Strategy Agent
    const strategy = await StrategyAgent.execute(audienceName, audienceDescription, matchedUserIds.length);
    strategyName = strategy.name;
    strategyDescription = strategy.description;
    strategyChannel = strategy.channel;

    emitEvent('campaign.updated', campaignId, `Strategy formulated: "${strategyName}" (${strategyChannel})`, 'StrategyAgent', {
      strategyName,
      channel: strategyChannel,
      reasoning: strategy.reasoning
    });
  } else {
    // Manual Strategy
    const predefined = mockStrategies.find(s => s.id === input.strategySelection);
    if (predefined) {
      strategyName = predefined.name;
      strategyDescription = predefined.description;
      strategyChannel = predefined.channel;
      emitEvent('campaign.updated', campaignId, `Loaded manual strategy: "${strategyName}"`, 'StrategyAgent');
    } else {
      strategyName = "Generic Promotion";
      strategyDescription = "Standard discounts across active channels.";
      strategyChannel = "Multi-Channel";
      emitEvent('campaign.updated', campaignId, `Strategy "${input.strategySelection}" not found, using generic promotion`, 'StrategyAgent');
    }
  }

  // 4. Template Selection & Copy Generation
  let templateName = "";
  let templateSubject = "";
  let templateBody = "";
  let discountUsed = "20% OFF";
  let offerUsed = "Special Promo";
  let ctaUsed = "Shop Now";

  emitEvent('campaign.updated', campaignId, 'Template Agent Running...', 'TemplateAgent');

  if (input.templateSelection === 'AI Generated') {
    // Run Template Agent
    const template = await TemplateAgent.execute(input.campaignType, strategyName, strategyDescription);
    templateName = template.name;
    templateSubject = template.subject;
    templateBody = template.body;
    discountUsed = template.discountUsed;
    offerUsed = template.offerUsed;
    ctaUsed = template.ctaUsed;

    emitEvent('campaign.updated', campaignId, `Template copywriting generated: "${templateName}"`, 'TemplateAgent', {
      templateName,
      subject: templateSubject
    });
  } else {
    // Manual Template
    const predefined = mockTemplates.find(t => t.id === input.templateSelection);
    if (predefined) {
      templateName = predefined.name;
      templateSubject = predefined.subject;
      templateBody = predefined.body;
      
      // Determine placeholder defaults
      if (input.campaignType === "11.11 Sale") {
        discountUsed = "Flat 50% OFF";
        offerUsed = "11.11 Double Eleven Sale";
        ctaUsed = "Claim 11.11 Discount";
      } else if (input.campaignType === "Pakistan Day Sale") {
        discountUsed = "Flat 23% OFF";
        offerUsed = "Pakistan Day Resolution Deals";
        ctaUsed = "Shop Resolution Sale";
      } else if (input.campaignType === "Summer Sale") {
        discountUsed = "Up to 30% OFF";
        offerUsed = "Summer Launch Catalog";
        ctaUsed = "Shop Summer Vibes";
      } else {
        discountUsed = "Flat 40% OFF";
        offerUsed = "Black Friday Access";
        ctaUsed = "Enter Early Access";
      }
      
      emitEvent('campaign.updated', campaignId, `Loaded manual template: "${templateName}"`, 'TemplateAgent');
    } else {
      templateName = "Standard Email Layout";
      templateSubject = "A Special Offer for you!";
      templateBody = "Enjoy {{discount}} on our latest collections. Click here: {{cta}}";
      emitEvent('campaign.updated', campaignId, `Template "${input.templateSelection}" not found, using standard layout`, 'TemplateAgent');
    }
  }

  // 5. Simulate Campaign Running & Metrics
  emitEvent('campaign.updated', campaignId, 'Simulating campaign launch and collecting customer activities...', 'System');
  
  // Wait a short time to simulate run
  await new Promise(resolve => setTimeout(resolve, 1200));

  const totalUsersCount = matchedUserIds.length > 0 ? matchedUserIds.length : 1; // prevent division by zero
  
  // Heuristics for metrics based on strategy type
  let openRateFactor = 0.65; // default 65% open rate
  let clickRateFactor = 0.20; // default 20% click rate of opened
  let convRateFactor = 0.35; // default 35% conversion rate of clicked
  
  if (strategyName.includes("Flash Sale")) {
    openRateFactor = 0.70;
    clickRateFactor = 0.35; // highly urgent triggers clicks
    convRateFactor = 0.25;
  } else if (strategyName.includes("Loyalty")) {
    openRateFactor = 0.85; // loyal customers open more
    clickRateFactor = 0.30;
    convRateFactor = 0.50; // loyal customers purchase more
  } else if (strategyName.includes("Abandoned Cart")) {
    openRateFactor = 0.50;
    clickRateFactor = 0.40; // looking for checkout recovery
    convRateFactor = 0.45;
  }

  const sent = totalUsersCount;
  const opened = Math.max(1, Math.round(sent * openRateFactor));
  const clicked = Math.max(1, Math.round(opened * clickRateFactor));
  const converted = Math.max(0, Math.round(clicked * convRateFactor));
  
  const ctr = parseFloat(((clicked / sent) * 100).toFixed(1));
  const conversionRate = parseFloat(((converted / sent) * 100).toFixed(1));

  const metrics: CampaignMetrics = {
    sent,
    opened,
    clicked,
    converted,
    ctr,
    conversionRate
  };

  // Generate individual user activity logs for users in segment
  const matchedUsersList = mockUsers.filter(u => matchedUserIds.includes(u.id));
  const activities: CampaignActivity[] = matchedUsersList.map((user, idx) => {
    // Determine status deterministically for demo detail view
    const hash = (user.age + user.purchases + idx) % 100;
    let opened = false;
    let clicked = false;
    let converted = false;
    
    if (hash < openRateFactor * 100) {
      opened = true;
      if (hash < openRateFactor * clickRateFactor * 100) {
        clicked = true;
        if (hash < openRateFactor * clickRateFactor * convRateFactor * 100) {
          converted = true;
        }
      }
    }

    return {
      email: user.email,
      opened,
      clicked,
      converted
    };
  });

  // 6. Run Learning Agent
  emitEvent('campaign.updated', campaignId, 'Learning Agent Running...', 'LearningAgent');
  const recommendations = await LearningAgent.execute(metrics);
  emitEvent('campaign.updated', campaignId, 'Learning Recommendations generated.', 'LearningAgent', { recommendations });

  // 7. Finalize and Save Campaign
  const campaign: Campaign = {
    id: campaignId,
    name: input.campaignName,
    type: input.campaignType,
    audienceName,
    audienceFilter,
    userCount: sent,
    strategyName,
    templateName,
    templateSubject,
    templateBody,
    ctr,
    conversion: conversionRate,
    status: 'Completed',
    metrics,
    activities,
    recommendations,
    createdAt: new Date().toISOString()
  };

  addCampaign(campaign);

  // Emit campaign.completed & campaign.created
  emitEvent('campaign.created', campaignId, `Campaign "${campaign.name}" created.`, 'System');
  emitEvent('campaign.completed', campaignId, `Orchestration workflow completed successfully.`, 'OrchestratorAgent');

  console.log(`[OrchestratorAgent] Finished campaign orchestration for: "${campaign.name}"`);
  return campaign;
}
