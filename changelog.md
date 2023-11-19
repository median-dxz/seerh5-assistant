// 以下信息仅在 >= 1.0版本内显示，后续1.0版本发布后（应为第一个可用的稳定版）将删除并重新开始记录changelog
// 为什么要删掉？一个是因为乱；一个是后面肯定会用上更好的changelog管理工具而不是手动编辑；最重要的一点：changelog一般是供开发者了解功能变更，从而帮助版本的迁移。但是前面这会根本没有人用，自然不用关心这些问题...

RoadMap: **见Readme**

**注意，正在进行0.5.0版本的重构和功能添加，暂时不具备可用性**

**todo已经迁移至issue/project**

- [ ] 项目更名为SEA(Seerh5 Assistant Project), 启动器部分名称更改为SEAL(Seerh5 Assistant Launcher)

# Core 当前版本 v0.6.0

- [ ] 整合官方的一个module显示log
  - [ ] 屏蔽官方实现
  - [ ] 更新hook位置
- [ ] 统一监听器接口, SEAEventTarget作为基类, Socket和GameModule去继承, 最后暴露EventBus统合
  - [ ] Socket的res监听fallback到SocketConnection
  - [ ] GameModule支持类型Map推导
- [ ] 移出注册事件时的无关逻辑到`event-bus`的`internal`
- [ ] SAType从DTS中移动到`core`下
- [ ] 属性攻击/特攻/物攻的枚举
- [ ] 涉及缩写sa的字符串部分用常量代替（缩写未来将要更改为sea）
- [ ] 通过declare module和内建命名空间支持等方式，使得sa-core支持扩展，类似d3和jq的插件
  - [ ] 添加hook的扩展点
- [ ] 将type作为打包输出的一部分而是在monorepo内共享
- [ ] 分离开发调试用的模块到专门的开发包
- [ ] 生产开发环境判断
- [ ] 解耦登录器/后端特定逻辑
- [ ] 解耦非核心功能
  - [ ] 取代原functions子包
  - [ ] script通过语法树进行高级反混淆，作为开发插件包提供，同时生产环境下禁用script解密

# Core v0.5.0

- [x] 移除chalk
- [x] 将log逻辑全部移出到launcher
- [x] 添加egret的license
- [x] `LevelManager`关卡强制终止时现在会在当前对战结束后立即停止
- [x] 更换对战相关Hook名称, 向后微调`battleStart`(原`panelReady`)的节点
- [x] 重构对战策略模块概念, 精简核心的职能, `resolveStrategy`由`Manager`导出, 主要逻辑的处理移交登录器层
- [x] 添加战斗单元测试

# App 当前版本 v0.5.1