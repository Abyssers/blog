<p align="left">
  <img src="./source/images/logos/banner_contain.svg" height="56" alt="Abyssers' Logo"/>
</p>

<p align="left">
  <a><img src="https://img.shields.io/github/issues/Abyssers/blog"></a>
  <a><img src="https://img.shields.io/github/forks/Abyssers/blog"></a>
  <a><img src="https://img.shields.io/github/stars/Abyssers/blog"></a>
</p>

Believe in the abyss!

---

English | [中文文档](./README.zh-CN.md)

## Getting started

If u r preparing to get involved in the project for the first time, please fork this repo to yours firstly and then:

```sh
git clone --recurse-submodules <your forked repo url>
```

> We do not accept PRs from the current repo's another branch.

Otherwise, please sync your forked repo and pull up the latest codes:

```sh
git pull origin main
git submodule update --init --remote --force
```

> We do not recommend making any changes to submodules (especially in the theme module) directly. Updating of the theme is usually handled by another repo: [hexo-theme-icarus](https://github.com/Abyss-Coder/hexo-theme-icarus).

Install all dependencies by npm (or yarn 1.x) with nodejs version >= 12.13.0:

```sh
npm install # or: yarn install
```

> Always keep an eye on our pull requests and update dependencies timely.

## Writing

Start the hot-update server (only for changes in the [source_dir](https://hexo.io/docs/configuration#Directory)):

```sh
npm run server # or: hexo s --debug
```

Create a new post or a new page:

```sh
hexo new [layout] <title>
```

> For more writing-related commands, see: https://hexo.io/docs/writing

## Deployment

This project has already integrated automated deployment with Actions. You just need to push your contents to your forked repo and create a Pull Request following the standard procedure. When the PR is approved and merged, the blog site will update static pages automatically.

## License

[Apache 2.0](https://github.com/Abyss-Coder/blog/blob/main/LICENSE)

Copyright 2022 AbyssCoder