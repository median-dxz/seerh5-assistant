// 以下信息仅在 >= 1.0版本内显示，后续1.0版本发布后（应为第一个可用的稳定版）将删除并重新开始记录changelog
// 为什么要删掉？一个是因为乱；一个是后面肯定会用上更好的changelog管理工具而不是手动编辑；最重要的一点：changelog一般是供开发者了解功能变更，从而帮助版本的迁移。但是前面这会根本没有人用，自然不用关心这些问题...

RoadMap: **见Readme**

**注意，正在进行0.5.0版本的重构和功能添加，暂时不具备可用性**

**todo已经迁移至issue/project**

- [x] 项目更名为SEA(Seerh5 Assistant Project), 启动器部分名称更改为SEAL(Seerh5 Assistant Launcher)
  - [x] `core`包更名为`sea-core`
  - [x] `server`包现在是`@sea/server`
  - [x] `app`包现在是`@sea/launcher`
> 其实名称没变，变的是缩写

- [ ] 整理github issue和project, 删除过远和不够明确的目标, 关闭暂时无法复现的问题, 关闭已经完成的内容并链接commit/pr

- [x] 后端使用typescript重构
- [x] 迁移后端到fastify
- [x] 端点交互使用tRPC

- [ ] 使用import map, 在全局共享`sea-core`ES模块实例, 使插件捆绑后以原生esm方式即可使用core
  - [ ] 编写vite插件和引入jspm, 使launcher在开发环境下将`sea-core`外部化, 由插件注入本地工作区包的importmap
  - [ ] 同样由vite插件和jspm, 在生产环境下将`sea-core`捆绑为单独的chunk并保留导出签名, 由插件注入chunk的importmap(额外步骤：将分包解析映射到总包)
  - [ ] sdk中不用额外插件，仅做外部化配置
  - [ ] 完善动态import加载插件的机制，在devtools中获取更好的显示
- [ ] sdk中core版本兼容性检测

# Core 当前版本 v0.6.6

- [x] 整合官方的module加载调试输出
  - [x] 屏蔽官方实现
  - [x] 更新hook位置
- [x] SAType从DTS中移动到`core/constant/type.ts`下
- [x] 将type作为打包输出的一部分
- [x] 统一组织所有的TypeMap到`constant`下
- [x] 弃用LocalStorage作为配置存储, 进行初步持久化
- [x] 重构GameConfig查询模块, 采用注册接口架构, 配合TypeMap, 添加可扩展性
  - [x] 通过模块声明合并以及全新的`GameConfigRegistry`注册可查询的`GameConfig`
  - [x] 通过`GameConfigRegistry`获得`GameConfigQuery`对象用以查询数据
- [x] 事件模块全部重构, 采用RxJS, 以响应式结构作为事件相关逻辑的组织方式
  - [x] 使用`Subscription`来批量管理订阅
  - [x] `DataSource`现在是使用观察者模式而不是发布订阅模式
  - [x] 使用`DataSource`上的静态方法`from*`来获取事件流, 而后进行订阅
  - [x] 移除`SendWithReceivedPromise`接口, 根据发包客户端的源码分析，这个接口是没有必要的
- [x] `wrapper`api重构, 采用链式不可变结构对函数添加`before`和`after`装饰器
- [ ] 属性攻击/特攻/物攻的枚举
- [x] 移除`extractObjectId`方法
  - [x] 常用的`Entity`中添加`infer*`静态方法, 用于替代原来的api
- [ ] 通过declare module方式并设计相关接口，使得Core支持扩展
  - [ ] 添加Loader的扩展点
  - [x] 添加Engine的扩展点
  - [x] 添加Hook的扩展点
  - [x] 添加GameConfig的扩展点
- [ ] 解耦登录器/后端特定逻辑, 分离非核心功能, 部分移动到登录器下的`features`包下, 由登录器提供扩展定义, 部分合并到`engine`中
  - [ ] script解密
  - [ ] 对战显血
  - [ ] 自动关弹窗
  - [ ] logFilter
- [ ] 对于部分错误, 封装错误类
  - [ ] 暂定有影响DRY原则的错误封装
- [ ] 额外允许一些模块打印关键日志, 通过`common`包下的`log`模块启用
  - [ ] `Log.setLogger()`允许使用自定义logger, 默认启用console.log, 输出格式为`[sea-core][module name]:`
  - [ ] 外部api为`Log.enable()`和`Log.disable()`, 通过传入模块名称来开启这一部分的输出
  - [ ] 目前暂定支持的模块只有`Battle`, 开启后将输出Operator模块的入参

# App 当前版本 v0.5.1

- [ ] 生产开发环境判断
- [ ] 基于trpc, 不再需要持久化配置提供序列化函数
- [ ] 为模组注入配置持久化接口

# 其他

- [ ] script通过语法树进行高级反混淆, 暂定主要目标是升级 async/await
- [ ] 心跳包逻辑有点问题, 会被主动断线
- [ ] 全体治疗基于Promise重写, 不需要加延时

v0.7.0
Loader扩展思路
Loader是一个全局单例, 内部有promise, 保证内部初始化一次
在全局挂载一个标志位, 用于检测多模块示例
有一个load方法, 执行前先检查浏览器环境, 然后等待给定window上的事件进行两个阶段的初始化
初始化的两个阶段:
beforeGameCore 执行一次初始化(在`Core.init()`之前执行)
afterMainPanelShow 执行一次初始化(在`Driver.complete`之后执行)
每个阶段在初始化之前都可以添加函数, 将按添加顺序执行, sea-core内部的函数总是首先执行
内部函数仅保留最基础的功能
登录器通过添加额外的函数来进行扩展

Engine扩展思路

导出一个engine, 是一个动态绑定的单例
有一个extendEngine方法, 往上面挂函数({fnA,fnB})

然后基于其他模块用到的必要内容(以及测试), 精简Core, 其余全部移入登录器内处理

quick-access-plugin整合成为新的command

模组目前可以添加的贡献点: 

command/qap | activate | module | level

