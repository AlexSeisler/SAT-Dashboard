// postcss.config.cjs
let autoprefixer = null;
try {
  autoprefixer = require("autoprefixer");
} catch (_) {
  // autoprefixer not installed in the build environment – continue without it
}

module.exports = {
  plugins: [
    require("tailwindcss"),
    ...(autoprefixer ? [autoprefixer] : []),
  ],
};
