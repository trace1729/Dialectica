# Dialectica — 系统架构与设计文档

## 概述

Dialectica 是一个基于 AI 的对话练习平台，支持日常场景角色扮演、哲学辩论、科学家讨论、圆桌多人对话。前端为 Next.js 16 + React 19 + Tailwind CSS 4，后端 API 路由调用 DeepSeek V4 API，数据层为 localStorage（客户端）+ 服务端 JSON 文件双层存储。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router, webpack bundler) |
| UI | React 19, Tailwind CSS 4 |
| 语言 | TypeScript 5 (strict mode) |
| AI | DeepSeek V4 API (via OpenAI SDK `openai@6`) |
| 语音 | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| 客户端存储 | localStorage (单 key 聚合 blob) |
| 服务端存储 | Node.js fs JSON 文件 (`.data/`) |
| 无鉴权 | 客户端生成 UUID 作为 userId，无需登录 |

---

## 系统架构图

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App Router                │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   页 面      │  │   Hooks      │  │  lib/     │ │
│  │ /            │  │ useGame      │  │ types.ts  │ │
│  │ /play        │  │ usePlayground│  │ prompts.ts│ │
│  │ /playground  │  │ useRoundtable│  │ categories│ │
│  │ /stats       │  │ useVoice     │  │ storage.ts│ │
│  └──────┬───────┘  └──────┬───────┘  │ deepseek  │ │
│         │                 │           └─────┬─────┘ │
│  ┌──────┴─────────────────┴─────────────────┴─────┐  │
│  │              API 路由层 (14 个端点)              │  │
│  │  /api/scenario  /api/respond  /api/feedback     │  │
│  │  /api/sessions  /api/debates                   │  │
│  │  /api/playground/scenario|respond|generate     │  │
│  │  /api/roundtable/scenario|respond|generate     │  │
│  └──────────────────────┬─────────────────────────┘  │
└─────────────────────────┼────────────────────────────┘
                          │
                   DeepSeek API
              (deepseek-v4-pro / flash)
```

---

## 页面结构

| 路由 | 组件 | 功能 |
|---|---|---|
| `/` | `app/page.tsx` | 主界面：左右分栏，左侧会话列表（可折叠），右侧新对话设置 |
| `/play` | `app/play/page.tsx` | 对话界面：NPC 角色扮演聊天，文本/语音输入，场景描述 |
| `/playground` | `app/playground/page.tsx` | 辩论广场：1v1 辩论 + 圆桌讨论，哲学/科学切换 |
| `/stats` | `app/stats/page.tsx` | 历史记录：已完成对话 + 辩论列表 |

---

## 数据流

### 普通对话流程

```
用户选择类别+难度 → POST /api/scenario → DeepSeek 生成场景
→ NPC 开场 → 用户回复 → POST /api/respond → DeepSeek 生成 NPC 回应
→ 多轮循环 → 用户点"结束" → POST /api/feedback → 评分+反馈
→ saveSession() → localStorage + POST /api/sessions
```

### 辩论/圆桌流程

```
用户选择参与人+议题 → POST /api/playground/scenario → 生成开场
→ 用户点"下一轮" → POST /api/playground/respond → 生成下一轮
→ 循环至 maxRounds → saveDebateRecord() → localStorage + POST /api/debates
```

### 草稿保存流程

```
对话/辩论进行中 → useEffect 监听 state.messages 变化 → saveDraft()
→ 写入 localStorage drafts 数组 → 用户返回主页 → 侧边栏读取 drafts
→ 点击"继续" → play 页面从 URL 读取 draftId → useEffect 恢复草稿
```

---

## 存储架构

### 客户端 (lib/storage.ts)

```
localStorage key: "conversation-practice"
┌─────────────────────────────────────────┐
│ StorageData {                           │
│   sessions: Session[]       // 已完成对话│
│   debates: DebateRecord[]   // 已完成辩论│
│   drafts: DraftSession[]    // 进行中对话│
│   debateDrafts: DraftDebate[]           │
│   roundtables: RoundtableRecord[]       │
│   roundtableDrafts: DraftRoundtable[]   │
│   stats: Stats              // XP 统计  │
│ }                                       │
└─────────────────────────────────────────┘
```

安全措施：
- SSR 安全：全部读写路径首先检查 `typeof window !== "undefined"`
- 写入失败降级：quota 溢出时裁剪最旧 50% 记录后重试
- `saveSession()` 同步更新 stats（XP + 计数）
- `deleteSession()` 同步扣减 stats
- 草稿保存为 upsert（同 id 替换）

### 服务端 (lib/server-storage.ts)

```
.data/
  sessions.json    → { "userId": Session[] }
  debates.json     → { "userId": DebateRecord[] }
  roundtables.json → { "userId": RoundtableRecord[] }
