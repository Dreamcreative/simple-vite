import { transformSync, build } from 'esbuild';
import { extname, dirname, join } from 'path';
import { existsSync } from 'fs';

let nodeModulesMap = new Map();
const appRoot = join(__dirname, '..');
const cache = join(appRoot, 'node_modules', '.svite/');
export const transformCode = opts => {
  return transformSync(opts.code, {
    loader: opts.loader || 'js',
    sourcemap: true,
    format: 'esm'
  });
};
const buildNodeModule = async pkgs => {
  const ep = pkgs.reduce((c, n) => {
    c.push(join(appRoot, 'node_modules', n, 'index.js'));
    return c;
  }, []);
  await build({
    entryPoints: ep,
    bundle: true,
    format: 'esm',
    logLevel: 'error',
    splitting: true,
    sourcemap: true,
    outdir: cache,
    treeShaking: 'ignore-annotations',
    metafile: true,
    define: {
      'process.env.NODE_ENV': JSON.stringify('development') // 默认开发模式
    }
  });
};
export const transformJSX = async opts => {
  const ext = extname(opts.path).slice(1);
  const ret = transformCode({
    loader: ext,
    code: opts.code
  });
  let { code } = ret;
  let needbuildModule = [];
  code = code.replace(/\bimport(?!\s+type)(?:[\w*{}\n\r\t, ]+from\s*)?\s*("([^"]+)"|'([^']+)')/gm, (a, b, c) => {
    let from;
    if (c.charAt(0) === '.') {
      from = join(dirname(opts.path), c);
      const filePath = join(opts.appRoot, from);
      if (!existsSync(filePath)) {
        if (existsSync(`${filePath}.js`)) {
          from = `${from}.js`;
        }
      }
      // if (['svg'].includes(extname(from).slice(1))) {
      //   from = `${from}?import`;
      // }
    } else {
      from = `${appRoot}/.cache/index.js`;
      if (!nodeModulesMap.has(c)) {
        needbuildModule.push(c);
        nodeModulesMap.set(c, true);
      }
    }
    return a.replace(b, `"${from}"`);
  });
  if (needbuildModule.length) {
    await buildNodeModule(needbuildModule);
  }
  return {
    ...ret,
    code
  };
};
