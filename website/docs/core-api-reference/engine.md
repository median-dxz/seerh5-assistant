---
sidebar_position: 6
---

# Engine 模块

禅与摩托车维修艺术

## 设计理念

Engine 模块其实并不是一个比较高层次的模块，该模块提供了一层实现游戏某些功能的薄封装，解耦了游戏和登录器之间的直接依赖。所有 SEAC 的其他高级模块没有覆盖到的部分都放在该模块下。

该模块除了 function 类外，功能是应该是**原子**的，**无其他模块依赖**的。此外因为这些封装都特化于特定游戏功能，可复用程度很低，与其一开始提供一个臃肿的实现，不如开放扩展接口，以便外部自行封装并复用需要的功能。

## engine 命名空间

engine 命名空间下提供了一个扩展方法 `extend` 和四大类功能：

- ui：ui 控制相关
- query：查询玩家信息相关
- mutate：修改玩家信息相关
- function：高级功能集

### engine.extend

### function 类

提供由一组功能组成的高级功能。

### engine.lowerHp

## socket 命名空间

请参阅[收发包教程](./socket.md)了解如何使用 `socket` 进行收发包。

### socket.sendByQueue

### socket.multiValues

### socket.bitSet

### socket.playerInfo
