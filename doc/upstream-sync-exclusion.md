# 上游同步排除机制

## 目标

在 upstream 连接编辑弹窗中增加"排除商品设置"，允许用户指定上游商品 ID 列表。自动同步时，列表中商品跳过库存/价格更新，同步日志有明确标识。

```
改前：  上游拉取 → 全量商品同步（库存、价格、SKU、批发价）
改后：  上游拉取 → 查排除列表 → 命中 → 跳过 + 日志标识
                                    → 未命中 → 正常同步
```

- 排除仅影响**库存/价格/状态更新**，不改变已有的 SKU 映射关系、采购订单链路
- 排除不影响"上游已删除/下架"的检测与标记（该逻辑独立执行）

## 核心策略

**排除数据挂在连接上**——`site_connections` 表新增 `excluded_product_ids` (TEXT) 字段，存储 JSON 数组如 `[123,456,789]`。

同步链路在两个关键节点拦截：

| 节点 | 方法 | 说明 |
|------|------|------|
| 定时批量同步 | `syncConnectionStock` | 遍历映射时检查，命中则 `continue` + 日志 |
| 单品实时同步 | `SyncProduct` | 下单前库存兜底触发，同样检查排除 |

## 数据格式

```jsonc
// site_connections 表新增字段
{ "excluded_product_ids": "[123, 456, 789]" }

// JSON 数组字符串，空字符串表示无排除
// 前端表单用逗号/空格分隔输入，提交时转为 JSON 数组
```

## 涉及文件

| 端 | 文件 | 改动 |
|----|------|------|
| 后端 | `internal/models/site_connection.go` | 新增 `ExcludedProductIDs` 字段 + `IsProductExcluded()` 方法 |
| 后端 | `internal/service/site_connection_service.go` | `CreateConnectionInput` / `UpdateConnectionInput` 增加字段；`Create` / `Update` 增加赋值 |
| 后端 | `internal/service/product_mapping_sync.go` | `syncConnectionStock` + `SyncProduct` 增加排除检查 + 日志 |
| Admin | `src/api/types.ts` | `AdminSiteConnection` 增加 `excluded_product_ids` |
| Admin | `src/views/admin/SiteConnections.vue` | 编辑弹窗增加排除商品 ID 输入区 |

## 实现细节

### 1. 模型层 — `site_connection.go`

```go
// SiteConnection 新增字段
ExcludedProductIDs string `gorm:"type:text" json:"excluded_product_ids"`
```

```go
// 新增辅助方法，供同步逻辑快速判断
func (c *SiteConnection) IsProductExcluded(upstreamProductID uint) bool {
    if c.ExcludedProductIDs == "" {
        return false
    }
    var ids []uint
    if err := json.Unmarshal([]byte(c.ExcludedProductIDs), &ids); err != nil {
        return false
    }
    for _, id := range ids {
        if id == upstreamProductID {
            return true
        }
    }
    return false
}
```

### 2. 服务层 — `site_connection_service.go`

**`CreateConnectionInput`** 增加：
```go
ExcludedProductIDs string `json:"excluded_product_ids"`
```

**`UpdateConnectionInput`** 增加（指针类型区分"未传"和"传空"）：
```go
ExcludedProductIDs *string `json:"excluded_product_ids"`
```

**`Create` 方法** 中 `conn` 构造增加：
```go
ExcludedProductIDs: strings.TrimSpace(input.ExcludedProductIDs),
```

**`Update` 方法** 中增加：
```go
if input.ExcludedProductIDs != nil {
    conn.ExcludedProductIDs = strings.TrimSpace(*input.ExcludedProductIDs)
}
```

### 3. 同步逻辑 — `product_mapping_sync.go`

**`syncConnectionStock`**（第 562 行循环内）增加排除检查：

