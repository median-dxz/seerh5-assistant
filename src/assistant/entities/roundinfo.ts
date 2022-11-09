import Entity from './entity';

export default class RoundPetInfo extends Entity {
    static __type = 'round_info';
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
    constructor(roundInfo: AttackValue) {
        super();
        if (roundInfo) {
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
                roundInfo.round,
                roundInfo.userID,
                roundInfo.skillID,
                roundInfo.petcatchtime,
                roundInfo.gainHP,
                roundInfo.lostHP,
                roundInfo.maxHp,
                roundInfo.remainHP,
                Boolean(roundInfo.isCrit),
                roundInfo.priority,
                roundInfo.effectName,
                roundInfo.status,
                roundInfo.sideEffects,
            ];
        }
    }
}
