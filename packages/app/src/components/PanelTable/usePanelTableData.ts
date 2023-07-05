import React from 'react';

export const RowDataContext = React.createContext<unknown>(undefined);
export const RowIndexContext = React.createContext<number>(-1);

export const useRowData = <TData>() => React.useContext(RowDataContext) as TData;
export const useIndex = () => React.useContext(RowIndexContext);
