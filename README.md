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

# 简介

**SeerH5-Assistant** 是一款由typescript编写的赛尔号H5端登陆器。项目目前包含两部分：core和app，其中core代表核心库，负责环境注入和接口封装，app是目前的登陆器应用程序原型，同时负责e2e测试。


未来还有两个模块：sdk与模组系统的支持，以及反向代理的本地服务器。

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

# 快速入门

首先clone整个仓库，然后运行：

```
npm i
```

在`packages/app`下编写客户端和模组。运行客户端请直接使用`npm run start`，此命令会启动webpack的DevServer，同时在该server内安装最基本的代理中间件。然后在本地服务器上即可使用登陆器游玩。

关于编写模组的例子，请看下面一节。

# 例程

下面以阿尔蒂克的第三关来介绍sa-core如何使用以及能实现什么功能。脚本最常用的功能就是进行pve关卡的编写，因此可以覆盖大部分应用场景。

我们需要在登陆器应用下本地安装`sa-core`这个包，这里不多做展开（毕竟还没到开放sdk的程度），参考`packages/app`下的做法，注意一定要先等待环境注入成功后（同时也是游戏成功登录后）再调用`sa-core`。

## 1. 关卡信息的获取

首先我们观察第三关的特征，发现我们需要的信息有：

- 今日剩余次数
- 当前位置
- 当前层击败的情况，如果最后一层已经全部击败，就可以领取一次奖励，开始新的一轮
- 神秘晶石和战斗晶石的数量

以及我们需要的发包操作有：

- 领取一轮的奖励并开始新的一轮
- 进行一次抽取
- 如果抽到boss则进行战斗

因为这是一个flash的关卡，h5端没有上线，故我们需要在flash端进行抓包和反编译关卡得到as3脚本，最终得到这些参数和发包需要的所有参数。这部分内容在之后的教程中会详细介绍，这边就省略相关过程。

```js
this.config = {
    抽取次数: 0,
    当前位置: 0,
    击败情况: [],
    神秘晶石: 0,
    战斗晶石: 0,
    位置参数: 0,
    async update() {
        const value = await SAEngine.Socket.multiValue(4858, 4859, 16595, 16598, 16599);
        this.神秘晶石 = value[0];
        this.战斗晶石 = value[1];
        this.抽取次数 = 20 - value[2];
        let temp = value[3]; //全部击败情况
        const levelState = [];
        for (let i = 1; i <= 20; i++) {
            levelState.push(temp & 1);
            temp = temp >> 1;
        }
        this.击败情况 = levelState.map(Boolean);
        this.当前位置 = value[4]; // 1-BASE
        this.位置参数 = posAttr[this.当前位置 - 1];
    },
    async 领取奖励() {
        await SAEngine.Socket.sendByQueue(46328, [7, 1]);
        return this.update();
    },
    async 抽取一次() {
        await SAEngine.Socket.sendByQueue(46328, [5, 0]);
        return this.update();
    },
};
```

我们来观察一下上面的代码是如何完成我们的需求的。

首先对于游戏内的特定于某个玩家，但是不是玩家本身所拥有的数值，被称为`MultiValue`。游戏内大部分的数值都属于这个值，尤其是对于每个玩家而言的关卡信息，几乎全都属于这个类型。`MultiValue`可以看成一个Map，通过给定key，查询对应的value。

要想获取`MultiValue`，我们需要使用`SAEngine`模块下的`Socket`导出对象。

`Socket`对象的`multiValue`方法是获取`MultiValue`的收发包的便捷封装。api如下：

```ts
Socket.multiValue(...values: number[]): Promise<number[]>
```

下面的代码都是从这些值解析我们需要的关卡信息的对应代码，我们跳到下面的领取奖励的部分：

```js
SAEngine.Socket.sendByQueue(46328, [7, 1])
```

这个就是通用的发包函数(通过WebSocket)。api如下：

```ts
Socket.sendByQueue(cmd: number, data?: number[]): Promise<ArrayBuffer>
```

因为涉及外部的收发包的抓取，同时需要反查关卡逻辑，所以这部分写pve关卡最麻烦的部分。不过接下来的内容在`sa-core`的帮助下，都可以非常简洁的实现。

## 2. 设置自动战斗的状态循环

完成了上面一部分后，我们就可以开始写真正执行pve脚本的部分了。首先是前置的准备操作。

```js
SAEngine.changeSuit(365);
SAEngine.changeTitle(418);
SAEngine.toggleAutoCure(false);
await switchBag(ct);
// 自动战斗
await this.config.update();
```

最后一行就是上面写的更新关卡信息。上面的准备工作中，我们依旧用到的是`SAEngine`模块，上面三个操作分别是：

- 切换套装到银翼
- 切换称号到音浪袭来
- 关闭自动治疗
 
这三个操作其实都是发包操作，但是由于所有的发包命令都统一使用`sendByQueue`封装，所以不用担心乱序的问题。因为这些都是发包操作，所有的返回都是Promise，因此按常理来说，使用时可能需要了解resolve的节点(在哪些回调之前/之后)，并且可能需要await和延迟操作来防止不正确的收包顺序、过快发包等操作导致的断线问题。对于`SAEngine`模块下的操作，一般除非特别注明，否则resolve的节点简单视为收包后立即resolve即可。

下一个操作是`switchBag`，即切换背包，这是一个预置的功能，封装了多组收发包操作，这种功能同样保证最后一个收包完成才resolve。

