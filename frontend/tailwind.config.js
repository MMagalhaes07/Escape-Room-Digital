/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Light mode palette
        background: "hsl(0 0% 100%)",
        foreground: "hsl(0 0% 5%)",

        // Dark mode palette
        dark: {
          bg: "hsl(220 15% 12%)", // Dark grey
          "bg-secondary": "hsl(220 13% 18%)",
          "bg-tertiary": "hsl(220 12% 24%)",
          text: "hsl(0 0% 95%)",
          "text-secondary": "hsl(0 0% 75%)",
        },

        // Accent colors (Blue)
        accent: {
          blue: "hsl(217 91% 60%)",
          "blue-dark": "hsl(217 91% 45%)",
          "blue-light": "hsl(217 91% 75%)",
        },

        // Semantic colors
        success: "hsl(142 72% 29%)",
        warning: "hsl(38 92% 50%)",
        error: "hsl(0 84% 60%)",
        info: "hsl(217 91% 60%)",
      },
      backgroundColor: {
        primary: "var(--bg-primary, hsl(0 0% 100%))",
        secondary: "var(--bg-secondary, hsl(0 0% 95%))",
      },
      textColor: {
        primary: "var(--text-primary, hsl(0 0% 5%))",
        secondary: "var(--text-secondary, hsl(0 0% 40%))",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
        slideIn: "slideIn 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};
