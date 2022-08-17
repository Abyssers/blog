<p align="left">
  <img src="./source/images/logos/banner.svg" height="65" alt="Abyss Coder Logo"/>
</p>

<p align="left">
  <a><img src="https://img.shields.io/github/issues/Abyss-Coder/blog"></a>
  <a><img src="https://img.shields.io/github/forks/Abyss-Coder/blog"></a>
  <a><img src="https://img.shields.io/github/stars/Abyss-Coder/blog"></a>
</p>

信封深渊吧!

---

[English](./README.zh-CN.md) | 中文文档

## 开始

如果您是第一次参与该项目，请先将此项目 fork 到您的个人仓库，并执行以下命令克隆至本地开发:

```sh
git clone --recurse-submodules <your forked repo url>
```
此外，请注意将您的仓库与组织仓库保持同步，并使用以下命令同步至本地:

```sh
git pull origin main
git submodule update --init --remote --force # 我们不建议直接更改子模块（主题模块）
```

使用 npm 或 yarn 安装全部依赖（nodejs >= 12.13.0）:

```sh
# with npm
npm install 

# with yarn 1.x
yarn install
```
启动 hexo 服务（热更新模式）:

```sh
npm run server
```