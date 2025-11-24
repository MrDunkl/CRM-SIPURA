import type { Metadata } from "next";
import "./globals.css";
import SupabaseProvider from "./components/providers/SupabaseProvider";

export const metadata: Metadata = {
  title: "CRM SIPURA",
  description: "A modern SaaS application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="bg-white" style={{ backgroundColor: "#FFFFFF" }}>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
