import { usePersistentConfig } from '@/services/usePersistentConfig';

const defaultData: number[][] = Array<number[]>(7).fill((() => [] as number[])());

export function usePetGroups() {
    const { data: petGroups, isLoading, mutate } = usePersistentConfig('PetGroups', defaultData);
    return {
        petGroups,
        isLoading,
        mutate
    };
}
