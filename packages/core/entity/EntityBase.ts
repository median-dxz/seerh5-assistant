export type EntityType = 'Item' | 'PetElement' | 'PetRoundInfo' | 'Skill' | 'Pet' | 'PetFragmentLevel';

export abstract class EntityBase {
    declare id: number;
    declare name: string;
    abstract readonly __type: EntityType;
}
