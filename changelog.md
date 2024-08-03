// 以下信息仅在 >= 1.0 版本内显示，后续 1.0 版本发布后（应为第一个可用的稳定版）将删除并重新开始记录 changelog
// 为什么要删掉？一个是因为乱；一个是后面肯定会用上更好的 changelog 管理工具(changeset 预定)而不是手动编辑；最重要的一点：changelog 一般是供开发者了解功能变更，从而帮助版本的迁移。但是前面这会根本没有人用，自然不用关心这些问题...

当前更新内容 模组安装与管理（2024.8）

- [ ] 错误边界（新依赖）
- [ ] 确认对话框（新依赖）
- [ ] 部署mod时拒绝同mod下taskId相同
- [ ] 收星星上限出错出错处理
- [ ] 更新vip签到->flash商城
- [ ] 全屏与刷新按钮
- [ ] 日任扫荡功能
- [ ] 入口文件转字符串替换
- [ ] ctOverride battleOverride strategyOverride, 有重映射和fallback两种模式, 只支持一级重载
- [ ] 选择套装称号时也可以预览效果
- [ ] 同步动画选项的localStorage
- [ ] 战斗日志保存
- [ ] 优化内置日志输出，信息输出，封装组件
- [ ] 后端日志管理
  - [ ] rotating
- [ ] 进入对战超时
- [ ] QuickAccess重做，移入主界面底部
  - [ ] command接口增强，也支持使用schema输入参数
  - [ ] 命令行对于qa插件显示图标
  - [ ] 更好的图标支持
- [ ] https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#the-configdir-template-variable-for-configuration-files
- [ ] 升级sdk的ts版本
- [ ] 内置模组在更新时的处理
- [ ] spt 扫荡
- [ ] 作战实验室 六界扫荡 星际迷航 神兽
- [ ] 精灵养成模组(日签)，自动养成指定精灵
  - [ ] 自动消耗积分
  - [ ] 指定一个列表，自动选择没有达到指标的精灵进行养成
- [ ] 教程的 cc 共享协议
- [ ] 删除博客功能
- [ ] 教程网站配色，首页，编辑
- [ ] dc 群组
- [ ] 搜索功能
- [ ] tarui/electron 打包项目
- [ ] 控件拖动
- [ ] 当前面板路径
- [ ] 更换名片精灵页面的重复
- [ ] coverage文件夹换位置
- [ ] 对等依赖<->dts定义(例如注册查询表)(可参考：next模块定义，mui对样式引擎的定义依赖)
- [ ] 取消对http-proxy-middleware的依赖
- [ ] hook符号表与管理?

# Core v1.1.0

- [ ] LevelManager超时
  - [ ] 中止时的超时和强制逃跑处理
  - [ ] 进入战斗时的超时
  - [ ] 进入对战相关的AbortController支持
- [ ] 优化 pet 缓存逻辑
  - [ ] cacheMap实现优化
  - [ ] 使用Monad实现替换Proxy实现
  - [ ] 添加单元测试

# 低优先级

- [ ] 本地文件缓存
- [ ] cookie issue
- [ ] 在三个加载资源处都显示 总加载文件数 当前文件名 当前已下载大小/当前文件大小
- [ ] script 通过语法树进行高级反混淆, 暂定主要目标是升级 async/await
- [ ] (task state)使用自定义的*高亮*显示框代替textarea显示json
- [ ] 由后端支持的更新 dist 文件夹进行软件更新
- [ ] 自定义背景（各种意义上？）
- [ ] logo
- [ ] 重新组织图标：更好的DX，Material Symbol，更好的代码组织，包括字体(字体默认大小?)，注意要打包进去或者测试无梯子
- [ ] 使用gird重置表格组件
- [ ] 构建electron分发
