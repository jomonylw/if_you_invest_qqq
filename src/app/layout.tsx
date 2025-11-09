import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Script from 'next/script';

export const metadata: Metadata = {
  title: "QQQ Investment Calculator 📈💰",
  description: "Welcome to the QQQ Investment Calculator, a web application designed to help you simulate and visualize potential returns on investments in QQQ (Invesco QQQ Trust, an exchange-traded fund based on the Nasdaq-100 Index). This tool allows you to input various investment parameters and see the projected growth over time.",
  keywords: ["QQQ", "Investment", "Calculator", "Nasdaq-100", "ETF", "Stock Market", "Finance", "Returns", "Investment Simulator", "Investment Visualization", "Financial Planning", "Invesco QQQ Trust"],
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-36x36.png', sizes: '36x36', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/favicon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/favicon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/favicon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/favicon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/favicon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="google-site-verification" content="7HFogv_3jnp93WlOKjh26rw86o8jp4SWJoOzzbrDnAY" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
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
        <Script
          id="adsbygoogle-script"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4965699846457045"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
