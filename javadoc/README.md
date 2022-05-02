# javadoc

存放为 Javadoc 额外定制的前端代码.  
目前的定制的功能有:
- Javadoc 原生样式字体 & 配色等优化
- 更新公告
- 深色模式
- Bukkit API 支持的版本/兼容性指南

## 构建

安装依赖:
> yarn install

构建成品:
> yarn build

将在项目根目录的 `dist` 文件夹生成两个构建产物: `javadoc.js` 和 `stylesheet.css`.  
`javadoc.js` 作为额外脚本在网页底部引入, `stylesheet.css` 直接替换 Javadoc 的原生样式.
