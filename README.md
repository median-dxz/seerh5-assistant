# Seerh5 Assistant

赛尔号 H5 端登陆器 && api 封装接口

![license](https://img.shields.io/github/license/median-dxz/seerh5-assistant)
![core version](https://img.shields.io/github/package-json/v/median-dxz/seerh5-assistant?filename=packages%2Fcore%2Fpackage.json&label=core%20version)
![launcher version](https://img.shields.io/github/package-json/v/median-dxz/seerh5-assistant?filename=packages%2Flauncher%2Fpackage.json&label=launcher%20version)
![last commit](https://img.shields.io/github/last-commit/median-dxz/seerh5-assistant)

目前处于**alpha**阶段，整体架构和api随时可能有**大型更改和重构**。

# 置顶声明

**IMPORTANT：项目全部开源，仅供学习使用，禁止用于任何商业和非法行为。项目内全部功能不涉及付费相关和 pvp 相关，项目内全部通信仅涉及淘米官方服务器，不涉及任何第三方。**

# 近期公告

**全面暂停SEAL的开发（目前版本已经具备初步可用性）**，开始对`sea-core`模块进行一系列调整，准备进行`sea-core 1.0.0-rc.1`版本的发布

重大事项：

- [ ] api全面文档化，使用`docusauru`在`github.io`上搭建api参考
- [ ] 编写教程（包含core层的使用和基础模组编写）
- [ ] 将集成测试移入单独的包
- [ ] 全面启用真正的单元测试，采用vitest
- [ ] 引入单层依赖管理
- [x] 命名空间，导出再次调整
- [x] 修复若干历史遗留问题

## 最近更新的内容

见ChangeLog

# 简介

**SeerH5-Assistant** 是一款使用typescript编写的赛尔号H5端登陆器。项目目前包含四个部分：core、launcher、server、sdk，其中

- `core`: 核心库，负责环境注入和接口封装
- `launcher`: 目前的登录器应用程序原型，同时负责e2e测试
- `server`: 登陆器后端，负责登陆器服务，游戏资源反代以及用户配置的存储（参见~~现在还不存在的~~文档了解为什么使用后端服务而不是直接使用Electron来实现这些）
- `sdk`: 适用于本登录器的模组开发框架

关于近期的更新计划和正在进行的进度，请参阅：[SEA-Project](https://github.com/users/median-dxz/projects/2)

项目简称: SEA，登录器简称：SEAL

# 快速入门

前排提示：本项目目前处于开发阶段，没有可用的成品，如果你对相关的技术栈不熟悉，可以等待该项目成熟后再来。

首先clone整个仓库，然后安装依赖：

```
pnpm i
```

依赖安装完成后，项目目前结构如下：

- `core`： 核心库,
- `launcher`： 登录器前端本体
- `server`：登录器后端
- `sdk`: sdk环境，内含一些预制的模组包

然后你需要分别为前端和sdk安装`sea-core`，由于各种因素的考虑，`sea-core`没有发布在npm上，因此你有两种选择：

1. 通过本地tarball包安装
2. 通过远程tarball包安装

不过现阶段使用clone整个项目来尝鲜的话，可以直接遵循下面步骤：

首先，你需要对sa-core执行手动构建，得到dist输出。

执行：

```
pnpm core:build
```

因为`launcher`是使用工作区链接来安装`sea-core`的，因此现在登录器就能使用了。

然后**分别**运行登录器的前端和后端。

首先在`package/launcher`下创建`.evn.local`文件，详情见vite的环境变量配置文档：

```
VITE_BACKEND_PORT={你的后端端口号，默认是2147}
```

然后在`launcher`包下启动开发服务：

```
pnpm dev
```

在`server`包下启动后端服务:

```
pnpm start
```

如果要进一步使用`sdk`中的预设模组，你可以直接运行：

```
pnpm release
pnpm build
```

第一条命令会启用一个脚本来构建`sea-core`，并自动安装到sdk下，
第二条命令会自动构建模组并复制到server的mods目录下。

最后进入游戏！请注意浏览器版本, 如果不支持import-map, 原生esm加载等功能, 需要手动添加相应的polyfill

注意该项目的后端的主要功能是作为**本地数据存储**和**跨域反代**，**部署在本地**，对于每一个用户存的都是独一份的数据。暂时还不考虑一人游玩多个号的场景。

关于编写模组的例子，请看下面的例程。

# SDK的环境构成

1. typescript+vite脚手架的基本配置
2. `sea-core`库的接口定义, 以及将其视为外部模块所需的相关配置
3. `launcher`扩展的`sea-core`定义，提供了更多高级常用功能
4. `launcher`提供的模组定义文件，用以支持模组的开发
5. `sea-core`库内嵌的`egret`白鹭引擎定义，以及`seerh5`游戏模块的反混淆定义

# 功能点

core：

- 自动战斗
  - 设置战斗模型
  - 完备的回合信息
- 统一的游戏静态数据查询接口
- 常用操作封装
- 精灵养成操作封装
  - 包含一个内部精灵信息缓存
- 收发包支持
- 多个事件订阅器
  - 模块加载
  - 收发包
  - 各种事件的监听
  - 注入了额外的常用事件的hook
- 游戏内实体封装
- 支持扩展

launcher：

- 扩展核心
  - 实现一些常用功能集
    - 压血
    - 战队派遣
    - 切换背包
  - 游戏内部优化
    - 本地换肤
    - 静态模式对战加速
    - 查看对方血量
    - 战队加成一键加满
    - h5端自动治疗开关
    - 离屏挂机
    - 更多功能编写中...
- 控制面板，你可以在这里轻松：
  - 切换称号
  - 切换套装
  - 分开治疗指定精灵
  - 压血
  - 借火
  - 保存并切换背包
- 一键签到
- 一键日任，稳定不掉线
- 因子扫荡
- 收发包调试
- 手动设置常用战斗
- 快捷控制面板
- 充分的功能扩展支持（未实现）

其他：

- 入口注入
- 多重缓存加速游戏加载
- 登陆器和实际游戏客户端之间的ui与数据同步
- 反代资源
- ui操控

# 完整参考

请等待还没完工的文档

# 原理与高级用例

同上，包括注入原理，修改原理，如何拿到官方原始源码进行调试，收发包细节，官方游戏引擎细节等

# 运行测试

目前登录器本体的功能就直接当作手动e2e测试啦!

对于core核心库的测试，同样需要先运行后端。

# 路线图 (Road Map)

## Core:

--> Release: 1.0.0 解耦登录器特定逻辑以及非核心功能, 要求可以方便对接到launcher

## App:

- [ ] --> 0.6.x 重构React组织和实现，将使项目具有一定可用性，**支持docker部署**，拥有SDK
- [ ] 0.7.x 版本将重构迁移至**electron**

# 开源协议

**MPL-2.0**

并确保您遵守了 **eula** 中的开发者条款
