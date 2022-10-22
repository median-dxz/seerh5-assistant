# seerh5-assistant

赛尔号 H5 端登陆器 && api 封装接口

目前处于alpha阶段。

**IMPORTANT：项目全部开源，仅供学习使用，禁止用于任何商业和非法行为。项目内全部功能不涉及付费相关和 pvp 相关，项目内全部通信仅涉及淘米官方服务器，不涉及任何第三方。**

# API DOC

还未编写，且构建配置为打包为 web app，因此 ES module 暴露的接口只在开发环境下有效，目前构建后的接口只有手动建立 window 下的全局变量，详见源代码。

## 自动战斗功能编写速览

下面以红莲之誓·安卡的第四关为例，说明如何利用这个库编写自动战斗的代码。

```tsx
import data from '@data';
import * as saco from '@sa-core/core';
import { ReflectObjBase } from '@sa-core/modloader';
import { defaultStyle, SaModuleLogger } from '../../logger';

const { BattleModule, Utils, Functions, Const, PetHelper } = saco;
const { delay } = window;
const { petCts: ct, commonBattleModule: bm } = data;
const log = SaModuleLogger('Mod: 红莲安卡第四关', defaultStyle.mod);
```

首先根据项目中的两个路径别名`@sa-core`和`@data`分别引入sa库和自定义数据，logger是可选的，也可以选择从window下挂载的SA变量获取module实例。

```typescript
const PetBags = [
    { catchTime: ct.神寂·克罗诺斯, name: '神寂·克罗诺斯' },
    { catchTime: ct.蒂朵, name: '蒂朵' },
    { catchTime: ct.六界帝神, name: '六界帝神' },
    { catchTime: ct.时空界皇, name: '时空界皇' },
];

const DSP = new BattleModule.BaseSkillModule.DiedSwitchLinked(bm.克朵六时.diedSwitchLink);
const NMS = new BattleModule.BaseSkillModule.NameMatched(bm.克朵六时.skillMatch);
```

接着以上述格式配置需要的精灵背包和战斗模型，目前支持两种模式的快速配置：`DiedSwitchLinked`用来指示战斗模型在当前精灵战败（hp=0）后切换的精灵，`NameMatched`用来指示某个精灵的固定出招。

```typescript
export class hlak4 extends ReflectObjBase implements ModClass {}
```

导出一个类，包括一个接口和一个扩展。

```typescript
export class hlak4 extends ReflectObjBase implements ModClass {
    _startFight() {
	    return Utils.SocketSendByQueue(45787, [86, 4, 52, 1]);
    }
    _getAward() {
        return Utils.SocketSendByQueue(45787, [86, 4, 51, 5]);
    }
 }
```

封装所需的特定发包指令。

```typescript
export class hlak4 extends ReflectObjBase implements ModClass {
    async update() {
        const data = await Utils.GetMultiValue(107809, 107810, 107805, 12743);
        this._activityInfo = Object.assign(this._activityInfo, {
            红莲能量: data[0],
            当前位置: (data[1] >> 8) & 255,
            今日剩余次数: 10 - data[3],
        });
        console.table(this._activityInfo);
        return this._activityInfo;
    }
}
```

编写更新关卡数据的函数。

```typescript
export class hlak4 extends ReflectObjBase implements ModClass {
    async init() {
        this.update();
        await Functions.SwitchBag(PetBags);
        PetHelper.setDefault(ct.神寂·克罗诺斯);
        PetHelper.cureAllPet();
        await delay(200);
        log('初始化完成');
    }
}
```

初始化方法，可以在里面放入切换背包，治疗精灵等预操作。

```typescript
export class hlak4 extends ReflectObjBase implements ModClass {
    async runOnce() {
        await new Promise<void>((resolve, reject) => {
            Functions.LowerBlood([ct.神寂·克罗诺斯, ct.时空界皇], Const.ITEMS.Potion.中级体力药剂, () => {
                const self = this;
                const battleModule = {
                    entry() {
                        self._startFight();
                    },
                    skillModule: BattleModule.GenerateBaseBattleModule(NMS, DSP),
                    async finished() {
                        self.update();
                        PetHelper.cureAllPet();
                        await delay(200);
                        resolve();
                    },
                };
                BattleModule.ModuleManager.queuedModule(battleModule);
                BattleModule.ModuleManager.runOnce();
            });
        });
    }
}
```

最后是核心的战斗模型，由于目前实现的限制，只能在压血的回调内执行单次的战斗模型。

战斗模型是一个对象字面量，有三个方法，请注意this的使用。三个方法分别是`entry`、 `battleModule` 和`finshed`，使用`ModuleManager`将模型加入队列并立即执行一次。

`entry`方法调用后，应使游戏进入战斗，一般通过发包操作完成，因为赛尔号的游戏主体在接收到战斗开始的包会自动处理相关的战斗进入逻辑，不需要特别处理。

`finshed`用于结束后的收尾工作，类似回调，调用的时机是战斗结束的收包之后。

`battleModule`接收一个战斗模型，其类型定义如下：

```typescript
type SkillModule = (battleStatus: RoundInfo, skills: Skill[], pets: PetSwitchInfos) => PromiseLike<void>;
```

如上所示，是一个函数签名。该函数接受当前回合的相关信息（包含双方精灵），当前我方精灵的所有技能以及当前我方背包的所有精灵信息。可以在里面调用`BattleOperator`进行出招，切精灵等操作。

对于死切顺序固定，每只精灵固定出招（点名84）的模型，可以使用上面提到的`BaseSkillModule`直接生成部分逻辑，而后使用`BattleModule.GenerateBaseBattleModule`得到完整的战斗模型。

# 版本号说明

## 1.0之前

`0`.`主版本(大型架构更改/功能添加)`.`次版本(功能点实现)`.`修补版本(几次完整的commit)`

## 1.0之后

采取semver标准

# 路线图 (Road Map)

- [x] 0.1.8-0.1.1x 版本将整体重构为**TypeScript**, 并进行代码结构和逻辑优化
- [x] 0.2.0 版本将使用自定的 logger 模块
- [ ] 0.2.x 版本将进行初步的 UI 设计
- [ ] 0.3.x版本将重构迁移至**electron**，使用node.js提供的文件api能力进行配置文件，模组等内容的读写
- [ ] 0.4.x版本将完成模组编写的库分发配置，届时考虑在electron版本的生成环境下开放模组sdk环境进行编写，调试和加载

# 如何运行

目前最方便的使用方式是直接在在开发调试服务器内运行整个服务，不仅支持hmr，而且编写模组时有完整的编辑器（vsc）支持。

想要在开发服务器上运行，请clone仓库，然后运行：

```bash
npm i
npm run start
```

开发服务器会在`localhost:1234`上运行。

暂无任何 release，请手动构建。

clone 该项目代码，运行：

```bash
npm i
npm run build
```

而后在 dist 文件下得到输出，该输出使用 webpack 打包，目前配置下会将预置的模组全部打包进去。

输出后需要一个代理服务器进行代理，而后通过 localhost 进行访问，代理服务器需要**webpack.proxy.js**中的代理中间件方可运行。

默认运行时没有使用 babel 转换！要求尽可能高版本的浏览器，至少全面支持 es6/7。

# 技术栈

React + mui 负责界面，webpack 打包

api 部分使用原生 es module 编写，封装 seerh5.61.com 暴露出的接口，通过操作这些接口实现登陆器相关功能。

# 开源协议

**MPL-2.0**

并确保您遵守了 **eula** 中的开发者条款
