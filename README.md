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

开发者考研中，项目缓更(缓慢更新)(因为貌似今年考不上了)

同时目前进度下，下一个主要目标需要重写整个登录器，工作量很大

## 最近更新的内容

- [x] 使用import map, 在全局共享`sea-core`ES模块实例, 使插件捆绑后以原生esm方式即可使用core, 基于vite插件实现
- [x] `SEAPet` 更换更优雅的链式调用api
```typescript
// 调用SEAPet事实上已经返回了一个Promise, 但是为了清晰起见,
// 以及防止vscode的自动提示出现两个相同的属性(其中一个是自动帮你嵌套await后获取ProxyPet上的属性)
// 约定使用一个get方法来获取返回的ProxyPet
await SEAPet(pet).get(); 
// get的用法和Promise的then一模一样, 实际上内部直接调用了Promise的then
await SEAPet(pet).get((pet) => {
    return pet.cure();
});
// 很优雅的异步获取属性
await SEAPet(pet).catchTime;
// 很优雅的异步调用突变方法
await SEAPet(pet).default();
// 对于更新并返回自身的突变, 可以很优雅的链式调用,
// 如果最后一个调用仍然返回自身, 使用done属性来获取实际的promise
await SEAPet(pet).cure().location().done;
```

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

# 例程

下面以最近的齐天大圣孙悟空12轮挑战为例来介绍sa-core如何使用以及能实现什么功能。sa最常用的功能之一就是进行pve关卡的编写，因此可以覆盖大部分应用场景。

我们需要在登陆器应用下本地安装`sa-core`这个包并配置sdk开发环境，这里不多做展开（主要sdk还没开发完成），目前可以参考`packages/sdk`。

## 1. 关卡信息的获取

首先我们观察该挑战特征，发现我们需要的信息有：

- 当前挑战次数（1~12）
- 当前挑战的条件

以及我们需要的发包操作有：

- 进行战斗

因为这是一个flash的关卡，h5端没有上线，故我们需要在flash端进行抓包和反编译关卡得到as3脚本，最终得到这些参数和发包需要的所有参数。这部分内容在之后的教程中会详细介绍，这边就省略相关过程。

## 2. 定义关卡

获取到信息后，在`v0.5.x`的`sa-core`中，我们可以使用`ILevelRunner`接口来编写关卡逻辑，实例化一个LevelRunner后，即可交由SA的LevelManager进行关卡的自动执行。

首先，我们需要区分关卡的三个相关概念：

- `Data`: 关卡的动态信息，会在我们进行关卡的时候动态改变，在状态机每次更新时都获取一次信息
- `Info`: 关卡的静态信息，通常是一些和关卡有关的常量，在模组初始化时获取一次信息
- `Option`: 关卡选项，是玩家传递给模组的配置参数，用以让模组做出关卡中的决策，最经常需要传递的信息就是战斗模型

`SALevelManager`要求`Data`和`Info`必须扩展自`SALevelData`和`SALevelInfo`，至于Option则完全由模组作者控制。

根据以上知识，我们可以写出一个关卡定义：

```ts
interface LevelData extends SALevelData {
    curPosition: number;
    limit: LimitType;
    start: boolean;
}

enum LimitType {
    低于300血 = 7,
    三回合击败 = 3,
    特殊攻击 = 6,
    物理攻击 = 5,
    伤害大于2000 = 1,
    全程暴击 = 8,
    拖10回合 = 4,
    伤害小于300 = 2,
}

export class LevelDaSheng implements ILevelRunner<LevelData, SALevelInfo> {
    info: SALevelInfo;
    data: LevelData;
    option: typeof options;
    logger: (msg: React.ReactNode) => void;

    constructor() {
        this.logger = SaModuleLogger('大圣12轮挑战', defaultStyle.mod);
        this.info = {
            name: '大圣12轮挑战',
            maxTimes: 12,
        };
        this.data = { curPosition: 0, start: false } as LevelData;
        this.option = options;
    }
}
```

下面来讲解一下上面的代码为什么是这么写的。

