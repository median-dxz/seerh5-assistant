import { createLocalPropsSelector, useAppSelector } from '@/shared/redux';
import { mod as modSlice } from './slice';

export const mod = {
    reducer: modSlice.reducer,
    ...modSlice.actions,
    ...modSlice.selectors,
    useDeployments: () => useAppSelector((state) => modSlice.selectors.deployments(state), shallowEqual),
    useSelectProps: createLocalPropsSelector(modSlice)
};

export type { ModFactory, ModInstance } from './handler';
export { isDeployed, type DeploymentState } from './slice';
export type { BattleInstance, StrategyInstance, TaskInstance } from './store';

import { shallowEqual } from 'react-redux';
import {
    getBattle,
    getCommand,
    getModIns,
    getStrategy,
    getTask,
    mapModExportsIns,
    useBattleStore,
    useCommandStore,
    useMapModExportsIns,
    useModInsStore,
    useStrategyStore,
    useTaskStore
} from './store';
export const ModStore = {
    getBattle,
    getCommand,
    getModIns,
    getStrategy,
    getTask,
    mapModExportsIns,
    useMapModExportsIns,
    useBattleStore,
    useCommandStore,
    useModInsStore,
    useStrategyStore,
    useTaskStore
};

export * from './utils';
