import { NextResponse } from 'next/server';
import { getCampaigns } from '@/mock/campaigns';
import { execute as runOrchestrator } from '@/adk/agents/OrchestratorAgent';

export async function GET() {
  try {
    const campaigns = getCampaigns();
    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignName, campaignType, audienceSelection, strategySelection, templateSelection } = body;
    
    if (!campaignName || !campaignType || !audienceSelection || !strategySelection || !templateSelection) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Trigger sequential agent execution asynchronously in the background.
    // The Event Bus will receive progress logs which the frontend polls.
    runOrchestrator({
      campaignName,
      campaignType,
      audienceSelection,
      strategySelection,
      templateSelection
    }).catch(err => {
      console.error("[api/campaigns] Background orchestration failed:", err);
    });

    return NextResponse.json({ 
      status: "Accepted",
      message: "Campaign orchestration started."
    }, { status: 202 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
