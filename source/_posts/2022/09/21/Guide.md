---
title: 入博指南
author: Morilence
date: 2022-09-21T12:59:39.000Z
contributors:
  - name: Morilence
    email: 1280659615@qq.com
    contributions: 1
updatedby: Morilence
updated: 2022-09-21T13:37:14.349Z
---

本文仅为准备参与该博客项目的成员提供工作流程与规范上的指导。

## 简介

本博文章以 [Markdown][md_url] 作为主要模板语言，选用 [Hexo][hexo_url] 框架进行文章解析与静态网页的渲染生成，主题则采用了在 [Icarus][icarus_url] 主题基础上二次改开得来的 [Abyrus][abyrus_repo_url]。也正因此，项目仓库被分为两部分同时进行维护，其中主题仓库作为博客本体仓库的子模块被引入。

## 开始

如果是第一次接触本项目的话，请先 fork [blog][blog_repo_url] 到您个人 github 账号下。然后将 fork 后的仓库 clone 到您本地进行开发：

```sh
git clone --recurse-submodules <repo_url>
```

为了使您 fork 的仓库能与源仓库保持同步更新，需要为其设置 upstream 为源仓库地址：

```sh
# 示例默认使用 ssh 链接
git remote add upstream git@github.com:Abyssers/blog.git
git pull upstream main
git push origin main
```

[blog_repo_url]: https://github.com/Abyssers/blog
[abyrus_repo_url]: https://github.com/Abyssers/abyrus
[md_url]: https://daringfireball.net/projects/markdown/
[hexo_url]: https://hexo.io/
[icarus_url]: https://ppoffice.github.io/hexo-theme-icarus/
