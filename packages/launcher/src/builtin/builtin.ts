import { MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import { NOOP, delay, strategy as sg } from '@sea/core';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';
import { task } from '@sea/mod-type';

export const metadata = {
    id: 'Builtin',
    scope: MOD_SCOPE_BUILTIN,
    version: VERSION
} satisfies SEAModMetadata;

export default function ({ battle }: SEAModContext<typeof metadata>) {
    return {
        strategies: [
            {
                name: 'auto',
                resolveMove: sg.auto.move(),
                resolveNoBlood: sg.auto.noBlood()
            }
        ],
        tasks: [
            task({
                metadata: { id: 'Test', name: '测试' },
                runner() {
                    return {
                        data: { maxTimes: 1, progress: 0, remainingTimes: 0, customField: 'string' },
                        selectLevelBattle() {
                            return battle('');
                        },
                        async update() {
                            await Promise.resolve();
                            this.data.progress += 33;
                        },
                        logger: NOOP,
                        next() {
                            if (this.data.progress >= 99) {
                                return 'stop';
                            }
                            return 'run';
                        },
                        actions: {
                            async run() {
                                await delay(3000);
                            }
                        }
                    };
                }
            }),
            task({
                metadata: { id: 'TestError', name: '测试错误' },
                runner() {
                    return {
                        data: { maxTimes: 1, progress: 0, remainingTimes: 0, customField: 'string' },
                        selectLevelBattle() {
                            return battle('');
                        },
                        async update() {
                            if (this.data.progress >= 66) {
                                await Promise.reject(new Error('oops update'));
                            }
                            this.data.progress += 33;
                        },
                        logger: NOOP,
                        next() {
                            if (this.data.progress >= 99) {
                                return 'stop';
                            }
                            return 'run';
                        },
                        actions: {
                            async run() {
                                if (this.data.progress > 33) {
                                    await Promise.reject(new Error('oops run'));
                                }
                                await delay(3000);
                            }
                        }
                    };
                }
            })
        ]
    } satisfies SEAModExport;
}