```

- 所有操作需要 `userId`（客户端生成，无鉴权）
- 服务端写入为 fire-and-forget（`.catch(() => {})`），不影响客户端主流程
- 服务端为辅助备份，客户端为主

---

## AI 模型分配策略

| 场景类别 | 模型 | 思考强化 |
|---|---|---|
| 日常对话 (6 类) | `deepseek-v4-flash` | 困难 → `max`，其他 → `high`，极速模式 → 关闭 |
| 哲学 | `deepseek-v4-pro` | 同上 |
| 技术话题 (3 类) | `deepseek-v4-pro` | 同上 |
| Playground 辩论 | `deepseek-v4-pro` | `high` |
| Playground 圆桌 | `deepseek-v4-pro` | `high` |

逻辑位于各 API 路由的 `getChatOptions()` 函数中，根据 `category` + `difficulty` + `speedMode` 组合决定。

---

## 类别体系

### 三层话题结构

```
Topic (话题标签)
 ├── 💬 对话练习 (daily)
 │    ├── 闲聊寒暄、点餐购物、职场沟通
 │    ├── 社交场合、电话沟通、化解矛盾
 ├── 🧠 哲学话题 (philosophy) → 单一 「哲学对话」 + 哲学家选择
 └── 💻 技术话题 (tech)
      ├── 计算机体系结构、并行编程、大模型
```

### Playground 人员池

- **哲学家** (22 位)：苏格拉底、柏拉图、康德、尼采、庄子...
- **科学家** (27 位)：Turing、Hinton、von Neumann、Hawking、Lovelace...
- 通过 `哲/科` 切换键在 1v1 辩论和圆桌讨论中切换

---

## 核心 Hooks

### useGame

```
state: {
  phase: "home" | "setup" | "playing" | "feedback"
  category, difficulty, scenario, transcript, feedback,
  loading, error, philosopher, speedMode, draftId
}

API: startGame(cat, diff, philosopher?, speedMode?)
     sendMessage(text)
     endSession()
     reset()
```

- `startGame` → POST `/api/scenario` → 进入 playing
- `sendMessage` → POST `/api/respond` → 追加 NPC 消息
- `endSession` → POST `/api/feedback` → 保存结果
- 并发保护：`sendingRef` 防止重复请求
- 草稿自动保存：`useEffect` 监听 transcript 变化 → `saveDraft()`
- 草稿恢复：传入 `draftId` → `useEffect` 查询 `getDrafts()` → 恢复状态

### usePlayground

```
state: { phase, title, scene, philosopherA/B, messages,
         currentSpeaker, round, maxRounds, loading, draftId }

API: startDebate(), nextRound(), reset(), continueDebate(extraRounds)
```

- 草稿自动保存 + 恢复同上模式
- 早退分支修复：`nextRound` 顶部的 `round >= maxRounds` 检查中先调用 `saveDebateRecord(state)`
- 人工结束修复：`reset()` 中未完成的辩论不保存为已完成，保留草稿

### useRoundtable

```
state: { philosophers(5), topic, messages, speakerOrder,
         currentTurn, round, maxRounds, draftId }

API: startRoundtable(participants, topic, rounds)
     nextMessage()
     reset()
