---
sidebar_position: 6
---

# Engine 模块

禅与摩托车维修艺术

## 设计理念

Engine 模块其实并不是一个比较高层次的模块，该模块提供了一层实现游戏某些功能的薄封装，解耦了游戏和登录器之间的直接依赖。所有 SEAC 的其他高级模块没有覆盖到的部分都放在该模块下。

该模块除了 function 类外，功能是应该是**原子**的，**无其他模块依赖**的。此外因为这些封装都特化于特定游戏功能，可复用程度很低，与其一开始提供一个臃肿的实现，不如开放扩展接口，以便外部自行封装并复用需要的功能。

## engine 命名空间

engine命名空间实质就是一个对象，提供了一个扩展方法 `extend` 和四大类功能：

- ui：ui 控制相关
- query：查询玩家信息相关
- mutate：修改玩家信息相关
- function：高级功能集

### engine.extend

函数签名：

```ts
SEAEngine.extend(func: AnyFunction | Record<string, AnyFunction>): void
```

传入一个函数或者包含若干方法的对象，这些函数将以函数名作为键被复制到engine上，然后engine上就可以调用这些函数了。

### function 类

提供由一组功能组成的高级功能。

### engine.lowerHp

自动使用谱尼第三封印进行压血，需要调用方保证第三封印已经开启，同时确保ct的合法性。

```ts
function lowerHp(pets: number[], healPotionId?: ValueOf<typeof PotionId>, hpLimit?: number): Promise<void>;
```

- `pets`: 精灵的[ct](../concepts-and-words.md#catchtime)数组，压血目标，若长度超过6则截断。会自动进行背包的切换。
- `healPotionId`: 回血药的id，默认使用50血药。
- `hpLimit`: 压血上限，该功能执行完毕后保证精灵血量**小于**此数值，默认200。

注意该方法会自动进行若干次对战，且会调用core中的战斗调度器。同时还会对进行自动使用中级活力药剂进行pp的回复并且关闭自动治疗等。

返回一个 Promise，该 Promise 会在压血全部完成后 resolve。

### engine.switchBag

切换背包，需要调用方确保ct的合法性。

```ts
function switchBag(pets: number[] | Pet[]): Promise<void>;
```

## socket 命名空间

请参阅[收发包教程](./socket.md)了解如何使用 `socket` 进行收发包。

### socket.sendByQueue

### socket.multiValues

### socket.bitSet

### socket.playerInfo
