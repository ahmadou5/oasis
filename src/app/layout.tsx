import type { Metadata } from "next";
import { Raleway, Comic_Neue } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { ReduxProvider } from "@/components/ReduxProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { Navigation } from "@/components/Navigation";
import FluidBackground from "@/components/FluidBackground";
import Layout from "@/components/Layout/Layout";

const raleway = Comic_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-comic-neue",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.classList.add(theme);
                console.log('Initial theme set:', theme);
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${raleway.variable} font-comic-neue text-gray-900 dark:text-white min-h-screen relative overflow-x-hidden transition-colors duration-300`}
      >
        <ThemeProvider>
          <ReduxProvider>
            <WalletProvider>
              <FluidBackground />
              <Layout>{children}</Layout>
            </WalletProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
