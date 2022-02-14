const path = require('path');
const sveltePreprocess = require('svelte-preprocess');
const makeAttractionsImporter = require('attractions/importer.js');

module.exports = {
  // preprocess: [sveltePreprocess()],

  preprocess: [
    sveltePreprocess({
      scss: {
        importer: makeAttractionsImporter({
          // themeFile: path.join(__dirname, 'theme.scss'),
          // nodeModulesPath: path.join(__dirname, './node_modules')
        }),
        // includePaths: [path.join(__dirname, './')],
      },
    }),
  ],

  onwarn: (warning, handler) => {
    const { code, frame } = warning;
    if (code === "css-unused-selector") {
      return;
    }
    handler(warning);
  },

};