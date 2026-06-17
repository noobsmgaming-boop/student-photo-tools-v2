/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        premium: "0 24px 80px -40px rgb(0 0 0 / 0.45)",
        lift: "0 18px 50px -30px rgb(0 0 0 / 0.35)"
      },
      animation: {
        floatIn: "floatIn 720ms cubic-bezier(.2,.8,.2,1) both",
        softPulse: "softPulse 2.8s ease-in-out infinite"
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        softPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.75" },
          "50%": { transform: "scale(1.035)", opacity: "1" }
        }
      }
    }
  },
  plugins: []
};
