import type { Metadata } from "next";
import { Geist, Geist_Mono, Google_Sans_Flex } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const googleSansFlex = Google_Sans_Flex({
  variable: "--font-google-sans-flex",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ineem",
  description:
      "Ineem is the AI powered Email assistant to automate, fraud detection and more for your emails with AI agents",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
        />
        <link
            href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap"
            rel="stylesheet"
        />
      </head>
      <body
          className={`${geistSans.variable} ${googleSansFlex.variable} antialiased`}
      >
      <Providers>{children}</Providers>
      </body>
      </html>
  );
}
