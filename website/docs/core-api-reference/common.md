---
sidebar_position: 2
---

# Common 模块

你会用到的！

## hook 相关

目前 SEAC 内置了两种相对安全的 hook 方式：`wrapper` 和 `hookFn` 。

### hookFn

```ts
function hookFn<T extends object, K extends keyof T>(target: T, funcName: K, override: HookFunction<T, K>): void;

type HookFunction<T extends object, K extends keyof T> = T[K] extends (...args: infer P) => infer R
  ? (this: T, originalFunc: (...args: P) => R, ...args: P) => R
  : never;
```

就地修改一个函数。

```ts
window.fn = function fn(arg: string) {
  return arg;
};

const obj = {
  fn: () => {
    console.log('obj.fn');
  },
};

// 必须指定一个挂载对象
hook(window, 'fn', (f, arg) => {
  // fully typed
  console.log(arg);
  return f(arg + '->hook');
});

hook(obj, 'fn', function () {
  console.log(obj === this); // <- this有类型推导！
});

fn('fn');
// 输出 'fn'
// 返回 'fn->hook'

obj.fn();
// 什么也没发生
```

替换挂载对象上的目标函数。是给游戏添加/移除/修改功能的终极手段。你需要指定挂载对象和函数名称，以便 `hookFn` 内部能记录足够的信息，这将允许你：

- 通过 `restoreHookedFn` 还原函数
- 通过 `assertIsWrappedFunction` 和 `assertIsHookedFunction` 断言 hook 类型
- 对非幂等的 `wrapper` 和 `hookFn` 进行特殊处理

你需要传入一个函数 `override` 来替换原函数，`override`的参数分两部分： `originalFunc` 是**绑定了挂载对象作为 this**的原函数，后面跟着的是原函数的入参，你可以选择使用它们或完全忽略。

一般来说，你只会将 hook 应用在游戏暴露出来的对象中，极端情况有下列若干种：

1. 目标函数是一个构造函数

