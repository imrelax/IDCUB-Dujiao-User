# Dujiao-Next User Web · Nuxt 4 深度定制版

基于 [dujiao-next/user](https://github.com/dujiao-next/user) 官方 Vue 3 源码，全面采用 **Nuxt 4 + Vue 3 + Tailwind CSS v4** 进行重构与二次开发。

本项目的核心目标是 **大幅提升 SEO 收录能力**、**优化全站响应式 UI/UX 交互体验**，并 **扩展官方尚未实现的自定义功能**，同时保持与后端 API 的路径完全兼容。

---

## Nuxt 4 对比原版 dujiao-user 的核心改进

原版 [dujiao-next/user](https://github.com/dujiao-next/user) 项目是基于 Vite + Vue 3 的纯客户端 SPA，Nuxt 4 版本在 **架构、SEO、功能模块、性能、国际化** 五个维度进行了系统性重构。

### 1. 架构重构：SPA → SSR 全栈化

#### 1.1 SSR 服务端渲染

原版项目所有页面内容均由浏览器端 JS 动态渲染，搜索引擎爬虫只能抓取到空白壳页面。Nuxt 4 版本借助 Nitro 引擎实现全站 SSR：

- **每个页面首次访问均由服务端渲染完整 HTML**，包含商品标题、描述、价格、分类等关键 SEO 信息。
- 路由级 ISR（Incremental Static Regeneration）缓存策略：首页、商品列表、分类页、文章页等公开页面自动缓存 5 分钟，Sitemap 缓存 1 小时，在保证内容实时性的同时大幅降低服务器压力。
- 配置于 `nuxt.config.ts` → `nitro.routeRules`，按路径精确控制。

#### 1.2 文件即路由 (File-based Routing)

原版需要手动编写 `src/router/index.ts` 维护所有路由。Nuxt 4 采用约定式路由：

- `app/pages/[locale]/products/[slug].vue` 自动生成 `/zh/products/xxx` 等路由。
- `app/pages/[locale]/[post_type]/[slug].vue` 实现动态文章类型路由（博客、公告、教程等），新增文章类型只需在后台配置，无需修改前端路由代码。
- 所有路由天然支持 `[locale]` 语言前缀。

#### 1.3 Nitro Server 层

Nuxt 4 新增 `server/` 目录，利用 Nitro 服务端能力实现原版无法做到的功能：

| 功能 | 原版 user | Nuxt 4 |
|---|---|---|
| Sitemap 生成 | 无 | 6 个子 Sitemap，从管理增强系统 API 动态分页拉取（`server/routes/sitemap*.xml.ts`） |
| robots.txt | 静态文件 | 服务端动态生成（`server/routes/robots.txt.ts`） |
| API 代理 | 依赖 Vite proxy（仅开发环境） | Nitro 统一代理前台接口、后台管理接口、`/uploads/**`，生产环境有效 |
| 运行时配置 | 仅 `VITE_*` 编译时常量 | `runtimeConfig` 支持运行时注入环境变量 |

#### 1.4 统一布局系统

原版在 `App.vue` 中硬编码全局结构。Nuxt 4 引入 `app/layouts/default.vue`，提供：

- `<NuxtLoadingIndicator />` — 页面切换时的加载进度条
- `<NuxtErrorBoundary>` — 局部错误边界，子页面崩溃不影响整体布局
- `<FloatingMenu />` — 全局浮动操作菜单（客服、Telegram、浏览历史）
- `<MobileBottomNav />` — 移动端底部导航

#### 1.5 全局中间件

原版通过路由守卫和组件内 `onMounted` 实现权限控制。Nuxt 4 通过 3 个全局中间件系统化管理：

| 中间件 | 文件 | 职责 |
|---|---|---|
| `auth.global.ts` | `app/middleware/auth.global.ts` | 页面级鉴权：需登录页面自动跳转登录，已登录用户访问登录页自动跳回 |
| `locale.global.ts` | `app/middleware/locale.global.ts` | URL locale 校验与 Pinia 同步，无效语言自动 301 重定向到默认语言 |
| `config.global.ts` | `app/middleware/config.global.ts` | 首次加载时自动拉取站点配置（公告、广告、营销活动等） |

---

### 2. SEO 搜索优化

#### 2.1 多维度 Sitemap 体系

原版无任何 Sitemap。Nuxt 4 在 `server/routes/` 下实现了 6 个子 Sitemap：

| Sitemap | 数据来源 | 更新策略 |
|---|---|---|
| `sitemap-products.xml` | 管理增强系统 Sitemap 数据源（分页拉取，最多 20 页 x 500 条） | ISR 1h |
| `sitemap-categories.xml` | 管理增强系统 Sitemap 数据源 | ISR 1h |
| `sitemap-posts.xml` | 管理增强系统 Sitemap 数据源（按 post_type 遍历） | ISR 1h |
| `sitemap-pages.xml` | 管理增强系统 Sitemap 数据源 | ISR 1h |
| `sitemap-tags.xml` | 管理增强系统 Sitemap 数据源 | ISR 1h |
| `sitemap.xml` | Sitemap index，汇总上述子 Sitemap | ISR 1h |

所有 Sitemap 自动为多语言（zh-CN、zh-TW、en-US）生成对应的 `<xhtml:link rel="alternate">` 标签，通过 `server/utils/sitemap.ts` 中的 `buildMultiLocaleSitemapXml()` 统一处理。

#### 2.2 页面级 SEO 元数据

- `app/composables/usePageSeo.ts`：为每个页面统一注入 Title、Description、Keywords、Open Graph 标签。
- 商品详情页自动读取商品名称和描述作为 SEO 标题和摘要。
- 分类页、文章详情页、博客列表页同理。

#### 2.3 URL 路径平移

Nuxt 4 路由设计严格保持与原版一致的 URL 结构（如 `/products/xxx`、`/categories/xxx`、`/me/orders`），域名切换时无需 301 重定向，避免 SEO 权重流失。

---

### 3. 新增功能模块

以下是 Nuxt 4 对比原版 `user/` 独立新增的功能模块。

#### 3.1 营销活动系统 (Campaign)

原版无此功能。Nuxt 4 在首页聚合渲染时，从管理增强系统 API 一次性拉取全量活动数据：

| 组件 | 说明 |
|---|---|
| `CampaignBanner.vue` | 首页促销 Banner 网格（4 列响应式），动态从管理增强系统营销接口拉取活动数据 |
| `CampaignPopup.vue` | 入站弹窗，支持图片/标题/富文本内容/CTA 链接，按 session 记录已展示状态 |
| `CountdownTimer.vue` | 倒计时组件，精确到秒，到期自动触发刷新回调 |

**实现方式**：`CampaignBanner` 和 `CampaignPopup` 均在首页 `onMounted` 时通过 `appStore.fetchCampaignEffects()` 获取管理增强系统返回的活动数据，前端按 `effect_type`（`banner` / `popup` / `countdown`）分发到对应子组件。`CampaignPopup` 使用 `sessionStorage` 记录已展示状态，同一 session 内不重复弹出。`CountdownTimer` 基于 `setInterval` 每秒刷新剩余时间，到期后 emit 回调事件通知父组件重新拉取数据——实现活动自动启停，无需刷新页面。`CampaignBanner` 采用 CSS Grid 4 列布局，`md` 断点以下自动折叠为 2 列。

#### 3.2 捆绑商品 (Bundle)

原版不支持捆绑销售。Nuxt 4 新增 `app/components/bundle/ProductBundleView.vue`：

- 支持分组选择（如按地区、规格分组）。
- 支持简洁模式和详情两种展示风格。
- 分组内商品独立选择，实时计算总价。
- 页面路由：`/[locale]/bundles/[slug].vue`。

**实现方式**：捆绑数据采用三级模型——Bundle（捆绑主体，含名称/封面/风格）→ Group（分组，如"美服"/"日服"）→ Item（子商品，含覆盖名称/特性标签/跳转链接）。前端通过管理增强系统 API 拉取完整 Bundle JSON，`ProductBundleView` 渲染时按 `style_type` 切换展示模式：`compact` 模式展示分组选择器 + 总价汇总栏，`detailed` 模式额外展示每个子商品的特性列表和独立详情。分组选择通过 `v-model` 绑定当前 Group，子商品切换时实时重新计算总价（各 Item 价格从 V1 产品数据补全）。

#### 3.3 广告位系统 (Ad)

原版无广告系统。Nuxt 4 新增 `app/components/ad/AdSlot.vue`：

- 两种布局模式：`sidebar`（竖排堆叠，侧边栏场景）和 `inline`（横排网格，列表内嵌）。
- 悬停动画：图片缩放 + 渐变遮罩 + shimmer 效果。
- 自动识别内部/外部链接，内部用 `<NuxtLink>`，外部用 `<a>`。

**实现方式**：广告数据由管理增强系统配置下发，每条广告包含 `image`、`title`、`link`、`layout` 字段。`AdSlot` 通过 props 接收 `layout` 模式：`sidebar` 使用 `flex-col gap-4` 堆叠渲染，`inline` 使用 `grid grid-cols-2 md:grid-cols-3` 网格布局。链接识别逻辑：检查 `link` 是否以 `/` 开头或同域名——是则渲染 `<NuxtLink>` 走客户端路由，否则渲染 `<a target="_blank" rel="noopener">`。悬停效果通过 Tailwind `group-hover:scale-110` + `transition-transform` 实现图片缩放，叠加伪元素渐变遮罩和 CSS `shimmer` 动画。

#### 3.4 浏览历史 (Browsing History)

原版无此功能。Nuxt 4 通过 `app/composables/useBrowsingHistory.ts` + `app/components/history/BrowsingHistory.vue` 实现：

- 基于 localStorage 的客户端浏览记录（最多 20 条，LIFO 排序，同商品去重）。
- 商品详情页自动记录当前商品。
- 通过 `FloatingMenu.vue` 中的快捷入口和产品详情页底部区域展示。

**实现方式**：`useBrowsingHistory` composable 封装了对 localStorage key 的读写逻辑。每次进入商品详情页时调用 `addToHistory(product)`——内部先过滤已存在的同 ID 记录（去重），再将新记录插入数组头部，截断至 20 条上限后写回 localStorage。`BrowsingHistory` 组件读取历史列表渲染为垂直商品卡片，每项显示缩略图、名称和价格。「未读小红点」通过对比上次查看时间戳与最新记录时间戳实现：`FloatingMenu` 入口按钮通过 `watch` 监听历史数组长度变化，若有新记录则在图标右上角 overlay 红色圆点。

#### 3.5 智能推荐

原版无推荐系统。Nuxt 4 新增 `app/components/recommendation/`：

| 组件 | 说明 |
|---|---|
| `AlsoBought.vue` | 商品详情页底部「买了又买」推荐，调用管理增强系统 API，自动过滤隐藏/售罄商品 |
| `SimilarHot.vue` | 相似热门商品推荐 |
| `HomeRecommend.vue` | 首页智能推荐区，结合浏览历史进行个性化推荐 |

**实现方式**：三种推荐各走独立数据源——`AlsoBought` 请求当前商品的关联推荐接口，`SimilarHot` 基于分类/标签匹配热门商品，`HomeRecommend` 读取本地浏览历史的商品分类再拉取同类热门。所有推荐返回的商品列表统一经过 `useProductListHidden` 的 `filterListHidden()` 双重过滤：先剔除管理增强系统中标记为隐藏的 product ID，再过滤状态为售罄/缺货的 item，确保前端只展示可购买的有效商品。推荐列表为空时自动隐藏组件区域，不占页面空间。

#### 3.6 在线客服 (ChatPopup)

原版无客服功能。Nuxt 4 新增 `app/components/ChatPopup.vue`：

- Teleport 到 body 层级的 iframe 聊天面板。
- 移动端全屏、桌面端悬浮窗口，响应式适配。
- 聊天入口 URL 从站点配置中读取。

**实现方式**：使用 Vue `<Teleport to="body">` 将聊天 iframe 挂载到 DOM 顶层，彻底避免 z-index 层级冲突（页面内其他 fixed/sticky 元素无法覆盖聊天窗口）。聊天 URL 由管理增强系统站点配置下发，前端在组件挂载时动态设置 `<iframe src>`。响应式适配策略：`md` 以下断点聊天面板 `position:fixed inset-0 w-full h-full` 全屏展开，`md` 及以上使用 `fixed bottom-20 right-6 w-96 h-[500px] rounded-xl shadow-2xl` 悬浮卡片模式。通过 `v-model:visible` 控制显示/隐藏，关闭时 `<iframe>` 不被销毁（保持聊天会话）。

#### 3.7 悬浮操作菜单 (FloatingMenu)

`app/components/FloatingMenu.vue` — 桌面端右下角、移动端底部上方的固定浮动按钮组：

- **在线客服**：带脉冲动画提示的聊天入口按钮。
- **Telegram**：可直接配置的 Telegram 群组/频道链接。
- **浏览历史**：快捷查看最近浏览商品，带未读小红点提示。
- **回到顶部**：`BackToTop.vue`，滚动超过一屏后显示。

**实现方式**：每个按钮均为独立的 Vue 组件实例，通过 `position: fixed` 定位。客服按钮的脉冲动画使用 CSS `@keyframes pulse-ring` 在外圈渲染扩散圆环（`box-shadow` 动画 + `opacity` 渐隐），每 3 秒循环触发吸引用户注意。Telegram 按钮直接从管理增强系统站点配置读取群组/频道链接并渲染为 `<a>` 标签。`BackToTop` 通过 `window.scrollY > window.innerHeight` 判断是否显示，点击后调用 `window.scrollTo({ top: 0, behavior: 'smooth' })` 平滑滚动。移动端（`< md`）菜单容器贴底显示并增加 `pb-[env(safe-area-inset-bottom)]` 适配刘海屏。

#### 3.8 商品列表隐藏功能

原版无此能力。Nuxt 4 新增 `app/composables/useProductListHidden.ts`：

- 支持手动指定隐藏某些商品 ID（通过配置 `config.listHiddenProducts.productIds`）。
- 支持自动隐藏售罄/缺货商品（`config.listHiddenProducts.hideOutOfStock`）。
- 隐藏的商品仅在列表中不显示，直接访问详情页 URL 仍可打开（展示为售罄状态）。
- 统一过滤函数 `filterListHidden()` 应用于所有推荐、列表、搜索模块。

**实现方式**：`useProductListHidden` 从管理增强系统站点配置中读取 `listHiddenProducts` 对象，返回两个核心方法——`filterListHidden(products)` 接收商品数组，逐项检查 `id` 是否在 `productIds` 黑名单中，若开启 `hideOutOfStock` 则额外检查 `stock_status` 字段，命中即剔除。该函数被注入到所有列表渲染管线中：首页推荐、分类筛选、搜索结果、AlsoBought 推荐、标签页商品列表——确保全站一致性。注意隐藏仅作用于列表上下文（`v-for` 渲染前过滤），详情页通过 `[slug]` 直连访问时不做拦截，以便 SEO 爬虫仍可抓取页面、用户可通过外链访问。

#### 3.9 自定义脚本注入

原版无此能力。Nuxt 4 通过 `app/plugins/customScripts.client.ts` + `app/utils/customScripts.ts` 实现：

- 从站点配置 `config.scripts` 读取自定义 JS 代码。
- 内容指纹去重，仅在脚本内容变化时重新注入。
- 支持 head 和 body_end 两种注入位置，可独立开关每条脚本。

**实现方式**：站点配置中的 `scripts` 数组每项包含 `code`（JS 源码）、`position`（`head` / `body_end`）、`enabled`（开关）。客户端插件在应用初始化时执行：对每条已启用的脚本计算 SHA-256 内容哈希作为指纹，与 `localStorage` 中上次注入的指纹比对——相同则跳过，不同则通过 `document.createElement('script')` 动态创建 `<script>` 标签，`head` 位置插入 `<head>`，`body_end` 位置插入 `<body>` 末尾。指纹存储确保配置中同一脚本内容不变时不会重复注入，但脚本内容更新（如第三方统计代码升级）后下次页面加载自动替换为新版本。`enabled: false` 的脚本不创建 DOM 元素，实现零开销关闭。

#### 3.10 新增页面

原版无以下页面。Nuxt 4 新增：

| 页面 | 路由 | 文件位置 |
|---|---|---|
| 隐私政策 | `/[locale]/privacy` | `app/pages/[locale]/privacy.vue` |
| 服务条款 | `/[locale]/terms` | `app/pages/[locale]/terms.vue` |
| 常见问题 | `/[locale]/faq` | `app/pages/[locale]/faq.vue` |
| 会员中心 | `/[locale]/me/memberships` | `app/pages/[locale]/me/memberships.vue` |
| 商品标签页 | `/[locale]/tags/[tag]` | `app/pages/[locale]/tags/[tag].vue` |
| 通用独立页 | `/[locale]/page/[slug]` | `app/pages/[locale]/page/[slug].vue` |

---

### 4. UI/UX 体验优化

#### 4.1 首页 Hero 区域

原版首页 Banner 较简单。Nuxt 4 重新设计了现代卡片式 Hero：

- 支持背景大图 + 渐变遮罩叠加。
- 动态标题、副标题、CTA 按钮文本和链接。
- 移动端触摸滑动切换。
- 图片通过 `@nuxt/image` 优化，支持 srcset 响应式加载。

#### 4.2 图片优化体系

原版直接使用原始图片 URL。Nuxt 4 引入完整的图片优化链：

- **`@nuxt/image` 模块**：所有 `<NuxtImg>` / `<NuxtPicture>` 自动走管理增强系统图片代理，支持 WebP 转换 + 按需缩放。
- **`SmartImage.vue`**：统一的智能图片组件，自动处理加载失败回退、懒加载。
- **`PostThumbnail.vue`**：文章/商品缩略图组件，带毛玻璃占位效果。
- **`@nuxt/fonts`**：Inter 字体自动优化，内联 CSS、添加 `font-display: swap` 消除 FOUT。

#### 4.3 图标系统

原版依赖 `@heroicons/vue` 图标库。Nuxt 4 扩展为两套图标方案：

- **`MenuIcon.vue`**：集成 Iconify API，支持 Font Awesome（fas/fab/far）图标名自动映射到 Iconify 格式，SVG 通过浏览器缓存加载。
- **`FlagIcon.vue`**：纯内联 SVG 国旗组件（中国、台湾、美国），用于语言切换器。

#### 4.4 分页组件

`PaginationNav.vue`：全站统一的现代化分页组件，博客、公告、教程、订单等所有列表页一致使用。

#### 4.5 面包屑导航

`BreadcrumbNav.vue`：动态面包屑组件，根据当前路由自动生成导航路径。

---

### 5. 国际化 (i18n) 重构

#### 5.1 URL 前缀路由

原版通过 `?lang=zh` 查询参数切换语言，对 SEO 不友好。Nuxt 4 改为路径前缀模式：

- `/zh/products/xxx` → 简体中文
- `/tw/products/xxx` → 繁体中文
- `/en/products/xxx` → 英文

由 `app/middleware/locale.global.ts` 中间件处理 locale 验证与重定向。

#### 5.2 翻译文件结构化

原版将所有翻译集中在一个 `src/i18n/index.ts`。Nuxt 4 拆分为 3 个独立文件：

- `app/i18n/messages/zh-CN.ts`
- `app/i18n/messages/zh-TW.ts`
- `app/i18n/messages/en-US.ts`

配合 `app/i18n/index.ts` 统一导出，支持 SSR 环境下正确的 locale 同步（通过 `ensureI18nLocale()` 避免 hydration mismatch）。

#### 5.3 SSR 安全的路由跳转

`app/composables/useLocalePath.ts`：自动根据当前语言为路由路径添加正确前缀，避免客户端/服务端不一致。

---

### 6. 性能优化

| 策略 | 实现位置 | 说明 |
|---|---|---|
| ISR 缓存 | `nuxt.config.ts` → `nitro.routeRules` | 公开页面 5 分钟，Sitemap 1 小时 |
| 图片 WebP 代理 | 管理增强系统图片处理层 | 所有 `/uploads/` 图片自动转 WebP + 缩放 |
| 字体优化 | `@nuxt/fonts` 模块 | Inter 字体内联 + font-display:swap |
| CSS 代码分割 | `nuxt.config.ts` → `vite.build.cssCodeSplit` | 按页面拆分 CSS |
| 分类数据缓存 | `useProductCategories.ts` | 5 分钟内存缓存 |
| 自定义脚本指纹去重 | `customScripts.client.ts` | 避免重复注入相同脚本 |
| Vercel Analytics | `@vercel/analytics` + `@vercel/speed-insights` | 可选的性能监控模块 |

---

### 7. 技术栈变更一览

| 维度 | 原版 user | Nuxt 4 版 |
|---|---|---|
| 框架 | Vite + Vue 3 SPA | Nuxt 4 SSR |
| CSS | Tailwind CSS v4（PostCSS） | Tailwind CSS v4（Vite 插件） |
| 图片 | 原始 URL | `@nuxt/image` 自动优化 |
| i18n | vue-i18n v9（查询参数） | vue-i18n v11（URL 前缀路由） |
| SEO | 无 Sitemap | 6 个子 Sitemap + robots.txt |

---

## 自定义配置

### 早期模式：本地 JSON 文件

项目初期，所有扩展功能通过 `xiabibi.json` 本地文件硬编码管理——商品角标、公告弹窗、友情链接、营销活动、广告位、自定义脚本、商品隐藏、购买须知等均写死在 JSON 中。每次调整配置都需要修改文件、重新构建并部署，灵活性有限。

### 当前模式：管理增强系统后台动态配置

现已升级为**后台可视化管理**，由独立 BFF 服务层接管全部站点配置：

- **数据库驱动**：所有配置项存储在 PostgreSQL `config_items` 表中，通过 Admin 面板实时修改，无需重新部署。
- **模型化实体**：营销活动、捆绑商品、FAQ、购买须知模板、导航菜单、独立页面等均以结构化数据模型管理，天然支持多语言 JSONB 字段。
- **聚合首页接口**：单次请求返回推荐商品、Banner、营销活动、最新文章，替代早期多次独立请求。
- **缓存策略**：接口级内存缓存，配置变更即时生效，无明显延迟。

管理增强系统作为增强层运行于独立进程，拥有自己的数据库，通过 HTTP 调用核心接口，不与核心共库。

---

## 说明

本项目所有代码均由 AI 编写，基于 **DeepSeek V4 Pro** 模型生成。由于对代码整体缺乏足够的理解与把控，因此选择闭源，但欢迎通过 Issue 交流讨论。

---

## 许可证

本项目前端核心架构基于 [dujiao-next](https://github.com/dujiao-next) 官方版本进行二次重构与开发。
请遵循原项目设定的 **GPLv3 协议**。项目页脚已强制保留开源版权声明，请勿移除。

---

*最后更新：2026-06-04*
