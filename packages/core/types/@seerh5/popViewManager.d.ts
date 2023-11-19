declare class PopViewManager {
    openView(t: PopView): void;
    hideView(id: PopView | number): void;
    __viewMap__: seerh5.Dict<PopView>;
}

declare class PopView extends eui.Component {}
