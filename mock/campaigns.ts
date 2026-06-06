import fs from 'fs';
import path from 'path';

export interface CampaignActivity {
  email: string;
  opened: boolean;
  clicked: boolean;
  converted: boolean;
}

export interface CampaignMetrics {
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  ctr: number;
  conversionRate: number;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  audienceName: string;
  audienceFilter: any;
  userCount: number;
  strategyName: string;
  templateName: string;
  templateSubject: string;
  templateBody: string;
  ctr: number;
  conversion: number;
  status: 'Draft' | 'In Progress' | 'Completed' | 'Active';
  metrics: CampaignMetrics;
  activities: CampaignActivity[];
  recommendations: string[];
  createdAt: string;
}

const FILE_PATH = path.join(process.cwd(), 'mock', 'campaigns.json');

const initialCampaigns: Campaign[] = [
  {
    id: "camp_1",
    name: "Pakistan Day Resolution Bonanza",
    type: "Pakistan Day Sale",
    audienceName: "Active Islamabad Youth",
    audienceFilter: { ageMin: 18, ageMax: 28, cities: ["Islamabad"] },
    userCount: 15,
    strategyName: "Bundle & Save",
    templateName: "Pakistan Day Resolution Sale",
    templateSubject: "🇵🇰 Celebrate Pakistan Day with 25% OFF!",
    templateBody: "Dear Zainab,\n\nHappy Pakistan Day! Celebrate with our special Pakistan Day Resolution Sale designed exclusively for you.\n\nGet 25% off our latest collections with free nationwide delivery.\n\n👉 Redeem Offer: Shop Now\n\nJashn-e-Azadi Mubarak!",
    ctr: 8.5,
    conversion: 3.2,
    status: "Completed",
    createdAt: "2026-03-23T10:00:00.000Z",
    metrics: {
      sent: 100,
      opened: 65,
      clicked: 12,
      converted: 4,
      ctr: 12.0,
      conversionRate: 4.0
    },
    activities: [
      { email: "zainab.ahmed@outlook.com", opened: true, clicked: true, converted: true },
      { email: "hania.amir@gmail.com", opened: true, clicked: true, converted: true },
      { email: "shadab.k@gmail.com", opened: true, clicked: true, converted: false },
      { email: "imad.w@yahoo.com", opened: true, clicked: false, converted: false },
      { email: "kashif.m@yahoo.com", opened: false, clicked: false, converted: false }
    ],
    recommendations: [
      "The bundle discount worked exceptionally well for younger segments.",
      "The CTR was very high (12.0%). Maintain similar timing (morning releases) for next season.",
      "Conversion could be boosted by adding a limited-time countdown timer to the landing page."
    ]
  },
  {
    id: "camp_2",
    name: "Pre-Summer Clothing Drive",
    type: "Summer Sale",
    audienceName: "Young Tech-Savvy Women in Karachi",
    audienceFilter: { ageMin: 20, ageMax: 35, gender: "Female", cities: ["Karachi"] },
    userCount: 22,
    strategyName: "Flash Sale",
    templateName: "Summer Vibes Discount",
    templateSubject: "☀️ Beat the Heat: 30% Off Summer Launch!",
    templateBody: "Hey Ayesha,\n\nCool down this season with our refreshing Summer Sale! Enjoy 30% OFF across our store.\n\nMake your summer brighter with our hottest deals!\n\n👉 Shop Summer Collection: Get Discount\n\nStay cool!",
    ctr: 5.2,
    conversion: 1.8,
    status: "Active",
    createdAt: "2026-05-15T08:30:00.000Z",
    metrics: {
      sent: 250,
      opened: 180,
      clicked: 32,
      converted: 11,
      ctr: 12.8,
      conversionRate: 4.4
    },
    activities: [
      { email: "ayesha.khan@gmail.com", opened: true, clicked: true, converted: true },
      { email: "nida.yasir@gmail.com", opened: true, clicked: true, converted: false },
      { email: "iqra.aziz@gmail.com", opened: true, clicked: false, converted: false },
      { email: "sarah.q@gmail.com", opened: false, clicked: false, converted: false }
    ],
    recommendations: [
      "High device-open rates suggest push notifications were highly effective.",
      "CTR is healthy, but conversion rate lags. Test offering free shipping to Karachi addresses during checkout."
    ]
  },
  {
    id: "camp_3",
    name: "11.11 Early Bird Teaser",
    type: "11.11 Sale",
    audienceName: "High Value Customers (Lahore)",
    audienceFilter: { cities: ["Lahore"], minPurchases: 10 },
    userCount: 18,
    strategyName: "Loyalty Rewards Program",
    templateName: "11.11 Sale Template",
    templateSubject: "🔥 Biggest Sale of the Year: 50% Off Early Access!",
    templateBody: "Dear Muhammad,\n\nGet ready for the mega shopping event of the year! We are offering a whopping 50% off on all your favorite categories.\n\nDon't wait. Items are selling out fast!\n\n👉 Click here: Claim Early Access\n\nHappy Shopping!",
    ctr: 12.4,
    conversion: 6.8,
    status: "Completed",
    createdAt: "2025-11-01T12:00:00.000Z",
    metrics: {
      sent: 80,
      opened: 72,
      clicked: 25,
      converted: 14,
      ctr: 31.2,
      conversionRate: 17.5
    },
    activities: [
      { email: "m.ali@yahoo.com", opened: true, clicked: true, converted: true },
      { email: "sanamalik@gmail.com", opened: true, clicked: true, converted: true },
      { email: "fahad.m@gmail.com", opened: true, clicked: true, converted: false },
      { email: "babar.azam@gmail.com", opened: true, clicked: true, converted: true }
    ],
    recommendations: [
      "Loyalty VIP audience conversion is extremely high (17.5%). Keep this cohort exclusive.",
      "Offer early checkout for high-value items as they sell out within minutes."
    ]
  }
];

function ensureFileExists() {
  const dir = path.dirname(FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(initialCampaigns, null, 2), 'utf-8');
  }
}

export function getCampaigns(): Campaign[] {
  ensureFileExists();
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading campaigns:", error);
    return initialCampaigns;
  }
}

export function getCampaignById(id: string): Campaign | undefined {
  const campaigns = getCampaigns();
  return campaigns.find(c => c.id === id);
}

export function addCampaign(campaign: Campaign): void {
  ensureFileExists();
  const campaigns = getCampaigns();
  campaigns.unshift(campaign); // Add to beginning of list
  fs.writeFileSync(FILE_PATH, JSON.stringify(campaigns, null, 2), 'utf-8');
}

export function updateCampaign(id: string, updates: Partial<Campaign>): Campaign | undefined {
  ensureFileExists();
  const campaigns = getCampaigns();
  const index = campaigns.findIndex(c => c.id === id);
  if (index !== -1) {
    campaigns[index] = { ...campaigns[index], ...updates };
    fs.writeFileSync(FILE_PATH, JSON.stringify(campaigns, null, 2), 'utf-8');
    return campaigns[index];
  }
  return undefined;
}
