import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      sourceMap: true,
    }),
    postcss({
      // 将 CSS 注入到 head 中
      inject: true,
      // 最小化 CSS
      minimize: true,
      // 生成 sourcemap
      sourceMap: true,
      // 将 CSS 抽取到单独的文件中
      extract: 'styles.css',
    }),
  ],
  external: ['react', 'react-dom', 'antd', 'lodash'],
}
