import { NextResponse } from 'next/server';
import { mockTemplates } from '@/mock/templates';
import { execute as runTemplateAgent } from '@/adk/agents/TemplateAgent';

export async function GET() {
  try {
    return NextResponse.json(mockTemplates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignType, strategyName, strategyDescription } = body;
    
    if (!campaignType || !strategyName || !strategyDescription) {
      return NextResponse.json({ error: "Missing campaignType, strategyName, or strategyDescription" }, { status: 400 });
    }
    
    const template = await runTemplateAgent(campaignType, strategyName, strategyDescription);
    return NextResponse.json(template);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
