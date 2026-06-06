import { NextResponse } from 'next/server';
import { getEvents, clearEvents } from '@/utils/eventBus';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    
    let events = getEvents();
    if (campaignId) {
      events = events.filter(e => e.campaignId === campaignId);
    }
    
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    clearEvents();
    return NextResponse.json({ success: true, message: "Event log cleared." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
