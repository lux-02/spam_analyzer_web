/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        "primary-light": "var(--primary-light)",
        box: "var(--box)",
        "box-light": "var(--box-light)",
        "box-dark": "var(--box-dark)",
        heading: "var(--heading)",
        text: "var(--text)",
        "text-light": "var(--text-light)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        safe: "var(--safe)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundColor: {
        DEFAULT: "var(--background)",
      },
      textColor: {
        DEFAULT: "var(--text)",
      },
      boxShadow: {
        custom:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "custom-hover":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "custom-dark":
          "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        "custom-hover-dark":
          "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      fontFamily: {
        sans: ["Pretendard", "Noto Sans KR", "sans-serif"],
      },
    },
  },
  plugins: [],
};
