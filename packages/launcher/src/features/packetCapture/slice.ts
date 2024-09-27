import { createAppSlice } from '@/shared';

export interface PacketEvent {
    type: 'RemoveListener' | 'AddListener' | 'Received' | 'Send';
    time: number;
    cmd: number;
    label: string;
    data?: object;
    buffer?: Array<number | Uint8Array> | Uint8Array;
    index: number;
}

export interface PacketCaptureState {
    packets: PacketEvent[];
    filteredCommandIds: number[];
    running: boolean;
}

const initialState: PacketCaptureState = {
    packets: [],
    filteredCommandIds: [
        1002, // SYSTEM_TIME
        2001, // ENTER_MAP
        2002, // LEAVE_MAP
        2004, // MAP_OGRE_LIST
        2441, // LOAD_PERCENT
        9019, // NONO_FOLLOW_OR_HOOM
        9274, // PET_GET_LEVEL_UP_EXP
        41228 // SYSTEM_TIME_CHECK
    ],
    running: false
};

let counter = 0;

export const packetCapture = createAppSlice({
    name: 'packetCapture',
    initialState,
    reducers: (create) => ({
        start: create.reducer((state) => {
            state.running = true;
        }),
        stop: create.reducer((state) => {
            state.running = false;
        }),
        clear: create.reducer((state) => {
            state.packets = [];
            counter = 0;
        }),
        onSocketEvent: create.preparedReducer(
            (packetEventData: Pick<PacketEvent, 'cmd' | 'data' | 'buffer' | 'type'>) => {
                const packetEvent: Partial<PacketEvent> = {
                    ...packetEventData,
                    time: Date.now(),
                    label: SocketEncryptImpl.getCmdLabel(packetEventData.cmd),
                    index: counter++
                };
                return { payload: packetEvent as PacketEvent };
            },
            (state, action) => {
                if (state.running && !state.filteredCommandIds.includes(action.payload.cmd)) {
                    state.packets.push(action.payload);
                }
            }
        )
    })
});
