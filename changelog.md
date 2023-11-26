// 以下信息仅在 >= 1.0版本内显示，后续1.0版本发布后（应为第一个可用的稳定版）将删除并重新开始记录changelog
// 为什么要删掉？一个是因为乱；一个是后面肯定会用上更好的changelog管理工具而不是手动编辑；最重要的一点：changelog一般是供开发者了解功能变更，从而帮助版本的迁移。但是前面这会根本没有人用，自然不用关心这些问题...

RoadMap: **见Readme**

**注意，正在进行0.5.0版本的重构和功能添加，暂时不具备可用性**

**todo已经迁移至issue/project**

- [x] 项目更名为SEA(Seerh5 Assistant Project), 启动器部分名称更改为SEAL(Seerh5 Assistant Launcher)
> 其实名称没变，变的是缩写

- [ ] 迁移后端到typescript

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
- [ ] 通过declare module方式并设计相关接口，使得Core支持扩展
  - [ ] 添加Loader的扩展点
  - [x] 添加Hook的扩展点
  - [x] 添加GameConfig的扩展点

- [ ] 属性攻击/特攻/物攻的枚举

- [ ] 对于部分错误, 封装错误类
- [ ] 解耦登录器/后端特定逻辑
- [ ] 解耦非核心功能, 全部移动到登录器下的`features`包下, 由登录器提供扩展定义
  - [ ] 取代原functions子包
  - [ ] script解密
  - [ ] 对战显血
  - [ ] 自动关弹窗
  - [ ] logFilter
  - [ ] script通过语法树进行高级反混淆, 暂定主要目标是升级 async/await

# App 当前版本 v0.5.1

- [ ] 背包切换的列表键报错

- [ ] 生产开发环境判断
- [ ] 为模组注入配置持久化接口
