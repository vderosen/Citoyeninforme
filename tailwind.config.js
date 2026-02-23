/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "warm-white": "#FFFFFF",
        "warm-gray": "#F4F5F7",
        "civic-navy": "#1E2A44",
        "civic-navy-light": "rgba(30,42,68,0.05)",
        "accent-coral": "#E84855",
        "accent-coral-dark": "#C23340",
        "accent-coral-light": "rgba(232,72,85,0.08)",
        "text-primary": "#1E2A44",
        "text-body": "#4A5568", // Lighter body text
        "text-caption": "#718096",
        "text-inverse": "#FFFFFF",
        "signal-green": "#4CAF83", // Soft highlight green
        "signal-amber": "#D97706",
        "signal-red": "#E84855",
        "party-fallback": "#9CA3AF",
      },
      fontFamily: {
        "display-bold": ["SpaceGrotesk_700Bold"],
        "display-semibold": ["SpaceGrotesk_600SemiBold"],
        "display-medium": ["SpaceGrotesk_500Medium"],
        body: ["Inter_400Regular"],
        "body-medium": ["Inter_500Medium"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(30,42,68,0.04)", // diffuse light shadow
        elevated: "0 8px 24px rgba(30,42,68,0.08)", // more pronounced for focus cards
      },
      borderRadius: {
        '2xl': '20px',
      }
    },
  },
  plugins: [],
};
