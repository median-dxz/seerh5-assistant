import { describe, expect, test, vi } from 'vitest';

import { HookedSymbol, type HookedFunction } from '../dist/common/utils';
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
        const hookedFunc = createFn() as HookedFunction<() => void>;
        hookedFunc[HookedSymbol.original] = f;
        const result = wrapper(hookedFunc);
        expect(result[HookedSymbol.original]).toBe(hookedFunc);
    });

    test('wrap 一个 WrappedFunction', () => {
        const f = createFn();
        const before = [createFn(), () => 1];
        const after = [createFn(), () => 2];
        const wrapped = wrapper(f).after(after[0]).before(before[0]);
        const rewrapped = wrapper(wrapped).after(after[1]).before(before[1]);

        expect(rewrapped[HookedSymbol.original]).toBe(f);
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

    test('wrapFn', () => {
        const target = {
            funcName: createFn(),
        };

        const override = vi.fn();
        const originalFunc = target.funcName;

        hookFn(target, 'funcName', override);

        expect(target.funcName).not.toBe(originalFunc);
        expect(target.funcName[HookedSymbol.original]).toBe(originalFunc);

        const args = [1, 2, 3];
        target.funcName(...args);

        expect(override).toHaveBeenCalledWith(originalFunc.bind(target), ...args);
    });
});
