# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个部署在 GitHub Pages 上的个人网站。网站使用纯静态 HTML + CSS，无需构建工具。

## 开发与部署

- **本地预览**: 直接在浏览器中打开 `index.html` 文件，或使用本地服务器：
  ```bash
  python -m http.server 8000
  # 然后访问 http://localhost:8000
  ```

- **部署**: 推送到 main 分支即可自动部署到 GitHub Pages

## 文件结构

- `index.html` - 网站主页，包含内联样式