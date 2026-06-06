# Adaptive Personalised Marketing Agent

A full-stack AI-powered marketing automation platform built with Next.js 16, Google Gemini 2.5 Flash, and Gmail SMTP. The system orchestrates multiple specialized AI agents to automatically create, personalize, and dispatch email campaigns to segmented audiences.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Architecture Overview](#architecture-overview)
- [AI Agent Pipeline](#ai-agent-pipeline)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [How to Test](#how-to-test)
- [Email Personalization](#email-personalization)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## How It Works

The platform simulates a complete AI-driven marketing workflow:

1. **You configure a campaign** — choose a campaign type (e.g., Summer Sale), and whether each component (audience, strategy, template) should be AI-generated or manually selected.

2. **Multi-agent orchestration begins** — four specialized AI agents run sequentially. You can watch their progress live via the event log.

3. **Campaign data is saved** — metrics, user activity, and AI recommendations are computed and stored for the session.

4. **You view the campaign** — analytics, audience activity, and learning insights are all available on the Campaign Detail page.

5. **You dispatch a real email** — click "Launch & Send Emails" to trigger Gemini to write a hyper-personalized email for a target user, then send it via Gmail SMTP.

---

## Architecture Overview

```
User Browser
    |
    |-- POST /api/campaigns        --> Triggers OrchestratorAgent (background, non-blocking)
    |-- GET  /api/campaigns/events --> Frontend polls this every 1.5s (live log stream)
    |-- GET  /api/campaigns/:id    --> Campaign detail data
    `-- POST /api/campaigns/:id/send --> Gemini personalization --> Gmail SMTP dispatch
```

The orchestration runs **asynchronously** — the API returns `202 Accepted` immediately, so the UI never freezes. The frontend polls the Event Bus to get real-time agent progress updates.

---

## AI Agent Pipeline

The `OrchestratorAgent` runs these agents in sequence:

### 1. AudienceAgent
- Analyzes the campaign type and user demographic data
- Uses Gemini to select or AI-generate an audience segment
- Filters `mockUsers` based on age, gender, city, purchases
- **Output:** Audience name, description, list of matched user IDs

### 2. StrategyAgent
- Receives audience profile from AudienceAgent
- Uses Gemini to pick the best strategy from predefined options: Flash Sale, Email Marketing, Push Notifications, Loyalty Campaign, Bundle Discount, Cart Recovery
- Provides strategic reasoning
- **Output:** Strategy name, channel, tailored description

### 3. TemplateAgent
- Receives campaign type + strategy from above agents
- Uses Gemini to write a complete email template with subject line and body
- Fills in placeholders: `{{name}}`, `{{discount}}`, `{{offer}}`, `{{cta}}`
- **Output:** Template subject, body copy, discount value, CTA text

### 4. LearningAgent
- Analyzes simulated campaign metrics (open rate, CTR, conversion rate)
- Uses Gemini to generate 3 specific, actionable recommendations
- **Output:** Array of improvement insights for future campaigns

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.7 (App Router, Turbopack) |
| AI Model | Google Gemini 2.5 Flash (`@google/genai`) |
| Agent SDK | Google ADK (`@google/adk`) |
| Email | Nodemailer + Gmail SMTP (App Password) |
| UI Charts | Recharts |
| Icons | Lucide React |
| Styling | Vanilla CSS + Tailwind CSS |
| Language | TypeScript |
| Runtime | Node.js v22 |

---

## Project Structure

```
marketing-agent/
├── app/
│   ├── api/
│   │   ├── campaigns/
│   │   │   ├── route.ts              # GET all campaigns, POST create
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts          # GET campaign by ID
│   │   │   │   └── send/
│   │   │   │       └── route.ts      # POST send personalized email via SMTP
│   │   │   └── events/
│   │   │       └── route.ts          # GET/DELETE event bus logs
│   │   ├── audiences/route.ts
│   │   ├── strategies/route.ts
│   │   └── templates/route.ts
│   ├── campaigns/
│   │   ├── page.tsx                  # Campaigns list
│   │   ├── create/page.tsx           # Create campaign + live agent log
│   │   └── [id]/page.tsx             # Campaign detail, analytics, email send
│   ├── dashboard/page.tsx            # Home dashboard with metrics
│   ├── audiences/page.tsx
│   ├── strategies/page.tsx
│   └── templates/page.tsx
│
├── adk/agents/
│   ├── OrchestratorAgent.ts          # Main pipeline coordinator
│   ├── AudienceAgent.ts              # Audience segmentation via Gemini
│   ├── StrategyAgent.ts              # Marketing strategy selection via Gemini
│   ├── TemplateAgent.ts              # Email copywriting via Gemini
│   └── LearningAgent.ts             # Performance analysis via Gemini
│
├── mock/
│   ├── users.ts                      # 100 mock user profiles with browsing history
│   ├── audiences.ts                  # Predefined audience segments
│   ├── strategies.ts                 # Predefined strategy options
│   ├── templates.ts                  # Predefined email templates
│   └── campaigns.ts                  # In-memory campaign store
│
├── utils/
│   └── eventBus.ts                   # Shared in-memory event log for agent comms
│
├── components/
│   └── Sidebar.tsx
│
├── .env                              # SMTP + Gemini credentials (never commit!)
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Node.js v20 or v22
- A Google Gemini API key — [Get one here](https://aistudio.google.com/app/apikey)
- A Gmail account with **2-Step Verification** enabled
- A Gmail **App Password** — [Generate one here](https://myaccount.google.com/apppasswords)

### 1. Clone & Install

```bash
git clone <repo-url>
cd marketing-agent
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
RECIPIENT_EMAIL=receiver@gmail.com
```

> **Important:** `EMAIL_PASS` is a Gmail **App Password** (16 characters, displayed with spaces by Google). You can paste it with or without spaces — the code automatically strips them.

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `EMAIL_USER` | Gmail address to send from | `yourname@gmail.com` |
| `EMAIL_PASS` | Gmail App Password (16 chars) | `rmok oncb hpvj ghpp` |
| `RECIPIENT_EMAIL` | Email address to receive demo emails | `test@gmail.com` |

> **Never commit your `.env` file.** It is listed in `.gitignore` by default.

---

## Running the App

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm run start
```

---

## How to Test

### 1. Create a Campaign (Full AI Flow)

1. Open [http://localhost:3000/campaigns/create](http://localhost:3000/campaigns/create)
2. Enter a **Campaign Name** (e.g., `Summer Mega Sale`)
3. Select a **Campaign Type** (e.g., `Summer Sale`)
4. Leave all three selections as **AI Generated** for maximum demo impact
5. Click **"Generate Campaign"**

**What you will see:**
- The screen immediately switches to the **live orchestration view** (no freeze)
- 4 agent cards animate through `Waiting -> Active -> Done` states
- A **live log** streams every agent message in real time
- When all agents complete, the success banner appears
- After 2.5 seconds, you are **automatically navigated to the Dashboard**
- A **"Campaign Created!"** toast slides up from the bottom right

---

### 2. View Campaign Analytics

1. Click on any campaign from the Dashboard or Campaigns list
2. You will see:
   - **Subject Line** generated by the Template Agent
   - **6 metric cards**: Sent, Opened, Clicked, Converted, CTR, Conversion Rate
   - **Funnel Bar Chart** (horizontal bar breakdown)
   - **Engagement Pie Chart** (opened / clicked / converted / unopened)
   - **3 tabs**: Overview, User Activity, AI Learning Insights

---

### 3. Send a Real Personalized Email

1. Open any completed Campaign Detail page
2. Click **"Launch & Send Emails"** (top right button)
3. Wait 5-10 seconds while:
   - Gemini reads the user's mock browsing history and past interactions
   - Gemini rewrites the campaign email body to be deeply personalized for that user
   - Nodemailer dispatches the email via Gmail SMTP
4. A **modal** will appear:
   - **On success:** Shows the AI-personalized email body preview + the delivery address (`RECIPIENT_EMAIL`)
   - **On failure:** Shows the exact SMTP error message for debugging

**Check your inbox at `RECIPIENT_EMAIL` for the received email!**

---

### 4. Explore Mock Data Views

Navigate to:
- `/audiences` — View all pre-built audience segments with size and filters
- `/strategies` — Browse 6 predefined marketing strategies with channel info
- `/templates` — See all email template variants and preview subjects

---

## Email Personalization

When "Launch & Send Emails" is triggered, the system:

1. Picks `usr_1` (Ayesha Khan) from mock users as the demo recipient context
2. Gathers her rich profile data:
   - **Browsing History:** "Viewed Summer Lawn Suits", "Abandoned Cart: Floral Kurti"
   - **Past Interactions:** "Frequent Buyer", "Clicked '50% Off' email last week"
   - **Demographics:** City (Karachi), Age (24), Total Spent (PKR 24,500)
3. Sends all of this to Gemini with the base email template
4. Gemini rewrites the email to reference her specific interests, city, and behavior
5. The personalized email is dispatched as a styled HTML email to `RECIPIENT_EMAIL`

---

## API Reference

### `GET /api/campaigns`
Returns all campaigns in memory.

### `POST /api/campaigns`
Starts a new campaign orchestration.

**Body:**
```json
{
  "campaignId": "camp_1234567890",
  "campaignName": "Summer Sale 2026",
  "campaignType": "Summer Sale",
  "audienceSelection": "AI Generated",
  "strategySelection": "AI Generated",
  "templateSelection": "AI Generated"
}
```

**Response:** `202 Accepted`

### `GET /api/campaigns/events?campaignId=camp_xyz`
Returns all Event Bus logs for a specific campaign (used for live polling).

### `DELETE /api/campaigns/events`
Clears all events (called before starting a new campaign).

### `GET /api/campaigns/:id`
Returns a single campaign by ID including full metrics and activities.

### `POST /api/campaigns/:id/send`
Triggers AI personalization + Gmail SMTP dispatch for the campaign.

**Response:**
```json
{
  "success": true,
  "sentTo": "recipient@gmail.com",
  "personalizedFor": "Ayesha Khan",
  "personalizedBody": "Hi Ayesha, we noticed you were eyeing..."
}
```

---

## Troubleshooting

### Email Not Sending

| Error | Fix |
|---|---|
| `Invalid login` / `Username and Password not accepted` | Your App Password is wrong. Re-generate it at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords). Make sure 2-Step Verification is ON. |
| `ECONNREFUSED` or `ETIMEDOUT` | SMTP port 465 may be blocked by your firewall or VPN. Try disabling VPN. |
| `Self-signed certificate` error | Already handled — `rejectUnauthorized: false` is set in the TLS config. |
| No error but modal does not show | Check the browser Console and the terminal running `npm run dev` for `[Email]` log lines. |

### App Password Tip

Gmail App Passwords look like `rmok oncb hpvj ghpp`. Paste them into `.env` **with or without spaces** — spaces are automatically stripped by the application.

```env
# Both formats work:
EMAIL_PASS=rmok oncb hpvj ghpp
EMAIL_PASS=rmokoncbhpvjghpp
```

### Dev Server `.env` Not Loading

Next.js caches env variables at startup. After editing `.env`, you must **restart the dev server**:

```bash
# Press Ctrl+C to stop, then:
npm run dev
```

### Charts Showing "Width/Height -1" Warning

This is a harmless Recharts SSR warning during static page generation (`npm run build`). It does not affect the running app.
