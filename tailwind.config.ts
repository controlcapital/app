import type { Config } from "tailwindcss";

const config: Config = {
  // 1. Indica dónde están tus archivos para que Tailwind genere los estilos
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // 2. ACTIVA EL MODO CLASE (Esto es lo que te falta)
  darkMode: 'class', 
  theme: {
    extend: {
      // Aquí puedes añadir colores personalizados si quieres
    },
  },
  plugins: [],
};
export default config;