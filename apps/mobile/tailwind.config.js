/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Court surfaces — shared with @courtrank/core SURFACE_HEX.
        clay: "#d8694c",
        hard: "#2563eb",
        grass: "#16a34a",
        // Brand ink/paper (dark-first, mirroring the web hero chrome).
        ink: "#0a0a0a",
        paper: "#faf9f7",
      },
    },
  },
  plugins: [],
};
