# seerh5-assistant

赛尔号 H5 端登陆器 && api 封装接口

![license](https://img.shields.io/github/license/median-dxz/seerh5-assistant)
![core version](https://img.shields.io/github/package-json/v/median-dxz/seerh5-assistant?filename=packages%2Fcore%2Fpackage.json&label=core%20version)
![app version](https://img.shields.io/github/package-json/v/median-dxz/seerh5-assistant?filename=packages%2Fapp%2Fpackage.json&label=app%20version)
![last commit](https://img.shields.io/github/last-commit/median-dxz/seerh5-assistant)

目前处于**alpha**阶段，整体架构和api随时可能有**大型更改和重构**。

# 置顶声明

**IMPORTANT：项目全部开源，仅供学习使用，禁止用于任何商业和非法行为。项目内全部功能不涉及付费相关和 pvp 相关，项目内全部通信仅涉及淘米官方服务器，不涉及任何第三方。**

# 近期公告

开发者考研去了，项目缓更

**近期事情比较多（即使不包括考研）**，本项目将自230707版本开始直接停更，恢复更新时间待定，预计三周之后。

正在重写整个登录器，工作量很大

# 简介

**SeerH5-Assistant** 是一款由typescript编写的赛尔号H5端登陆器。项目目前包含两部分：core和app，其中core代表核心库，负责环境注入和接口封装，app是目前的登陆器应用程序原型，同时负责e2e测试。

关于近期的更新计划和正在进行的进度，请参阅：[SA-Project](https://github.com/users/median-dxz/projects/2)

# 快速入门

首先clone整个仓库，然后安装依赖：

```
npm i
```

依赖安装完成后，项目目前结构如下：

- `core`： 核心库
- `app`： 登录器前端应用
- `backend`：登录器后端服务
- `sdk`: 一些预制的模组包

首先，你需要对sa-core执行手动构建，得到dist输出。

在`core`包下执行：

```
pnpm build
```

然后**分别**运行登录器的前端和后端。

首先在`package/app`下创建`.evn.local`文件，详情见vite的环境变量配置文档：

```
VITE_BACKEND_PORT={你的后端端口号，默认是2147}
```

然后在`app`包下启动开发服务：

```
pnpm dev
```

在`backend`包下启动后端服务:

```
pnpm serve
```

在`sdk`包下运行

```
pnpm build
```

会自动构建模组并复制到backend的mods目录下。

检查`backend/config`修改你的配置
检查`app/builtin`以添加你需要的`Battle`和`Strategy`

在上述两处地方其中添加你的相关配置。

最后进入游戏！

注意该项目的后端的主要功能是作为**本地数据存储**和**跨域反代**，**部署在本地**，对于每一个用户存的都是独一份的数据。暂时还不考虑一人游玩多个号的场景。

关于编写模组的例子，请看下面的例程。

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

app：

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
import { ct } from '@sa-app/context/ct';
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

- [x] v0.1.8 - v0.1.10
  - [x] 整体重构为**TypeScript** 
- [x] v0.2.x
  - [x] 添加初步的UI界面和功能支持
  - [x] 和模组交互的命令框
  - [x] 提供快捷功能访问的快捷栏
  - [x] 主操作面板
  - [x] 手动添加官方客户端的dts定义
  - [x] 添加egret引擎的dts定义
  - [x] 重构`BattleManager`模块
- [x] v0.3.x
  - [x] 清日任功能
  - [x] 事件钩子全面优化
  - [x] 基于LocalStorage的配置储存
- [x] v0.4.x 版本进行了非常大的重构和更改，主要包括：
  - [x] core与app分离，项目变为monorepo
  - [x] core的api以及内部实现几乎全部重新设计
  - [x] 为编写pve关卡提供了高级抽象的level模块
  - [x] 迁移webpack到vite
  - [x] 添加service worker
  - [x] 从开发服务器分离独立后端
  - [x] core模块的单元测试支持

分离之后，两个模块的路线图：

## Core:

- [ ] --> 0.5.x 重构`Battle`下的策略(Strategy)与行动(Move)，将概念和接口优化，降低代码复杂度和思维复杂度
- [ ] Release: 1.0.0 整合`Function`功能，重构组织形式，表现为内置模组，要求可以方便对接到app

## App:

- [ ] --> 0.5.x 重构React组织和实现，将使项目具有一定可用性，可以在生产环境使用（不考虑动态加载模组功能）
- [ ] 0.6.x 版本将重构迁移至**electron**，使用node.js提供的文件api能力进行配置文件，模组等内容的读写
- [ ] 0.7.x 版本将完成模组编写的库分发配置，届时考虑在electron版本的生成环境下开放模组sdk环境进行编写，调试和加载

# 开源协议

**MPL-2.0**


并确保您遵守了 **eula** 中的开发者条款
