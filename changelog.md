// 以下信息仅在 >= 1.0版本内显示，后续1.0版本发布后（应为第一个可用的稳定版）将删除并重新开始记录changelog
// 为什么要删掉？一个是因为乱；一个是后面肯定会用上更好的changelog管理工具而不是手动编辑；最重要的一点：changelog一般是供开发者了解功能变更，从而帮助版本的迁移。但是前面这会根本没有人用，自然不用关心这些问题...

**注意，0.4.0版本对大部分api进行了重构**

下面的内容拟定迁移到Project看板，方便维护

长期待定功能（此部分功能的需求不明确，较好的实现方式与手段未知）：

- [ ] react层次重构,优化react部分代码组织
- [ ] 后端迁移到fastify
- [ ] 使用changeset和hasky
- [ ] spt自动推进
- [ ] **查询对手使用技能**
- [ ] 完整可读的api doc

on progress:

加个currency什么的包,并行运行前后端两个server
静态 /dist
http://rp-ta.61.com/tm.js 什么情况？
pwa怎么又不行了...
还有就是把eslint的一堆报错修掉...
sapet的mixin模式
什么鬼百度的hm怎么又跑进来了
开头那个有localhost的cookie。。
重新规划
生产环境下禁用script解密
战斗模式隐藏快捷按钮
快捷按钮为加载一个函数片段，由mod提供
pet matcher便捷函数，通过名字找ct
抽象日任模块公共代码部分 全新的level模块！
添加半自动模式，策略添加fallback选项
自爆模式识别 附带重新梳理自定义策略，预制策略，默认策略，关卡定义策略的优先级关系
借火操作
后端迁移fastify
核心模块基本上只剩下helper和function，strategy三部分需要重构整合了，重构完将release v1.0

issues:

- [ ] 关闭面板导致的看板娘消失问题
- [ ] 战队派遣模块的bug(重复刷新)
- [ ] 更新背包精灵发包后无响应的bug(cache await update一直不resolve)(hmr?)
  - 目前倾向是原生PetManager那边的问题
- [ ] 因子目前存在稳定的断线情况, 具体来说就是隔一段时间或者场数断一次, 不频繁, 但是怀疑和单纯的两次战斗之间的延迟已经无关联
  - 注意因子的掉线机制和其他关卡是分开计算的, 使用sa进行日任完全不会掉线

待定模组功能:

- [ ] 小舞第4关脚本(压血84)
- [ ] log写入本地

- [ ] 青龙完全体
- [ ] 因子自动判断兑换数量
  - [ ] 判断精灵是否获得, 若没获得, 因子是否可以兑换
  - [ ] 判断特性是否开启, 同上
  - [ ] 判断第五是否开启, 同上

RoadMap: **见Readme**

正在准备v0.5.0版本的发布!

Backend:

1. 可以使用Ctrl-C在正常终端正确退出程序

App: v0.5.0

Core: v0.5.0

App: v0.4.2

1. 添加eslint支持
2. 迁移到vite进行打包
3. 添加单独的后端模块

Core: v0.4.5

1. 确定测试框架为浏览器端mocha
2. 搭建测试环境
3. 迁移打包器，从webpack迁移到vite
   - 这里额外注意，sa-core使用tsc作为构建输出，不进一步构建生产版本，sa-core下的vite仅作测试用开发服务器
4. core包的包名更改为`sa-core`
5. 更改core包组织结构，现在可以导入分包
6. 更改部分api名称
7. 重新组织工具链
8. `SAPet`接口改为统一异步!
   - 发现大多数用例没有通过链式调用获得收益，而链式调用使用promise方式也可以很好的描述
   - 减轻心智负担，不要再考虑操作后缓存中是否能直接取到对象
   - 保证调用风格的统一
   - await可以直接对其使用，且减少ide的报错
   - 如果确定可以在缓存中直接读取信息，请使用`SAPet`(同时保持向后兼容)
   - 否则建议统一使用新的`SAPet.get()`api
   - 在需要获取精灵并马上使用一次值的场景下，考虑使用返回代理对象的`SAPet.xxx`系列方法

