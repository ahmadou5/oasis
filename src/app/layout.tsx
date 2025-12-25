import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { ReduxProvider } from "@/components/ReduxProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { Navigation } from "@/components/Navigation";
import FluidBackground from "@/components/FluidBackground";
import Layout from "@/components/Layout/Layout";
import SplashScreen from "../components/Layout/SplashScreen";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oasis - The Solana Staking Platform",
  description:
    "Decentralized Solana staking application for delegating SOL and earning rewards",
  keywords: "Solana, staking, SOL, validator, delegation, rewards, DeFi",
  authors: [{ name: "Oasis Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
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
        className={`${montserrat.variable} font-montserrat text-gray-900 dark:text-white min-h-screen relative overflow-x-hidden transition-colors duration-300`}
      >
        <ThemeProvider>
          <ReduxProvider>
            <WalletProvider>
              <Layout>
                <SplashScreen />
                {children}
              </Layout>
            </WalletProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
