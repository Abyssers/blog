<p align="left">
  <img src="./source/images/logos/banner.svg" height="65" alt="Abyss Coder Logo"/>
</p>

<p align="left">
  <a><img src="https://img.shields.io/github/issues/Abyss-Coder/blog"></a>
  <a><img src="https://img.shields.io/github/forks/Abyss-Coder/blog"></a>
  <a><img src="https://img.shields.io/github/stars/Abyss-Coder/blog"></a>
</p>

Believe in the abyss!

---

English | [中文文档](./README.zh-CN.md)

## Getting started

If u r preparing to get involved in the project for the first time, please fork this repo to yours firstly and then:

```sh
git clone --recurse-submodules <your forked repo url>
```

Otherwise, please sync your forked repo firstly and then:

```sh
git pull origin main
git submodule update --init --remote --force # We do not recommend making changes to submodules (theme module) directly
```

Install all dependencies by npm with nodejs version >= 12.13.0 (or yarn 1.x):

```sh
npm install # yarn install
```

Start hexo server (in hot-update mode):

```sh
npm run server
```