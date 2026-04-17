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
  openGraph: {
    title: "CommitMap — Git Visualizer",
    description: "Curate your code history. A high-fidelity digital archive for repositories.",
    url: "https://commitmap.ashutoshswamy.in",
    siteName: "CommitMap",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CommitMap — Git Visualizer",
    description: "Curate your code history. A high-fidelity digital archive for repositories.",
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