因此我们想让以上四个发包操作一次性发出，然后等待全部的`Promise` resolve后进行接下来的操作，一般来说应该用`Promise.all`实现。但是由于切换背包的发包和上面不冲突，且时间一定远大于上面的操作，故只要在切背包的时候await即可。

切换背包的api如下：

```ts
switchBag(cts: number[]): Promise<void>
```

ct指`CatchTime`，是每个精灵的唯一标识。

看到这里，一个自然的问题就是，上面这些套装称号的id，还有精灵的ct，应该如何获取呢？

底层上，`sa-core`已经封装了一组对应的查询api，你可以参考文档的[对应部分](/doc/2.SAEngine.md)。登陆器会使用这些查询函数提供一个查询面板方便开发者。你也可以在浏览器控制台使用这些查询api进行查询，又或者，可以使用第三方的数据源进行查询（如mw手册等）。

然后进入我们正式的战斗循环部分：

```js
 while (
    (this.config.战斗晶石 < 100 || this.config.神秘晶石 < 100) &&
    (this.config.抽取次数 > 0 || this.config.击败情况[this.config.当前位置 - 1] === false)
) {
    if (this.config.击败情况.filter((v, i) => i >= 18).every(Boolean)) {
        await this.config.领取奖励();
    } 

    if (this.config.当前位置 === 0 || this.config.击败情况[this.config.当前位置 - 1] === true) {
        await this.config.抽取一次();
    }

    if (this.config.位置参数 < 15) {
        //检测并进入战斗
    }
    await delay(1000);
    await this.config.update();
}

SABattle.Manager.clear();
```

为什么要这样写...这个还是和具体关卡的逻辑有关，回忆一下，我们想做的事情是：

- 抽取一次，直到顶层的boss都被击败或者过关，那么领取奖励开始新的一轮
- 如果抽到boss，就进入对战
- 直到过关或者今日的次数用完

这本质上是一种状态机，由于状态较为简单，因此我们可以用简单的循环和分支判断来实现。

额外注意的是，我们要时刻注意和服务器状态的同步，因此宁可频繁的更新，使用while循环，也尽量不要使用乐观UI的思路进行编写。例如：

```js
// 最好不要这么写!!
for (const i = 0; i < 20; i++) { // 假定一天20次机会都在本次运行中完成
    if (this.config.击败情况.filter((v, i) => i >= 18).every(Boolean)) {
        await this.config.领取奖励();
    }
    // 假定当前位置是可以抽取的
    await this.config.抽取一次();
    if (this.config.位置参数 < 15) {
        //检测并进入战斗
    }
    await this.config.update();
}
// 上面的问题的本质是没有考虑操作关卡后产生的"不纯"状态
```

## 3. 设置自动战斗

然后就到了最激动人心的自动战斗部分。一般来说，首先不要忘了在脚本运行结束的时候加上：

```js
SABattle.Manager.clear();
```

这里使用了`SABattle`模块的`Manager`导出对象，该对象负责管理自动战斗。`clear`方法会帮我们复位自动战斗的状态，以便切换到其他模型或者正常游戏。注意战斗结束的时候并**不会**进行自动复位，况且有可能因为各种意外情况导致战斗失败或者没有正常结束，此时都需要进行手动的复位。

那么，战斗模型如何设置呢？使用`sa-core`提供的功能，仅仅只需几行代码。

首先是可选的操作：使用`lowerBlood`进行压血，这同样是封装好的功能集，该函数会将给定ct的精灵压血，还会自动切换背包，是非常方便的一个功能，也是本项目提供的核心亮点功能之一。

```js
await lowerBlood(ct);
```

由于同样是涉及多组发包的异步操作，甚至还涉及到进入对战（使用谱尼第三封印压血），因此我们必须等待返回的`Promise` resolve。

api如下：

```js
lowerBlood(cts: number[], healPotionId?: number, hpLimit?: number): Promise<void>
```

压血结束之后，需要编写一个`MoveModule`，这是一个接口，定义如下：

```ts
type MoveModule = {
    resolveNoBlood: switchNoBloodHandler;
    resolveMove: moveHandler;
};
```

`MoveModule`就是前面反复提到的战斗模型，该对象由两个函数构成，一个在死切的时候调用，一个在正常的回合调用，失败的调用会fallback到auto，等同于超时后自动进行的操作。

但是对于这个例子，我们使用的模型是：送潘朵+压血魔钰一招秒，事实上，大部分关卡的情况就是这么简单，每个精灵出同一招，要么是几招来回按，切换的顺序也是固定的。那么对于这种送自爆强攻的情况，我们不需要手动编写代码，只需要声明死切链和出招表，就可以生成模型：

```js
const moveModule = SABattle.generateStrategy(
    ['鬼焰·焚身术', '梦境残缺', '幻梦芳逝'],
    ['潘克多斯', '蒂朵', '魔钰']
);
```

最后是进入对战，我们需要为每个对战指定模型和入口函数：

```js
await SABattle.Manager.runOnce(() => {
    FightManager.fightNoMapBoss(9736 + this.config.位置参数 - 1);
}, moveModule);
```
`FightManager`是客户端原生的接口，调用后就会自动进入战斗，注意**不要**在入口函数里写和进入战斗**无关的初始化操作**，入口函数应该尽可能保持简单。

至此，我们完成了整个关卡脚本的编写。

# 完整参考

请等待还没完工的文档

# 原理与高级用例

同上，包括注入原理，修改原理，如何拿到官方原始源码进行调试，收发包细节，官方游戏引擎细节等

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
