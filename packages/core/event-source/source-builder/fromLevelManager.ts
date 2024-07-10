import { levelManager } from '../../battle/index.js';
import { SEAEventSource } from '../EventSource.js';

type LevelManagerEvents = 'update';

export function fromLevelManager(event: 'update'): SEAEventSource<string>;

export function fromLevelManager(event: LevelManagerEvents) {
    switch (event) {
        case 'update':
            return new SEAEventSource(levelManager.update$);
        default:
            throw new Error(`Invalid type ${event as string}, type could only be 'update'`);
    }
}
