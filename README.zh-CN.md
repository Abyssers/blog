<p align="left">
  <img src="./source/images/logos/banner_contain.svg" height="64" alt="Abyssers' Logo"/>
</p>

<p align="left">
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/Abyssers/blog"></a>
  <a><img src="https://img.shields.io/github/workflow/status/Abyssers/blog/deploy"></a>
  <a><img src="https://img.shields.io/github/issues/Abyssers/blog"></a>
  <a><img src="https://img.shields.io/github/forks/Abyssers/blog"></a>
  <a><img src="https://img.shields.io/github/stars/Abyssers/blog"></a>
</p>

信奉深渊吧!

---

[English](./README.md) | 中文文档

## 开始

如果您是第一次参与该项目，请先将此项目 fork 到您的个人仓库，并执行以下命令克隆至本地开发:

```sh
git clone --recurse-submodules <your forked repo url>
```

> 禁止从当前仓库的其他分支提交 PR。

此外，请注意将您的仓库与组织仓库保持同步，并使用以下命令同步至本地:

```sh
git pull origin main
git submodule update --init --remote --force
```

> 我们不建议直接对子模块（尤其是主题模块）进行任何更改，主题的维护由另一个仓库处理：[abyrus](https://github.com/Abyssers/abyrus)。

使用 npm 或 yarn 安装全部依赖（nodejs >= 12.13.0）:

```sh
# with npm
npm install

# with yarn 1.x
yarn install
```

> 时刻关注我们的 PR 并及时更新依赖。

最后，确认已经启用 husky ：

```sh
npx husky install
```

> 尽管我们已经设置了 “prepare” 脚本，以确保它在 `npm install` 之后启用，但仍然有可能在不安装依赖项的情况下提交更改，导致跳过预提交 Hook。

## 写作

启动热更新服务 (仅适用于 [source_dir](https://hexo.io/docs/configuration#Directory) 中的更改)：

```sh
npm run serve # or: hexo s --debug
```

创建一篇新博客:

```sh
hexo new [layout] <title>
```

> 更多与写作相关的命令，参见：https://hexo.io/docs/writing

## 部署

本项目基于 Actions 集成了自动化部署能力。只需要把你的内容推送到你的 fork 仓库并创建一个规范的 PR，博客站点将在提交的 PR 被批准并合并后，自动更新静态页面。

## 开源协议

[Apache 2.0](https://github.com/Abyssers/blog/blob/main/LICENSE)

版权所有 2022 Abyssers
