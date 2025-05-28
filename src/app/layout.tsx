import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QQQ Investment Calculator 📈💰",
  description: "Welcome to the QQQ Investment Calculator, a web application designed to help you simulate and visualize potential returns on investments in QQQ (Invesco QQQ Trust, an exchange-traded fund based on the Nasdaq-100 Index). This tool allows you to input various investment parameters and see the projected growth over time.",
  keywords: ["QQQ", "Investment", "Calculator", "Nasdaq-100", "ETF", "Stock Market", "Finance", "Returns", "Investment Simulator", "Investment Visualization", "Financial Planning", "Invesco QQQ Trust"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="google-site-verification" content="7HFogv_3jnp93WlOKjh26rw86o8jp4SWJoOzzbrDnAY" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-2DZ7BDV92W"
        />
        <Script id="google-analytics-inline" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-2DZ7BDV92W');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
