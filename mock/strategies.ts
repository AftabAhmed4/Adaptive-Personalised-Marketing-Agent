export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: string;
  channel: 'Email' | 'Push' | 'SMS' | 'Multi-Channel';
}

export const mockStrategies: Strategy[] = [
  {
    id: "strat_flash_sale",
    name: "Flash Sale",
    description: "High-urgency campaign with deep discounts, target active users with a limited-time countdown offer.",
    type: "Flash Sale",
    channel: "Multi-Channel"
  },
  {
    id: "strat_email_marketing",
    name: "Email Newsletter",
    description: "Standard email campaign focusing on storytelling, product announcements, and curated content catalog.",
    type: "Email Marketing",
    channel: "Email"
  },
  {
    id: "strat_push_notification",
    name: "Push Blast",
    description: "Instant notification sent directly to users' devices with a short, punchy hook and immediate call-to-action.",
    type: "Push Notification",
    channel: "Push"
  },
  {
    id: "strat_loyalty_campaign",
    name: "Loyalty Rewards Program",
    description: "Target high-purchase customers with exclusive perks, points multiplier, or early-access product drops.",
    type: "Loyalty Campaign",
    channel: "Email"
  },
  {
    id: "strat_bundle_discount",
    name: "Bundle & Save",
    description: "Cross-sell strategy grouping complementary items together at a discounted price to increase average order value.",
    type: "Bundle Discount",
    channel: "Multi-Channel"
  },
  {
    id: "strat_abandoned_cart",
    name: "Cart Recovery",
    description: "Triggered email to remind users about items left in their shopping cart, often offering a small incentive to complete checkout.",
    type: "Abandoned Cart",
    channel: "Email"
  }
];
