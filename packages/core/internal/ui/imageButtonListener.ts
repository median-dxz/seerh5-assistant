/**
 * 获取图形按钮上挂载的监听器
 *
 * @returns 注册的监听器函数
 */
export function imageButtonListener(button: eui.UIComponent) {
    return ImageButtonUtil.imgs[`k_${button.hashCode}`];
}
