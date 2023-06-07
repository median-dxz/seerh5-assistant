export function useObjectProducer<T extends object>(state: T, reducer: (draft: T) => void) {
    return (oldState: T = state) => {
        const newState = { ...oldState };
        reducer(newState);
        return newState;
    };
}
