# Dialectica

AI 驱动的角色扮演对话与哲学辩论平台。通过与智能 NPC 模拟真实场景练习中文对话，或让东西方哲学大师围绕任意议题展开思辨交锋。

## 功能

- **角色扮演对话** — 在涵盖日常闲聊、点餐购物、职场沟通、社交场合、电话沟通、矛盾化解等真实场景中，与 AI NPC 进行沉浸式对话练习
- **技术话题探讨** — 与计算机体系结构、并行编程、大模型领域的专家角色进行技术讨论
- **哲学对话** — 与尼采、康德、庄子等 20 位东西方哲学家进行一对一思想交流
- **辩论 Playground** — 随机或指定两位哲学家，围绕任意哲学领域自动展开多轮辩论，支持查看推理过程
- **语音输入/输出** — 使用 Web Speech API 实现语音识别与 TTS 朗读
- **学习反馈** — 每次对话结束后 AI 自动评分（1-10）并给出改进建议
- **进度追踪** — 本地存储 + 服务端持久化，记录 XP 和经验值

## 技术栈

- **框架**: Next.js 16 (App Router)
- **前端**: React 19, TypeScript, Tailwind CSS 4
- **AI 引擎**: DeepSeek API (`deepseek-v4-flash` / `deepseek-v4-pro`)
- **存储**: 浏览器 localStorage + 服务端 JSON 文件
- **语音**: Web Speech Recognition / Synthesis

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看。

## 项目结构

```
├── app/                    # Next.js App Router 页面和 API 路由
│   ├── page.tsx            # 首页：选择设置 + 历史列表
│   ├── play/page.tsx       # 对话练习主界面
│   ├── playground/page.tsx # 辩论 Playground
│   ├── stats/page.tsx      # 历史统计
│   └── api/                # 6 个 API 路由
├── components/             # UI 组件
├── hooks/                  # React hooks（状态管理）
├── lib/                    # 纯逻辑（类型、prompt、API 客户端、存储）
└── types/                  # TypeScript 类型声明
```

## 环境变量

| 变量 | 说明 |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |

## 许可

MIT
