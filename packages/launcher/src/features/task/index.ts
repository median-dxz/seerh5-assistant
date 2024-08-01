import { createAppSlice } from '@/shared';

export const task = createAppSlice({
    name: 'task',
    initialState: {
        taskCount: 0
    },
    reducers: {
        addTask: (state) => {
            state.taskCount++;
        },
        removeTask: (state) => {
            state.taskCount--;
        }
    }
});
