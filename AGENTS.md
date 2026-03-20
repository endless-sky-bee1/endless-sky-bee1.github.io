# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个部署在 GitHub Pages 上的产品官网，包含主站页面和产品用户手册。网站使用纯静态 HTML + CSS，无需构建工具。

## 文件结构

```
├── index.html              # 主页
├── about.html              # 关于我们
├── products.html           # 产品中心
├── support.html            # 服务支持
├── styles.css              # 主站全局样式
├── pages.css               # 内页公共样式
├── nav.js                  # 导航公共脚本
├── favicon.svg / .ico      # 站点图标
├── .nojekyll               # 禁用 Jekyll，使 _ 开头文件可被访问（必须保留）
├── products/
│   └── brief/              # 产品简报（中英文 HTML + MD 源文件）
└── support/
    └── manual/
        └── 3516cv610/      # Hi3516CV610 用户手册（Docsify）
            ├── index.html  # Docsify 入口
            ├── README.md   # 手册首页
            ├── _sidebar.md # 侧边栏导航
            └── zh/         # 中文章节 Markdown
                └── images/ # 章节配图
```

## 开发与部署

**本地预览**：
```bash
python3 -m http.server 8000
# 访问 http://localhost:8000
```

**部署**：推送到 main 分支即可自动触发 GitHub Pages 部署（约 1 分钟生效）。

**验证部署状态**：
```bash
gh run list --limit 3
```

## 用户手册（Docsify）

用户手册位于 `support/manual/3516cv610/`，使用 [Docsify](https://docsify.js.org/) 渲染。

**关键配置说明**（`index.html`）：

- `loadSidebar: true` — 从 `_sidebar.md` 加载侧边栏
- `alias: { '/.*/_sidebar.md': '/_sidebar.md' }` — 强制所有子路径使用根目录的 `_sidebar.md`，避免进入 `zh/*` 子路由后侧边栏消失
- `zoom-image` 插件 — 支持图片点击放大

**新增手册章节**：
1. 在 `zh/` 下新建 Markdown 文件（命名规则：`NN-name.md`）
2. 在 `_sidebar.md` 中添加对应链接
3. 章节内的图片放在 `zh/images/` 目录下，引用路径为 `images/文件名.png`

## GitHub Pages 注意事项

- **必须保留 `.nojekyll`**：GitHub Pages 默认启用 Jekyll，会屏蔽所有 `_` 开头的文件（如 `_sidebar.md`）。根目录的 `.nojekyll` 文件可禁用 Jekyll，确保这些文件可被正常访问。删除该文件会导致 Docsify 侧边栏消失。
- `tmp/` 目录已加入 `.gitignore`，存放参考文档等临时文件，不提交到仓库。

## 参考源码

本网站内容与文案应参考本地源码仓：`/home/endless/workspace/open/endless/endless-github`

更新网站时，优先依据该仓库中的：
- `README.md`
- `docs/zh/PRD.md`
- `docs/zh/FeatureList.md`
- `docs/zh/TechStack.md`
- `foundation/web_page/README.md`