首先我们需要创建一个实现`ILevelRunner`接口的类，这个接口需要两个泛型参数，分别是`Data`和`Info`，默认情况下使用`SALevelInfo`和`SALevelData`两个接口。当我们添加额外的关卡信息时，一定要记得从`SALevelInfo`和`SALevelData`扩展。

因此我们先定义了`LevelData`这个接口，然后再实现这个类。

实现这个类的时候，首先需要在构造函数中进行初始化，可以看到，这里我填入了关卡默认的`SALevelInfo`接口所需要的参数，以及默认的data信息。因为这个是自用模组，option就直接内联在类中了，如果是公开模组，请将option作为参数传入。

可以看到，这里的option里包含了所有限制条件下使用的**战斗模型**，下面会解释。

## 3. 战斗模型

首先来看这个`ILevelBattleStrategy`的接口定义：

```ts
export interface ILevelBattleStrategy {
    // 战斗模型
    strategy: MoveStrategy;
    // 精灵列表
    pets: number[];
    // 战斗前准备
    beforeBattle?: () => Promise<void>;
}
```

pets需要的参数是精灵的ct，ct指`CatchTime`，是每个精灵的唯一标识。另外，这里约定了数组的第一个项会视为首发。

一个自然的问题就是，精灵的ct应该如何获取？而且这是自用模组，如果要编写分享给大家的模组，我们是事先无法知道玩家的精灵ct的。目前的解决方案是，由于现代精灵大多数具有唯一性，SA的官方登录器实现提供了`ct`这一个便捷的helper函数来进行精灵名称到ct的映射。（截至本教程编写的时候，该helper尚不支持在关卡模组中注入，只能在内部实现中使用）我们导入（在登录器的builtin下）或者访问注入的helpers（通过this.appHelpers）来使用这个函数。

```ts
import { ct } from '@sea-launcher/context/ct';
// or
this.appHelpers.ct
```

这里还有个小问题，ct这个helper返回的是个promise，因此我们的应该在模块级别定义，以便使用await。

最终我们写出如下的战斗模型:

```ts
const options = {
    '84': {
        strategy: generateStrategy(['守御八分', '剑挥四方', '诸界混一击'], ['帝皇之御', '六界帝神', '时空界皇']),
        pets: await ct('帝皇之御', '六界帝神', '时空界皇'),
        beforeBattle: async () => lowerBlood(await ct('时空界皇')),
    },
    '84蒂朵': {
        strategy: generateStrategy(['守御八分', '剑挥四方', '幻梦芳逝'], ['帝皇之御', '六界帝神', '蒂朵']),
        pets: await ct('帝皇之御', '六界帝神', '蒂朵'),
    },
    圣谱: {
        strategy: {
            resolveMove: async (state, skill) => {
                let r = skill.find((s) => s.name === ['光荣之梦', '璀璨圣光'].at(state.round % 2));
                if (state.round > 10) {
                    r = skill.find((s) => s.name === ['神灵救世光', '光荣之梦'].at(state.round % 2));
                }
                return Operator.useSkill(r?.id);
            },
            resolveNoBlood: () => -1,
        },
        pets: await ct('圣灵谱尼'),
    },
    艾莫高伤: {
        strategy: {
            resolveMove: async (state, skill, pets) => {
                const r = skill.find((s) => s.name === '冥夜镇魂弑');
                if (r && state.round > 4) {
                    return Operator.useSkill(r?.id);
                } else if (r) {
                    return Operator.switchPet(pets.findIndex((p) => p.name === '鲁肃'));
                }
                return Operator.useItem(Potion.中级活力药剂);
            },
            resolveNoBlood: (state, _, pets) => {
                return new NoBloodSwitchLink([
                    '潘克多斯',
                    '蒂朵',
                    '茉蕊儿',
                    '艾莫莉萨',
                    '鲁肃',
                    '芳馨·茉蕊儿',
                    '艾莫莉萨',
                ]).match(pets, state.self.catchtime);
            },
        },
        pets: await ct('潘克多斯', '蒂朵', '鲁肃', '芳馨·茉蕊儿', '茉蕊儿', '艾莫莉萨'),
        beforeBattle: async () => lowerBlood(await ct('潘克多斯', '蒂朵', '鲁肃', '芳馨·茉蕊儿', '茉蕊儿')),
    },
} satisfies Record<string, ILevelBattleStrategy>;
```

