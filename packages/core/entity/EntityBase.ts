export type EntityType = 'Item' | 'PetElement' | 'PetRoundInfo' | 'Skill' | 'Pet' | 'PetFragmentLevel';

export abstract class EntityBase {
    id: number;
    name: string;
    readonly __type: EntityType;
}
