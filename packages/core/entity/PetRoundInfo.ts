import { EntityBase, type EntityType } from './EntityBase.js';

export class PetRoundInfo extends EntityBase {
    id: undefined;
    name: undefined;
    readonly __type: EntityType = 'PetRoundInfo';
    
    round: number;
    userId: number;
    skillId: number;
    catchtime: number;

    hp: {
        gain: number;
        remain: number;
        max: number;
    };

    damage: number;
    isFirstMove: boolean;
    isCrit: boolean;
    priority: number;
    effectName: string;

    status: number[];
    sideEffects: number[];
    constructor(attackValue: AttackValue) {
        super();
        this.isFirstMove = false;
        [
            this.round,
            this.userId,
            this.skillId,
            this.catchtime,
            this.hp,
            this.damage,
            this.isCrit,
            this.priority,
            this.effectName,
            this.status,
            this.sideEffects,
        ] = [
            attackValue.round,
            attackValue.userID,
            attackValue.skillID,
            attackValue.petcatchtime,
            {
                gain: attackValue.gainHP,
                remain: attackValue.remainHP,
                max: attackValue.maxHp,
            },
            attackValue.lostHP,
            Boolean(attackValue.isCrit),
            attackValue.priority,
            attackValue.effectName,
            attackValue.status,
            attackValue.sideEffects,
        ];
    }
}