这种情况下 `hookFn` 也能生效，但是写起来较为麻烦，而且你的 typescript 编译器就不乐意了，目前可以通过最新的实验性 api [experiment_hookConstructor](#experiment_hookconstructor) 解决。

2. 目标函数在顶级作用域

说明这个函数被挂载在 `globalThis` 或者说 `window` 上了，因为游戏中的模块是使用 IIFE 加载的。

1. 目标函数是一个 getter

包括下面的 `wrapper`，暂时不支持这种特殊情况，你可以选择直接修改这个 getter，或者提一个 **issue** 来讨论这种情况。

4. 目标函数已经被 hook 过

如果目标函数只用 `hookFn` 修改过，那么之前的所有更改都会被**丢弃**（SEAC 会在出现丢弃修改行为的时候发出警告），在你的`override` 中传入的，**是最初的原函数**。

另请务必参阅[hook 教程](./hook.md#互操作性)中对 `hookFn` 和 `wrapper` 两者**互操作性**的描述。

### hookPrototype

```ts
function hookPrototype<T extends HasPrototype, K extends keyof T['prototype']>(
  target: T,
  funcName: K,
  override: HookFunction<T['prototype'], K>
): void;
```

对`hookFn`的一个简单包装。

```ts
hookPrototype(a, 'fnName', hooked);
// 等价于
hookFn(a.prototype, 'fnName', hooked);
```

### wrapper

```ts
function wrapper<F extends AnyFunction>(func: F | HookedFunction<F> | WrappedFunction<F>): WrappedFunction<F>;

interface WrappedFunction<F extends AnyFunction> extends HookedFunction<F> {
  (...args: Parameters<F>): ReturnType<F>;
  after(this: WrappedFunction<F>, decorator: AfterDecorator<F>): WrappedFunction<F>;
  before(this: WrappedFunction<F>, decorator: BeforeDecorator<F>): WrappedFunction<F>;
}

type BeforeDecorator<F extends AnyFunction> = (...args: Parameters<F>) => void;
type AfterDecorator<F extends AnyFunction> = (
  result: ConvertVoid<InferPromiseResultType<ReturnType<F>>>,
  ...args: Parameters<F>
) => void;
```

~~写类型体操写的~~

`wrapper` 可以给目标函数添加 `before` 和 `after` 钩子，同时不影响原函数的行为，从而让你可以安全的拦截入参以及返回值。但是和 `hookFn` 不同的是，`wrapper` 没有修改原函数行为的能力，两个钩子不会对原函数的执行造成任何影响。

`wrapper` 的使用非常简单，你只需要传入目标函数，然后使用*链式语法*向钩子上添加装饰器，最后将修改完成的函数赋值给原函数即可。

例如：

```ts
function f(arg1: string) {
  console.log('fn call');
  return '2';
}

f = wrapper(f)
  .before((arg1) => {
    console.log(arg1); // <- arg1会被推导为string
  })
  .after((result, arg1) => {
    console.log(result); // <- result也会推导出来
  });

f('1');
// 输出:
// '1'
// 'fn call'
// '2'
```

在 `before` 装饰器 和 `after` 装饰器内都可以获得原函数的调用参数，`after` 装饰器内可以额外获得原函数的返回值。

在使用 `wrapper` 的时候，有一些需要注意的地方。

- 幂等性与不可变性

如果你传入了一个已经被 `hookFn` 或 `wrapper` 修改过的函数，那么 `wrapper` 会在**修改后的基础**上进行包装。另外， `wrapper` 、 `after` 和 `before`调用后保证返回一个全新的函数。换而言之，这三个操作都是纯函数操作。因此你可以放心的使用 `wrapper` 包装函数并添加装饰器。

另请务必参阅[hook 教程](./hook.md#互操作性)中对两者**互操作性**的描述。

- `this` 的处理

你可以给 `before` 或 `after` 钩子传入一个纯正的 `function` 而不是匿名函数，这样 `this` 指针就可以被正确的绑定（与原函数的 `this` 为同一指向），不过请注意你需要手动声明 `this` 的类型。

```ts
const object = {
  f() {
    console.log(this === object);
  },
};

object.f = wrapper(object.f).after(function (this: typeof object) {
  console.log(this === object);
});

object.f();
// 输出:
// true
// true
```

- 返回 `void` 的函数

对于 `after` 钩子，返回类型如果是 `void` 会自动转为 `undefined` 。

- 返回 `Promise` 的函数

对于 `after` 钩子，如果原函数的返回是一个 `Promise`，那么所有的 `after` 装饰器会得到原函数 `fulfilled` 后再执行。也就是说，你的装饰器里面拿到的是 `Promise` 内的结果， `wrapper` 在内部帮你 `await` 了这个 `Promise`。

- 调用顺序

装饰器会分别按照在 `after` 和 `before` 上被添加的顺序执行，但是之间不会有异步等待关系，事实上你不应该依赖这个行为，不同的装饰器之间是应该是独立的。

### restoreHookedFn

```ts
function restoreHookedFn<T extends object, K extends keyof T>(target: T, funcName: K): void;
```

还原被修改的函数到最初的样子，这一节列出的所有 hook 方式都可以还原。调用形式和`hookFn`一致。

```ts
restoreHookedFn(object, 'f'); // 还原上面的object
object.f();
// 输出 true
```

### experiment_hookConstructor

```ts
function experiment_hookConstructor<TClass extends Constructor<any>>(
  classType: TClass,
  className: string,
  override: (ins: InstanceType<TClass>, ...args: ConstructorParameters<TClass>) => void
): void;
```

修改一个构造函数。比较特殊的是，你只能操作已经创建好的实例。

:::info
**experiment**: 这是一个实验性 API
:::

### assertIsHookedFunction

```ts
function assertIsHookedFunction<F extends AnyFunction>(func: F | HookedFunction<F>): func is HookedFunction<F>;
```

断言 `func` 是否被 SEAC 的 hook 函数修改过。

### assertIsWrappedFunction

```ts
function assertIsWrappedFunction<F extends AnyFunction>(func: F | WrappedFunction<F>): func is WrappedFunction<F>;
```

断言 `func` 是否是一个 wrapped 的函数，注意一个 wrapped 函数一定是 hooked，反之不一定。

这里的 hooked 指该函数被 SEAC 的 hook 函数修改过，而 wrapped 特指该函数是使用 `wrapper` 修改的。在[Hook 教程](./hook.md)中这两个词和*WrappedFunction*、*HookedFunction*指代相同。

## 延时相关

:::tip
不仅是为了节约计算资源，减少可能的竟态影响；同时也是为了降低账号风控，减少被断线的可能，请不要高频发包。

下面的三个函数可以帮你轻松做到这一点。
:::

### delay

```ts
function delay(time: number): Promise<void>;
```

延时函数，`setTimeout`的`promisify`版本。

### debounce

```ts
function debounce<F extends AnyFunction>(func: F, time: number): F;
```

去抖函数，参见[debounceTime](https://rxjs.dev/api/index/function/debounceTime)了解去抖的含义。

### throttle

```ts
function throttle<F extends AnyFunction>(func: F, time: number): F;
```

节流函数，参见[throttleTime](https://rxjs.dev/api/index/function/throttleTime)了解节流的含义。

## 常量

### NOOP

```ts
const NOOP: () => void;
```

空函数，减少创建空匿名函数的资源浪费，同时提供更好的语义。

## 实用类型

### AnyFunction

```ts
type AnyFunction = (...args: any[]) => unknown;
```

表示任意函数。

### Constructor

```ts
type Constructor<T> = { new (...args: any[]): T };
```

表示任意构造函数，或者实例的**类类型**，和 InstanceType 相反。

### ValueOf

```ts
type ValueOf<T> = T[keyof T];
```

一般用于 TypeMap，可以看作类型上的`Map.prototype.values()`。

### WithClass

```ts
type WithClass<T> = T & { __class__: string };
```

一般用于断言`egret`上的实例对象，获取其作为元数据的`__class__`属性。
