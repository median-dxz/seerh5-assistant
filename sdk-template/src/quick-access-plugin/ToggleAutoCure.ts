import { ReactComponent as SvgIcon } from './test.svg';

export default class FightPuni implements SAMod.IQuickAccessPlugin {
    icon: SvgComponent;
    click(): void {
        throw new Error('Method not implemented.');
    }
    show?(): string {
        throw new Error('Method not implemented.');
    }
    showAsync?(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    meta: SAMod.MetaData;
    logger: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void };
}
