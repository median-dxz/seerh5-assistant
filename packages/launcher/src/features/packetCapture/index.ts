import { createLocalPropsSelector } from '@/shared';

import { packetCapture as packetCaptureSlice } from './slice';

export const packetCapture = {
    reducer: packetCaptureSlice.reducer,
    ...packetCaptureSlice.actions,
    ...packetCaptureSlice.selectors,
    useSelectProps: createLocalPropsSelector(packetCaptureSlice)
};

export type { PacketCaptureState, PacketEvent } from './slice';
