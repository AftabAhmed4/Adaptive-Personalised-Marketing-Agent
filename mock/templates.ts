export interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  placeholders: string[];
}

export const mockTemplates: Template[] = [
  {
    id: "temp_11_11",
    name: "11.11 Sale Template",
    subject: "🔥 Biggest Sale of the Year: {{offer}}!",
    body: `Hi {{name}},

Get ready for the mega shopping event of the year! We are offering a whopping {{discount}} on all your favorite categories.

Don't wait. Items are selling out fast!

👉 Click here: {{cta}}

Happy Shopping!`,
    placeholders: ["name", "discount", "offer", "cta"]
  },
  {
    id: "temp_pakistan_day",
    name: "Pakistan Day Resolution Sale",
    subject: "🇵🇰 Celebrate Pakistan Day with {{discount}} OFF!",
    body: `Dear {{name}},

Happy Pakistan Day! Celebrate with our special {{offer}} designed exclusively for you. 

Get {{discount}} on our latest collections with free nationwide delivery.

👉 Redeem Offer: {{cta}}

Jashn-e-Azadi Mubarak!`,
    placeholders: ["name", "discount", "offer", "cta"]
  },
  {
    id: "temp_summer_sale",
    name: "Summer Vibes Discount",
    subject: "☀️ Beat the Heat: {{offer}} inside!",
    body: `Hey {{name}},

Cool down this season with our refreshing Summer Sale! Enjoy {{discount}} across our store.

Make your summer brighter with our hottest deals!

👉 Shop Summer Collection: {{cta}}

Stay cool!`,
    placeholders: ["name", "discount", "offer", "cta"]
  },
  {
    id: "temp_black_friday",
    name: "Black Friday Extravaganza",
    subject: "🛍️ Black Friday VIP Access: {{discount}} OFF!",
    body: `Hi {{name}},

The wait is finally over. Black Friday is here, and you have exclusive access to our {{offer}}!

Grab {{discount}} before the sale opens to the general public.

👉 Access VIP Deals: {{cta}}

Hurry, inventory is extremely limited!`,
    placeholders: ["name", "discount", "offer", "cta"]
  }
];
