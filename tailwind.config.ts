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
      backgroundImage: {
        'yuushasama': "url('../public/yuushasama.png')"
      },
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
        sans: ['Noto Sans', ...defaultTheme.fontFamily.sans],
        gothic: ['Noto Sans Gothic', 'sans-serif']
      },
      colors: {
        dusk: '#070707',
        fuschia: '#FFE7FF',
        viral: '#00A984'
      },
      animation: {
        border: 'background ease infinite'
      },
    },
  },
  plugins: [],
}
export default config
