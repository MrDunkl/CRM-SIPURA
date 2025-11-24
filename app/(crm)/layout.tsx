import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";

interface CrmLayoutProps {
  children: ReactNode;
}

export default function CrmLayout({ children }: CrmLayoutProps) {
  return (
    <>
      <Sidebar />
      <main
        className="min-h-screen flex justify-center"
        style={{ width: "calc(100% - 5rem)", marginRight: "5rem" }}
      >
        <div className="w-full max-w-5xl px-6 py-10">{children}</div>
      </main>
    </>
  );
}

