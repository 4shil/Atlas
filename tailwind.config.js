/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#1F2937",
                "background-light": "#F3F4F6",
                "background-dark": "#111827",
                "glass-light": "rgba(255, 255, 255, 0.4)",
                "glass-dark": "rgba(31, 41, 55, 0.4)",
                "card-mint": "#C7E8E6",
                "card-lavender": "#E3DDF9",
                // Semantic surface tokens
                surface: {
                    DEFAULT: "#ffffff",
                    dark: "#09090f",
                },
                "on-surface": {
                    DEFAULT: "#111827",
                    dark: "#f1f5f9",
                },
                muted: {
                    DEFAULT: "#6b7280",
                    dark: "#9ca3af",
                },
                border: {
                    DEFAULT: "rgba(0,0,0,0.08)",
                    dark: "rgba(255,255,255,0.08)",
                },
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "1.5rem",
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
};
