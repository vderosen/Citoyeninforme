/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "warm-white": "#FAFAF8",
        "warm-gray": "#F0EDE8",
        "civic-navy": "#1B2A4A",
        "civic-navy-light": "rgba(27,42,74,0.05)",
        "accent-coral": "#E8553A",
        "accent-coral-dark": "#C23D22",
        "accent-coral-light": "rgba(232,85,58,0.08)",
        "text-primary": "#1B2A4A",
        "text-body": "#3D3D3D",
        "text-caption": "#6B7280",
        "text-inverse": "#FAFAF8",
        "signal-green": "#16A34A",
        "signal-amber": "#D97706",
        "signal-red": "#DC2626",
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
        card: "0 1px 3px rgba(27,42,74,0.08)",
        elevated: "0 4px 12px rgba(27,42,74,0.12)",
      },
    },
  },
  plugins: [],
};
