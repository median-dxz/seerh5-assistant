import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { AnyFunction } from '../common/utils';
import { HookedSymbol, assertIsHookedFunction, assertIsWrappedFunction, type HookedFunction } from '../common/utils';
import { hookFn, wrapper } from '../index';

const createFn = () => () => {};

describe('wrapper', () => {
    test('不是函数的入参', () => {
        const result = wrapper(undefined as any);
        expect(result).toBeUndefined();
    });

    test('测试不可变性', () => {
        const originalFunc = () => 1;

        const wrapped1 = wrapper(originalFunc);
        const wrapped2 = wrapped1.after(createFn());
        const wrapped3 = wrapped2.before(createFn());

        expect(assertIsWrappedFunction(wrapped3)).toBe(true);

        expect(wrapped1[HookedSymbol.kOriginal]).toBe(originalFunc);
        expect(wrapped2[HookedSymbol.kOriginal]).toBe(originalFunc);
        expect(wrapped3[HookedSymbol.kOriginal]).toBe(originalFunc);

        expect(wrapped1).not.toEqual(wrapped2);
        expect(wrapped2).not.toEqual(wrapped3);
        expect(wrapped3[HookedSymbol.kAfter]).toEqual(wrapped2[HookedSymbol.kAfter]);
    });

    test('测试 before 和 after 钩子', () => {
        const originalFunc = (...args: any[]) => 1;
        const beforeDecorator = vi.fn();
        const afterDecorator = vi.fn();
        const wrappedFunc = wrapper(originalFunc).before(beforeDecorator).after(afterDecorator);

        expect(wrappedFunc[HookedSymbol.kOriginal]).toBe(originalFunc);
        expect(wrappedFunc[HookedSymbol.kBefore]).toEqual([beforeDecorator]);
        expect(wrappedFunc[HookedSymbol.kAfter]).toEqual([afterDecorator]);

        const args = [1, 2, 3];
        const returnValue = wrappedFunc(...args);

        expect(beforeDecorator).toHaveBeenCalledWith(...args);
        expect(afterDecorator).toHaveBeenCalledWith(returnValue, ...args);
    });

    test('wrap 一个 HookedFunction', () => {
        const f = createFn();
        const hookedFunc1 = createFn() as HookedFunction<() => void>;
        const hookedFunc2 = createFn() as HookedFunction<() => void>;
        hookedFunc1[HookedSymbol.kOriginal] = f;
        hookedFunc2[HookedSymbol.kOriginal] = hookedFunc1;

        const result1 = wrapper(hookedFunc1);
        expect(result1[HookedSymbol.kOriginal]).toBe(hookedFunc1); // original 指向 HookedFunction

        const result2 = wrapper(hookedFunc2);
        expect(result2[HookedSymbol.kOriginal]).toBe(hookedFunc2); // original 指向 HookedFunction

        expect(result2[HookedSymbol.kOriginal][HookedSymbol.kOriginal]).toBe(hookedFunc1);
    });

    test('wrap 一个 WrappedFunction', () => {
        const f = createFn();
        const before = [createFn(), () => 1];
        const after = [createFn(), () => 2];
        const wrapped = wrapper(f).after(after[0]).before(before[0]);
        const rewrapped = wrapper(wrapped).after(after[1]).before(before[1]);

        expect(rewrapped[HookedSymbol.kOriginal]).toBe(f); // original 指向 originalFunction
        expect(rewrapped[HookedSymbol.kBefore]).toEqual(before);
        expect(rewrapped[HookedSymbol.kAfter]).toEqual(after);
    });

    test('测试对异步返回值的处理', async () => {
        const originalFunc = async (...args: number[]) => 'result';
        const afterDecorator1 = vi.fn();
        const afterDecorator2 = vi.fn();
        const wrappedFunc = wrapper(originalFunc).after(afterDecorator1).after(afterDecorator2);

        expect(wrappedFunc[HookedSymbol.kAfter]).toEqual([afterDecorator1, afterDecorator2]);

        const args = [1, 2, 3];
        const returnValue = wrappedFunc(...args);

        expect(afterDecorator1).not.toHaveBeenCalled();
        expect(afterDecorator2).not.toHaveBeenCalled();

        await returnValue;

        expect(afterDecorator1).toHaveBeenCalledWith('result', ...args);
        expect(afterDecorator2).toHaveBeenCalledWith('result', ...args);
    });
});

