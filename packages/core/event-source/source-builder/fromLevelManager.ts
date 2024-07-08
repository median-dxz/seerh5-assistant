import { levelManager } from '../../battle/index.js';
import { SEAEventSource } from '../EventSource.js';

type LevelManagerEvents = 'update' | 'nextAction' | 'log';

export function fromLevelManager(event: 'update'): SEAEventSource<void>;
export function fromLevelManager(event: 'nextAction' | 'log'): SEAEventSource<string>;

export function fromLevelManager(event: LevelManagerEvents) {
    switch (event) {
        case 'update':
            return new SEAEventSource(levelManager.update$);
        case 'nextAction':
            return new SEAEventSource(levelManager.nextAction$);
        case 'log':
            return new SEAEventSource(levelManager.log$);
        default:
            throw new Error(`Invalid type ${event as string}, type could only be 'update'`);
    }
}
