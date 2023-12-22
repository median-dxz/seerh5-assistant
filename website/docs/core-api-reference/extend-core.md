---
sidebar_position: 5
---

# 扩展类型定义

Rea(s)oN

通过 TS 的声明合并来扩展核心的类型定义。

## 声明合并

声明合并是 TS 官方提供的一项特性，可以让库的消费者可以扩大他们需要的类型定义，从而在向库添加功能的同时保持 Typed。

如果你不了解什么是声明合并，这是官方文档：[Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

你可以在 dc 频道中查看对游戏内类型定义的常见扩展模式。

下面的内容是关于 SEAC 自身提供的，用于声明合并的可扩展部分。

:::warning
SEAC 在 SEAL 中运行的时候，全局只存在一份实例，因此你对 SEAC 做的扩展对其他所有模组共享（包括 SEAL 自身）。

请注意潜在的冲突行为！
:::

## 注册表与 TypeMap

SEAC 中目前除了 `engine` 之外都是采用注册表 + TypeMap 的方式来提供扩展点的。所谓注册表，就是指 SEAC 导出的以*Registry*结尾的一些对象，例如：

```ts
import { SocketDeserializerRegistry } from '@sea/core';
```

注册表上会有 `register` 和 `unregister` 方法，用以注册/卸载内容。

而所谓 TypeMap 就是一个接口，这个接口的键值对和注册表内部的 Map 中的内容一一对应，这样从注册表上获得内容时就可以获得完全的 Typed。重点是要认识到 TypeMap 作为一个类型，虽然和注册表配对，但是本质上两者相互独立。因此扩展 SEAC 时一定要同步更新两者。

另外一个事实是，虽然注册表可以卸载注册的内容，但是 **TypeMap 作为类型定义是没有卸载一说的**。因此在编写模组时，要注意保持模组的生命周期和注册表的维护同步，以便在整个生命周期内保证类型定义的正确性。

目前 SEAC 中一共存在三个注册表：

- HookPointRegistry - HookPointDataMap：负责提供 HookPoint
- SocketDeserializerRegistry - SocketResponseMap：提供 Socket 响应的反序列化
- GameConfigRegistry - GameConfigMap：提供游戏静态数据的统一查询接口

此外还有一个没有对应注册表的 TypeMap：GameModuleMap。

## 扩展核心定义

下面是一份完整的扩展核心定义参考，你可以从中了解所有 SEAC 中需要进行扩展核心定义的情况，以及如何处理。

请注意，这个教程的内容重点是扩展 SEAC 时对 TypeScript 类型的处理，而不是如何在实际上扩展 SEAC 的功能。也就是说，即使不进行类型处理，在 js 层面扩展功能依然能照常运行。这部分内容请前往相关功能所处的章节了解。
