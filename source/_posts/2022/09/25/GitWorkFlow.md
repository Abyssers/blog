---
title: 【Abysser工程化实践】Git工作流规范
toc: true
author: GarlicGo
date: 2022-09-25T16:12:34.000Z
tags:
    - 工程化
    - Git
categories:
    - 工程化
contributors:
    - name: GarlicGo
      avatar: "https://avatars.githubusercontent.com/u/50868054"
      link: "https://github.com/GarlicGo"
      contributions: 1
updatedby: GarlicGo
updated: 2022-09-25T16:08:56.000Z
---

本文为准备参与 Abyssers' blog 建设的成员提供 Git 工作流规范上的指导。

<!-- more -->

# Git 工作流简介

Git 作为一个强大的代码管理工具，提供了丰富的分支策略和工作流方式，一直以来都是各大互联网企业的首选。在业界，Git 工作流有很多种，包括 Git Flow、GitHub Flow、GitLab Flow 等。在某些情况下现有工作流无法满足公司或团队的研发需求，这时就需要结合团队研发现状，充分考虑现有工作流程中的上下游系统，制定出与团队更加匹的工作流。

# 常见 Git 工作流

## Git Flow

![][git-flow]

Git Flow 开发模型从源代码管理角度对通常意义上的软件开发活动进行了约束。应该说，为我们的软件开发提供了一个可供参考的管理模型。Git Flow 开发模型让 nvie 的开发代码仓库保持整洁，让小组各个成员之间的开发相互隔离，能够有效避免处于开发状态中的代码相互影响而导致的效率低下和混乱。

## GitHub Flow

![][github-flow]

GitHub Flow 是一个相对简单的分支模型，它没有 Git Flow 或是 Gitlab Flow 那么多的定义和概念。GitHub Flow 最大的亮点在于部署（Deploy）发生在 合并（Merge）之前，这就是 GitHub Flow 的核心，非阻塞式集成 —— 在产生任何副作用之前得知当前修改的所有集成效果，达到真正的持续集成。

## GitLab Flow

![][gitlab-flow]

GitLab Flow 并不像 Git Flow, GitHub Flow 一样具有明显的规范，它更多是在 GitHub Flow 基础上，综合考虑环境部署、项目管理等问题而得出的一种实践。

# Abyssers' blog 工作流实践（规范建议）

本节认为您已经参考 [初入指南][newbie-guide] 将组织仓库 fork 至个人 GitHub 账户，并 clone 至本地。

## 新建分支

当准备开始一项新工作时，不要直接在 main 分支上直接开始。先 pull 一下保证代码最新，这里注意如果拉取的是 fork 仓库代码，那么在 pull 之前需要将 fork 仓库与组织仓库进行同步：

![][branch-sync]

之后新建并切换至一个新分支：

```bash
git checkout -b <开发分支名称>
```

## 暂存代码

当功能正在开发的过程中需要切换分支，直接 checkout 会将未提交的改动一同带到切换的新分支上，此时可以使用 [stash][git-stash] 将未提交的内容保存至堆栈中。

## 提交并推送至 fork 仓库

当开发工作完成，需要将更新推送并合并时，不要直接推送至组织仓库，应该推送至自己的 fork 仓库，再通过 PR 提交至组织仓库。在推送至自己的 fork 仓库时首先需要检查 main 分支是否有更新，如果此时有更新需要首先对 fork 仓库进行同步，并将本地代码进行暂存：

```bash
git add .
git stash
```

暂存后切换至 main 分支并使用 pull 更新最新代码，再回到开发分支，如果 main 分支有更新需要合并 main 分支最新代码，并取出暂存代码：

```bash
git checkout main
git pull
git checkout <开发分支名称>
git merge main
git stash pop
```

如果遇到冲突，需要将冲突解决后提交并推送至 fork 仓库：

```bash
git commit -m <message>
git push --set-upstream origin <开发分支名称>
```

## 通过 PR 提交至组织仓库

我们到自己的 fork 仓库里，向组织仓库提交分支合并请求，一般是自己这次工作创建的分支合并至组织仓库的 main 分支：

![][pr]

在提交 PR 后，组织仓库管理员会进行 Code Review ，如果提交的代码存在问题，在问题修复后管理员会将代码合并至组织仓库。

## 合并之后

在你的 PR 通过后，你这次的任务就算是完成了，最后要注意的一点就是别忘了同步 main 分支代码，首先在 fork 仓库对分支进行同步，之后在本地将分支切换至 main 分支再使用 pull 同步最新代码。

[newbie-guide]: /blog/2022-09-21-Newbie-Guide/
[branch-sync]: ./2022-09-25-GitWorkFlow/branch-sync.png
[pr]: ./2022-09-25-GitWorkFlow/pr.png
[git-flow]: ./2022-09-25-GitWorkFlow/git-flow.webp
[github-flow]: ./2022-09-25-GitWorkFlow/github-flow.png
[gitlab-flow]: ./2022-09-25-GitWorkFlow/gitlab-flow.png
[git-stash]: https://git-scm.com/docs/git-stash
