---
title: "Hugo 博客搭建教程"
date: 2026-02-14T10:00:00+08:00
draft: false
description: "从零开始搭建一个美观的 Hugo 技术博客的完整教程。"
tags: ["Hugo", "教程", "GitHub Pages"]
categories: ["技术"]
---

## 📖 前言

本文记录了使用 Hugo 和 Blowfish 主题搭建个人技术博客的完整过程。

<!--more-->

## 🛠️ 准备工作

在开始之前，你需要安装以下工具：

### 1. 安装 Git

```bash
# Windows 用户可以从官网下载
# https://git-scm.com/download/win
git --version
```

### 2. 安装 Hugo

```bash
# 使用 winget 安装
winget install Hugo.Hugo.Extended
hugo version
```

## 📁 创建站点

```bash
# 创建新的 Hugo 站点
hugo new site my-blog

# 进入站点目录
cd my-blog

# 初始化 Git 仓库
git init
```

## 🎨 安装主题

```bash
# 添加 Blowfish 主题
git submodule add https://github.com/nunocoracao/blowfish.git themes/blowfish
```

## ✍️ 写第一篇文章

```bash
hugo new posts/my-first-post/index.md
```

然后编辑生成的 Markdown 文件即可！

## 🚀 本地预览

```bash
hugo server -D
```

访问 `http://localhost:1313` 即可预览你的博客！

## 📤 部署到 GitHub Pages

1. 在 GitHub 创建仓库 `yourusername.github.io`
2. 推送代码到仓库
3. 设置 GitHub Actions 自动部署

---

*Happy Blogging! 🎉*
