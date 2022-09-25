---
title: Drone持续集成实践，实现自动部署
date: 2022-09-22T11:00:14.000Z
toc: true
author: slanceli
tags:
    - CI/CD
    - Drone
categories:
    - CI/CD
contributors:
    - name: Morilence
      avatar: "https://avatars.githubusercontent.com/u/44861693"
      link: "https://github.com/Morilence"
      contributions: 4
    - name: slanceli
      avatar: "https://avatars.githubusercontent.com/u/43295293"
      link: "https://github.com/slanceli/"
      contributions: 1
updatedby: Morilence
updated: 2022-09-24T05:57:28.000Z
---

使用 Drone 实现自动化部署。

<!-- more -->

# 背景

最近参与了一个项目的开发，我主要负责后端。疯狂的时候，一天 push 了 10 次左右，每 push 一次，我都要走一遍如下流程：

> 编译 -> 打开 shell -> 登录服务器 -> 上传编译好的程序 -> kill 旧进程 -> 启动新版本的程序

作为一名资深懒狗，当然会去寻找自动化部署的工具。于是发现了[Drone](https://docs.drone.io/)。

# Drone 简介

Drone 是[Harness](https://harness.io/)开发的一个现代化持续集成平台，使团队能够使用功能强大的云原生管道引擎自动执行构建、测试和发布工作流。（以上部分来自官网）

网上有许多声音说 Drone 的官方文档写得太烂了，我不敢苟同。只是没有中文版的罢了，按照官方文档部署是完全没有问题的。

Drone 分为两个部分：Server 和 Runners。

-   Server  
     Drone 主服务，它是一个守护进程应用并且拥有 Web 管理界面。它通过 Webhook 对接 Git Server。解析 Git Repository 根目录下的.drone.yml 文件，并以轮询的形态查找需要执行的 Pipelines，路由并管理 Runners。
-   Runners  
    Drone Pipeline 处理执行器，可以部署一份或多份。Drone 拥有多种类型的 Runner（docker、k8s、exe、ssh 等等），可选适合的方式安装。

# 安装 Server

## 一段废话

Drone 可以与许多主流源代码管理系统无缝衔接，受限于篇幅，本文只介绍 Drone 与 Github 的集成。

## 准备工作

### 创建 OAuth 应用

如果不会创建，请认真阅读：[在 Github 上创建一个 OAuth 应用](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)，这是 Github 官方文档，比某 SDN 的文章强多了，不服来辩。

> 注意**Authorization callback URL**和**Homepage URL**是如何匹配的，请完全按照这个格式匹配，具体如下图所示。否则会出现可预估但是我不想说的错误。
>
> 其中**drone.example.com**为解析到服务器的域名，可以直接是公网 ip，**port**是端口，**若使用公网 IP 则可以指定端口**。

![](./2022-09-22-DroneBySlanceli/1.png)

完成后请记住**Client ID**，生成一个**Client secrets**并记住（并不是真的叫你记住），后面需要用到。
![](./2022-09-22-DroneBySlanceli/2.png)

## 创建一个共享 Secret

创建共享 Secret 以验证 Runners 和 Server 之间的通信。  
你可以使用**openssl**生成一个共享密钥。

```bash
openssl rand -hex 16
c1007912b7089ed39f88138a5a9a2c12
```

## 拉取镜像

请确保目标机器上有 Docker 环境，因为 Drone server 是以 Docker 镜像发布的。

```bash
docker pull drone/drone:2
```

## 配置

Drone server 是用环境变量进行配置的。以下只展示了一部分常用参数，若有需要，请参考[完整配置](https://docs.drone.io/server/reference/)

-   **DRONE_GITHUB_CLIENT_ID**（必需）  
    该环境变量的值为在[上面步骤](/blog/2022-09-22-Drone持续集成实践，实现自动部署/#准备工作)生成的 GitHub oauth Client ID。
-   **DRONE_GITHUB_CLIENT_SECRET**（必需）  
    该环境变量的值为在[上面步骤](/blog/2022-09-22-Drone持续集成实践，实现自动部署/#准备工作)生成的 GitHub oauth Client Secret。
-   **DRONE_RPC_SECRET**（必需）  
    该值为[上面步骤](/blog/2022-09-22-Drone持续集成实践，实现自动部署/#创建一个共享Secret)生成的共享 secret，用于验证 server 和 runners 之间的 rpc 连接。必须为 server 和 runners 提供相同的 secret。
-   **DRONE_SERVER_HOST**（必需）
    该值为解析到主机的域名或公网 IP，如果使用公网 IP，那么可以添加端口。
-   **DRONE_SERVER_PROTO**（必需）  
    此值应设置为 http 或 https。
-   **DRONE_USER_FILTER**  
    可选参数，其值应为 GitHub 用户或组织的列表（英文逗号分隔）。注册仅限于此列表中的用户或属于此列表中组织成员的用户。如果未设置此值，则注册将向公众开放。

## 启动 Server

可以使用以下命令启动 Server 容器。容器是通过环境变量配置的。  
若对 Docker 的启动参数有疑问，请参考[docker docs](https://docs.docker.com/engine/reference/commandline/run/)

```bash
docker run \
  --volume=/var/lib/drone:/data \
  --env=DRONE_GITHUB_CLIENT_ID=your-id \
  --env=DRONE_GITHUB_CLIENT_SECRET=super-duper-secret \
  --env=DRONE_RPC_SECRET=super-duper-secret \
  --env=DRONE_SERVER_HOST=drone.example.com \
  --env=DRONE_SERVER_PROTO=http \
  --publish=80:80 \
  --restart=always \
  --detach=true \
  --name=drone \
  drone/drone:2
```

浏览器访问**DRONE_SERVER_HOST**的值，若出现以下界面，那么恭喜你，成功了一半。若失败了，不要气馁，可以参考一下官方文档。
![](./2022-09-22-DroneBySlanceli/3.png)

可以尝试一下登录。看是否会出现你的代码仓库。若没有，请检查是否授权。
![](./2022-09-22-DroneBySlanceli/4.png)

# 安装 Runners

## 一些废话

Drone runners 轮询 server 以查找要执行的工作负载。不同类型的 runners 针对不同的用例和运行时环境进行了优化。您可以安装一个或多个类型的 runners。  
本人的需求是：push 代码后，实例自动拉取代码进行编译，kill 旧进程，启动新的程序。所以选择了 exec runner。更多类型请看[这里](https://docs.drone.io/runner/overview/)。

## 下载

amd64 架构:

```bash
curl -L https://github.com/drone-runners/drone-runner-exec/releases/latest/download/drone_runner_exec_linux_amd64.tar.gz | tar zx
sudo install -t /usr/local/bin drone-runner-exec
```

i386 架构:

```bash
curl -L https://github.com/drone-runners/drone-runner-exec/releases/latest/download/drone_runner_exec_linux_i386.tar.gz | tar zx
sudo install -t /usr/local/bin drone-runner-exec
```

32 位 arm:

```bash
curl -L https://github.com/drone-runners/drone-runner-exec/releases/latest/download/drone_runner_exec_linux_arm.tar.gz | tar zx
sudo install -t /usr/local/bin drone-runner-exec
```

64 位 arm:

```bash
curl -L https://github.com/drone-runners/drone-runner-exec/releases/latest/download/drone_runner_exec_linux_arm64.tar.gz | tar zx
sudo install -t /usr/local/bin drone-runner-exec
```

## 配置

exec runner 通过环境变量配置文件进行配置，以下只介绍常见的配置参数，若有需要请查看[完整配置](https://docs.drone.io/runner/exec/configuration/reference/)

如果你在上一步中以 root 身份安装 drone-runner-exec，那么配置文件的目录为：

```
/etc/drone-runner-exec/config
```

否则：

```
~/.drone-runner-exec/config
```

请注意，这不是一个 bash 文件。不支持 Bash 语法和 Bash 表达式。

```
DRONE_RPC_PROTO=http
DRONE_RPC_HOST=drone.example.com
DRONE_RPC_SECRET=super-duper-secret
```

-   **DRONE_RPC_PROTO**  
    不想进行说明。
-   **DRONE_RPC_HOST**  
    提供了 runners 连接到主机地址处的服务器，以接收要执行的管道。与 server 环境变量的 DRONE_SERVER_HOST 保持一致。
-   **DRONE_RPC_SECRET**  
    提供了用于向 Drone server 进行身份验证的共享密钥。与 server 环境变量的 DRONE_RPC_SECRET 保持一致。

## 安装并启动

```bash
drone-runner-exec service install
drone-runner-exec service start
```

## 日志问题

参考[官方文档](https://docs.drone.io/runner/exec/installation/linux/#logging)

# pipeline

## 概述

pipeline 可帮助您自动执行软件交付过程中的步骤，例如启动代码生成、运行自动化测试以及部署到过渡或生产环境。

pipeline 执行由源代码存储库触发。代码中的更改会触发运行相应 pipeline 的 Drone 的 webhook。

pipeline 是通过将文件（命名应为`.drone.yml`）放在 git 存储库的根目录中来配置的。yaml 语法设计为易于阅读和富有表现力，以便查看存储库的任何人都可以了解工作流。

## 示例

```yaml
kind: pipeline
type: exec
name: name
platform:
    os: linux
    arch: amd64

steps:
    - name: clean
      commands:
          - bash clean.sh

    - name: build
      commands:
          - bash build.sh
      environment:
          GOOS: linux
          GOARCH: amd64
          GOPROXY: https://goproxy.cn,direct

    - name: start
      commands:
          - start.sh

trigger:
    event:
        - push
```

其中[trigger](https://docs.drone.io/pipeline/triggers/)可以指定 branch 和 event 等，过滤 Webhook。

效果图：
![](./2022-09-22-DroneBySlanceli/5.png)
懒狗狂喜。

# 参考

1. [Drone CI / CD | Drone](https://docs.drone.io/)
2. [Drone 概念与答疑](https://www.cnblogs.com/lswweb/p/14246235.html)
