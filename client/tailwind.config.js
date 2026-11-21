// Colors point to CSS variables (see src/style.css) so dark and light themes share the same token names.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        paper: token('paper'),
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        oracle: token('oracle'),
        oracleSoft: token('oracle-soft'),
        yes: token('yes'),
        no: token('no'),
      },
      fontFamily: { sans: ['"Inter Variable"', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '12px' },
    },
  },
};
