/**
 * 获取图形按钮上挂载的监听器
 *
 * @returns 注册的监听器函数
 */
export const imageButtonListener = (button: eui.UIComponent) => ImageButtonUtil.imgs[`k_${button.hashCode}`];