```

- 并行发言顺序：由 API 生成随机 `speakerOrder` 数组
- 去重逻辑：随机模式用 Set 防重复，指定模式冲突时自动替换为不重复随机人选

### useVoice

```
语种: zh-CN
输入: SpeechRecognition (浏览器原生)
输出: SpeechSynthesis (TTS 朗读 NPC 回复)
类型声明: types/speech.d.ts
```

---

## 提示词架构 (lib/prompts.ts)

采用**分类专用**提示词体系，每个类别三个维度：

| 维度 | 函数数量 | 说明 |
|---|---|---|
| scenario | 7 daily + 3 tech + philosophy | 场景生成提示词，按难度控制轮次 |
| respond | 7 daily + 3 tech + philosophy | NPC 回复提示词，含 7 种随机风格注入 |
| feedback | 7 daily + 3 tech + philosophy | 评分反馈提示词 |

### 随机风格注入 (7 种)

每轮 NPC 回复随机从以下风格中选择一种：
```
简短犀利 → 温暖关怀 → 幽默调侃 → 反问引导 →
分享趣事 → 情绪外露 → 拖延犹豫
```

### Playground 辩论随机风格 (5 种)

每轮发言随机切换：
```
严谨论证 → 激情反驳 → 苏格拉底式追问 → 故事隐喻 → 颠覆性反转
```

---

## 关键设计决策

### 1. webpack 替代 Turbopack
原因：环境中 Turbopack 扫描父级 `node_modules` 失败（权限拒绝）。构建/开发命令均使用 `--webpack` 标志。

### 2. localStorage 为主，服务端为辅
原因：无鉴权设计。客户端 UUID 作为 userId，服务端存储为 fire-and-forget 备份。不引入数据库依赖。

### 3. 单一 localStorage Key
所有数据存储为单一 JSON blob，避免多个 key 造成的碎片化和 quota 管理复杂度。写入失败时统一裁剪。

### 4. JSON Parse 容错
模型偶尔返回非 JSON 纯文本。API 路由（`/api/respond`）对 `JSON.parse` 做 try-catch，失败时将纯文本作为 `npcResponse` 返回。

### 5. 草稿系统
基于 `useEffect` 自动保存（监听 key state 变化），无需用户手动保存。恢复时从 URL 参数读取 `draftId`。

### 6. 并发保护
`sendMessage` 使用 `useRef` 的 `sendingRef` 防止快速连发导致的重复 API 调用和状态错乱。

---

## Bug 修复日志

### Bug #1: 页面按钮无响应（水合错误）
- **症状**：首页和对话页所有按钮点击无反应
- **根因**：`getStats()` / `getSessions()` / `getDrafts()` 在 JSX 渲染阶段调用，服务端返回空数组，客户端返回实际数据，React 水合检测到差异后放弃绑定事件
- **修复**：全部移入 `useState + useEffect` 异步加载；`DraftSession` 恢复延迟到 `useEffect` 而非 `useState` 初始化器
- **提交**：f0286bb (part of initial build)

### Bug #2: Playground 辩论记录丢失
- **症状**：辩论结束后侧边栏无记录
- **根因**：`nextRound` 顶部早退检查中直接 `setState(finished)` 而 **未调用 `saveDebateRecord()`**
- **修复**：早退前插入 `saveDebateRecord(state)`；`reset()` 中改为仅在辩论自然完成（phase === "finished"）时保存，避免覆盖草稿
- **提交**：d60cc44

### Bug #3: 首页 `<a>` 标签导致页面卡死
- **症状**：点击"查看全部历史"后浏览器后退，首页按钮卡死
- **根因**：`<a href="/stats">` 触发完整页面重载，浏览器从 bfcache 恢复旧页面（水合已失败的状态）
- **修复**：改为 `router.push("/stats")` 客户端导航
- **提交**：9e08d37

### Bug #4: `crypto.randomUUID` 不可用
- **症状**：`crypto.randomUUID is not a function`
- **根因**：部分环境不支持此 API
- **修复**：创建 `lib/uid.ts`，优先使用 `crypto.randomUUID()`，回退到手动 UUID v4 生成
- **提交**：f0286bb

### Bug #5: NPC 回复丢失
- **症状**：用户发送消息后 NPC 不回，连发多条才回复
- **根因 1**：模型返回非 JSON 纯文本，`JSON.parse` 崩溃返回 500
- **根因 2**：`sendMessage` 缺少并发锁，快速连发时状态冲突
- **修复**：API 路由添加 JSON parse 容错；`sendingRef` 防并发；BASE_RESPOND_RULES 加入严格 JSON 格式说明 + 示例
- **提交**：45c4b4d

### Bug #6: 圆桌讨论模式选择器 blank
- **症状**：科学家 Tab 空白，无法进入对话
- **根因**：科学家 Tab（`subMode === "scientists"`）同时对应 1v1 和圆桌两种模式，视图条件只检查一种状态
- **修复**：移除独立科学家 Tab，改为在 1v1 和圆桌内部各加入 `哲/科` 切换键
- **提交**：c496cac

### Bug #7: API 失败后 UI 永久卡死
- **症状**：点击"开始"后持续显示"生成中..."
- **根因**：全部 6 个 catch 块（useGame×3 + usePlayground×2 + useRoundtable）中未重置 phase
- **修复**：所有 catch 块显式设置 `phase: "home"` / `"idle"` / `"playing"` 恢复可操作状态
- **提交**：c496cac

### Bug #8: 侧边栏折叠按钮重叠
- **症状**：◀ 按钮 absolute 定位覆盖会话列表文字
- **修复**：按钮移入侧边栏标题行内（flex justify-between），收起后在主区域左上角显示 ▶ 重开按钮
- **提交**：45c4b4d

---

## 目录结构总览

```
.
├── app/
│   ├── api/                    # 14 个 API 路由端点
│   │   ├── scenario/           # 生成日常场景
│   │   ├── respond/            # NPC 回复
│   │   ├── feedback/           # 会话评分
│   │   ├── sessions/           # 会话记录 CRUD
│   │   ├── debates/            # 辩论记录 CRUD
│   │   ├── playground/
│   │   │   ├── scenario/       # 辩论开场
│   │   │   ├── respond/        # 辩论下一轮
│   │   │   └── generate/       # 批量生成完整辩论
│   │   └── roundtable/
│   │       ├── scenario/       # 圆桌开场
│   │       ├── respond/        # 圆桌下一轮
│   │       └── generate/       # 批量生成完整圆桌
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页（侧边栏 + 对话设置）
│   ├── play/page.tsx           # 对话界面
│   ├── playground/page.tsx     # 辩论广场
│   └── stats/page.tsx          # 历史记录
├── components/
│   ├── ConfirmDialog.tsx       # 删除确认弹窗
│   └── VisualScene.tsx         # CSS 场景渲染
├── hooks/
│   ├── useGame.ts              # 对话状态机
│   ├── usePlayground.ts        # 辩论状态机
│   ├── useRoundtable.ts        # 圆桌状态机
│   └── useVoice.ts             # 语音 I/O
├── lib/
│   ├── types.ts                # 类型定义
│   ├── prompt.ts               # 提示词模板
│   ├── categories.ts           # 类别/人物/字段定义
│   ├── deepseek.ts             # AI 客户端
│   ├── storage.ts              # 客户端存储
│   ├── server-storage.ts       # 服务端存储
│   └── uid.ts                  # UUID 工具
├── types/
│   └── speech.d.ts             # Web Speech API 类型声明
└── doc/
    └── arch.md                 # 本文档
