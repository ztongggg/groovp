// Device mockup: on >= sm shows an iPhone bezel + notch around the 402x874
// screen; on small viewports the app goes full-bleed (real phone shows its own
// chrome). The screen area scrolls internally.
export default function PhoneFrame({ children }) {
  return (
    <div className="flex min-h-screen justify-center bg-[#d8d6e0] sm:items-center sm:py-6">
      {/* bezel */}
      <div className="relative bg-black sm:rounded-[46px] sm:p-3 sm:shadow-2xl">
        {/* notch */}
        <div className="absolute left-1/2 top-3 z-20 hidden h-7 w-40 -translate-x-1/2 rounded-b-3xl bg-black sm:block" />
        {/* screen — `transform` here isn't decorative: it makes this div a
            containing block for `position: fixed` descendants (CSS spec), so
            every bottom sheet/modal/composer bar in the app clips to the
            402x874 phone screen instead of covering the whole browser
            viewport around the bezel on desktop. */}
        <div className="h-screen w-screen overflow-hidden bg-white sm:h-[874px] sm:w-[402px] sm:rounded-[34px]" style={{ transform: "translateZ(0)" }}>
          <div className="h-full overflow-y-auto phone-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
