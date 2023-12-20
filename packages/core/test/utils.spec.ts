import { describe, expect, test } from 'vitest';
import { HookedSymbol, wrapper } from '../common/utils';

describe('wrapper', () => {
    test('不是函数的入参', () => {
        const result = wrapper(undefined as any);
        expect(result).toBeUndefined();
    });

    test('幂等性', () => {
        const f = () => {};
        const wrappedFunc = wrapper(f);
        const result = wrapper(wrappedFunc);
        expect(result).toBe(wrappedFunc);
    });

    test('wrapper should return the original function if it is a hooked function', () => {
        const f = () => {};
        const hookedFunc = {
            [HookedSymbol.original]: originalFunc,
        };
        const result = wrapper(hookedFunc);
        expect(result[HookedSymbol.original]).toBe(originalFunc);
    });

    test('wrapper should create a wrapped function with before and after decorators', () => {
        const originalFunc = () => {};
        const beforeDecorator = jest.fn();
        const afterDecorator = jest.fn();
        const wrappedFunc = wrapper(originalFunc).before(beforeDecorator).after(afterDecorator);

        expect(wrappedFunc).toBeInstanceOf(Function);
        expect(wrappedFunc[HookedSymbol.original]).toBe(originalFunc);
        expect(wrappedFunc[HookedSymbol.before]).toEqual([beforeDecorator]);
        expect(wrappedFunc[HookedSymbol.after]).toEqual([afterDecorator]);

        const args = [1, 2, 3];
        const returnValue = wrappedFunc(...args);

        expect(beforeDecorator).toHaveBeenCalledWith(...args);
        expect(afterDecorator).toHaveBeenCalledWith(returnValue, ...args);
    });

    test('wrapper should handle async functions correctly', async () => {
        const originalFunc = async () => {};
        const beforeDecorator = jest.fn();
        const afterDecorator = jest.fn();
        const wrappedFunc = wrapper(originalFunc).before(beforeDecorator).after(afterDecorator);

        expect(wrappedFunc).toBeInstanceOf(Function);
        expect(wrappedFunc[HookedSymbol.original]).toBe(originalFunc);
        expect(wrappedFunc[HookedSymbol.before]).toEqual([beforeDecorator]);
        expect(wrappedFunc[HookedSymbol.after]).toEqual([afterDecorator]);

        const args = [1, 2, 3];
        const returnValue = wrappedFunc(...args);

        expect(beforeDecorator).toHaveBeenCalledWith(...args);
        expect(afterDecorator).not.toHaveBeenCalled();

        await returnValue;

        expect(afterDecorator).toHaveBeenCalledWith(undefined, ...args);
    });
});
