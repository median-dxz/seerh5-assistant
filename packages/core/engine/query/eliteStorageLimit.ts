import * as Socket from '../socket.js';

/**
 * 获取精英收藏的上限
 */
export async function eliteStorageLimit() {
    return Socket.multiValue(121020).then((r) => {
        let i = r[0];
        i = 255 & i;
        i += 1;
        i = 30 >= i ? i : 30;
        // eslint-disable-next-line
        return parseFloat(config.Brave_lv.getItem(i).storehouse);
    });
}
