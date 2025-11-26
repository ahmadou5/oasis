import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { ReduxProvider } from "@/components/ReduxProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { Navigation } from "@/components/Navigation";
import FluidBackground from "@/components/FluidBackground";
import Layout from "@/components/Layout/Layout";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stakeit - Solana Staking Platform",
  description:
    "Decentralized Solana staking application for delegating SOL and earning rewards",
  keywords: "Solana, staking, SOL, validator, delegation, rewards, DeFi",
  authors: [{ name: "Stakeit Team" }],
  openGraph: {
    title: "Stakeit - Solana Staking Platform",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${raleway.variable} font-raleway bg-white dark:bg-solana-dark text-gray-900 dark:text-white min-h-screen relative overflow-x-hidden transition-colors duration-300`}
      >
        <ThemeProvider>
          <ReduxProvider>
            <WalletProvider>
              <Layout>{children}</Layout>
            </WalletProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
