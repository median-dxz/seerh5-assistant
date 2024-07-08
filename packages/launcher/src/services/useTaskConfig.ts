import { QueryKey } from '@/constants';
import useSWR from 'swr';
import { task } from './endpoints';

export function useTaskConfig() {
    const { data, error, isLoading } = useSWR([QueryKey.taskConfig, 'all'], () => task.all.query());

    return { data, error, isLoading } as {
        data: Awaited<ReturnType<typeof task.all.query>> | undefined;
        error: unknown;
        isLoading: boolean;
    };
}