有关战斗模型的具体编写，请参阅（待填坑）战斗模型部分的教程。另外上面的打法并不是很稳，很多时候还是需要根据具体情况手操...

最后我们实现战斗模型的选择方法：

```ts
export class LevelDaSheng implements ILevelRunner<LevelData, SALevelInfo> {
    selectBattle() {
        let battle: ILevelBattleStrategy = this.option['84'];
        console.log(this.data.limit);
        switch (this.data.limit) {
            case LimitType.低于300血:
                battle = this.option['84'];
                break;
            case LimitType.三回合击败:
                battle = this.option['84'];
                break;
            case LimitType.特殊攻击:
                battle = this.option['84'];
                break;
            case LimitType.物理攻击:
                battle = this.option['84蒂朵'];
                break;
            case LimitType.伤害大于2000:
                battle = this.option['艾莫高伤'];
                break;
            case LimitType.全程暴击:
                battle = this.option['艾莫高伤'];
                break;
            case LimitType.拖10回合:
                battle = this.option['圣谱'];
                break;
            case LimitType.伤害小于300:
                battle = this.option['84蒂朵'];
                break;
        }
        return battle;
    }
}
```

## 4. 定义关卡的状态更新方法

首先，对于特定于某个玩家，但是不是玩家本身所拥有的数值，在游戏中被称为`MultiValue`。游戏内大部分的数值都属于这个值，尤其是对于每个玩家而言的关卡信息，几乎全都属于这个类型。`MultiValue`可以看成一个Map，通过给定key，查询对应的value。

要想获取`MultiValue`，我们需要使用`SAEngine`模块下的`Socket`导出对象。

`Socket`对象的`multiValue`方法是获取`MultiValue`的收发包的便捷封装。api如下：

```ts
Socket.multiValue(...values: number[]): Promise<number[]>
```

下面的代码都是从这些值解析我们需要的关卡信息的对应代码，我们跳到下面的领取奖励的部分：

```ts
SAEngine.Socket.sendByQueue(46328, [7, 1])
```

这个就是通用的发包函数(通过WebSocket)。api如下：

```ts
Socket.sendByQueue(cmd: number, data?: number[]): Promise<ArrayBuffer>
```

然后编写关卡的状态机更新函数和更新动作：

```ts
    async updater() {
        const values = await Socket.multiValue(207051, 207052);

        this.data = {
            ...this.data,

            curPosition: values[0],
            limit: values[1] as LimitType,

            leftTimes: 12 - values[0],
        };
        if (this.data.curPosition !== 12) {
            return SALevelState.BATTLE;
        } else {
            this.data.success = true;
            return SALevelState.STOP;
        }
    }

    readonly actions: Record<string, () => Promise<void>> = {
        battle: async () => {
            await Socket.sendByQueue(41950, [32, 1]);
        },
    };
```

至此，我们完成了整个关卡脚本的编写(详细讲解待填坑)。

> 注：以上代码没有处理每日关卡是否开启的逻辑(data.start)，每天运行前需要额外发一个`41950,[32, 0]`的包。

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

- [ ] --> 0.5.x 重构React组织和实现，将使项目具有一定可用性，可以在生产环境使用（不考虑动态加载模组功能）
- [ ] 0.6.x 版本将重构迁移至**electron**，使用node.js提供的文件api能力进行配置文件，模组等内容的读写
- [ ] 0.7.x 版本将完成模组编写的库分发配置，届时考虑在electron版本的生成环境下开放模组sdk环境进行编写，调试和加载

# 开源协议

**MPL-2.0**

并确保您遵守了 **eula** 中的开发者条款
