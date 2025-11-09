import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Script from 'next/script';

export const metadata: Metadata = {
  title: "QQQ Investment Calculator - Simulate QQQ ETF Returns & Investment Growth",
  description: "Free QQQ investment calculator to simulate returns, analyze investment growth, and visualize your QQQ ETF portfolio performance. Calculate compound returns, monthly investments, and projected wealth accumulation for Nasdaq-100 investments.",
  keywords: ["QQQ investment calculator", "QQQ ETF returns", "QQQ investment simulator", "Nasdaq-100 calculator", "ETF investment analysis", "QQQ portfolio growth", "investment calculator", "ETF returns calculator", "Nasdaq investment tool", "QQQ wealth calculator", "ETF profit calculator", "QQQ compound returns"],
  authors: [{ name: "QQQ Investment Calculator" }],
  creator: "QQQ Investment Calculator",
  publisher: "QQQ Investment Calculator",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://if-you-invest-qqq.vercel.app',
    title: 'QQQ Investment Calculator - Simulate QQQ ETF Returns & Investment Growth',
    description: 'Free QQQ investment calculator to simulate returns, analyze investment growth, and visualize your QQQ ETF portfolio performance.',
    siteName: 'QQQ Investment Calculator',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'QQQ Investment Calculator - Simulate Returns and Investment Growth',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QQQ Investment Calculator - Simulate QQQ ETF Returns & Investment Growth',
    description: 'Free QQQ investment calculator to simulate returns, analyze investment growth, and visualize your QQQ ETF portfolio performance.',
    creator: '@your-twitter-handle',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://if-you-invest-qqq.vercel.app',
  },
  other: {
    'theme-color': '#667eea',
    'msapplication-TileColor': '#667eea',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#667eea',
      },
    ],
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL('https://if-you-invest-qqq.vercel.app'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "QQQ Investment Calculator",
    "description": "Free QQQ investment calculator to simulate returns, analyze investment growth, and visualize your QQQ ETF portfolio performance.",
    "url": "https://if-you-invest-qqq.vercel.app",
    "applicationCategory": "FinanceApplication",
    "applicationSubCategory": "Investment Calculator",
    "operatingSystem": "Web Browser",
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "dateModified": "2024-11-09",
    "author": {
      "@type": "Organization",
      "name": "QQQ Investment Calculator"
    },
    "publisher": {
      "@type": "Organization",
      "name": "QQQ Investment Calculator"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free QQQ investment calculator"
    },
    "featureList": [
      "QQQ ETF return simulation",
      "Investment growth analysis",
      "Compound return calculations",
      "Monthly investment planning",
      "Portfolio performance visualization",
      "Wealth accumulation projections"
    ],
    "screenshot": "/screenshot/result.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    },
    "keywords": "QQQ investment calculator, QQQ ETF returns, investment simulator, ETF analysis, financial calculator",
    "mainEntity": {
      "@type": "Service",
      "name": "QQQ Investment Calculation",
      "description": "Online tool for calculating and simulating QQQ ETF investment returns and growth"
    }
  };

  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="7HFogv_3jnp93WlOKjh26rw86o8jp4SWJoOzzbrDnAY" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#667eea" />
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </head>
      
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
