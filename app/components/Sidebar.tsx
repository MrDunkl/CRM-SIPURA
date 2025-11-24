"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { FaUsers, FaChartLine, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import { MdLeaderboard } from "react-icons/md";
import AuthModal from "./auth/AuthModal";

interface AppIconProps {
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  href?: string;
  onClick?: () => void;
}

const AppIcon: React.FC<AppIconProps> = ({ icon, label, bgColor, href, onClick }) => {
  const content = (
    <>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg shadow-md hover:shadow-lg transition-all duration-200"
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </div>
      <span className="text-[10px] font-medium text-gray-700">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex flex-col items-center gap-1 cursor-pointer transform transition-all duration-200 hover:scale-110"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-1 cursor-pointer transform transition-all duration-200 hover:scale-110"
    >
      {content}
    </div>
  );
};

export default function Sidebar() {
  const { session, supabaseClient } = useSessionContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const employeeId = session?.user?.id ?? null;
  const metadata = (session?.user?.user_metadata ?? {}) as {
    first_name?: string;
    last_name?: string;
    employee_code?: string;
  };

  const initials = useMemo(() => {
    if (!employeeId) return "•";
    const first = metadata.first_name?.[0] ?? session?.user?.email?.[0] ?? "";
    const last = metadata.last_name?.[0] ?? "";
    const value = `${first}${last}`.trim();
    return value ? value.toUpperCase() : "•";
  }, [employeeId, metadata.first_name, metadata.last_name, session?.user?.email]);

  const displayName = useMemo(() => {
    const name = `${metadata.first_name ?? ""} ${metadata.last_name ?? ""}`.trim();
    return name || session?.user?.email || "Unbekannt";
  }, [metadata.first_name, metadata.last_name, session?.user?.email]);

  const employeeCode = metadata.employee_code ?? "—";

  const handleCircleClick = () => {
    if (employeeId) {
      setShowPopover((prev) => !prev);
    } else {
      setIsModalOpen(true);
      setShowPopover(false);
    }
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setShowPopover(false);
    setIsModalOpen(false);
  };

  const apps = [
    {
      icon: <FaUsers />,
      label: "Leads",
      bgColor: "rgb(59, 130, 246)", // Blue
      href: "/lead",
    },
    {
      icon: <FaChartLine />,
      label: "Analytics",
      bgColor: "rgb(16, 185, 129)", // Green
    },
    {
      icon: <FaUsers />,
      label: "Team",
      bgColor: "rgb(139, 92, 246)", // Purple
    },
    {
      icon: <FaFileAlt />,
      label: "Dokumente",
      bgColor: "rgb(245, 158, 11)", // Orange
    },
    {
      icon: <FaCalendarAlt />,
      label: "Events",
      bgColor: "rgb(236, 72, 153)", // Pink
    },
    {
      icon: <MdLeaderboard />,
      label: "Leaderboard",
      bgColor: "rgb(239, 68, 68)", // Red
    },
  ];

  return (
    <>
      <div
        className="fixed top-0 right-0 h-screen w-20 flex flex-col items-center justify-between py-8 gap-5 shadow-lg z-40"
        style={{ backgroundColor: "#fafafc" }}
      >
        <div className="flex flex-col items-center justify-center gap-5">
          {apps.map((app, index) => (
            <AppIcon
              key={index}
              icon={app.icon}
              label={app.label}
              bgColor={app.bgColor}
              href={app.href}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center gap-2">
          <button
            onClick={handleCircleClick}
            className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white shadow-lg transition hover:scale-105 focus:outline-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,1) 0%, rgba(168,85,247,1) 50%, rgba(236,72,153,1) 100%)",
            }}
          >
            {employeeId ? initials : "Login"}
          </button>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            {employeeId ? "Profil" : "Anmelden"}
          </p>

          {employeeId && showPopover && (
            <div className="absolute bottom-16 right-0 w-56 rounded-2xl bg-white p-4 text-left shadow-2xl">
              <p className="text-xs uppercase tracking-wide text-gray-400">Mitarbeiter</p>
              <p className="text-sm font-semibold text-gray-900">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">ID: {employeeCode}</p>
              <button
                onClick={handleLogout}
                className="mt-3 w-full rounded-xl bg-gray-100 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSignedIn={() => {
          setIsModalOpen(false);
          setShowPopover(true);
        }}
      />
    </>
  );
}

