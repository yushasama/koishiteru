import defaultTheme from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(1.1)' },
          '50%': { transform: 'scaleY(2)' },
        },
      },
      backgroundImage: {
        'chicago': "url('/wallpapers/chicago.jpg')",
        'nyc': "url('/wallpapers/nyc.jpg')",
        'research': "url('/wallpapers/research.jpg')",
        'garden-grove': "url('/wallpapers/garden_grove.jpg')",
        'singapore': "url('/wallpapers/singapore.jpg')"

      },
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
        sans: ['Noto Sans', ...defaultTheme.fontFamily.sans],
        gothic: ['Noto Sans Gothic', 'sans-serif']
      },
      colors: {
        dusk: '#070707',
        fuschia: '#FFE7FF',
        viral: '#00A984',
        rias: '#FE2760'
      },
      animation: {
        wave: 'wave 1s ease-in-out infinite',
        border: 'background ease infinite'
      },
    },
  },
  plugins: [],
}
export default config
