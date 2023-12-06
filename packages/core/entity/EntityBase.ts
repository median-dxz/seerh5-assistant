export type EntityType = 'Item' | 'PetElement' | 'PetRoundInfo' | 'Skill' | 'Pet' | 'PetFragmentLevel';

export abstract class EntityBase {
    abstract id?: number;
    abstract name?: string;
    abstract __type: EntityType;

    static inferId<T extends { id: number }>(obj: T | number) {
        if (typeof obj === 'number') return obj;
        if ('id' in obj) return obj.id;
        return undefined as never;
    }
}
