// 以下信息仅在 >= 1.0版本内显示，后续1.0版本发布后（应为第一个可用的稳定版）将删除并重新开始记录changelog
// 为什么要删掉？一个是因为乱；一个是后面肯定会用上更好的changelog管理工具而不是手动编辑；最重要的一点：changelog一般是供开发者了解功能变更，从而帮助版本的迁移。但是前面这会根本没有人用，自然不用关心这些问题...

RoadMap: **见Readme**

**注意，正在进行0.5.0版本的重构和功能添加，暂时不具备可用性**

**todo已经迁移至issue/project**

- [x] 项目更名为SEA(Seerh5 Assistant Project), 启动器部分名称更改为SEAL(Seerh5 Assistant Launcher)
> 其实名称没变，变的是缩写

# Core 当前版本 v0.6.3

- [x] 整合官方的module加载调试输出
  - [x] 屏蔽官方实现
  - [x] 更新hook位置
- [x] SAType从DTS中移动到`core/constant/type.ts`下
- [x] 将type作为打包输出的一部分

- [ ] 统一监听器接口, SEAEventTarget作为基类, Socket和GameModule去继承, 最后暴露EventBus统合
  - [ ] Socket的res监听fallback到SocketConnection
  - [ ] GameModule支持类型Map推导

- [ ] 重构GameConfig查询模块, 采用接口+注册制, 配合TypeMap, 添加可扩展性
- [ ] 统一组织所有的TypeMap到`constant`下

- [ ] 属性攻击/特攻/物攻的枚举

- [ ] 通过declare module和内建命名空间支持等方式，使得Core支持扩展，类似d3和jq的插件
  - [ ] 添加Loader的扩展点
  - [ ] 添加GameConfig的扩展点

- [ ] 解耦登录器/后端特定逻辑
- [ ] 解耦非核心功能, 全部移动到登录器下的`features`包下, 由登录器提供扩展定义
  - [ ] 取代原functions子包
  - [ ] script解密
  - [ ] 对战显血
  - [ ] 自动关弹窗
  - [ ] logFilter
  - [ ] script通过语法树进行高级反混淆, 暂定主要目标是升级 async/await

# App 当前版本 v0.5.1

- [ ] 生产开发环境判断
- [ ] 为模组注入配置持久化接口