```go
for i := range connMappings {
    mapping := &connMappings[i]

    // 排除列表检查
    if conn.IsProductExcluded(mapping.UpstreamProductID) {
        logger.Infow("sync_product_skipped_excluded",
            "connection_id", connectionID,
            "upstream_product_id", mapping.UpstreamProductID,
            "local_product_id", mapping.LocalProductID,
            "mapping_id", mapping.ID,
        )
        continue
    }

    // ... 原有同步逻辑不变
}
```

**`SyncProduct`**（第 21 行，获取连接后）增加排除检查：

```go
// 排除列表检查
if conn.IsProductExcluded(mapping.UpstreamProductID) {
    logger.Infow("sync_single_product_skipped_excluded",
        "connection_id", mapping.ConnectionID,
        "upstream_product_id", mapping.UpstreamProductID,
        "mapping_id", mapping.ID,
    )
    return nil
}
```

### 4. 前端类型 — `types.ts`

```typescript
export interface AdminSiteConnection {
    // ... 现有字段
    excluded_product_ids?: string  // JSON 数组字符串
}
```

### 5. 前端 UI — `SiteConnections.vue`

**表单字段**（`form` reactive）增加：
```typescript
excluded_product_ids: '',
```

**编辑回填**（`openEditModal`）：JSON 数组 → 逗号分隔字符串显示：
```typescript
excluded_product_ids: (() => {
    const raw = conn.excluded_product_ids
    if (!raw) return ''
    try { return JSON.parse(raw).join(', ') } catch { return raw }
})(),
```

**提交转换**（`buildPayload`）：逗号/空格分隔 → JSON 数组字符串：
```typescript
excluded_product_ids: (() => {
    const raw = form.excluded_product_ids.trim()
    if (!raw) return ''
    const ids = raw.split(/[,\s]+/).map(Number).filter(n => !Number.isNaN(n) && n > 0)
    return JSON.stringify(ids)
})(),
```

**弹窗 UI**（加价配置区域之后、提交按钮之前）：

```html
<div class="border-t border-border pt-4">
    <div>
        <h3 class="mb-1 text-sm font-medium">排除商品设置</h3>
        <p class="mb-3 text-xs text-muted-foreground">
            设置在自动同步时需要跳过的上游商品，这些商品的库存和价格不会被自动更新。
        </p>
    </div>
    <div>
        <label class="mb-1.5 block text-xs font-medium text-muted-foreground">排除商品 ID</label>
        <textarea
            v-model="form.excluded_product_ids"
            rows="3"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="输入上游商品 ID，多个 ID 用逗号或空格分隔，例如：123, 456, 789"
        ></textarea>
        <p class="mt-1 text-xs text-muted-foreground">
            输入的上游商品 ID 在自动同步时将被跳过，不会更新库存、价格等信息。
        </p>
    </div>
</div>
```

## 不改的

- 同步之外的逻辑（采购订单、履约、退款）— 排除仅控制同步数据更新
- `markUpstreamUnavailable` — 上游删除/下架检测不受排除影响
- SKU 映射关系 — 已有的映射不因排除而断开
- 数据库 schema — 纯新增字段，无 DDL 风险（SQLite 兼容）

## 实施 checklist

- [ ] `models/site_connection.go`：新增 `ExcludedProductIDs` 字段 + `IsProductExcluded()` 方法
- [ ] `service/site_connection_service.go`：Input 结构体、`Create`、`Update` 增加排除字段支持
- [ ] `service/product_mapping_sync.go`：`syncConnectionStock` + `SyncProduct` 增加排除检查 + 日志
- [ ] `admin/src/api/types.ts`：`AdminSiteConnection` 增加 `excluded_product_ids`
- [ ] `admin/src/views/admin/SiteConnections.vue`：表单/弹窗增加排除 ID 输入区 + 数据转换
- [ ] 验证：配置排除 → 触发同步（定时/手动）→ 检查日志确认跳过标识 → 确认被排除商品库存/价格未变更
