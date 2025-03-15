import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitScan",
  description: "AI-Powered Vulnerability Scanner for GitHub Repositories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="shortcut icon" href="/favicon.jpeg" type="image/x-icon" />
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
