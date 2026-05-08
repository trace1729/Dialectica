# Dialectica

Deepseek vibe demo


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



## 环境变量

| 变量 | 说明 |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |

## 许可

MIT
