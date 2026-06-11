/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        paper:    '#FAFAF7',
        ink:      '#0A0A09',
        'ink-2':  '#525150',
        'ink-3':  '#A8A29E',
        rule:     '#E7E5E0',
        gold: {
          DEFAULT: '#B68847',
          deep:    '#8E6A37',
          tint:    '#F5EFE3',
        },
        // legacy brand (kept so any leftover refs still resolve)
        brand: {
          50:  '#F5EFE3',
          100: '#EADBC0',
          500: '#B68847',
          600: '#8E6A37',
          700: '#6B4F29',
          900: '#3A2A14',
        },
      },
      letterSpacing: {
        tightest: '-0.04em',
        eyebrow:  '0.14em',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(10, 10, 9, 0.04), 0 8px 24px -12px rgba(10, 10, 9, 0.08)',
        lift: '0 2px 4px rgba(10, 10, 9, 0.06), 0 12px 32px -8px rgba(10, 10, 9, 0.12)',
      },
    },
  },
  plugins: [],
};