```

## 近期更新 (2026-05)

### 页面过渡动画
- `components/PageTransition.tsx`：监听 `usePathname`，路由切换时子内容 key 变更，触发淡入+上移动画（0.35s ease-out）
- `app/globals.css`：`@keyframes fade-in` 含 `translateY(12px→0)` + opacity，`slide-up` 含 `translateY(24px→0)`

### 进度条
- `components/ProgressBar.tsx`：每 400ms 随机递增 2-10%，到 85% 停止，300ms ease-out 过渡
- 替代 `/play`、`/playground` 页面加载状态的 spinner

### 政治模式
- 新增 `POLITICIANS` 列表（30 位历史领袖，亚历山大大帝 → 曼德拉）
- Playground 和主页"哲思"标签均支持 🧠哲学 / 🔬科学 / 🏛️政治 三人类型切换
- 动态标签：哲学家/科学家/政治家（选择器文字、圆桌标题）

### 界面重命名
- 标题：对话练习 → **浪潮**
- 话题标签：哲学话题/对话 → **哲思**
- Playground 图标：🎪

### 侧边栏重构
- 从 flex 流宽度动画 → `fixed` 固定定位 + `translateX` 滑入/滑出
- 不再影响主区域布局，彻底消除垂直位移问题
- ▶ 重开按钮同样 fixed 定位

### 科学家中文名
- `SCIENTISTS` 的 `label` 字段全部改为中文（见图灵/霍金/吴恩达/杨立昆等）

### NPC 回复容错
- `/api/respond` 对模型返回的非 JSON 纯文本做 try-catch 降级
- 纯文本直接作为 `npcResponse` 返回，emotion 默认"平静"

### Bug 修复：发送并发锁
- `useGame.sendMessage` 新增 `sendingRef`，请求未完成前阻止二次调用
- 所有 catch 块显式重置 `phase`，避免 UI 永久卡死在"生成中..."

### 侧边栏圆桌显示
- 主页侧边栏新增 🏛️ 圆桌进行中 和 🏛️ 圆桌（已完成）两个分区
- 加载 `getRoundtables()` 和 `getRoundtableDrafts()`，支持点击展开查看各发言人对话记录

### 科学/政治范畴
- 新增 `SCIENCE_FIELDS`（12 个领域：AI/量子/神经科学等）和 `POLITICS_FIELDS`（12 个范畴：民主/外交/意识形态等）
- Playground 和主页哲思标签根据 personType 自动切换范畴选择器
- `fieldList` / `getRandomTopic` / `getFieldLabel` 根据当前人类型动态计算
