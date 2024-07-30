import { createContext, useContext } from 'react';

export const RowDataContext = createContext<unknown>(undefined);
export const RowIndexContext = createContext<number>(-1);

export const useRowData = <TData>() => useContext(RowDataContext) as TData;
export const useIndex = () => useContext(RowIndexContext);
