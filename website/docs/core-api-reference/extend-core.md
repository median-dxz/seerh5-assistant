---
sidebar_position: 5
---

# 扩展接口定义

Rea(s)oN

通过 TS 的声明合并来扩展核心的类型定义。

## 前置知识：声明合并

声明合并是 TS 官方提供的一项特性，可以让库的消费者可以扩大他们需要的类型定义，从而在向库添加功能的同时保持 Typed。

如果你不了解什么是声明合并，这是官方文档：[Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

你可以在 dc 频道中查看对游戏内类型定义的常见扩展模式。

下面的内容是关于 SEAC 自身提供的，可以通过声明合并进行类型扩展的部分。

:::warning
SEAC 在 SEAL 中运行的时候，全局只存在一份实例，因此你对 SEAC 做的扩展对其他所有模组共享（包括 SEAL 自身）。

请注意潜在的冲突行为！
:::

## 为什么需要扩展接口定义

举个例子，SEAC 提供了 Engine 的扩展点，你可以通过 engine 命名空间上的 `extend` 方法来扩展 engine 的功能。

```ts
import { engine } from '../dist/index';

engine.extend(function someFunction() {});
```

当上面的代码执行完毕之后，就能 engine 上访问到 `someFunction` 这个方法。但是这是一个运行时的动态行为，SEAC 没法预料 engine 上会被扩展出什么方法，TypeScript 的类型定义上自然也不可能存在 `someFunction`。

这时候就是扩展接口定义发挥作用的时候了。如果我们可以在外部扩展核心中的接口，那么就可以让 TS 在我们的代码库中将新加的功能视为 SEAC 的一部分，从而提供类型提示。而这是通过**声明合并**实现的：

```ts
declare module '@sea/core' {
  interface SEAEngine {
    someFunction(): void;
  }
}
```

上面的声明合并能成功，是因为 SEAC 提供了 `SEAEngine` 这个 interface 作为 engine 的类型。

总结一下，扩展接口定义是这样的一种 TS 模式：通过声明合并，在模块外部声明**模块被扩展出的功能**的类型定义。SEAL 给 sdk 提供的定义中，就有对 SEAC 的扩展接口定义，这样你在编写模组的时候，就能在自动补全提示上找到 SEAL 给 SEAC 添加的功能。

## SEAC 扩展接口

要扩展接口定义，需要模块提供可以进行声明合并的接口。下面是一份完整的 SEAC 中可扩展接口的列表，你可以从中了解所有 SEAC 中需要进行扩展接口定义的情况，以及如何处理。

请注意，这个教程**不是**如何扩展 SEAC 的功能，而是如何扩展 SEAC 提供的类型定义。请前往相关章节了解这些定义所关联的功能的内容。
