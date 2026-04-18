// Matches the shape V0 emits from its own Next.js + Tailwind 4 templates,
// minimizing surface area for their sandbox's postcss-load-config to trip on.
// If V0's sandbox still can't read this (e.g. their loader is the browser
// bundle), rosedale-os ships `postcss.config.mjs` as an unlocked seed file
// so V0 can rewrite it per-demo.
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
