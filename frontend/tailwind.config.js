/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Midnight Gold Design System
        "mg-bg": "#0A0F1E",
        "mg-gold": "#FAC775",
        "mg-success": "#1D9E75",
        "mg-alert": "#D85A30",
        "mg-text": "#F5F5F5",
        "mg-muted": "#6B7280",
        "mg-card": "#111827",
        "mg-border": "#1F2937",
        // Light mode
        "mg-light-bg": "#FFFFFF",
        "mg-light-surface": "#F5F5F5",
        "mg-light-text": "#0A0F1E",
        "mg-light-muted": "#4B5563",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        "card-lg": "16px",
      },
      boxShadow: {
        "gold-glow": "0 0 20px rgba(250, 199, 117, 0.3)",
        "gold-glow-sm": "0 0 10px rgba(250, 199, 117, 0.2)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "fire": "fire 0.8s ease-in-out infinite alternate",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
      },
      keyframes: {
        fire: {
          "0%": { transform: "scaleY(1) scaleX(1)" },
          "100%": { transform: "scaleY(1.1) scaleX(0.95)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(250,199,117,0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(250,199,117,0.5)" },
        },
        slideUp: {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
