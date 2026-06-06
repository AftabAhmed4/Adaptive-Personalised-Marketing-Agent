import { NextResponse } from 'next/server';
import { getCampaignById } from '@/mock/campaigns';
import { mockUsers } from '@/mock/users';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = getCampaignById(id);
    
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const emailUser = process.env.EMAIL_USER;
    // Strip spaces from Gmail App Password (Gmail app passwords are 16 chars with spaces)
    const emailPass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');

    if (!emailUser || !emailPass) {
      return NextResponse.json({ error: "SMTP credentials missing in .env" }, { status: 500 });
    }

    // The real recipient email
    const recipientEmail = process.env.RECIPIENT_EMAIL || emailUser;

    // 1. Pick our detailed mock user (user_1) to personalize the email for
    const mockTargetUser = mockUsers.find(u => u.id === 'usr_1') || mockUsers[0];

    // 2. Personalize the template using Gemini AI
    const prompt = `
      You are an expert marketing copywriter. We have a base email template for a marketing campaign.
      I need you to rewrite the body of this email to be highly personalized for a specific user based on their mock profile.

      Base Template Subject: ${campaign.templateSubject}
      Base Template Body: ${campaign.templateBody}
      
      User Profile:
      - Name: ${mockTargetUser.name}
      - City: ${mockTargetUser.city}
      - Browsing History: ${mockTargetUser.browsingHistory?.join(', ') || 'N/A'}
      - Past Interactions: ${mockTargetUser.pastInteractions?.join(', ') || 'N/A'}
      - Total Spent: $${mockTargetUser.totalSpent}

      Instructions:
      - Write only the rewritten email body.
      - Make it sound human and engaging.
      - Mention their city, or reference their browsing history naturally.
      - Keep the core offer (${campaign.type}) intact.
      - Do not include subject line or any markdown wrapping like \`\`\`.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const personalizedBody = response.text || campaign.templateBody;

    // 3. Set up Nodemailer transporter with explicit SMTP config (more reliable than 'service: gmail')
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify SMTP connection before sending
    await transporter.verify();

    // 4. Dispatch the personalized email to the recipient
    const info = await transporter.sendMail({
      from: `"MarketAI Agent" <${emailUser}>`,
      to: recipientEmail,
      subject: `[Personalized for ${mockTargetUser.name}] ${campaign.templateSubject}`,
      text: personalizedBody,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#7c3aed">MarketAI Campaign</h2>
        <p style="color:#333">${personalizedBody.replace(/\n/g, '<br/>')}</p>
        <hr style="border:1px solid #e0e0e0;margin:24px 0"/>
        <small style="color:#999">Sent by MarketAI Agent for campaign: ${campaign.name}</small>
      </div>`,
    });

    console.log('[Email] Sent successfully. MessageId:', info.messageId, 'To:', recipientEmail);

    // 5. Respond with success
    return NextResponse.json({ 
      success: true, 
      sentTo: recipientEmail,
      personalizedFor: mockTargetUser.name,
      personalizedBody 
    });

  } catch (error: any) {
    console.error('[Email] SMTP Error:', error.code, error.response || error.message);
    return NextResponse.json({ 
      error: error.message,
      code: error.code || 'UNKNOWN'
    }, { status: 500 });
  }
}
