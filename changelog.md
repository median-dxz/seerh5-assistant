// 以下信息仅在 >= 1.0 版本内显示，后续 1.0 版本发布后（应为第一个可用的稳定版）将删除并重新开始记录 changelog
// 为什么要删掉？一个是因为乱；一个是后面肯定会用上更好的 changelog 管理工具而不是手动编辑；最重要的一点：changelog 一般是供开发者了解功能变更，从而帮助版本的迁移。但是前面这会根本没有人用，自然不用关心这些问题...

RoadMap: **见 Readme**

**注意，正在进行 0.6.0 版本的重构和功能添加，暂时不具备可用性**

- [ ] 整理 github issue 和 project, 删除过远和不够明确的目标, 关闭暂时无法复现的问题, 关闭已经完成的内容并链接 commit/pr
- [ ] sdk 中 core 版本兼容性检测, 添加 core 版本字段(必填), 并规范 launcher 的 core 实例和 sdk 使用的 api 之间的关系
- [ ] 统一签到模组(`sign`)到关卡, 将无战斗纯发包的也视为关卡的一种
  - [ ] 可能需要重新设计关卡的整体接口
  - [ ] 顺便解决关卡进度指示器的问题
- [ ] sdk 中的同步 core 版本号脚本
- [ ] 战斗日志保存
- [ ] script 通过语法树进行高级反混淆, 暂定主要目标是升级 async/await
- [x] 一键收星星
- [ ] 自定义背景（各种意义上？）
- [x] 控制中心：自动治疗开关
- [ ] QuickAccess 重做，移入主界面底部
- [ ] ctOverride
- [ ] 日常新增：功勋任务
- [ ] spt 扫荡
- [ ] 常用配置查询
- [ ] 精灵养成模组，每天自动养成指定精灵
  - [ ] 自动消耗积分
  - [ ] 指定一个列表，自动选择没有达到指标的精灵进行养成
- [ ] launcher 语法高亮模块
- [ ] launcher 轻量配置编辑器模块，日志显示模块
- [ ] launcher 和 server 的 logger 模块
- [ ] 调度界面, 删除全部已完成
- [ ] 模组加载时的出错处理

# Core 当前版本 v1.0.0-rc.1

- [x] 精简 api 界面, 删除不必要的导出
  - [x] 删除不常用的子包导出
  - [x] 删除不必要的实体接口
  - [x] 重命名`SocketBuilderRegistry`为`SocketDeserializerRegistry`
  - [x] `Battle`下导出全部重新组织
- [x] `SEAPet` 更换更优雅的链式调用 api
- [x] 重新组织导出
  - [x] 不再有子包导出
  - [x] `seac`作为核心实例用于控制全局副作用
  - [x] `Strategy`模块重写, 提供更加方便优雅的 api, 且统一大部分操作
    - [x] 新 api 以纯函数式方式，包括技能对点, 自动, 第五, 攻击
  - [x] 更名
    - [x] `SEAPet` -> `spet`
    - [x] `GameConfigRegistry.getQuery` -> `query`
    - [x] `extendEngine` -> `engine.extend`
    - [x] `Engine` -> `engine`
    - [x] `SEABattle` -> `battle`
    - [x] `CoreLoader` -> `core`
- [x] 日志模块重写，输出 object 而不是消息，可以子 logger 化
- [ ] 全体治疗基于 Promise 重写, 不需要加延时
- [ ] 查询关卡获取的因子数量
- [ ] 启用单元测试，集成测试作为单独的包，移出 core
- [ ] 对于 CoreLoad 的注册 hook, 提供标志位来进行功能的打开，关闭
  - [ ] 同时公开 hook 数组, 以便登录器层可以开关特定功能
- [ ] 解耦登录器/后端特定逻辑, 分离非核心功能, 部分移动到登录器下的`features`包下, 由登录器提供扩展定义, 部分合并到`engine`中
  - [ ] script 解密
  - [ ] 对战显血
  - [ ] 自动关弹窗
  - [ ] logFilter
- [ ] 查询魂印激活放到 SEAPet 中
- [ ] 完善 pet 缓存逻辑
  - [ ] 同时优化第五和魂印的检测逻辑

# 低优先级

- [ ] 本地文件缓存
- [ ] 字体设置
- [ ] join all pet, 全局 pet 筛选
- [x] 根组件渲染提前到 Core.init
- [ ] jsx 外部化, import-map 共享 react
- [ ] cookie issue
- [ ] 更换 store 库(不用 context)
- [ ] 在三个加载资源处都显示 总加载文件数 当前文件名 当前已下载大小/当前文件大小
- [ ] 考虑如何使`Strategy`添加更简单的 fallback 支持(可能添加一个字段?)
  - [ ] 例如`true`代表 fallback 到自动, 否则链式依次 fallback