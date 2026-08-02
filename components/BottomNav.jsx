"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ c }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function SearchIcon({ c }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
    </svg>
  );
}
function UsersIcon({ c }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 6.2a3 3 0 0 1 0 5.6" /><path d="M17.5 14c2.2.5 3.5 2.4 3.5 5" />
    </svg>
  );
}
function UserIcon({ c }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

const ITEMS = [
  { label: "Home", href: "/home", Icon: HomeIcon },
  { label: "Discover", href: "/discover", Icon: SearchIcon },
  { label: "Teams", href: "/teams", Icon: UsersIcon },
  { label: "Profile", href: "/profile", Icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-10 flex h-20 items-start justify-around bg-white pt-4"
      style={{ boxShadow: "0 -2px 16px rgba(26,20,51,0.08)" }}
    >
      {ITEMS.map(({ label, href, Icon }) => {
        const active = pathname === href;
        const color = active ? "#7c3aed" : "#757080";
        return (
          <Link key={label} href={href} className="flex w-[70px] flex-col items-center">
            <span className="relative flex h-[22px] items-center justify-center">
              {active && (
                <span className="absolute -top-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#7c3aed]" />
              )}
              <Icon c={color} />
            </span>
            <span
              className="mt-2"
              style={{ fontSize: 10.5, fontWeight: active ? 600 : 400, color }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
