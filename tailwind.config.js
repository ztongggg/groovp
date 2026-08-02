/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Groovp Design System v2 tokens (from memory.md)
        navy: "#1D1B44",     // primary text
        muted: "#756F80",    // secondary text / icons
        line: "#F3F1F8",     // borders / subtle fills
        bgapp: "#F9F8FB",    // screen background
        purple: {
          100: "#ECE8FC",    // chip / light fills
          600: "#7C3AEB",    // primary brand / CTA
          700: "#6126CC",    // pressed / gradient end
        },
        // illustration accents
        accent: {
          teal: "#34B9A8",
          pink: "#F1A7C1",
          orange: "#E8863B",
          lavender: "#B9AEE8",
        },
        // status badges
        badge: {
          pendingBg: "#FBEECB",
          pendingText: "#A9791C",
          declinedBg: "#FCE0E0",
          declinedText: "#C6413B",
          acceptedBg: "#DCF3E2",
          acceptedText: "#2F8A57",
        },
      },
      boxShadow: {
        card: "0 2px 8px rgba(29,27,68,0.06)",
      },
    },
  },
  plugins: [],
};
