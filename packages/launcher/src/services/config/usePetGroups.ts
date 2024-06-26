import { usePersistentConfig } from '@/utils/usePersistentConfig';

const defaultData: number[][] = Array(7).fill((() => [])());

export function usePetGroups() {
    const { data: petGroups, isLoading, mutate } = usePersistentConfig('PetGroups', defaultData);
    return {
        petGroups,
        isLoading,
        mutate
    };
}
