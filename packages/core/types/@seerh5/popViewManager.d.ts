declare global {
    class PopViewManager {
        openView(t: PopView): void;
        hideView(id: PopView | number): void;
        __viewMap__: seerh5.Dict<PopView>;
    }

    class PopView extends eui.Component {}
}

export { };

