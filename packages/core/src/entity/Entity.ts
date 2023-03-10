export type EntityType = 'Item' | 'PetElement' | 'PetRoundInfo' | 'Skill' | 'Pet' | 'PetFragmentLevel';

export abstract class Entity {
    id: number;
    name: string;
    readonly __type: EntityType;
}