Core: v0.4.3 (ps: 感觉大部分core模块都翻了个底朝天)
1. 添加service-worker，缓存assets
2. 优化类型推导，现在使用`game-data`模块只需要输入字符串即可
3. 添加`SAEventBus`，这是一个helper类，可以方便的在模块内添加并卸载常用监听器(SAEventTarget/EventManager/MainSocket)
4. 修复战斗模块首回合获取基础信息失败的问题
5. **重构且适配MoveModule接口**！新接口剪除大量样板代码，编写自动战斗脚本更加简单！
   1. 不需要判断skillId和index是否合法，自动执行auto操作
   2. 不需要重新获取skill，死切后处理由manager自动进行
   3. 保证RoundInfo中最重要的catchTime，id，name是最新的，这些字段会覆盖上一轮的实际RoundPetInfo收包中的值
   4. 首回合就能获取到部分精灵信息

```typescript
// 之前的最小自动战斗配置
const resolver = async (round, skill, pets) {
   const snm = new SkillNameMatch(_snm);
   const dsl = new DiedSwitchLink(_dsl);
   if (round.isDiedSwitch) {
      const r = dsl.match(pets, round.self!.catchtime);
      if (r !== -1) {
         Operator.switchPet(r);
      } else {
         Operator.auto();
      }
      await delay(600);
      skills = Provider.getCurSkills()!;
   }
   const r = snm.match(skills);
   if (r) {
      Operator.useSkill(r);
   } else {
      Operator.auto();
   }
}

// 现在
const snm = new SkillNameMatch(_snm);
const dsl = new NoBloodSwitchLink(_dsl);
const resolver = {
   resolveNoBlood(round, skills, pets) {
      return dsl.match(pets, round.self!.catchtime);
   },
   resolveMove(round, skills, pets) {
      return Operator.useSkill(snm.match(skills));
   },
}
```
Core: v0.4.2
1. 事件总线模块整体重构，api更清晰简洁
   1. SAEventTarget对原生EventTarget进行了一层封装，不需要提供CustomEvent，可以直接在on中获取data
   2. api整体抽象为on/once/off/emit四个
   3. SocketListener/GameModuleListener
   4. 上述两个Listener传入对象进行监听配置，api统一
2. 更多的基础配套函数
   1. hook函数
   2. debounce函数
3. 更改Mod接口类型
4. 调整整体的模块内初始化代码分布和加载

App & Core: v0.4.1
1. 背包状态更新可以在app中同步了
2. 背包显示实际加成后血量
3. 支持首发的提示和切换
4. 自动战斗模块的编辑与显示进行了对空格的优化

Core: v0.4.0
1. 重构项目为MonoRepo
2. `sa-core`与`sa-app`分开独立构建
3. `sa-core`模块**全部重新设计实现**，详见doc/api设计
4. **数据同步与缓存模块，socket订阅模块**
5. **全新的PetHelper模块**

v0.3.10
1. 新的LocalStorage管理策略，不再由各个组件显式维护
2. 修复技能石作为技能发包导致的严重错误(使用错误的skillId,淘米返回的错误很严重)
3. 修复新PetHelper的若干适配问题

v0.3.9.1
1. 适配230331版本的日任更新
2. 适配新版资源兑换面板

v0.3.9
1. `Battle`接口上添加了对战时pet的名称和id的获取
2. `Battle.Manager`的相关辅助变量管理策略变更，现在需要通过`Manager`内的函数进行操作，而不是通过`Manager`将相关变量之间暴露并使用。重点注意现在strategy是要在`runOnce`的第二个参数内传递。
3. 支持解析技能石

v0.3.8
1. 修复一个skill effect的解析错误
2. 密战第3关脚本
3. 新因子: 卡莎
4. 优化压血延时
5. 因子模组自动开关自动治疗
6. 全局挂载sac对象
7. 六界神王殿扫荡

v0.3.7
1. 模组输入命令后清空当前命令
2. 校正剩余电池时间的便捷函数
3. 主面板关闭逻辑重构
4. bubble替换的Alarm.show现在可以正常显示html
5. 修复三塔日任停止后仍然会进行这本层对战的问题
6. 适配230310新版三塔日任

v0.3.6
1. 快捷命令组模块(只能说完全是应付一下)
  - 模块CloseAll
  - MainPanel.hide
  - MainPanel.show
2. 在背包页面，可以直接切换动画模式
3. `petBag`中catchTime现在直接复制到剪切板而不是输出到控制台
4. 重构战斗管理器模块和react项目组织，主要变动如下:
  - 死切链，技能匹配，自动战斗和默认策略从核心库移除，在app层管理
  - 自定义策略仍然为最高优先级，归`Battle`模块管理。即，核心库部分，保留自定义策略的使用，同时修复了使用自定义策略不进行延时检测的bug
  - 重构`BattleManager`面板，重构app内所有和自动战斗相关的逻辑
  - 重构reactApp的文件组织（又更换了一次命名）
