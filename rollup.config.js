import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import localResolve from 'rollup-plugin-local-resolve';

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

export default {
  entry: './src/index.js',
  plugins: [
    babel(babelrc()),
    localResolve(),
  ],
  external: external,
  targets: [
    {
      format: 'umd',
      moduleName: 'JSDistoPedal',
      dest: './build/JSDistoPedal.js'
    }
  ]
};