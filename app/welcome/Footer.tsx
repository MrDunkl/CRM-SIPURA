"use client";

import Link from "next/link";
import { FiFacebook, FiMail, FiPhoneCall, FiWhatsapp } from "react-icons/fi";
import { TbMapPin } from "react-icons/tb";

const sections = [
  {
    title: "Kontakt",
    items: [
      { icon: <FiPhoneCall />, label: "+43 (0) 1 226 6633", href: "tel:+4312266633" },
      { icon: <FiMail />, label: "office@multipartners.at", href: "mailto:office@multipartners.at" },
      {
        icon: <TbMapPin />,
        label: "Auerspergstraße 4/2.OG/7, 1010 Wien",
        href: "https://maps.google.com/?q=Auerspergstra%C3%9Fe+4+1010+Wien",
      },
    ],
    social: [
      { icon: <FiWhatsapp />, label: "WhatsApp", href: "https://wa.me/43012266633", color: "bg-[#25D366]" },
      { icon: <FiFacebook />, label: "Facebook", href: "https://facebook.com", color: "bg-[#3b5998]" },
      { icon: <FiPhoneCall />, label: "Telefon", href: "tel:+4312266633", color: "bg-[#f3b63f]" },
      { icon: <FiMail />, label: "E-Mail", href: "mailto:office@multipartners.at", color: "bg-[#f35f4f]" },
    ],
  },
  {
    title: "Projekte",
    links: [
      { label: "Online-Casinoverluste", href: "#" },
      { label: "Betriebskosten optimieren", href: "#" },
      { label: "Weitere Projekte", href: "#" },
    ],
  },
  {
    title: "Über Multi Partners",
    links: [
      { label: "Kontakt", href: "#" },
      { label: "Datenschutz", href: "#" },
      { label: "Impressum", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 w-full rounded-t-[3rem] bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] px-6 py-16 text-white shadow-[0_-12px_40px_-18px_rgba(15,39,62,0.4)]">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className="space-y-5">
            <h3 className="text-lg font-semibold uppercase tracking-[0.25em] text-white/80">
              {section.title}
            </h3>
            {"items" in section ? (
              <div className="space-y-3">
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 text-sm transition hover:text-white/80"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                {section.social && (
                  <div className="flex gap-3 pt-2">
                    {section.social.map((socialItem) => (
                      <Link
                        key={socialItem.label}
                        href={socialItem.href}
                        className={`${socialItem.color} flex h-10 w-10 items-center justify-center rounded-full text-white shadow transition hover:scale-105`}
                        aria-label={socialItem.label}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {socialItem.icon}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <ul className="space-y-3 text-sm">
                {section.links?.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition hover:text-white/80"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <div className="mt-12 text-center text-xs text-white/70">
        © {new Date().getFullYear()} Multi Partners GmbH · Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}

