// 在 index.jsx 中，其实就是标准的 `react` 语法 的入口文件，代码如下
import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import App from './App.jsx';
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
