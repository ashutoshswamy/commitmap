import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://commitmap.ashutoshswamy.in"),
  title: {
    default: "CommitMap — Git Visualizer",
    template: "%s | CommitMap",
  },
  description:
    "Curate your code history. A high-fidelity digital archive for repositories.",
  keywords: [
    "git",
    "visualizer",
    "commit map",
    "code history",
    "digital archive",
    "repository",
    "developer tools",
  ],
  authors: [{ name: "CommitMap" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "CommitMap — Git Visualizer",
    description: "Curate your code history. A high-fidelity digital archive for repositories.",
    url: "https://commitmap.ashutoshswamy.in",
    siteName: "CommitMap",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 675,
        alt: "CommitMap — The Git Visualizer Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CommitMap — Git Visualizer",
    description: "Curate your code history. A high-fidelity digital archive for repositories.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-background">
        {children}
      </body>
    </html>
  );
}
