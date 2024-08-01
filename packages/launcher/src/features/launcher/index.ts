import { createLocalPropsSelector } from '@/shared';

import { launcher as launcherSlice } from './slice';

export const launcher = {
    reducer: launcherSlice.reducer,
    ...launcherSlice.actions,
    ...launcherSlice.selectors,
    useSelectProps: createLocalPropsSelector(launcherSlice)
};
