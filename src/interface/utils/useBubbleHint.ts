export const useBubbleHint = (msg: string) => {
    if (BubblerManager) {
        BubblerManager.getInstance().showText(msg);
    }
};
