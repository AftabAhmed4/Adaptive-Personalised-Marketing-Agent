import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "MarketAI – AI-Powered Marketing Platform",
  description: "Autonomous AI-powered personalized marketing campaigns using multi-agent orchestration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="main-area">{children}</div>
        </div>
      </body>
    </html>
  );
}