describe('hookFn', () => {
    test('不是函数的入参', () => {
        const result = wrapper(undefined as any);
        expect(result).toBeUndefined();
    });

    interface LocalTestContext {
        target: {
            func: AnyFunction;
        };
    }

    beforeEach<LocalTestContext>(async (context) => {
        context.target = {
            func: vi.fn(function (...args: unknown[]) {
                return this;
            })
        };
    });

    test<LocalTestContext>('测试HookedFunction', ({ target }) => {
        const override = vi.fn(function (f, ...args: any[]) {
            return { this: this, args, thisBind: this === f() };
        });
        const originalFunc = target.func;

        hookFn(target, 'func', override);

        expect(target.func).not.toBe(originalFunc);
        expect(target.func[HookedSymbol.kOriginal]).toBe(originalFunc);

        const args = [1, 2, 3];
        const r = target.func(...args);

        expect(override).toHaveBeenCalled();

        expect(r).toEqual({
            this: target,
            args: [1, 2, 3],
            thisBind: true
        });
        expect(assertIsHookedFunction(target.func)).toBe(true);
    });

    test<LocalTestContext>('hook 一个 HookedFunction', ({ target }) => {
        const originalFunc = target.func;
        const override1 = vi.fn();
        const override2 = vi.fn((f) => f());
        hookFn(target, 'func', override1);
        hookFn(target, 'func', override2);
        const r = target.func();

        expect(override1).not.toHaveBeenCalled();
        expect(override2).toHaveBeenCalled();
        expect(target.func[HookedSymbol.kOriginal]).toBe(originalFunc); // original 指向 originalFunction
        expect(r).toBe(target); // this === target
    });

    test<LocalTestContext>('hook 一个 WrappedFunction', ({ target }) => {
        const originalFunc = target.func;
        const override = vi.fn();
        const decorator = vi.fn();
        target.func = wrapper(target.func).before(decorator).after(decorator);
        hookFn(target, 'func', override);
        target.func();

        expect(override).toHaveBeenCalled();
        expect(decorator).not.toHaveBeenCalled();

        // 验证是否了清空之前的修改
        expect(target.func[HookedSymbol.kOriginal]).toBe(originalFunc);
        expect(target.func[HookedSymbol.kBefore]).toBeUndefined();
        expect(target.func[HookedSymbol.kAfter]).toBeUndefined();
        expect(assertIsWrappedFunction(target.func)).toBe(false);
    });

    test<LocalTestContext>('hook 一个 wrap 了 HookedFunction 的 WrappedFunction', ({ target }) => {
        const originalFunc = target.func;
        const override1 = vi.fn();
        const override2 = vi.fn();
        const decorator = vi.fn();
        hookFn(target, 'func', override1);
        target.func = wrapper(target.func).before(decorator).after(decorator);
        hookFn(target, 'func', override2);
        target.func();

        expect(override2).toHaveBeenCalled();
        expect(override1).not.toHaveBeenCalled();
        expect(decorator).not.toHaveBeenCalled();

        // 验证是否了清空之前的修改
        expect(target.func[HookedSymbol.kOriginal]).toBe(originalFunc);
        expect(target.func[HookedSymbol.kBefore]).toBeUndefined();
        expect(target.func[HookedSymbol.kAfter]).toBeUndefined();
        expect(assertIsWrappedFunction(target.func)).toBe(false);
    });
});
