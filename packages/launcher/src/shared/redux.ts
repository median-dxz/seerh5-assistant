import type { AppDispatch, AppRootState } from '@/store';
import {
    addListener,
    asyncThunkCreator,
    buildCreateSlice,
    createListenerMiddleware,
    type Selector,
    type Slice,
    type TypedAddListener
} from '@reduxjs/toolkit';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<AppRootState>();

export const createAppSlice = buildCreateSlice({
    creators: { asyncThunk: asyncThunkCreator }
});

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening.withTypes<AppRootState, AppDispatch>();

export const addAppListener: TypedAddListener<AppRootState, AppDispatch> = addListener.withTypes<
    AppRootState,
    AppDispatch
>();

export function pipeSelector<R1, R2>(a: Selector<AppRootState, R1>, b: Selector<R1, R2>): Selector<AppRootState, R2>;
export function pipeSelector<R1, R2, R3>(
    a: Selector<AppRootState, R1>,
    b: Selector<R1, R2>,
    c: Selector<R2, R3>
): Selector<AppRootState, R3>;
export function pipeSelector<R1, R2, R3, R4>(
    a: Selector<AppRootState, R1>,
    b: Selector<R1, R2>,
    c: Selector<R2, R3>,
    d: Selector<R3, R4>
): Selector<AppRootState, R4>;

export function pipeSelector(rootSelector: Selector<AppRootState>, ...selectors: Array<Selector<unknown>>) {
    return (state: unknown) =>
        [rootSelector as Selector<unknown>, ...selectors].reduce(
            (prevState, nextSelector) => nextSelector(prevState),
            state
        );
}

export type LocalSelector<SliceState> = <U extends keyof SliceState>(prop: U, ...props: U[]) => Pick<SliceState, U>;

export function createLocalPropsSelector<TSliceState>(slice: Slice<TSliceState>): LocalSelector<TSliceState> {
    return <U extends keyof TSliceState>(prop: U, ...props: U[]) =>
        useAppSelector(
            pipeSelector(
                (state) => slice.selectSlice(state as unknown as Record<string, TSliceState>),
                (state) => {
                    const result = {} as Pick<TSliceState, U>;
                    [prop, ...props].forEach((key) => {
                        result[key] = state[key];
                    });
                    return result;
                }
            ),
            shallowEqual
        );
}
