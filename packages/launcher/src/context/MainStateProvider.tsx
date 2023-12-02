import React, { useState, type PropsWithChildren } from 'react';
import { MainState } from './useMainState';

export function MainStateProvider({ children }: PropsWithChildren<object>) {
    const [open, setOpen] = useState(false);
    return <MainState.Provider value={{ open, setOpen }}>{children}</MainState.Provider>;
}
