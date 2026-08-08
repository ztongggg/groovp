// Global loading fallback — Next.js shows this automatically while a route
// segment's server component is fetching, on any navigation app-wide.
export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "3px solid #EAE5FC",
          borderTopColor: "#7C3AED",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}
