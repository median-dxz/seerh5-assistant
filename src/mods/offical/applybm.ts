import { ReflectObjBase } from '../../assisant/modloader';

class applyBm extends ReflectObjBase implements ModClass {
    constructor() {super();}
    init() {}
    meta = { description: '' };
}

export default {
    mod: applyBm,
};
