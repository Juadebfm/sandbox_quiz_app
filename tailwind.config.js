/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "pc-blue": "#222057",
        "pc-black": "#232323",
        "pc-orange": "#f8991d",
        "pc-light-gray": "#939393",
        "pc-dark-gray": "#323232",
        "pc-white-white": "#ffffff",
        "pc-bg": "#f5f6fa",
      },
      fontSize: {
        "heading-1": "28px",
        "heading-2": "22px",
        "big-text": "18px",
        "normal-text": "16px",
        "small-text": "14px",
      },
      fontFamily: {
        "font-gilroy-thin": ["Gilroy_Thin", "sans-serif"],
        "font-gilroy-italic": ["Gilroy_Italic", "sans-serif"],
        "font-gilroy-regular": ["Gilroy_Regular", "sans-serif"],
        "font-gilroy-medium": ["Gilroy_Medium", "sans-serif"],
        "font-gilroy-semibold": ["Gilroy_Semibold", "sans-serif"],
        "font-gilroy-bold": ["Gilroy_Bold", "sans-serif"],
        "font-gilroy-black": ["Gilroy_Black", "sans-serif"],
      },
    },
  },
  plugins: [],
};
