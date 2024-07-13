// 以下信息仅在 >= 1.0 版本内显示，后续 1.0 版本发布后（应为第一个可用的稳定版）将删除并重新开始记录 changelog
// 为什么要删掉？一个是因为乱；一个是后面肯定会用上更好的 changelog 管理工具(changeset 预定)而不是手动编辑；最重要的一点：changelog 一般是供开发者了解功能变更，从而帮助版本的迁移。但是前面这会根本没有人用，自然不用关心这些问题...

当前更新内容 模组安装与管理 & 关卡功能重构（2024.7）

- [ ] 关卡配置与mod配置UI
- [ ] 调度界面, 删除全部已完成
- [ ] 收星星上限出错出错处理
- [ ] 更新vip签到(flash商城?)
- [ ] 全屏与刷新按钮
- [x] rotating算子基于内部计数器而不是round
- [ ] 关卡添加与结束的snackbar
- [ ] 命名空间的脆弱性
- [ ] core v1.0.0
- [ ] 日任扫荡功能
- [ ] LevelManager中止时的超时和强制逃跑处理
- [ ] PanelTable是不是直接useMemo就行了，奇怪的cacheReturn hook
- [ ] (task state)使用自定义的高亮显示框代替textarea显示json

- [ ] https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#the-configdir-template-variable-for-configuration-files
- [ ] 升级sdk的ts版本
- [ ] 验证第五和魂印判断的正确性
- [ ] sdk 中 core 版本兼容性检测, 添加 core 版本字段(必填), 并规范 launcher 的 core 实例和 sdk 使用的 api 之间的关系
  - [ ] 需要一次性提供 Launcher Api 版本，Core 版本和自身版本
  - [ ] launcher api 版本和 launcher 版本之间的关系？
  - [ ] 同步server launcher mod-type的版本，保持统一 (选取三个中最新的, 同步到其他两个)
- [ ] 战斗日志保存
- [ ] script 通过语法树进行高级反混淆, 暂定主要目标是升级 async/await
- [ ] 后端日志管理
  - [ ] rotating
- [ ] 预置功能管理
- [ ] 内置模组在更新时的处理
- [ ] 日任掉线
- [ ] 自定义背景（各种意义上？）
- [ ] QuickAccess 重做，移入主界面底部
- [ ] ctOverride
- [ ] spt 扫荡
- [ ] 作战实验室 六界扫荡 星际迷航 神兽
- [ ] 常用配置查询
- [ ] 精灵养成模组，每天自动养成指定精灵
  - [ ] 自动消耗积分
  - [ ] 指定一个列表，自动选择没有达到指标的精灵进行养成
- [ ] launcher 语法高亮模块 hljs
- [ ] launcher 轻量配置编辑器模块，日志显示模块
- [ ] launcher 和 server 的 logger 模块
- [ ] 模组加载时的出错处理
- [ ] 教程的 cc 共享协议
- [ ] 删除博客功能
- [ ] logo
- [ ] 教程网站配色，首页，编辑
- [ ] 由后端支持的更新 dist 文件夹进行软件更新
- [ ] dc 群组
- [ ] yo 工作区脚手架构建
- [ ] 引入 changeset + 发版
- [ ] 优化自动构建脚本
- [ ] 搜索功能
- [ ] sdk/预设/例子/模组发布转移到单独的仓库
- [ ] store逻辑复用优化
- [ ] 拆分优化调度器list
- [ ] 优化内置日志输出，信息输出，封装组件
- [ ] tarui/electron 打包项目
- [ ] 控件拖动
- [ ] 当前面板路径
- [ ] 进入对战超时
- [ ] 更换名片精灵页面的重复
- [ ] coverage文件夹换位置
- [ ] 对等依赖<->dts定义(例如注册查询表)(可参考：next模块定义，mui对样式引擎的定义依赖)
- [ ] 模组定义新增标志位，表明不支持热重载
- [ ] 取消对http-proxy-middleware的依赖
- [ ] 错误边界

# Core 当前版本 v1.0.0-rc.6

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
- [ ] 查询关卡获取的因子数量
- [x] 启用单元测试
- [ ] 解耦登录器/后端特定逻辑, 分离非核心功能, 部分移动到登录器下的`features`包下, 由登录器提供扩展定义, 部分合并到`engine`中
  - [ ] script 解密
  - [ ] 对战显血
  - [ ] 自动关弹窗
  - [ ] logFilter
- [ ] 查询魂印激活放到 SEAPet 中
- [x] LevelRunner使用事件流
- [ ] 完善 pet 缓存逻辑
  - [ ] 同时优化第五和魂印的检测逻辑
- [x] 对于 CoreLoad 的注册 hook, 提供标志位来进行功能的打开，关闭
  - [x] 同时公开 hook 数组, 以便登录器层可以开关特定功能
- [x] 集成测试作为单独的包，移出 core

# Core v1.1.0

# 低优先级

- [ ] 本地文件缓存
- [ ] 字体设置
- [ ] join all pet, 全局 pet 筛选
- [x] 根组件渲染提前到 Core.init
- [ ] jsx 外部化, import-map 共享 react
- [ ] cookie issue
- [ ] 在三个加载资源处都显示 总加载文件数 当前文件名 当前已下载大小/当前文件大小
- [ ] 考虑如何使`Strategy`添加更简单的 fallback 支持(可能添加一个字段?)
  - [ ] 例如`true`代表 fallback 到自动, 否则链式依次 fallback
- [ ] 首屏logo
