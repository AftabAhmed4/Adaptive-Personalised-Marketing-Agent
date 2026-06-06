export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  filters: {
    ageMin?: number;
    ageMax?: number;
    gender?: 'Male' | 'Female' | 'Non-binary' | 'All';
    cities?: string[];
    minPurchases?: number;
    maxPurchases?: number;
    lastActiveDays?: number;
  };
}

export const mockAudiences: AudienceSegment[] = [
  {
    id: "aud_young_female_karachi",
    name: "Young Tech-Savvy Women in Karachi",
    description: "Women aged 20-35 living in Karachi with more than 2 purchases.",
    filters: {
      ageMin: 20,
      ageMax: 35,
      gender: "Female",
      cities: ["Karachi"],
      minPurchases: 2
    }
  },
  {
    id: "aud_high_spenders_lahore",
    name: "High Value Customers (Lahore)",
    description: "All users in Lahore with a history of substantial purchasing behavior (min 10 purchases).",
    filters: {
      cities: ["Lahore"],
      minPurchases: 10
    }
  },
  {
    id: "aud_dormant_buyers",
    name: "Dormant Buyers Re-engagement",
    description: "Users who have made at least 1 purchase but have not been active in the last 15 days.",
    filters: {
      minPurchases: 1,
      lastActiveDays: 15
    }
  },
  {
    id: "aud_active_youth_islamabad",
    name: "Active Islamabad Youth",
    description: "Youth aged 18-28 in Islamabad who recently placed an order.",
    filters: {
      ageMin: 18,
      ageMax: 28,
      cities: ["Islamabad"],
      minPurchases: 3
    }
  }
];
