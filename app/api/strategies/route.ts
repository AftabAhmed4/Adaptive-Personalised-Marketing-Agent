import { NextResponse } from 'next/server';
import { mockStrategies } from '@/mock/strategies';
import { execute as runStrategyAgent } from '@/adk/agents/StrategyAgent';

export async function GET() {
  try {
    return NextResponse.json(mockStrategies);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { audienceName, audienceDescription, userCount } = body;
    
    if (!audienceName || !audienceDescription) {
      return NextResponse.json({ error: "Missing audienceName or audienceDescription" }, { status: 400 });
    }
    
    const count = userCount !== undefined ? Number(userCount) : 0;
    const strategy = await runStrategyAgent(audienceName, audienceDescription, count);
    return NextResponse.json(strategy);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
