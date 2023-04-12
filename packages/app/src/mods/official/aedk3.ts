import {
    Mod,
    PetPosition,
    SABattle,
    SAEngine,
    SAPetHelper,
    SaModuleLogger,
    defaultStyle,
    delay,
    lowerBlood,
    switchBag,
} from 'seerh5-assistant-core';

const log = SaModuleLogger('阿尔蒂克第三关', defaultStyle.mod);

interface LevelConfig {
    update(): Promise<void>;
    领取奖励(): Promise<void>;
    抽取一次(): Promise<void>;
    抽取次数: number;
    当前位置: number;
    击败情况: boolean[];
    神秘晶石: number;
    战斗晶石: number;
    位置参数: number;
}

const pets = [
    { name: '潘克多斯', catchTime: 1656383521 },
    { name: '魔钰', catchTime: 1655445699 },
    { name: '蒂朵', catchTime: 1656056275 },
];

const moveModule: SABattle.MoveModule = SABattle.generateStrategy(
    ['鬼焰·焚身术', '梦境残缺', '幻梦芳逝'],
    ['潘克多斯', '蒂朵', '魔钰']
);

const posAttr = [15, 1, 2, 16, 3, 4, 15, 5, 6, 7, 8, 15, 9, 16, 10, 15, 11, 12, 13, 14];

const ct = pets.map((p) => p.catchTime);

class 阿尔蒂克第三关 extends Mod {
    config: LevelConfig;
    async init() {
        // 获取关卡信息
        this.config = {
            抽取次数: 0,
            当前位置: 0,
            击败情况: [],
            神秘晶石: 0,
            战斗晶石: 0,
            位置参数: 0,
            async update() {
                const value = await SAEngine.Socket.multiValue(4858, 4859, 16595, 16598, 16599);
                this.神秘晶石 = value[0];
                this.战斗晶石 = value[1];
                this.抽取次数 = 20 - value[2];
                let temp = value[3]; //全部击败情况
                const levelState = [];
                for (let i = 1; i <= 20; i++) {
                    levelState.push(temp & 1);
                    temp = temp >> 1;
                }
                this.击败情况 = levelState.map(Boolean);
                this.当前位置 = value[4]; // 1-BASE
                this.位置参数 = posAttr[this.当前位置 - 1];
            },
            async 领取奖励() {
                await SAEngine.Socket.sendByQueue(46328, [7, 1]);
                return this.update();
            },
            async 抽取一次() {
                await SAEngine.Socket.sendByQueue(46328, [5, 0]);
                return this.update();
            },
        };
    }
    async runAll() {
        // 银翼 音浪 潘朵魔钰 压血 关自动回血
        SAEngine.changeSuit(365);
        SAEngine.changeTitle(418);
        SAPetHelper.toggleAutoCure(false);
        await switchBag(ct);
        // 自动战斗
        await this.config.update();
        log(`更新信息`);
        while (
            (this.config.战斗晶石 < 100 || this.config.神秘晶石 < 100) &&
            (this.config.抽取次数 > 0 || this.config.击败情况[this.config.当前位置 - 1] === false)
        ) {
            log(`顶层通过情况: ${this.config.击败情况.filter((v, i) => i >= 18).toString()}`);
            if (this.config.击败情况.filter((v, i) => i >= 18).every(Boolean)) {
                await this.config.领取奖励();
                console.log('领取奖励');
                debugger;
            }

            log('成功进入关卡, 当前信息如下: ');
            log(this.config);
            log(
                `当前位置: ${this.config.当前位置}, 当前位置击败情况: ${this.config.击败情况[this.config.当前位置 - 1]}`
            );
            if (this.config.当前位置 === 0 || this.config.击败情况[this.config.当前位置 - 1] === true) {
                await this.config.抽取一次();
                log('抽取一次, 信息更新完成');
            }
            log(
                `当前位置: ${this.config.当前位置}, 当前位置击败情况: ${
                    this.config.击败情况[this.config.当前位置 - 1]
                } 当前位置参数: ${this.config.位置参数}`
            );
            if (this.config.位置参数 < 15) {
                //检测战斗
                await lowerBlood(ct);
                log(
                    '压血完成, 当前精灵血线列表',
                    (await SAPetHelper.getBagPets(PetPosition.bag1)).map((p) => ({
                        name: p.name,
                        hp: p.hp,
                    }))
                );

                await SABattle.Manager.runOnce(async () => {
                    log(`开始战斗发包, 参数: ${9736 + this.config.位置参数 - 1}`);
                    FightManager.fightNoMapBoss(9736 + this.config.位置参数 - 1); //计算id
                }, moveModule);
                log(`战斗完成`);
            }

            await delay(1000);
            await this.config.update();
            log(`更新信息`);
        }
        log('今日结束');
        SABattle.Manager.clear();
    }
    meta = { id: 'aedk3', description: '' };
}

export default 阿尔蒂克第三关;
