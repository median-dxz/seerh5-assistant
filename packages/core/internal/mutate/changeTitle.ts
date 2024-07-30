import { sendByQueue } from '../socket.js';

/**
 * 切换称号
 *
 * @param title 称号ID
 */
export const changeTitle = async (title: number) => {
    if (MainManager.actorInfo.curTitle !== title) {
        try {
            await sendByQueue(CommandID.SETTITLE, [title]);
            MainManager.actorInfo.curTitle = title;
            return true;
        } catch (err) {
            return false;
        }
    }
    return false;
};
