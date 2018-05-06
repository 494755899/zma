import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
export default {
  input: "./zma/zma.js",
  output: {
    file: "./zma/index.js",
    format: "umd",
    name: "zma"
  },
  plugins: [
    babel({
      exclude: "node_modules/**" // only transpile our source code
    }),
    uglify()
  ]
};
