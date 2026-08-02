// iOS-style status bar (matches the Figma frames' StatusBar). 46px tall.
export default function StatusBar() {
  return (
    <div className="relative flex h-[46px] shrink-0 items-center justify-between px-6">
      <span style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>9:41</span>
      {/* center pill (camera housing) */}
      <div className="absolute left-1/2 top-[18px] h-6 w-24 -translate-x-1/2 rounded-full bg-[#1e1b4b]" />
      <div className="flex items-center gap-1.5">
        {/* signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="#1e1b4b">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        {/* wifi */}
        <svg width="16" height="11" viewBox="0 0 16 12" fill="none" stroke="#1e1b4b" strokeWidth="1.6" strokeLinecap="round">
          <path d="M1 4.2a10 10 0 0 1 14 0" />
          <path d="M3.5 6.8a6.2 6.2 0 0 1 9 0" />
          <path d="M6 9.3a2.6 2.6 0 0 1 4 0" />
        </svg>
        {/* battery */}
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
          <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="#1e1b4b" opacity="0.4" />
          <rect x="2" y="2" width="15" height="8" rx="1.5" fill="#1e1b4b" />
          <rect x="21.5" y="4" width="1.5" height="4" rx="0.75" fill="#1e1b4b" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
