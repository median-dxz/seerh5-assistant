import { describe, expect, test, vi } from 'vitest';

import { HookedSymbol } from '../common/utils';
import { wrapper } from '../index';

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
        const hookedFunc = createFn();
        hookedFunc[HookedSymbol.original] = f;
        const result = wrapper(hookedFunc);
        expect(result[HookedSymbol.original]).toBe(hookedFunc);
    });

    test('wrap 一个 WrappedFunction', () => {
        const f = () => {};
        const before = [createFn(), createFn()];
        const after = [createFn(), createFn()];
        const wrapped = wrapper(f).after(before[0]).before(after[0]);
        const rewrapped = wrapper(wrapped).after(before[1]).before(after[1]);

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