5. 统一表格组件
6. ~~压血不改变默认首发(压血后还原默认首发)~~ 请客户端考虑使用更换背包相关功能自行实现
7. ~~hmr后战斗信息面板同步失效~~ 0.4.x版本进行ui和core项目分离后进行解决
8. sa库初始化部分的副作用处理与修复，使之对hmr有更好的支持
  - 改进库与app入口构建，修改了hmr相关，webpack配置相关代码，对入口文件进行了一定的重构
  - 将`wrapper`进行了幂等处理，保证副作用不会嵌套
  - `SAEventTarget`现在在common模块下导出，同时仍保留为window下导出
  - webpack的进一步配置，库导出与应用分离暂不考虑，参见大版本更新的RoadMap
  - 目前仍然是胶水临时解决方案状态，等0.4.x版本ui层和库分离后解决

v0.3.5.2
1. 进一步修复精灵头像显示问题

v0.3.5.1
1. 再次进行对战延迟修复，同时检测：对战开始到下一次对战启动延时&对战结束到下一次对战启动延时，因子额外再加延时
2. 修复精灵王日任领取周奖励失败的bug
3. 修复精灵王日任领取周奖励不能正确显示完成状态的bug
4. 苍星签到加入`sign`模组

v0.3.5
1. 启用`tsconfig.json`中`skipLibCheck`选项
2. `const`模块简化
3. 日任新增精灵王试炼
4. 修复弹出技能新技能面板导致的switchBag错误(结束自动关闭新技能面板)
5. 模组的方法反射功能支持获取参数数量和参数名称
6. 适配并修改当前版本(202212)静态模式，取消出招，双方回合和磕pp的延时，高速进行pve
7. ~~签到可以领取活跃度奖励~~该收发包行为暂不支持在h5上执行
8. vip点数自动兑换道具，在`sign`模组中设置
9. 战队强化一键满级
10. 背包页面可以进行友谊之星，另外一些常用外部弹窗支持自动打开时自动关闭面板
11. 日常副本模块重命名为`realm`
12. 重构PetBag面板，将函数移出声明式jsx部分，同时修复了获取头像的bug，可以正常获取苍星头像

v0.3.4
1. `Functions`模块新增功能:
   - `getClickTarget`: 获取下一次鼠标点击处的UI对象
   - `findObject`: 在对象树中查找
2. 保存背包bug修复
3. 切背包自动判重，不会将需要的精灵切入仓库
4. 因子关卡通用模块测试版(`applybm.ts`)
   - 因子关卡辅助
   - 预编译模型
   - 自动战斗
5. ~~合并计数物品获得~~(已被官方修复)
6. 主面板的锁定功能，锁定后点击外部不再关闭主面板，且点击会穿透到canvas上
7. 后台心跳包发送不再处理剩余电池时间的计算

v0.3.3
1. React中获取图片资源问题的再修复
2. 精灵头像显示（简版实现）
3. 技能石合成模组
   - 在控制台输出使用的石头和概率
   - `craftOne`指令可以自动选取石头合成一次，d级会留两颗
   - 不支持显示合成失败
4. 梦幻宝石快速合成
   - 位于`sign`模组内，需要参数
5. 泰坦矿洞切背包bag修复
6. 优化`BattlePanel`相关hooks
   - 将`completed`分离为两个节点，`completed`节点已废弃
   - 新的节点`endPropShown`: 结束面板弹出，并且不会关闭巅峰对战的面板
   - 新的节点`battleEnd`: 战斗结束，节点极其靠后，同时正确补上一个事件的发送，修复了战斗结束后主界面看板娘消失的bug
   - 调整了`roundEnd`节点，同样更加靠后以修复以前节点在对方切换精灵之前导致的bug

v0.3.2
1. 缓存本地换肤
2. 缓存死切链和技能表
3. 项目结构优化
4. 修复常用数据概览模块图片显示不正确的问题
5. `BattleModule`更改为`Battle`
6. 修复日任模块的部分判定错误
7. `Functions`下`switchBag`现在只需要ct数组作为参数了
8. ~~换背包功能~~构建失败

