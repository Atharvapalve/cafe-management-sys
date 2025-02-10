/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Coffee Brown Theme
        primary: {
          DEFAULT: "#6F4E37", // Dark Coffee Brown
          foreground: "#FFFFFF", // White text for contrast
        },
        secondary: {
          DEFAULT: "#A67B5B", // Lighter Coffee Brown
          foreground: "#000000", // Black text for contrast
        },
        accent: {
          DEFAULT: "#D2B48C", // Beige (accent color)
          foreground: "#000000", // Black text for contrast
        },
        background: "#F5F5DC", // Creamy background
        foreground: "#2C1810", // Deep Coffee Brown for text
        muted: {
          DEFAULT: "#E6DCC3", // Light Beige
          foreground: "#2C1810", // Deep Coffee Brown
        },
        destructive: {
          DEFAULT: "#8B0000", // Red for errors
          foreground: "#FFFFFF", // White text for contrast
        },
        border: "#A67B5B", // Light Coffee Brown for borders
        input: "#E6DCC3", // Light Beige for inputs
        ring: "#6F4E37", // Dark Coffee Brown for focus rings
        card: {
          DEFAULT: "#F5F5DC", // Creamy card background
          foreground: "#2C1810", // Deep Coffee Brown for card text
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};