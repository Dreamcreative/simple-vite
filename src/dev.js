// dev.js

import express from 'express';
import { createServer } from 'http';
import { join, extname } from 'path'; // 文件路径相关操作api
import { readFileSync } from 'fs'; // 文件读取相关操作api
import { transformCss, transformJSX } from './transform';
import { transformSync } from 'esbuild';
// target 文件夹的绝对路径
const targetRootPath = join(__dirname, '../');
// const transformCode = opts => {
//   return transformSync(opts.code, {
//     loader: opts.loader || 'js',
//     sourcemap: true,
//     format: 'esm'
//   });
// };
// const transformJSX = opts => {
//   const ext = extname(opts.path).slice(1);
//   const ret = transformCode({
//     // jsx -> js
//     loader: ext,
//     code: opts.code
//   });

//   let { code } = ret;

//   return {
//     code
//   };
// };
export async function dev() {
  const app = express();
  // 拦截请求根路径，返回index.html文件内容
  app.get('/', (req, res) => {
    // 读取index.html文件
    const htmlPath = join(targetRootPath, 'index.html');
    let html = readFileSync(htmlPath, 'utf-8');
    // 设置 返回的内容类型为 text/html
    res.set('Content-Type', 'text/html');
    // 返回index.html文件的字符串
    res.send(html);
  });
  app.get('/*', (req, res) => {
    const filePath = join(__dirname, '..', req.path.slice(1));
    switch (extname(req.path)) {
      case '.jsx':
        res.set('Content-Type', 'application/javascript');
        res.send(
          transformJSX({
            appRoot: targetRootPath,
            path: req.path,
            code: readFileSync(filePath, 'utf-8')
          }).code
        );
        break;
      default:
        break;
    }
  });

  // 创建server服务器
  const server = createServer(app);
  const port = 3000;
  // 监听端口
  server.listen(port, () => {
    console.log('App is running at http://127.0.0.1:' + port);
  });
}