v0.3.1
1. 新的模块钩子
   1. module的事件钩子现在有`loadScript`,`construct`和`destroy`三个
   2. 在`loadScript`事件触发时，模块实例尚未创建，但是和该模块对应的**脚本已经载入内存**，可以获取其命名空间和原型对象
   3. 在`construct`事件触发时，模块**实例已经创建**，可以通过`ModuleManager`或者新的`SeerModuleHelper`组件获取该实例，且该实例存在于`ModuleManager`的`_modules`或者`moduleList`下
   4. 在`destroy`事件触发时，模块**实例准备销毁**，且该实例已从`ModuleManager`的`_modules`或者`moduleList`下移除
2. 新的模块侦听管理器`SeerModuleStatePublisher`，在`EventHandler`模块下导出，采用观察者模式，三个订阅状态和上面的钩子一一对应，注意在`load`事件中，不可以通过ctx参数获取直接获取当前对象实例
3. `SeerModuleHelper`组件，包含ts环境下获取模块信息的工具函数，在`EventHandler`模块下导出
4. 使用新的模块组件重写`LocalCloth`模组
5. 修复日任模块的一些bug

v0.3.0
1. 全新的**一键日任面板**
2. 精灵背包dump
3. 取消使用道具的确认

v0.2.11
1. 精灵背包面板
2. 战斗管理器面板

v0.2.10
1. 点空白处关闭主面板
2. 个人信息获取与修改相关api，见`player-helper`
3. 友谊之星查看

v0.2.9 **break changes**
1. `SkillModule`更名为`MoveModule`，更好的反映这个函数是作用于一轮内的操作，而不只是出招逻辑
2. `BaseSkillModule`模块现在为`Strategy`模块
3. 相关类型现在在`AutoBattle`命名空间下
4. 重构整个`BattleModuleManager`:
   1. 将无关的输出显示逻辑移入`EventHandler`
   2. 将进入战斗与战斗逻辑两个部分解耦，战斗逻辑可以在无进入战斗的情况下单独设定。战斗逻辑调度部分为`BattleModuleManager.strategy`
   3. 不再使用队列，战斗状态管理权的将交给模组编写者，Manager仅提供一次性的`runOnce`作为方便函数，封装了一个在战斗结束时resolve的promise
5. `Functions` & `PetHelper`下函数命名已统一为*camelCase*
6. 优化`Functions`模块下`lowerBlood`代码逻辑，修正背包切换的bug，适配新的`BattleManager`
7. 修复初始化部分的`Event`模块因为将`SAEventTarget`捕获为模块内变量导致hmr更新时不能更新相关事件回调的bug
8. `Utils`添加GetBitSet功能，该函数用以取一系列布尔值，类似GetMultiValue,只不过后者的取值范围为为正整数
9. `PetHelper`下现在可以获取自动治疗状态
10. `LocalCloth`: 现在只有点击精灵头像时会输出调试信息了

v0.2.8
1. 将抓包逻辑迁移到ui组件中（部分功能未实现）

v0.2.7
1. 全局面板现在会在关闭后隐藏而不是卸载
2. 抓包功能支持
3. 更新socket部分定义
4. 更新wrapper函数签名,this参数类型现在由调用者手动指定而不是依赖typescript推导

v0.2.6
1. 常用数据查看模块
2. 引入egret的TypeDefined
3. 更新定义文件
4. 优化项目组织结构

v0.2.5
1. 后台挂机功能，通过在lifecycle处于pause期间定时发送system_time_check包实现

v0.2.4
1. 更新定义文件
2. 将模块外部逻辑，即两个`loader`放入`src/`下
3. ~~`entity`下`__type`现在为static~~更正: `__type`按设计为实例属性

v0.2.3.5
1. 更新部分定义文件
2. `LocalCloth`模块适配新版背包点击头像查看精灵详情

v0.2.3.4
1. 更新部分定义文件
2. ~~PetHelper.getPets()~~ 弃用: `PetHelper`模块下的`getPets`方法已根据官方更新精灵仓库和背包系统后的情况拆分为`getBagPets`和`getStoragePets`两个函数。对于后者，不会立即返回所有精灵的信息，而是返回一个异步函数，执行后得到`Pet`实体的Promise(即延迟加载，只在要访问的时候获取某个精灵的信息)。
> ps:由于`calcAllEfficientPet`函数使用的仅为精灵属性，且实现没用到`getPets`方法，所有不受影响

v0.2.3.3
1. ctrl+p自动给命令框对上焦点
2. 本地皮肤的战斗部分不修改到对方皮肤

v0.2.3.2
1. 添加样式化的主功能按钮(打开主功能页面)
2. 优化快捷功能条的逻辑
3. 更换快捷功能条单的样式
4. 优化组件的文件组织
5. 优化组件的页面布局

