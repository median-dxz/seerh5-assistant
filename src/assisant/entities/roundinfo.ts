import Entity from './entity';

export default class RoundPetInfo extends Entity {
    __type = 'round_info';
    round: number;

    userId: number;
    skillId: number;
    catchtime: number;

    hp = {
        gain: 0,
        remain: 0,
        max: 0,
    };

    damage: number;
    isFirstMove: boolean;
    isCrit: boolean;
    priority: number;
    effectName: string;

    status: number[];
    sideEffects: number[];
    constructor(roundInfoLike: UseSkillInfo) {
        super();
        if (roundInfoLike) {
            [
                this.round,
                this.userId,
                this.skillId,
                this.catchtime,
                this.hp.gain,
                this.damage,
                this.hp.max,
                this.hp.remain,
                this.isCrit,
                this.priority,
                this.effectName,
                this.status,
                this.sideEffects,
            ] = [
                roundInfoLike.round,
                roundInfoLike.userID,
                roundInfoLike.skillID,
                roundInfoLike.petcatchtime,
                roundInfoLike.gainHP,
                roundInfoLike.lostHP,
                roundInfoLike.maxHp,
                roundInfoLike.remainHP,
                Boolean(roundInfoLike.isCrit),
                roundInfoLike.priority,
                roundInfoLike.effectName,
                roundInfoLike.status,
                roundInfoLike.sideEffects,
            ];
        }
    }
}
