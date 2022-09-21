---
title: 初入指南
toc: true
author: Morilence
date: 2022-09-21T12:59:39.000Z
contributors:
  - name: Morilence
    email: 1280659615@qq.com
    contributions: 1
updatedby: Morilence
updated: 2022-09-21T16:25:18.000Z
---

本文仅为准备参与该博客项目的成员提供工作流程与规范上的指导。

## 简介

本博文章以 [Markdown][md_url] 作为主要模板语言，选用 [Hexo][hexo_url] 框架进行文章解析与静态网页的渲染生成，主题则采用了在 [Icarus][icarus_url] 主题基础上二次改开得来的 [Abyrus][abyrus_repo_url]。也正因此，项目仓库被分为两部分同时进行维护，其中主题仓库作为博客本体仓库的子模块被引入。

## 开始

如果是第一次接触本项目的话，请先 fork [blog][blog_repo_url] 到您个人 github 账号下。然后将 fork 后的仓库 clone 到您本地进行开发：

```sh
git clone --recurse-submodules <fork_url>
```

> 注：请务必带上 \-\-recurse-submodules 参数以确保主题模块能够被正常签出

为了使您在本地开发时更方便地与源仓库保持同步，我们建议在本地新增一个远程/上游（upstream）来指向源仓库：

```sh
# 示例默认使用 ssh 链接
git remote add upstream git@github.com:Abyssers/blog.git
git fetch upstream
```

> 注：upstream 并非硬性指定名称，可自行修改

然后将源仓库的 main 分支设为您本地开发分支的上游分支：

```sh
git branch --set-upstream-to=upstream/main <local_branch>
```

> 注：\<local_branch\> 默认可选 main 分支

这样以后在执行 git pull 的时候就会直接从上游分支（源仓库的 main 分支）来拉取代码了。但是在设置完上游后，git push 的目标也变成了源仓库，此时便需要将 upstream 的 push 地址修改回为您 fork 仓库的地址：

```sh
git remote set-url --push upstream <fork_url>
```

期间您可以通过执行 `git remote -v` 来检查本地所有的上游及其地址信息，如果上述操作设置成功您将看到：

```sh
origin    git@github.com:<your_name>/blog.git (fetch)
origin    git@github.com:<your_name>/blog.git (push)
upstream    git@github.com:Abyssers/blog.git (fetch)
upstream    git@github.com:<your_name>/blog.git (push)
```

> 问：为啥不直接改默认上游（origin）的 fetch URL？
> 答：因为 git 不支持，git remote set-url 没有 \-\-fetch 选项，所以只能采用新建源仓库指向的上游继而改其 push URL 的方案。

另外，在后续开发/创作过程中，随着主题模块（子模块）的不断更新，仅仅 git pull 是无法将最新版本的主题文件更新到本地的，但我们所有的主题变更都只在主题仓库进行提交，因此对于博客仓库，您只需要强制拉取最新版本的主题模块覆盖本地：

```sh
git submodule update --init --remote --force
```

> 注：您也不必担心在强制更新本地主题后出现与源仓库所引用主题版本不一致的问题，Abyrus 的一切更新将通过 Github Actions 自动为博客仓库发起更新主题模块的 Pull Request 请求，所以只需及时拉取最新代码到本地即可。

[blog_repo_url]: https://github.com/Abyssers/blog
[abyrus_repo_url]: https://github.com/Abyssers/abyrus
[md_url]: https://daringfireball.net/projects/markdown/
[hexo_url]: https://hexo.io/
[icarus_url]: https://ppoffice.github.io/hexo-theme-icarus/