v0.2.3.1
1. 命令框优化，全局显示完成的命令，输入更加自然
2. 在模组命令底部添加return命令，目前退出模组命令输入有两种方式
   1. 选择使用return命令
   2. 在输入框为空时按下`Backspace`

v0.2.3
1. 全局`ctrl+p`命令框，带自动提示。
2. 模组添加内省方法，可以获取方法名和通过方法名执行相应方法。
3. 修复命令框在不显示的时候没有卸载的问题(顺便解决初始化的时候mods还未载入导致的初始化异常)

v0.2.2.3
1. 添加路径别名，修改导入自定义data的方式
2. 添加了计划使用的本地api接口，方便SA未来可以进行日志保存和信息的保存等

v0.2.2.2
1. 修复压血在不需要进入战斗直接退出后不能正确进行补药的问题
2. 关于某些精灵原皮的half图加载失败：官方的assets配置里就不完整，缺失了很多精灵half的hash，无法修复

v0.2.2.1
1. 小优化
2. 主页现在会将入口点暴露，同时删除了百度统计的注入

v0.2.2
1. 红莲安卡第四关mod
2. 圣瞳缪斯第四关mod
3. 修复一个在BattleModule对象中没有使用箭头函数导致的this指向错误问题（x密室mod）

v0.2.1

1. 修复`Utils`模块中`DictMatcher`的错误
2. 添加了更多的物品常量
3. `BattleModule.Operator`可以使用auto函数进行自动操作
4. 现在`SocketSendByQueue`返回`undefined | ArrayBuffer`，以便进行收包的读取

v0.2.0

**break changes**：详见0.1.8 - 0.2.0的changelogs

(更新过渡版本 v0.1.11):

1. 迁移工作收尾，为大部分mods添加了any注解，方便过渡
2. 添加`utils\module`模块，目前只是部分方便的helper方法，方便在ts环境下获取全局加载的module对象
3. archive的模组不再显示，并且排除出仓库。（这部分模组都是作者写的过渡用或自用模组，针对性较强，且不会影响模块的核心功能，等日后开放外部模组sdk后，会挑选合适的地点发布自定义模组。而且注意，现阶段的official mods是这个项目的不完善与作者需求的矛盾之下的产物。）
4. 添加调试用的logger模块
5. 修复了mod中获取全局对象的错误
6. 修复了`LocalCloth`模组中对于原皮肤id为undefined的处理不当导致的错误
7. 修复了官方获取部分精灵经典皮肤的banner会失败的问题

(v0.2.0):

1. 更新了ts下的hmr（重构时移除了这个功能），现在hmr可以正常工作，包括react-refresh/动态替换全局导出/模块更新
2. 重新组织了所有的模块的目录，使之更符合现代js library的组织方式（但目前仍然只有web构建）

v0.1.10
1. 继续迁移工作，大部分代码已经迁移到typescript
2. 修复一个由于对象浅拷贝导致的对局信息获取错误
3. `SAEventManager`已更名为`SAEventTarget`
4. `BattleModule`模块大型翻修，已添加完善的声明与定义
5. `BattleModule.BattleModuleManager`模块下`BattleModule`现在不是分别传入`entry`,`skillModule`,`finish`，而是一个包含这三个属性的对象

v0.1.9

1. 继续迁移工作, 项目已配置typescript环境
2. 考虑到所有的官方js文件的注入口已经被拦截，所以进行了全局的`console`替换，因此现在项目可以正常使用原生console（而不是对全局的console进行代理）并不破坏堆栈信息
3. 修复压血功能的问题

v0.1.8

1. 项目进行整体大重构，下面是重点摘要
2. `sa-loader`现在会加载init目录下的初始化文件，这些文件都具有全局副作用
3. `event`模块整体重做，对原函数的hook全部移动到init下的`event.js`内完成，现在的思路是`SAEventManager`只负责接收hook挂载的时候传出的值
4. `common`模块移动到根目录下，命名为`utils.js`，在全局作用域挂载`wrapper`和`delay`
5. 新增`globals.d.ts`用于vsc全局变量提示
6. `const`下`CMDID`现在值是从`CommandID`中读取的
7. `entities`模块大更改，更加统一，通用。其他模块将使用新的对象进行数据交互
8. `PetHelper`重新整合，修改Promise逻辑，修改导入导出
9. 修复大量bug

v0.1.7

