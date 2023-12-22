import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
    AnyFunction,
    HookedSymbol,
    assertIsHookedFunction,
    assertIsWrappedFunction,
    type HookedFunction,
} from '../dist/common/utils';
import { hookFn, wrapper } from '../dist/index';

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

        expect(wrapped1[HookedSymbol.original]).toBe(originalFunc);
        expect(wrapped2[HookedSymbol.original]).toBe(originalFunc);
        expect(wrapped3[HookedSymbol.original]).toBe(originalFunc);

        expect(wrapped1).not.toEqual(wrapped2);
        expect(wrapped2).not.toEqual(wrapped3);
        expect(wrapped3[HookedSymbol.after]).toEqual(wrapped2[HookedSymbol.after]);
    });

    test('测试 before 和 after 钩子', () => {
        const originalFunc = (...args: any[]) => 1;
        const beforeDecorator = vi.fn();
        const afterDecorator = vi.fn();
        const wrappedFunc = wrapper(originalFunc).before(beforeDecorator).after(afterDecorator);

        expect(wrappedFunc[HookedSymbol.original]).toBe(originalFunc);
        expect(wrappedFunc[HookedSymbol.before]).toEqual([beforeDecorator]);
        expect(wrappedFunc[HookedSymbol.after]).toEqual([afterDecorator]);

        const args = [1, 2, 3];
        const returnValue = wrappedFunc(...args);

        expect(beforeDecorator).toHaveBeenCalledWith(...args);
        expect(afterDecorator).toHaveBeenCalledWith(returnValue, ...args);
    });

    test('wrap 一个 HookedFunction', () => {
        const f = createFn();
        const hookedFunc1 = createFn() as HookedFunction<() => void>;
        const hookedFunc2 = createFn() as HookedFunction<() => void>;
        hookedFunc1[HookedSymbol.original] = f;
        hookedFunc2[HookedSymbol.original] = hookedFunc1;

        const result1 = wrapper(hookedFunc1);
        expect(result1[HookedSymbol.original]).toBe(hookedFunc1); // original 指向 HookedFunction

        const result2 = wrapper(hookedFunc2);
        expect(result2[HookedSymbol.original]).toBe(hookedFunc2); // original 指向 HookedFunction

        expect(result2[HookedSymbol.original][HookedSymbol.original]).toBe(hookedFunc1);
    });

    test('wrap 一个 WrappedFunction', () => {
        const f = createFn();
        const before = [createFn(), () => 1];
        const after = [createFn(), () => 2];
        const wrapped = wrapper(f).after(after[0]).before(before[0]);
        const rewrapped = wrapper(wrapped).after(after[1]).before(before[1]);

        expect(rewrapped[HookedSymbol.original]).toBe(f); // original 指向 originalFunction
        expect(rewrapped[HookedSymbol.before]).toEqual(before);
        expect(rewrapped[HookedSymbol.after]).toEqual(after);
    });

    test('测试对异步返回值的处理', async () => {
        const originalFunc = async (...args: number[]) => {
            return 'result';
        };
        const afterDecorator1 = vi.fn();
        const afterDecorator2 = vi.fn();
        const wrappedFunc = wrapper(originalFunc).after(afterDecorator1).after(afterDecorator2);

        expect(wrappedFunc[HookedSymbol.after]).toEqual([afterDecorator1, afterDecorator2]);

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
            }),
        };
    });

    test<LocalTestContext>('测试HookedFunction', ({ target }) => {
        const override = vi.fn(function (f, ...args: any[]) {
            return { this: this, args, thisBind: this === f() };
        });
        const originalFunc = target.func;

        hookFn(target, 'func', override);

        expect(target.func).not.toBe(originalFunc);
        expect(target.func[HookedSymbol.original]).toBe(originalFunc);

        const args = [1, 2, 3];
        const r = target.func(...args);

        expect(override).toHaveBeenCalled();

        expect(r).toEqual({
            this: target,
            args: [1, 2, 3],
            thisBind: true,
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
        expect(target.func[HookedSymbol.original]).toBe(originalFunc); // original 指向 originalFunction
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
        expect(target.func[HookedSymbol.original]).toBe(originalFunc);
        expect(target.func[HookedSymbol.before]).toBeUndefined();
        expect(target.func[HookedSymbol.after]).toBeUndefined();
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
        expect(target.func[HookedSymbol.original]).toBe(originalFunc);
        expect(target.func[HookedSymbol.before]).toBeUndefined();
        expect(target.func[HookedSymbol.after]).toBeUndefined();
        expect(assertIsWrappedFunction(target.func)).toBe(false);
    });
});
