---
sidebar_position: 3
---

我们第一个关注点是“**加载**”，什么是“加载”？

加载是指游戏的js模块载入内存的过程，游戏代码不是一次性，而是分阶段载入，并且按需请求的。了解这一点非常重要，这基本上意味着：

1. 某个游戏对象当前不一定存在
2. 需要跟踪游戏模块的加载来保证功能的可用性

`SEAC`将`SeerH5`的加载划分为了**三个阶段**的内容：

1. 游戏入口文件加载 - 核心模块初始化前
2. 游戏核心模块初始化 - 玩家登录前
3. 玩家登录 - 主面板展开

这三个阶段很好通过肉眼识别：

- 阶段一：白屏，显示logo
- 阶段二：登录界面
- 阶段三：主面板展开

# Create a Blog Post

Docusaurus creates a **page for each blog post**, but also a **blog index page**, a **tag system**, an **RSS** feed...

## Create your first Post

Create a file at `blog/2021-02-28-greetings.md`:

```md title="blog/2021-02-28-greetings.md"
---
slug: greetings
title: Greetings!
authors:
  - name: Joel Marcey
    title: Co-creator of Docusaurus 1
    url: https://github.com/JoelMarcey
    image_url: https://github.com/JoelMarcey.png
  - name: Sébastien Lorber
    title: Docusaurus maintainer
    url: https://sebastienlorber.com
    image_url: https://github.com/slorber.png
tags: [greetings]
---

Congratulations, you have made your first post!

Feel free to play around and edit this post as much you like.
```

A new blog post is now available at [http://localhost:3000/blog/greetings](http://localhost:3000/blog/greetings).
