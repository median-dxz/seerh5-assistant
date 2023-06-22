import dayjs from 'dayjs';
import { Socket } from 'sa-core/engine';

interface Config {
    signCookie: string;
    userId: string;
}

class YearsAnniversary14 implements SAMod.ISignMod<Config> {
    declare logger: typeof console.log;

    meta: SAMod.MetaData = {
        id: '14YearsAnniversary',
        author: 'median',
        type: 'sign',
        description: '14周年庆签到',
    };

    config?: Config;

    subDaysWY = dayjs().diff(dayjs('2023-06-01'), 'd');
    subDaysWXC = dayjs().diff(dayjs('2023-06-08'), 'd');

    export: Record<string, SAMod.SignModExport> = {
        主题站签到: {
            check: () => Promise.resolve(this.config ? 1 : 0),

            run: async () => {
                const param = new URLSearchParams({
                    PHPSESSID: this.config.signCookie,
                    cookie_login_uid: this.config.userId,
                });
                const rText = await fetch(`/api/14year/?${param.toString()}`);

                this.logger('签到结果: ', await rText.json());
            },
        },

        领取卫岳因子: {
            check: async () => {
                let times: number;
                const signBits = await Socket.multiValue(121581, 121582);
                if (this.subDaysWY >= 32) {
                    times = signBits[1] & (1 << (this.subDaysWY - 32));
                } else {
                    times = signBits[0] & (1 << (this.subDaysWY - 1));
                }
                return Number(!times);
            },
            run: () => {
                Socket.sendByQueue(41388, [64, this.subDaysWY]);
            },
        },

        领取武心婵因子: {
            check: async () => {
                let times: number;
                const signBits = await Socket.multiValue(121583);

                if (this.subDaysWXC >= 32) {
                    times = signBits[1] & (1 << (this.subDaysWXC - 32));
                } else {
                    times = signBits[0] & (1 << (this.subDaysWXC - 1));
                }
                return Number(!times);
            },
            run: () => {
                Socket.sendByQueue(41388, [65, this.subDaysWXC]);
            },
        },
    };
}

export default YearsAnniversary14;
