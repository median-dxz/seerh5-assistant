// 以下信息仅在 >= 1.0版本内显示，后续1.0版本发布后（应为第一个可用的稳定版）将删除并重新开始记录changelog
// 为什么要删掉？一个是因为乱；一个是后面肯定会用上更好的changelog管理工具而不是手动编辑；最重要的一点：changelog一般是供开发者了解功能变更，从而帮助版本的迁移。但是前面这会根本没有人用，自然不用关心这些问题...

RoadMap: **见Readme**

**注意，正在进行0.5.0版本的重构和功能添加，暂时不具备可用性**

**todo已经迁移至issue/project**

- [ ] 整理github issue和project, 删除过远和不够明确的目标, 关闭暂时无法复现的问题, 关闭已经完成的内容并链接commit/pr

- [ ] 使用import map, 在全局共享`sea-core`ES模块实例, 使插件捆绑后以原生esm方式即可使用core
  - [ ] 编写vite插件和引入jspm, 使launcher在开发环境下将`sea-core`外部化, 由插件注入本地工作区包的importmap
  - [ ] 同样由vite插件和jspm, 在生产环境下将`sea-core`捆绑为单独的chunk并保留导出签名, 由插件注入chunk的importmap(额外步骤：将分包解析映射到总包)
  - [ ] sdk中不用额外插件，仅做外部化配置
  - [ ] 完善动态import加载插件的机制，在devtools中获取更好的显示
- [ ] sdk中core版本兼容性检测
- [ ] 抑制vite的html外部脚本报错 ([vite #11854](https://github.com/vitejs/vite/pull/11854))
- [ ] 关闭生产环境下(`vite build`)对`sea-core`的`tree-shake`

# Core 当前版本 v0.7.1

- [ ] 添加发布版本的npm脚本, 并同步修改`loader/index.ts`内的`version`
  - [ ] 入参是版本, 然后同步修改package.json和loader的两个字段, 使用正则替换+JSON.prase
- [ ] 精简api界面, 删除不必要的导出
- [ ] 属性攻击/特攻/物攻的枚举
- [ ] 对于部分错误, 封装错误类
  - [ ] 暂定有影响DRY原则的错误封装
- [x] 额外允许一些模块打印关键日志, 通过`common`包下的`log`模块启用
  - [x] `Log.setLogger()`允许使用自定义logger, 默认启用console.log, 输出格式为`[sea-core][module name]:`
  - [x] 外部api为`Log.enable()`和`Log.disable()`, 通过传入模块名称来开启这一部分的输出
  - [x] 目前暂定支持的模块只有`Battle`, 开启后将输出Operator模块的入参

> 以下内容等登录器端相关功能编写完善之后再迁移
 
- [ ] 解耦登录器/后端特定逻辑, 分离非核心功能, 部分移动到登录器下的`features`包下, 由登录器提供扩展定义, 部分合并到`engine`中
  - [ ] script解密
  - [ ] 对战显血
  - [ ] 自动关弹窗
  - [ ] logFilter

# App 当前版本 v0.5.1

- [ ] 生产开发环境判断
- [x] 基于trpc, 不再需要持久化配置提供序列化函数
- [ ] 为模组注入配置持久化接口

# 其他

- [ ] script通过语法树进行高级反混淆, 暂定主要目标是升级 async/await
- [ ] 心跳包逻辑有点问题, 会被主动断线
- [ ] 全体治疗基于Promise重写, 不需要加延时

# 低优先级

- [ ] 本地文件缓存
- [ ] 字体设置
- [ ] join all pet, 全局pet筛选
- [ ] 根组件渲染提前到Core.init

quick-access-plugin整合成为新的command

模组目前可以添加的贡献点: 

command/qap | activate | module | level

