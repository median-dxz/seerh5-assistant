import { createContext } from 'react';
import type { PanelColumn } from './types';

export const ColumnContext = createContext<PanelColumn[]>([]);
