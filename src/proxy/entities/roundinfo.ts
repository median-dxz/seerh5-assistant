import Entity from './entity.js';

export default class RoundPetInfo extends Entity {
    __type = 'round_info';
    round;

    userId;
    skillId;
    petCatchtime;

    hp = {
        gain: 0,
        remain: 0,
        max: 0,
    };

    damage;
    isFirstMove;
    isCrit;
    priority;
    effectName;

    status;
    sideEffects;
    constructor(roundInfoLike) {
        super();
        if (roundInfoLike && typeof roundInfoLike == 'object') {
            [
                this.round,
                this.userId,
                this.skillId,
                this.petCatchtime,
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
                Math.max(roundInfoLike.maxHp, roundInfoLike.maxHpSelf),
                roundInfoLike.remainHP,
                roundInfoLike.isCrit,
                roundInfoLike.priority,
                roundInfoLike.effectName,
                roundInfoLike.status,
                roundInfoLike.sideEffects,
            ];
        }
    }
}
