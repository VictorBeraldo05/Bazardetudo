import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        stone: "#E7E5E4",
        pearl: "#F7F5F2",
        mist: "#D6D3D1",
        graphite: "#3F3F46"
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        display: ["DM Sans", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 40px rgba(10,10,10,0.08)"
      },
      backgroundImage: {
        grain: "radial-gradient(circle at top, rgba(255,255,255,0.8), rgba(231,229,228,0.6) 55%, rgba(214,211,209,0.5))"
      }
    }
  },
  plugins: []
};

export default config;