1. `setPetLocation`适配新版背包，适配部分的逻辑如下：
   1. `PosType`为`storage`的情况下，如果当前位置是精英收藏，则将精灵移除精英，否则等同于点击“放入仓库”。即自动根据是否为精英，放入仓库对应位置
   2. `PosType`为`elite`的情况下，尝试将精灵加入精英收藏，并且会首先回收至仓库。
   3. `PosType`为`bag1/secondbag1`的情况下，等同于在仓库的对应位置点击“放入背包”
   4. 如果觉得有点绕，可以这样理解，`setPetLocation`会自动根据精灵的当前位置，执行等同新版背包在当前位置的相应操作。如果当前页面不能执行这种操作（跨界面转移），则会分两步执行（如情况2）。
2. `getPetLocation`与`getPets`代码无变动，获取精英收藏的行为和版本一致：即使出战也能在`elite`类别下获取到。
3. `LocalCloth`模组添加小功能：在背包界面点击头像在控制台输出相应的原生PetInfo对象，方便调试
4. 考虑到目前还没有UI界面，暂时没有针对因子关做太多适配功能
5. 光惩关卡archive

v0.1.6.1

1. 修复初版通用战斗模块的小bug
2. 其他小优化

v0.1.6

1. `Utils`模块新增精灵查询
2. `Functions`模块新增多余刻印分解
3. 新的功能：**本地全皮肤**
4. 现在可以监听模块的打开和首次加载了
5. 战队派遣之前自动收取之前派遣
6. 更改了common模块的导出位置，现在位于`Utils`下

v0.1.5

1. 较多的修复和优化，详见commit中的文件diff
2. 红莲安卡模型：添加千裳强攻灰羽苍兽，以及在战斗模型匹配失败后交还控制权
3. 添加了新的模组：x战队，英卡洛斯飞镰点灯，莫伊莱因子
4. 刻印一键5级，可以在游戏内UI界面直接操作(较不稳定)
5. 一键清除多余的泰坦刻印

v0.1.4

1. 红莲安卡模型继续优化: 神鹿仙子关使用圣谱，为避免翻车提醒月照要三孔或特攻珠
2. 每日签到新增vip礼包和点数
3. loader适配8.12版本的sentry关闭
4. `Functions`新增切换vip自动回血
5. 重大优化：使用promise包装cmd监听回调，现在可以通过`SocketReceivedPromise`函数来包装某会发包的操作，该函数返回一个Promise，收包之后才resolve。
6. 使用`SocketReceivedPromise`优化`setPetLocation`，现在可以直接`await setPetLocation`，不需要再手动delay了。同时也变相加快了该函数的执行效率。
7. 现在将私人数据常量导入common.config.js中，约定通过`import data from '../common.config.js'`来访问
8. 精灵位置常量已封装进`Const`模块，约定通过`const PosType = Const.PETPOS`来访问

v0.1.3

1. 修复压血cts为空时没有运行callback的问题
2. 持续优化红莲安卡第三关模组，为了减少miss的问题使用了朵潘来进行场地必中，有待进一步观察效果
3. 英卡洛斯关卡已通过，archive
4. 光之惩戒收收集能量已通过，archive
5. 压血新判断极端情况，若谱尼被击败还未压血完成则运行下一个压血

v0.1.2

1. 重构过滤无用调试信息的方式，不再使用wrapper包装输出调试信息的函数，而是使用Proxy来代理console.log和warn。注意：通过这种方式必须通过trace才能得到调用链，因此待办：在模组内部使用封装后的Logger函数而不是代理后的console。
2. 优化确认信息显示，现在会以气泡方式显示而不是完全在控制台输出
3. 以原生接口开启发包调试输出
4. 优化socket信息显示
5. 修复压血func传入空数组也会触发战斗的问题
6. 优化红莲安卡模型
7. 英卡洛斯自动eve
8. 新功能：自动战队派遣，带自定义排除项，操作方式是将要排除的精灵放进背包

v0.1.1

1. 红莲安卡第三关模型优化，优化调试信息显示
2. 添加英卡洛斯平衡能量模型
3. 重构名称匹配技能模型，现在会根据添加的顺序匹配，并且会判断pp
4. 修复BattleOperator.UseSkill中传入无效id时自动使用技能错误（注意id和当前精灵不匹配会被显示非法操作的警告信息，BattleOperator不负责id的正确性校验，请使用调试完毕确认无误的模型或者传入前使用校验函数）

v0.1.0

第一个预览版本