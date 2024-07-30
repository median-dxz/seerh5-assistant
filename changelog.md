// 以下信息仅在 >= 1.0 版本内显示，后续 1.0 版本发布后（应为第一个可用的稳定版）将删除并重新开始记录 changelog
// 为什么要删掉？一个是因为乱；一个是后面肯定会用上更好的 changelog 管理工具(changeset 预定)而不是手动编辑；最重要的一点：changelog 一般是供开发者了解功能变更，从而帮助版本的迁移。但是前面这会根本没有人用，自然不用关心这些问题...

当前更新内容 模组安装与管理（2024.8）

- [x] 关卡配置与mod配置UI
- [x] 调度界面, 删除全部已完成
- [ ] 部署mod时拒绝同mod下taskId相同
- [ ] 收星星上限出错出错处理
- [ ] 更新vip签到->flash商城
- [ ] 全屏与刷新按钮
- [ ] 日任扫荡功能
- [ ] ctOverride battleOverride strategyOverride, 有重映射和fallback两种模式, 只支持一级重载
- [ ] 模组定义新增标志位，表明不支持热重载
- [ ] 模组加载/卸载时的出错处理
- [ ] 选择套装称号时也可以预览效果
- [x] vip自动恢复血量弹框的UI同步
- [ ] 优化重写PanelTable, 参考react-hook-form的RenderProps简化实现
- [ ] 组件泛型，能不能简化MenuButton
- [ ] 战斗延迟做成可配置项, 自动关闭得到物品延迟可配置
- [ ] sdk 中 core 版本兼容性检测, 添加 core 版本字段(必填), 并规范 launcher 的 core 实例和 sdk 使用的 api 之间的关系
  - [ ] 需要一次性提供 Launcher Api 版本，Core 版本和自身版本
  - [ ] launcher api 版本和 launcher 版本之间的关系？
  - [ ] 同步server launcher mod-type的版本，保持统一 (选取三个中最新的, 同步到其他两个)
- [ ] 战斗日志保存
- [ ] 优化内置日志输出，信息输出，封装组件
- [ ] 后端日志管理
  - [ ] rotating
- [ ] sdk/预设/例子/模组发布转移到单独的仓库
- [ ] 工作区脚手架->暂定github模板repo
- [ ] 入口文件转字符串替换
- [ ] 进入对战超时
- [ ] QuickAccess重做，移入主界面底部
  - [ ] command接口增强，也支持使用schema输入参数
  - [ ] 命令行对于qa插件显示图标
- [ ] https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#the-configdir-template-variable-for-configuration-files
- [ ] 升级sdk的ts版本
- [ ] 内置模组在更新时的处理
- [ ] 日任掉线
- [ ] spt 扫荡
- [ ] 作战实验室 六界扫荡 星际迷航 神兽
- [ ] 精灵养成模组(日签)，自动养成指定精灵
  - [ ] 自动消耗积分
  - [ ] 指定一个列表，自动选择没有达到指标的精灵进行养成
- [ ] 教程的 cc 共享协议
- [ ] 删除博客功能
- [ ] 教程网站配色，首页，编辑
- [ ] dc 群组
- [ ] 引入 changeset + 发版
- [ ] 搜索功能
- [ ] tarui/electron 打包项目
- [ ] 控件拖动
- [ ] 当前面板路径
- [ ] 更换名片精灵页面的重复
- [ ] coverage文件夹换位置
- [ ] 对等依赖<->dts定义(例如注册查询表)(可参考：next模块定义，mui对样式引擎的定义依赖)
- [ ] 取消对http-proxy-middleware的依赖
- [ ] 错误边界
- [ ] hook符号表与管理?

# Core v1.0.0(当前版本)

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
    - [x] 新 api 以纯函数式方式实现，包括技能对点, 自动, 第五, 攻击
  - [x] 更名
    - [x] `SEAPet` -> `spet`
    - [x] `GameConfigRegistry.getQuery` -> `query`
    - [x] `extendEngine` -> `engine.extend`
    - [x] `Engine` -> `engine`
    - [x] `SEABattle` -> `battle`
- [x] 日志模块重写，输出 object 而不是消息，可以子 logger 化
- [x] 启用单元测试
- [x] 查询关卡获取的因子数量
- [x] 查询魂印激活放到 SEAPet 中
  - [x] 修复为同步实现
- [x] 验证第五和魂印判断的正确性
- [x] 解耦登录器/后端特定逻辑, 分离非核心功能, 部分由登录器提供扩展定义, 合并到`engine`中, 部分由`mod-presets`实现
  - [x] script 解密(后端)
  - [x] 对战显血
  - [x] 自动关弹窗(模组)
  - [x] logFilter(后端+登录器)
- [x] LevelRunner使用事件流
- [x] 对于 CoreLoad 的注册 hook, 提供标志位来进行功能的打开，关闭
  - [x] 同时公开 hook 数组, 以便登录器层可以开关特定功能
- [x] 集成测试作为单独的包，移出 core

# Core v1.1.0

- [ ] LevelManager超时
  - [ ] 中止时的超时和强制逃跑处理
  - [ ] 进入战斗时的超时
  - [ ] 为关卡提供更好出错引导与处理
  - [ ] 进入对战相关的AbortController支持
- [ ] 完善 pet 缓存逻辑
  - [ ] cacheMap接口优化
  - [ ] 使用Monad实现替换Proxy实现
  - [ ] 添加单元测试

# 低优先级

- [ ] 本地文件缓存
- [ ] jsx 外部化, import-map 共享 react
- [ ] cookie issue
- [ ] 在三个加载资源处都显示 总加载文件数 当前文件名 当前已下载大小/当前文件大小
- [ ] script 通过语法树进行高级反混淆, 暂定主要目标是升级 async/await
- [ ] (task state)使用自定义的*高亮*显示框代替textarea显示json
- [ ] 由后端支持的更新 dist 文件夹进行软件更新
- [ ] 自定义背景（各种意义上？）
- [ ] logo
- [ ] 重新组织图标：更好的DX，Material Symbol，更好的代码组织，包括字体，注意要打包进去或者测试无梯子
- [ ] 使用gird重置表格组件
- [ ] 构建electron分发
