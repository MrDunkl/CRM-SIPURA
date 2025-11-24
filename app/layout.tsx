import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
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
        <SupabaseProvider>
          <Sidebar />
          <main
            className="min-h-screen flex justify-center"
            style={{ width: "calc(100% - 5rem)", marginRight: "5rem" }}
          >
            <div className="w-full max-w-5xl px-6 py-10">{children}</div>
          </main>
        </SupabaseProvider>
      </body>
    </html>
  );
}
