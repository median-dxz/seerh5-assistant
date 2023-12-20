---
sidebar_position: 2
---

# common 模块

## AnyFunction

```ts
type AnyFunction = (...args: any[]) => unknown;
```

实用工具类型，可以表示任意函数。

## Constructor

```ts
type Constructor<T> = { new (...args: any[]): T };
```

实用工具类型，表示任意构造函数，或者实例的**类类型**，和InstanceType相反。

## ValueOf

```ts
type ValueOf<T> = T[keyof T];
```

实用工具类型，一般用于TypeMap，可以看作类型上的`Map.prototype.values()`。

## withClass

```ts
type WithClass<T> = T & { __class__: string };
```

一般用于断言`egret`上的实例对象，获取其作为元数据的`__class__`属性。

