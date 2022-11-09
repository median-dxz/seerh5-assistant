import { ReflectObjBase } from "@sa-core/mod-type";

class applyBm extends ReflectObjBase implements ModClass {
    constructor() {super();}
    init() {}
    meta = { description: '' };
}

export default {
    mod: applyBm,
};